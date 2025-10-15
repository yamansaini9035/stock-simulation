import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const { symbol } = req.query || {};
    const filePath = path.join(process.cwd(), 'public', 'data', 'companyData.json');
    if (!fs.existsSync(filePath)) return res.status(200).json({});
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const company = symbol ? data[symbol] : null;
    return res.status(200).json(company || {});
  } catch (err) {
    console.error('company-info api error', err);
    return res.status(500).json({});
  }
}





