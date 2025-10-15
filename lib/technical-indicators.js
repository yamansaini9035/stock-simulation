/**
 * Technical Indicators Library
 * Provides various technical analysis indicators for trading charts
 */

// Simple Moving Average (SMA)
export function calculateSMA(data, period) {
  if (!data || data.length < period) return [];
  const isNumberSeries = typeof data[0] === 'number';
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const window = data.slice(i - period + 1, i + 1);
    const sum = window.reduce((acc, item) => acc + (isNumberSeries ? item : item.close), 0);
    const avg = sum / period;
    if (isNumberSeries) sma.push(avg); else sma.push({ time: data[i].time, value: avg });
  }
  return sma;
}

// Exponential Moving Average (EMA)
export function calculateEMA(data, period) {
  if (!data || data.length < period) return [];
  const isNumberSeries = typeof data[0] === 'number';
  const ema = [];
  const multiplier = 2 / (period + 1);
  const firstSMA = data.slice(0, period).reduce((acc, item) => acc + (isNumberSeries ? item : item.close), 0) / period;
  if (isNumberSeries) {
    ema.push(firstSMA);
    for (let i = period; i < data.length; i++) {
      const prev = ema[ema.length - 1];
      const value = ( (isNumberSeries ? data[i] : data[i].close) - prev ) * multiplier + prev;
      ema.push(value);
    }
    return ema;
  } else {
    ema.push({ time: data[period - 1].time, value: firstSMA });
    for (let i = period; i < data.length; i++) {
      const prev = ema[ema.length - 1].value;
      const value = (data[i].close - prev) * multiplier + prev;
      ema.push({ time: data[i].time, value });
    }
    return ema;
  }
}

// Relative Strength Index (RSI)
export function calculateRSI(data, period = 14) {
  if (!data || data.length < period + 1) return [];
  const isNumberSeries = typeof data[0] === 'number';
  const rsi = [];
  const gains = [];
  const losses = [];
  for (let i = 1; i < data.length; i++) {
    const curr = isNumberSeries ? data[i] : data[i].close;
    const prev = isNumberSeries ? data[i - 1] : data[i - 1].close;
    const change = curr - prev;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  let avgGain = gains.slice(0, period).reduce((acc, gain) => acc + gain, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((acc, loss) => acc + loss, 0) / period;
  const firstRSI = 100 - (100 / (1 + (avgLoss === 0 ? 100 : avgGain / avgLoss)));
  if (isNumberSeries) rsi.push(firstRSI); else rsi.push({ time: data[period].time, value: firstRSI });
  for (let i = period + 1; i < data.length; i++) {
    const gain = gains[i - 1];
    const loss = losses[i - 1];
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const value = 100 - (100 / (1 + (avgLoss === 0 ? 100 : avgGain / avgLoss)));
    if (isNumberSeries) rsi.push(value); else rsi.push({ time: data[i].time, value });
  }
  return rsi;
}

// Bollinger Bands
export function calculateBollingerBands(data, period = 20, multiplier = 2) {
  if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
  const isNumberSeries = typeof data[0] === 'number';
  const sma = calculateSMA(data, period);
  const bands = { upper: [], middle: [], lower: [] };
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const values = slice.map((item) => (isNumberSeries ? item : item.close));
    const mean = values.reduce((a, b) => a + b, 0) / period;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    const middle = isNumberSeries ? sma[i - period + 1] : sma[i - period + 1].value;
    const upper = middle + multiplier * stdDev;
    const lower = middle - multiplier * stdDev;
    if (isNumberSeries) {
      bands.upper.push(upper); bands.middle.push(middle); bands.lower.push(lower);
    } else {
      bands.upper.push({ time: data[i].time, value: upper });
      bands.middle.push({ time: data[i].time, value: middle });
      bands.lower.push({ time: data[i].time, value: lower });
    }
  }
  return bands;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!data || data.length < slowPeriod) return { macd: [], signal: [], histogram: [] };
  const isNumberSeries = typeof data[0] === 'number';
  const fast = calculateEMA(data, fastPeriod);
  const slow = calculateEMA(data, slowPeriod);
  const macd = [];
  for (let i = 0; i < Math.min(fast.length, slow.length); i++) {
    const fv = isNumberSeries ? fast[i] : fast[i].value;
    const sv = isNumberSeries ? slow[i] : slow[i].value;
    if (isNumberSeries) macd.push(fv - sv); else macd.push({ time: fast[i].time, value: fv - sv });
  }
  let signal = [];
  const histogram = [];
  if (macd.length >= signalPeriod) {
    if (isNumberSeries) {
      signal = calculateEMA(macd, signalPeriod);
      for (let i = 0; i < Math.min(macd.length, signal.length); i++) histogram.push(macd[i] - signal[i]);
    } else {
      const signalEMA = calculateEMA(macd.map(m => ({ close: m.value, time: m.time })), signalPeriod);
      for (let i = 0; i < Math.min(macd.length, signalEMA.length); i++) {
        signal.push({ time: macd[i].time, value: signalEMA[i].value });
        histogram.push({ time: macd[i].time, value: macd[i].value - signalEMA[i].value });
      }
    }
  }
  return { macd, signal, histogram };
}

