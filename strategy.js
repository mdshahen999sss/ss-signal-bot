function generateSignal(indicators, latestCandle) {
  let buyScore = 0;
  let sellScore = 0;

  const open = parseFloat(latestCandle.open);
  const high = parseFloat(latestCandle.high);
  const low = parseFloat(latestCandle.low);
  const close = parseFloat(latestCandle.close);

  const candleBody = Math.abs(close - open);
  const totalRange = high - low;
  const isBullishCandle = close > open;
  const isBearishCandle = close < open;

  // 1. ADVANCED PRICE ACTION ANALYSIS (High Weight: Max 4 Points)
  let priceActionStatus = "Neutral Candle";
  
  if (totalRange > 0) {
    const upperWick = high - Math.max(open, close);
    const lowerWick = Math.min(open, close) - low;

    // Strong Momentum Candle (Body >= 60% of total range)
    if (candleBody / totalRange >= 0.6) {
      if (isBullishCandle) {
        buyScore += 3;
        priceActionStatus = "Strong Bullish Body";
      } else if (isBearishCandle) {
        sellScore += 3;
        priceActionStatus = "Strong Bearish Body";
      }
    } 
    // Rejection / Pinbar
    else if (lowerWick > candleBody * 2 && isBullishCandle) {
      buyScore += 3;
      priceActionStatus = "Bullish Rejection (Pinbar)";
    } else if (upperWick > candleBody * 2 && isBearishCandle) {
      sellScore += 3;
      priceActionStatus = "Bearish Rejection (Pinbar)";
    } else {
      if (isBullishCandle) {
        buyScore += 1;
        priceActionStatus = "Weak Bullish Candle";
      } else if (isBearishCandle) {
        sellScore += 1;
        priceActionStatus = "Weak Bearish Candle";
      }
    }
  }

  // 2. EMA Trend (2 Points)
  let emaStatus = "Neutral";
  if (indicators.emaFast > indicators.emaSlow) {
    buyScore += 2;
    emaStatus = "Bullish";
  } else if (indicators.emaFast < indicators.emaSlow) {
    sellScore += 2;
    emaStatus = "Bearish";
  }

  // 3. RSI Momentum (2 Points)
  let rsiStatus = "Neutral";
  if (indicators.rsi > 52) {
    buyScore += 2;
    rsiStatus = `Bullish (${indicators.rsi})`;
  } else if (indicators.rsi < 48) {
    sellScore += 2;
    rsiStatus = `Bearish (${indicators.rsi})`;
  }

  // 4. MACD Confirmation (2 Points)
  let macdStatus = "Neutral";
  if (indicators.macd.histogram > 0) {
    buyScore += 2;
    macdStatus = "Bullish Crossover";
  } else if (indicators.macd.histogram < 0) {
    sellScore += 2;
    macdStatus = "Bearish Crossover";
  }

  // Decision Logic (Threshold 6 points out of 9)
  let decision = "WAIT";
  let confidence = Math.round((Math.max(buyScore, sellScore) / 9) * 100);

  // Price Action Validation Check (Don't BUY on Bearish Candle or SELL on Bullish Candle)
  if (buyScore >= 6 && isBullishCandle) {
    decision = "BUY";
  } else if (sellScore >= 6 && isBearishCandle) {
    decision = "SELL";
  }

  return {
    decision,
    confidence,
    scores: { buyScore, sellScore },
    breakdown: {
      priceAction: priceActionStatus,
      ema: emaStatus,
      rsi: rsiStatus,
      macd: macdStatus,
      fractal: indicators.fractal,
      volume: indicators.volume
    }
  };
}

module.exports = { generateSignal };
