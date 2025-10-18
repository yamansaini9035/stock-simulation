export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Simple session start - just return success
    // The Socket.IO server will handle the actual trading simulation
    return res.status(200).json({ 
      success: true, 
      message: 'Trading session started',
      sessionActive: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session start error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to start session' 
    });
  }
}
