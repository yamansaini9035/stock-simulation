const fs = require('fs');
const path = require('path');

// Company data with different starting prices and volatility
const companies = [
  // Indian Companies (20)
  { symbol: 'RELIANCE', name: 'Reliance Industries', startPrice: 2500, volatility: 0.8 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', startPrice: 3500, volatility: 0.6 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', startPrice: 1600, volatility: 0.7 },
  { symbol: 'INFY', name: 'Infosys', startPrice: 1400, volatility: 0.9 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', startPrice: 2400, volatility: 0.5 },
  { symbol: 'ITC', name: 'ITC Limited', startPrice: 450, volatility: 0.6 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', startPrice: 1800, volatility: 0.8 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', startPrice: 800, volatility: 1.0 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', startPrice: 3200, volatility: 0.7 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', startPrice: 9000, volatility: 0.9 },
  { symbol: 'NESTLEIND', name: 'Nestle India', startPrice: 18000, volatility: 0.4 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation', startPrice: 220, volatility: 0.6 },
  { symbol: 'NTPC', name: 'NTPC Limited', startPrice: 180, volatility: 0.7 },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corp', startPrice: 150, volatility: 1.1 },
  { symbol: 'TITAN', name: 'Titan Company', startPrice: 2800, volatility: 0.8 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', startPrice: 6500, volatility: 0.9 },
  { symbol: 'WIPRO', name: 'Wipro Limited', startPrice: 400, volatility: 0.8 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', startPrice: 1000, volatility: 0.7 },
  { symbol: 'TECHM', name: 'Tech Mahindra', startPrice: 1200, volatility: 0.9 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', startPrice: 500, volatility: 1.0 },
  
  // Worldwide Companies (10)
  { symbol: 'AAPL', name: 'Apple Inc', startPrice: 180, volatility: 0.6 },
  { symbol: 'TSLA', name: 'Tesla Inc', startPrice: 250, volatility: 1.2 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', startPrice: 140, volatility: 0.7 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', startPrice: 350, volatility: 0.5 },
  { symbol: 'AMZN', name: 'Amazon.com Inc', startPrice: 150, volatility: 0.8 },
  { symbol: 'META', name: 'Meta Platforms Inc', startPrice: 300, volatility: 0.9 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', startPrice: 450, volatility: 1.1 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', startPrice: 160, volatility: 0.7 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', startPrice: 160, volatility: 0.4 },
  { symbol: 'V', name: 'Visa Inc', startPrice: 250, volatility: 0.6 },
];

function generateDataset(company) {
  const data = [];
  let price = company.startPrice;
  const startTime = new Date('2024-01-01 09:00:00');

  for (let i = 0; i < 771; i++) {
    const time = new Date(startTime.getTime() + i * 7 * 1000);
    const timeStr = time.toTimeString().slice(0, 5);
    
    // Random walk with company-specific volatility
    const change = (Math.random() - 0.45) * company.volatility * 2;
    price += change;
    
    // Keep price within reasonable bounds (50% to 150% of start price)
    const minPrice = company.startPrice * 0.5;
    const maxPrice = company.startPrice * 1.5;
    price = Math.max(minPrice, Math.min(maxPrice, price));
    
    data.push({
      time: timeStr,
      price: Math.round(price * 100) / 100,
    });
  }

  return data;
}

// Generate datasets for all companies
companies.forEach(company => {
  const dataset = generateDataset(company);
  const filePath = path.join(__dirname, '..', 'public', 'data', `${company.symbol}.json`);
  
  fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2));
  console.log(`Generated dataset for ${company.symbol} (${company.name})`);
});

// Create a companies index file
const companiesIndex = companies.map(company => ({
  symbol: company.symbol,
  name: company.name,
  startPrice: company.startPrice,
  volatility: company.volatility,
}));

fs.writeFileSync(
  path.join(__dirname, '..', 'public', 'data', 'companies.json'),
  JSON.stringify(companiesIndex, null, 2),
);

console.log(`\nGenerated ${companies.length} company datasets`);
console.log('Companies index saved to public/data/companies.json');
