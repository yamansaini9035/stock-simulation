import { stateManager } from '../../../lib/stateManager';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    await stateManager.restoreFromDB();
    stateManager.startBatchPersistence();
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('restore api error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


