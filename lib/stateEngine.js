import { prisma } from './prisma';

// In-memory realtime state
const state = {
  orderBooks: new Map(), // symbol -> { bids: [], asks: [] }
  trades: [], // recent executed trades
  leaderboard: { lastUpdatedAt: 0, rankings: [] },
  riskByUserId: new Map(), // userId -> metrics
  alertsByUserId: new Map(), // userId -> Alert[] (active)
};

// Batch buffers for persistence
const buffers = {
  trades: [],
  leaderboardSnapshots: [],
  alertsTriggered: [],
};

function getNow() { return Date.now(); }

export const stateEngine = {
  // --- ORDER BOOK ---
  getOrderBook(symbol) {
    return state.orderBooks.get(symbol) || { bids: [], asks: [] };
  },
  setOrderBook(symbol, orderBook) {
    state.orderBooks.set(symbol, orderBook);
  },

  // --- TRADES (executions) ---
  addExecutedTrade(trade) {
    state.trades.unshift(trade);
    if (state.trades.length > 1000) state.trades.length = 1000;
    buffers.trades.push(trade);
  },
  getRecentTrades(limit = 100) {
    return state.trades.slice(0, limit);
  },

  // --- LEADERBOARD ---
  setLeaderboard(rankings) {
    state.leaderboard.rankings = rankings;
    state.leaderboard.lastUpdatedAt = getNow();
    buffers.leaderboardSnapshots.push({ at: new Date(), rankings });
  },
  getLeaderboard() {
    return state.leaderboard;
  },

  // --- RISK ---
  setRisk(userId, metrics) {
    state.riskByUserId.set(userId, metrics);
  },
  getRisk(userId) {
    return state.riskByUserId.get(userId) || null;
  },

  // --- ALERTS ---
  upsertAlert(userId, alert) {
    if (!state.alertsByUserId.has(userId)) state.alertsByUserId.set(userId, []);
    const list = state.alertsByUserId.get(userId);
    const idx = list.findIndex(a => a.id === alert.id);
    if (idx >= 0) list[idx] = alert; else list.unshift(alert);
  },
  getAlerts(userId) {
    return state.alertsByUserId.get(userId) || [];
  },
  markAlertTriggered(userId, alertId, triggeredAt, triggeredPrice) {
    const list = state.alertsByUserId.get(userId) || [];
    const alert = list.find(a => a.id === alertId);
    if (alert) {
      alert.isActive = false;
      alert.triggeredAt = triggeredAt;
      alert.triggeredPrice = triggeredPrice;
      buffers.alertsTriggered.push({ userId, alertId, triggeredAt, triggeredPrice });
    }
  },
};

// --- Periodic flush every 5s ---
let flushTimer;
export function startStateFlush() {
  if (flushTimer) return;
  flushTimer = setInterval(async () => {
    try {
      // trades -> DB
      if (buffers.trades.length) {
        const toWrite = buffers.trades.splice(0, buffers.trades.length);
        await prisma.trade.createMany({ data: toWrite.map(t => ({
          userId: t.userId,
          symbol: t.symbol,
          action: t.action,
          quantity: t.quantity,
          price: t.price,
          value: t.value,
          createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
        })) });
      }

      // leaderboard snapshots
      if (buffers.leaderboardSnapshots.length) {
        const toWrite = buffers.leaderboardSnapshots.splice(0, buffers.leaderboardSnapshots.length);
        // Flatten snapshot entries into Leaderboard rows (requires sessionId/userId mapping by caller)
        // Here we store nothing if mapping not provided; left as no-op placeholder for now.
      }

      // alerts triggered
      if (buffers.alertsTriggered.length) {
        const toWrite = buffers.alertsTriggered.splice(0, buffers.alertsTriggered.length);
        await Promise.all(toWrite.map((a) =>
          prisma.alert.update({ where: { id: a.alertId }, data: { isActive: false, triggeredAt: a.triggeredAt, triggeredPrice: a.triggeredPrice } }),
        ));
      }
    } catch (err) {
      console.error('state flush error', err);
    }
  }, 5000);
}

export function stopStateFlush() {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = undefined;
}

// --- Restore on server start ---
export async function restoreState() {
  try {
    // Load active alerts as baseline in memory
    const activeAlerts = await prisma.alert.findMany({ where: { isActive: true } });
    const byUser = new Map();
    for (const a of activeAlerts) {
      if (!byUser.has(a.userId)) byUser.set(a.userId, []);
      byUser.get(a.userId).push(a);
    }
    for (const [userId, list] of byUser.entries()) {
      state.alertsByUserId.set(userId, list);
    }
  } catch (err) {
    console.error('restore state error', err);
  }
}







