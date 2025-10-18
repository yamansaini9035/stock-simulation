export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Load companies data
    const fs = require('fs');
    const path = require('path');
    
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

    // Generate price data with some randomness
    const priceData = companies.map((c) => {
      const symbol = c.symbol || c.ticker || 'SYM';
      let basePrice = Number(c.price || c.base || 100);
      
      // Add some random movement to make it look live
      const volatility = Number(c.volatility || 0.8);
      const change = (Math.random() - 0.5) * basePrice * volatility * 0.01; // 1% max change
      const newPrice = Math.max(0.01, basePrice + change);
      const changePercent = (change / basePrice) * 100;
      
      return {
        symbol,
        name: c.name || symbol,
        price: Number(newPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: Math.floor(100 + Math.random() * 500),
        timestamp: Date.now()
      };
    });

    return res.status(200).json({
      success: true,
      data: priceData,
      sessionActive: true,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Price data error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to load price data' 
    });
  }
}
