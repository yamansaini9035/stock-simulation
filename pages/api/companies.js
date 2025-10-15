import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'companies.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const companies = JSON.parse(raw);
      return res.status(200).json({ success: true, companies });
    }
    // Fallback minimal list
    const fallback = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175, volatility: 0.9 },
      { symbol: 'MSFT', name: 'Microsoft', price: 350, volatility: 0.7 },
      { symbol: 'GOOGL', name: 'Alphabet', price: 140, volatility: 0.8 },
    ];
    return res.status(200).json({ success: true, companies: fallback });
  } catch (err) {
    console.error('companies api error', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}







