const { RSI, MACD, EMA } = require('technicalindicators');

// Williams Fractal Calculation Function (5-candle pattern)
function calculateFractals(candles) {
  let isBullishFractal = false; // Support
  let isBearishFractal = false; // Resistance

  if (candles.length < 5) return { isBullishFractal, isBearishFractal };

  // Testing index 2 (middle candle among last 5 confirmed candles)
  const c0 = parseFloat(candles[4].high);
  const c1 = parseFloat(candles[3].high);
  const c2 = parseFloat(candles[2].high); // middle
  const c3 = parseFloat(candles[1].high);
  const c4 = parseFloat(candles[0].high);

  const l0 = parseFloat(candles[4].low);
  const l1 = parseFloat(candles[3].low);
  const l2 = parseFloat(candles[2].low); // middle
  const l3 = parseFloat(candles[1].low);
  const l4 = parseFloat(candles[0].low);

  // Bearish Fractal (Resistance) - Middle High is highest
  if (c2 > c0 && c2 > c1 && c2 > c3 && c2 > c4) {
    isBearishFractal = true;
  }

  // Bullish Fractal (Support) - Middle Low is lowest
  if (l2 < l0 && l2 < l1 && l2 < l3 && l2 < l4) {
    isBullishFractal = true;
  }

  return { isBullishFractal, isBearishFractal };
}

// Volume Analysis Function with Fallback
function analyzeVolume(candles) {
  const latestVolume = parseFloat(candles[candles.length - 1]?.volume);

  // If volume is missing, null, undefined, or zero
  if (isNaN(latestVolume) || latestVolume === 0) {
    return {
      available: false,
      isHighVolume: false,
      status: "N/A (Not Provided by Data Feed)"
    };
  }

  // Calculate Average Volume over available candles
  const totalVolume = candles.reduce((sum, c) => sum + (parseFloat(c.volume) || 0), 0);
  const avgVolume = totalVolume / candles.length;

  return {
    available: true,
    latestVolume: latestVolume,
    avgVolume: Number(avgVolume.toFixed(2)),
    isHighVolume: latestVolume > avgVolume,
    status: latestVolume > avgVolume ? "High" : "Normal/Low"
  };
}

function calculateIndicators(candles) {
  if (!candles || candles.length < 30) {
    return { error: "Not enough candle data for accurate indicator calculation" };
  }

  // Twelve Data sends data newest-first, we need oldest-first for technical indicators
  const sortedCandles = [...candles].reverse();
  const closePrices = sortedCandles.map(c => parseFloat(c.close));

  // 1. Calculate RSI (14 period)
  const rsiArray = RSI.calculate({
    values: closePrices,
    period: 14
  });

  // 2. Calculate EMA Fast (12) and EMA Slow (26)
  const emaFastArray = EMA.calculate({
    values: closePrices,
    period: 12
  });

  const emaSlowArray = EMA.calculate({
    values: closePrices,
    period: 26
  });

  // 3. Calculate MACD (12, 26, 9)
  const macdArray = MACD.calculate({
    values: closePrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  // 4. Calculate Fractals
  const fractals = calculateFractals(sortedCandles);

  // 5. Analyze Volume
  const volumeData = analyzeVolume(sortedCandles);

  // Latest values
  const latestRSI = rsiArray[rsiArray.length - 1];
  const latestEmaFast = emaFastArray[emaFastArray.length - 1];
  const latestEmaSlow = emaSlowArray[emaSlowArray.length - 1];
  const latestMACD = macdArray[macdArray.length - 1];

  return {
    rsi: Number(latestRSI?.toFixed(2)) || null,
    emaFast: Number(latestEmaFast?.toFixed(5)) || null,
    emaSlow: Number(latestEmaSlow?.toFixed(5)) || null,
    macd: {
      MACD: Number(latestMACD?.MACD?.toFixed(5)) || null,
      signal: Number(latestMACD?.signal?.toFixed(5)) || null,
      histogram: Number(latestMACD?.histogram?.toFixed(5)) || null
    },
    fractals: {
      supportConfirmed: fractals.isBullishFractal,
      resistanceConfirmed: fractals.isBearishFractal
    },
    volume: volumeData
  };
}

module.exports = { calculateIndicators };