// Volume Weighted Average Price (VWAP)
export function calculateVWAP(data) {
  if (!data || data.length === 0) return [];
  
  const vwap = [];
  let cumulativeVolume = 0;
  let cumulativeVolumePrice = 0;
  
  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
    const volume = data[i].volume || 1;
    
    cumulativeVolume += volume;
    cumulativeVolumePrice += typicalPrice * volume;
    
    vwap.push({
      time: data[i].time,
      value: cumulativeVolumePrice / cumulativeVolume,
    });
  }
  
  return vwap;
}

// On-Balance Volume (OBV)
export function calculateOBV(data) {
  if (!data || data.length === 0) return [];
  
  const obv = [];
  let obvValue = 0;
  
  for (let i = 0; i < data.length; i++) {
    const volume = data[i].volume || 0;
    
    if (i === 0) {
      obvValue = volume;
    } else {
      if (data[i].close > data[i - 1].close) {
        obvValue += volume;
      } else if (data[i].close < data[i - 1].close) {
        obvValue -= volume;
      }
      // If close equals previous close, OBV remains unchanged
    }
    
    obv.push({
      time: data[i].time,
      value: obvValue,
    });
  }
  
  return obv;
}

// Stochastic Oscillator
export function calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
  if (!data || data.length < kPeriod) return { k: [], d: [] };
  
  const k = [];
  const d = [];
  
  for (let i = kPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...slice.map(item => item.high));
    const lowestLow = Math.min(...slice.map(item => item.low));
    const currentClose = data[i].close;
    
    const kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    k.push({
      time: data[i].time,
      value: kValue,
    });
  }
  
  // Calculate %D (SMA of %K)
  for (let i = dPeriod - 1; i < k.length; i++) {
    const slice = k.slice(i - dPeriod + 1, i + 1);
    const dValue = slice.reduce((acc, item) => acc + item.value, 0) / dPeriod;
    d.push({
      time: k[i].time,
      value: dValue,
    });
  }
  
  return { k, d };
}

// Williams %R
export function calculateWilliamsR(data, period = 14) {
  if (!data || data.length < period) return [];
  
  const williamsR = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const highestHigh = Math.max(...slice.map(item => item.high));
    const lowestLow = Math.min(...slice.map(item => item.low));
    const currentClose = data[i].close;
    
    const wrValue = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
    williamsR.push({
      time: data[i].time,
      value: wrValue,
    });
  }
  
  return williamsR;
}

