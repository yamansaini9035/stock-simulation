import { prisma } from './prisma';

// Simple in-memory cache as primary read store; MySQL as source of truth for durability
const memory = {
  usersByEnrollment: new Map(),
  holdingsByUserId: new Map(),
  ordersByUserId: new Map(),
  pricesBySymbolTick: new Map(), // key: `${symbol}:${tick}` -> { price }
};

const CACHE_TTL_MS = 15_000;

function now() {
  return Date.now();
}

export const hybridStore = {
  async getUserByEnrollment(enrollmentNo) {
    const cached = memory.usersByEnrollment.get(enrollmentNo);
    if (cached && cached.expiresAt > now()) return cached.value;
    const user = await prisma.user.findUnique({ where: { enrollmentNo } });
    memory.usersByEnrollment.set(enrollmentNo, { value: user, expiresAt: now() + CACHE_TTL_MS });
    return user;
  },

  async upsertUser(userInput) {
    const user = await prisma.user.upsert({
      where: { enrollmentNo: userInput.enrollmentNo },
      update: userInput,
      create: userInput,
    });
    memory.usersByEnrollment.set(user.enrollmentNo, { value: user, expiresAt: now() + CACHE_TTL_MS });
    return user;
  },

  async getHoldings(userId) {
    const key = userId;
    const cached = memory.holdingsByUserId.get(key);
    if (cached && cached.expiresAt > now()) return cached.value;
    const holdings = await prisma.holding.findMany({ where: { userId } });
    memory.holdingsByUserId.set(key, { value: holdings, expiresAt: now() + CACHE_TTL_MS });
    return holdings;
  },

  async updateHolding(userId, symbol, quantityDelta, price) {
    // Transaction: adjust holding and create trade
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.holding.findUnique({ where: { userId_symbol: { userId, symbol } } });
      let newQuantity = (existing?.quantity ?? 0) + quantityDelta;
      if (newQuantity < 0) newQuantity = 0;

      let avgPrice = existing?.avgPrice ?? 0;
      if (quantityDelta > 0) {
        const totalCost = avgPrice * (existing?.quantity ?? 0) + price * quantityDelta;
        const totalQty = (existing?.quantity ?? 0) + quantityDelta;
        avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
      } else if (newQuantity === 0) {
        avgPrice = 0;
      }

      const holding = await tx.holding.upsert({
        where: { userId_symbol: { userId, symbol } },
        update: { quantity: newQuantity, avgPrice },
        create: { userId, symbol, quantity: Math.max(newQuantity, 0), avgPrice },
      });

      await tx.trade.create({
        data: {
          userId,
          symbol,
          action: quantityDelta >= 0 ? 'BUY' : 'SELL',
          quantity: Math.abs(quantityDelta),
          price,
          value: Math.abs(quantityDelta) * price,
        },
      });

      // Invalidate cache
      memory.holdingsByUserId.delete(userId);
      return holding;
    });
  },

  async createOrder(orderInput) {
    const order = await prisma.order.create({ data: orderInput });
    if (!memory.ordersByUserId.has(order.userId)) {
      memory.ordersByUserId.set(order.userId, { value: [], expiresAt: 0 });
    }
    const cached = memory.ordersByUserId.get(order.userId);
    cached.value = [order, ...cached.value];
    cached.expiresAt = now() + CACHE_TTL_MS;
    return order;
  },

  async listOrders(userId) {
    const cached = memory.ordersByUserId.get(userId);
    if (cached && cached.expiresAt > now()) return cached.value;
    const orders = await prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    memory.ordersByUserId.set(userId, { value: orders, expiresAt: now() + CACHE_TTL_MS });
    return orders;
  },

  async setPrice(symbol, tick, price) {
    const key = `${symbol}:${tick}`;
    memory.pricesBySymbolTick.set(key, { price, expiresAt: now() + CACHE_TTL_MS });
    // Optionally persist sampled prices
    await prisma.priceData.upsert({
      where: { symbol_tick: { symbol, tick } },
      update: { price },
      create: { symbol, tick, price },
    });
  },

  async getPrice(symbol, tick) {
    const key = `${symbol}:${tick}`;
    const cached = memory.pricesBySymbolTick.get(key);
    if (cached && cached.expiresAt > now()) return cached.price;
    const row = await prisma.priceData.findUnique({ where: { symbol_tick: { symbol, tick } } });
    if (row) {
      memory.pricesBySymbolTick.set(key, { price: row.price, expiresAt: now() + CACHE_TTL_MS });
      return row.price;
    }
    return null;
  },
};






