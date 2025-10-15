import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { formatCurrency } from '../lib/utils';

export default function ChartComponent({ data, currentPrice, companyName }) {
  const chartData = data.map((tick, index) => ({
    time: tick.time,
    price: tick.price,
    index: index,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <p className="font-semibold text-gray-900">{`Time: ${label}`}</p>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {companyName ? companyName : 'Price Chart'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time price movements
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(currentPrice)}
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div className="card-professional p-6">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.56}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.04}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                strokeOpacity={0.6}
              />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ 
                  r: 6, 
                  fill: '#3b82f6',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-professional p-4 text-center">
          <p className="text-sm text-gray-600">Data Points</p>
          <p className="text-lg font-semibold text-gray-900">{data.length}</p>
        </div>
        <div className="card-professional p-4 text-center">
          <p className="text-sm text-gray-600">Min Price</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.length > 0 ? formatCurrency(Math.min(...data.map(d => d.price))) : '$0.00'}
          </p>
        </div>
        <div className="card-professional p-4 text-center">
          <p className="text-sm text-gray-600">Max Price</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.length > 0 ? formatCurrency(Math.max(...data.map(d => d.price))) : '$0.00'}
          </p>
        </div>
      </div>
    </div>
  );
}