// Commodity Channel Index (CCI)
export function calculateCCI(data, period = 20) {
  if (!data || data.length < period) return [];
  
  const cci = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const typicalPrices = slice.map(item => (item.high + item.low + item.close) / 3);
    const sma = typicalPrices.reduce((acc, tp) => acc + tp, 0) / period;
    const meanDeviation = typicalPrices.reduce((acc, tp) => acc + Math.abs(tp - sma), 0) / period;
    
    const currentTP = (data[i].high + data[i].low + data[i].close) / 3;
    const cciValue = meanDeviation === 0 ? 0 : (currentTP - sma) / (0.015 * meanDeviation);
    
    cci.push({
      time: data[i].time,
      value: cciValue,
    });
  }
  
  return cci;
}

// Main TechnicalIndicators class
class TechnicalIndicators {
  static calculateSMA = calculateSMA;
  static calculateEMA = calculateEMA;
  static calculateRSI = calculateRSI;
  static calculateBollingerBands = calculateBollingerBands;
  static calculateMACD = calculateMACD;
  static calculateVWAP = calculateVWAP;
  static calculateOBV = calculateOBV;
  static calculateStochastic = calculateStochastic;
  static calculateWilliamsR = calculateWilliamsR;
  static calculateCCI = calculateCCI;
  
  // Color mapping used by chart components
  static indicatorColors = {
    SMA: '#FFD700',
    EMA: '#00FFFF',
    RSI: '#8B5CF6',
    BollingerUpper: '#FF6B6B',
    BollingerMiddle: '#999999',
    BollingerLower: '#4ECDC4',
    MACD: '#00FFFF',
    MACDSignal: '#FF6B6B',
    MACDHistogram: '#8884d8',
    VWAP: '#F59E0B',
    OBV: '#34D399',
    StochasticK: '#60A5FA',
    StochasticD: '#F472B6',
    WilliamsR: '#F59E0B',
    CCI: '#A3E635',
  };

  static getIndicatorColor(name, fallback = '#AAAAAA') {
    return this.indicatorColors[name] || fallback;
  }
  
  // Calculate all indicators for given data
  static calculateAll(data, options = {}) {
    const {
      sma = { enabled: true, period: 20 },
      ema = { enabled: true, period: 20 },
      rsi = { enabled: true, period: 14 },
      bollinger = { enabled: false, period: 20, multiplier: 2 },
      macd = { enabled: false, fast: 12, slow: 26, signal: 9 },
      vwap = { enabled: false },
      obv = { enabled: false },
      stochastic = { enabled: false, kPeriod: 14, dPeriod: 3 },
      williamsR = { enabled: false, period: 14 },
      cci = { enabled: false, period: 20 },
    } = options;
    
    const indicators = {};
    
    if (sma.enabled) {
      indicators.sma = calculateSMA(data, sma.period);
    }
    
    if (ema.enabled) {
      indicators.ema = calculateEMA(data, ema.period);
    }
    
    if (rsi.enabled) {
      indicators.rsi = calculateRSI(data, rsi.period);
    }
    
    if (bollinger.enabled) {
      indicators.bollinger = calculateBollingerBands(data, bollinger.period, bollinger.multiplier);
    }
    
    if (macd.enabled) {
      indicators.macd = calculateMACD(data, macd.fast, macd.slow, macd.signal);
    }
    
    if (vwap.enabled) {
      indicators.vwap = calculateVWAP(data);
    }
    
    if (obv.enabled) {
      indicators.obv = calculateOBV(data);
    }
    
    if (stochastic.enabled) {
      indicators.stochastic = calculateStochastic(data, stochastic.kPeriod, stochastic.dPeriod);
    }
    
    if (williamsR.enabled) {
      indicators.williamsR = calculateWilliamsR(data, williamsR.period);
    }
    
    if (cci.enabled) {
      indicators.cci = calculateCCI(data, cci.period);
    }
    
    return indicators;
  }
}

export default TechnicalIndicators;

