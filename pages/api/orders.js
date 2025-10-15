import { hybridStore } from '../../lib/hybridStore';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      const orders = await hybridStore.listOrders(String(userId));
      return res.status(200).json({ orders });
    }

    if (req.method === 'POST') {
      const { userId, symbol, type, side, quantity, targetPrice } = req.body || {};
      if (!userId || !symbol || !type || !side || !quantity) {
        return res.status(400).json({ error: 'userId, symbol, type, side, quantity are required' });
      }
      const order = await hybridStore.createOrder({
        userId: String(userId),
        symbol: String(symbol),
        type: String(type),
        side: String(side),
        quantity: Number(quantity),
        targetPrice: targetPrice != null ? Number(targetPrice) : null,
        status: 'PENDING',
      });
      return res.status(201).json({ success: true, order });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('orders api error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


