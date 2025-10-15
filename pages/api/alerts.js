import { prisma } from '../../lib/prisma';
import { stateEngine } from '../../lib/stateEngine';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId is required' });
      // Prefer in-memory active alerts
      const list = stateEngine.getAlerts(String(userId));
      return res.status(200).json({ alerts: list });
    }

    if (req.method === 'POST') {
      const { userId, symbol, type, condition, targetPrice, message } = req.body || {};
      if (!userId || !symbol || !type) return res.status(400).json({ error: 'userId, symbol, type required' });
      const alert = await prisma.alert.create({
        data: {
          userId: String(userId),
          symbol: String(symbol),
          type: String(type),
          condition: condition ? String(condition) : '',
          targetPrice: targetPrice != null ? Number(targetPrice) : null,
          message: message ? String(message) : '',
          isActive: true,
        },
      });
      stateEngine.upsertAlert(String(userId), alert);
      return res.status(201).json({ alert });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      const removed = await prisma.alert.update({ where: { id: String(id) }, data: { isActive: false } });
      stateEngine.markAlertTriggered(removed.userId, removed.id, new Date(), removed.triggeredPrice ?? null);
      return res.status(200).json({ alert: removed });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('alerts api error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}







