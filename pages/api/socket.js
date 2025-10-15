import fs from 'fs';
import path from 'path';

import { Server } from 'socket.io';

import { stateManager } from '../../lib/stateManager';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    res.socket.server.io = io;

    stateManager.setSocket(io);

    // --- Simple price ticker ---
    const dataPath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    let companies = [];
    try {
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf8');
        companies = JSON.parse(raw);
      }
    } catch (e) {
      companies = [];
    }

    // Initialize price state
    let tick = 0;
    let isActive = false;
    const runtime = companies.map((c) => {
      const symbol = c.symbol || c.ticker || 'SYM';
      // Try to load a realistic starting price from per-symbol dataset
      let startPrice = Number(c.price || c.base || 0);
      try {
        if (!startPrice) {
          const p = path.join(process.cwd(), 'public', 'data', `${symbol}.json`);
          if (fs.existsSync(p)) {
            const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (Array.isArray(raw) && raw.length) {
              const last = raw[raw.length - 1];
              if (typeof last === 'number') startPrice = Number(last);
              else if (last && typeof last.close === 'number') startPrice = Number(last.close);
              else if (last && typeof last.price === 'number') startPrice = Number(last.price);
              else if (last && typeof last.c === 'number') startPrice = Number(last.c);
            }
          }
        }
      } catch (_) {}
      if (!startPrice || !isFinite(startPrice)) startPrice = 100;

      return {
        symbol,
        name: c.name || symbol || 'Company',
        price: startPrice,
        volatility: Number(c.volatility || 0.8),
        change: 0,
        changePercent: 0,
        volume: 0,
      };
    });

    function stepPrices() {
      tick += 1;
      isActive = true;
      const timestamp = Date.now();
      for (const c of runtime) {
        // Limit per-tick move to ~0.4% of price by default
        const basePct = Math.min(Math.max(c.volatility, 0.1), 2) / 100; // 0.1%..2%
        const drift = (Math.random() - 0.5) * (c.price * basePct);
        const old = c.price;
        c.price = Math.max(0.01, old + drift);
        c.change = c.price - old;
        c.changePercent = old ? (c.change / old) * 100 : 0;
        c.volume = Math.floor(100 + Math.random() * 500);
      }
      io.emit('priceUpdate', { tick, timestamp, companies: runtime, isActive });
      // Also emit a simple synthetic order book for the currently active symbols
      for (const c of runtime) {
        const mid = c.price;
        const levels = 10;
        const pctStep = 0.0005; // 0.05% per level
        const bids = [];
        const asks = [];
        for (let i = 0; i < levels; i++) {
          const bidPrice = Math.max(0.01, mid * (1 - pctStep * (i + 1)));
          const askPrice = mid * (1 + pctStep * (i + 1));
          bids.push({ price: Number(bidPrice.toFixed(2)), quantity: Math.floor(50 + Math.random() * 500) });
          asks.push({ price: Number(askPrice.toFixed(2)), quantity: Math.floor(50 + Math.random() * 500) });
        }
        const bestBid = bids[0];
        const bestAsk = asks[0];
        const spread = bestAsk.price - bestBid.price;
        io.emit('orderBookUpdate', {
          symbol: c.symbol,
          orderBook: { bids, asks, bestBid, bestAsk, spread, midPrice: mid },
        });
      }
      // Occasionally emit a news event (10% chance each tick)
      if (Math.random() < 0.1) {
        emitRandomNews();
      }
    }

    // Simple news generator
    function emitRandomNews() {
      if (!runtime.length) return;
      const pick = runtime[Math.floor(Math.random() * runtime.length)];
      const impacts = ['positive', 'negative', 'neutral'];
      const impact = impacts[Math.floor(Math.random() * impacts.length)];
      const pct = Number((Math.random() * 2 + 0.2).toFixed(2)); // 0.2% - 2.2%
      const headlines = {
        positive: `${pick.symbol} reports strong outlook`,
        negative: `${pick.symbol} faces regulatory headwinds`,
        neutral: `${pick.symbol} issues operational update`,
      };
      const event = {
        id: `${pick.symbol}-${Date.now()}`,
        symbol: pick.symbol,
        headline: headlines[impact],
        impact,
        priceImpact: pct,
        category: 'market',
        isActive: true,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      io.emit('newsEvent', event);
    }

    // Start ticker once
    if (!res.socket.server.__tickerStarted) {
      res.socket.server.__tickerStarted = true;
      // Kick off first frame immediately, then every 7s
      stepPrices();
      setInterval(stepPrices, 5000);
      // Emit first news shortly, then every 30s
      setTimeout(emitRandomNews, 3000);
      setInterval(emitRandomNews, 30000);
    }

    io.on('connection', (socket) => {
      socket.on('newOrder', async (payload, cb) => {
        try {
          const order = await stateManager.placeOrder(payload);
          cb && cb({ ok: true, order });
        } catch (err) {
          cb && cb({ ok: false, error: 'failed to place order' });
        }
      });

      socket.on('cancelOrder', async ({ orderId }, cb) => {
        try {
          const order = await stateManager.cancelOrder(orderId);
          cb && cb({ ok: true, order });
        } catch (err) {
          cb && cb({ ok: false, error: 'failed to cancel order' });
        }
      });

      socket.on('getChartData', async ({ symbol }) => {
        try {
          if (!symbol) return;
          const p = path.join(process.cwd(), 'public', 'data', `${symbol}.json`);
          if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, 'utf8');
            const parsed = JSON.parse(raw);
            // Normalize to [{time, open, high, low, close, volume}]
            const data = Array.isArray(parsed) ? parsed.map((row, i) => {
              if (typeof row === 'number') {
                return { time: i + 1, open: row, high: row, low: row, close: row, volume: 0 };
              }
              const t = row.time || row.timestamp || row.t || i + 1;
              const o = row.open ?? row.o ?? row.price ?? row.p ?? row.close;
              const h = row.high ?? row.h ?? row.close ?? o;
              const l = row.low ?? row.l ?? row.close ?? o;
              const c = row.close ?? row.c ?? row.price ?? o;
              const v = row.volume ?? row.v ?? 0;
              return { time: t, open: o, high: h, low: l, close: c, volume: v };
            }) : [];
            socket.emit('chartData', { symbol, data });
          } else {
            socket.emit('chartData', { symbol, data: [] });
          }
        } catch (err) {
          socket.emit('chartDataError', { symbol, error: 'failed to load' });
        }
      });
    });
  }
  res.end();
}


