import { stateEngine } from '../../lib/stateEngine';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const data = stateEngine.getLeaderboard();
    return res.status(200).json(data);
  }
  if (req.method === 'POST') {
    const { rankings } = req.body || {};
    if (!Array.isArray(rankings)) return res.status(400).json({ error: 'rankings array required' });
    stateEngine.setLeaderboard(rankings);
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: 'Method Not Allowed' });
}







