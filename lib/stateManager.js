import { prisma } from './prisma';

// Socket reference (set by server bootstrap)
let io = null;

// In-memory state
const mem = {
  // symbol -> { bids: [{price, qty}], asks: [...] }
  orderBooks: new Map(),
  // recent executed trades (for broadcast)
  trades: [],
  // leaderboard snapshot kept in memory
  leaderboard: { lastUpdatedAt: 0, rankings: [] },
};

// Batch buffers (flushed every 5s)
const buffers = {
  leaderboardSnapshots: [], // { at: Date, rankings: [...] }
};

function broadcast(event, payload) {
  if (io) io.emit(event, payload);
}

function now() { return Date.now(); }

export const stateManager = {
  setSocket(serverIo) {
    io = serverIo;
  },

  // --- ORDER MANAGEMENT ---
  async placeOrder(orderInput) {
    // Immediate durable write
    const order = await prisma.order.create({ data: {
      userId: String(orderInput.userId),
      symbol: String(orderInput.symbol),
      type: String(orderInput.type),
      side: String(orderInput.side),
      quantity: Number(orderInput.quantity),
      targetPrice: orderInput.targetPrice != null ? Number(orderInput.targetPrice) : null,
      status: 'PENDING',
    } });

    // Update order book and price (simplified: you may integrate your matching engine here)
    const ob = mem.orderBooks.get(order.symbol) || { bids: [], asks: [] };
    mem.orderBooks.set(order.symbol, ob);

    // Emit order-related updates
    broadcast('orderUpdate', { order });
    return order;
  },

  async cancelOrder(orderId) {
    const order = await prisma.order.update({ where: { id: String(orderId) }, data: { status: 'CANCELLED' } });
    broadcast('orderUpdate', { order });
    return order;
  },

  // --- TRADE EXECUTION (immediate write + broadcast) ---
  async recordTrade(trade, opts = {}) {
    const shouldPersist = opts.persist !== false;
    let created = trade;
    if (shouldPersist) {
      created = await prisma.trade.create({ data: {
        userId: String(trade.userId),
        symbol: String(trade.symbol),
        action: String(trade.action),
        quantity: Number(trade.quantity),
        price: Number(trade.price),
        value: Number(trade.quantity) * Number(trade.price),
        createdAt: trade.createdAt ? new Date(trade.createdAt) : undefined,
      } });
    }
    mem.trades.unshift(created);
    if (mem.trades.length > 1000) mem.trades.length = 1000;
    // Broadcast trade and price update (if your price changes on trade)
    broadcast('tradeExecuted', { trade: created });
    broadcast('priceUpdate', { symbol: created.symbol, price: created.price });
    return created;
  },

  // --- LEADERBOARD ---
  updateLeaderboard(rankings) {
    mem.leaderboard.rankings = rankings;
    mem.leaderboard.lastUpdatedAt = now();
    buffers.leaderboardSnapshots.push({ at: new Date(), rankings });
    broadcast('leaderboardUpdate', { rankings });
  },
  getLeaderboard() { return mem.leaderboard; },

  // --- ORDER BOOK ---
  getOrderBook(symbol) { return mem.orderBooks.get(symbol) || { bids: [], asks: [] }; },
  setOrderBook(symbol, ob) { mem.orderBooks.set(symbol, ob); },

  // --- STARTUP/RESTORE ---
  async restoreFromDB() {
    // Load recent orders/trades (optional: bounded windows)
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
    const trades = await prisma.trade.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
    mem.trades = trades;
    // Leaderboard snapshots: load latest snapshot if exists
    try {
      const snap = await prisma.leaderboardSnapshot.findFirst({ orderBy: { createdAt: 'desc' } });
      if (snap?.dataJson) {
        mem.leaderboard = { lastUpdatedAt: now(), rankings: JSON.parse(snap.dataJson) };
      }
    } catch (_) {}
    return { ordersCount: orders.length, tradesCount: trades.length };
  },

  startBatchPersistence() {
    if (this._timer) return;
    this._timer = setInterval(async () => {
      try {
        if (buffers.leaderboardSnapshots.length) {
          const toWrite = buffers.leaderboardSnapshots.splice(0, buffers.leaderboardSnapshots.length);
          // Keep last snapshot only to reduce writes
          const last = toWrite[toWrite.length - 1];
          await prisma.leaderboardSnapshot.create({ data: {
            dataJson: JSON.stringify(last.rankings),
          } });
        }
      } catch (err) {
        console.error('stateManager batch persist error', err);
      }
    }, 5000);
  },

  stopBatchPersistence() {
    if (this._timer) clearInterval(this._timer);
    this._timer = undefined;
  },

  // Convenience API as per deliverables
  async placeOrderSimple(userId, symbol, qty, price, type) {
    const side = qty >= 0 ? 'BUY' : 'SELL';
    const order = await this.placeOrder({ userId, symbol, type: type || 'MARKET', side, quantity: Math.abs(Number(qty)), targetPrice: price ?? null });
    return order;
  },
  async cancelOrderSimple(orderId) {
    return this.cancelOrder(orderId);
  },
  async flushLeaderboardToDB() {
    try {
      if (mem.leaderboard.rankings && mem.leaderboard.rankings.length) {
        await prisma.leaderboardSnapshot.create({ data: { dataJson: JSON.stringify(mem.leaderboard.rankings) } });
      }
      return { ok: true };
    } catch (err) {
      console.error('flushLeaderboardToDB error', err);
      return { ok: false, error: 'flush failed' };
    }
  },
};


