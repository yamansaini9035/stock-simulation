import { prisma } from '../../lib/prisma';
import { stateManager } from '../../lib/stateManager';

async function getOrCreateUser(userId) {
  // Try by id first
  let user = null;
  try {
    user = await prisma.user.findUnique({ where: { id: String(userId) } });
  } catch (_) {}
  if (user) {
    // Ensure demo starting balance
    if (user.balance == null) {
      user = await prisma.user.update({ where: { id: user.id }, data: { balance: 10000 } });
    }
    return user;
  }
  // Fallback by enrollmentNo
  try {
    user = await prisma.user.findUnique({ where: { enrollmentNo: String(userId) } });
    if (user) return user;
  } catch (_) {}
  // Create a new user with default balance
  const enrollmentNo = String(userId || 'guest');
  return await prisma.user.create({ data: { enrollmentNo, passwordHash: '', balance: 10000 } });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  try {
    const { userId, symbol, action, quantity, price } = req.body || {};
    if (!userId || !symbol || !action || !quantity || !price) {
      return res.status(400).json({ success: false, error: 'userId, symbol, action, quantity, price are required' });
    }

    const normalizedAction = String(action).toUpperCase();
    if (!['BUY', 'SELL'].includes(normalizedAction)) {
      return res.status(400).json({ success: false, error: 'action must be BUY or SELL' });
    }

    const qty = Math.max(1, parseInt(quantity, 10));
    const px = Number(price);
    if (!isFinite(px) || px <= 0) return res.status(400).json({ success: false, error: 'invalid price' });

    let user = await getOrCreateUser(userId);

    if (normalizedAction === 'BUY') {
      const cost = qty * px;
      let startingBalance = Number(user.balance ?? 10000);
      if (!isFinite(startingBalance)) startingBalance = 10000;
      if (startingBalance < cost) {
        // Demo-friendly top-up so users can trade immediately
        const topped = await prisma.user.update({ where: { id: user.id }, data: { balance: 100000 } });
        user = topped;
        startingBalance = Number(topped.balance || 100000);
      }

      // Update holding and create trade atomically
      const result = await prisma.$transaction(async (tx) => {
        // Update balance
        const updatedUser = await tx.user.update({ where: { id: user.id }, data: { balance: (user.balance || 0) - cost } });

        // Upsert holding
        const existing = await tx.holding.findUnique({ where: { userId_symbol: { userId: user.id, symbol } } });
        const newQty = (existing?.quantity || 0) + qty;
        const newAvg = existing ? ((existing.avgPrice * existing.quantity + px * qty) / newQty) : px;
        const holding = await tx.holding.upsert({
          where: { userId_symbol: { userId: user.id, symbol } },
          update: { quantity: newQty, avgPrice: newAvg },
          create: { userId: user.id, symbol, quantity: newQty, avgPrice: newAvg },
        });

        // Trade record
        const trade = await tx.trade.create({ data: { userId: user.id, symbol, action: 'BUY', quantity: qty, price: px, value: qty * px } });
        return { updatedUser, holding, trade };
      });

      // Broadcast trade event without double-persist (DB already wrote inside txn)
      try { await stateManager.recordTrade({ userId: user.id, symbol, action: 'BUY', quantity: qty, price: px }, { persist: false }); } catch (_) {}

      return res.status(200).json({ success: true, ...result });
    }

    // SELL
    const existing = await prisma.holding.findUnique({ where: { userId_symbol: { userId: user.id, symbol } } });
    if (!existing || existing.quantity < qty) return res.status(400).json({ success: false, error: 'Insufficient holdings' });
    const proceeds = qty * px;

    const result = await prisma.$transaction(async (tx) => {
      // Update holding
      const remaining = existing.quantity - qty;
      const holding = await tx.holding.update({ where: { userId_symbol: { userId: user.id, symbol } }, data: { quantity: remaining } });

      // Update balance
      const updatedUser = await tx.user.update({ where: { id: user.id }, data: { balance: (user.balance || 0) + proceeds } });

      // Trade record
      const trade = await tx.trade.create({ data: { userId: user.id, symbol, action: 'SELL', quantity: qty, price: px, value: qty * px } });
      return { updatedUser, holding, trade };
    });

    try { await stateManager.recordTrade({ userId: user.id, symbol, action: 'SELL', quantity: qty, price: px }, { persist: false }); } catch (_) {}
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('trade api error', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}


