require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const { EMA, RSI, MACD } = require('technicalindicators');

const app = express();
const PORT = process.env.PORT || 3000;
const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY || '';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const signalHistory = [];

async function fetchYahooOHLC(symbol, interval = '1m') {
  const yahooSymbol = symbol.replace('/', '') + '=X';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=1d&interval=${interval}`;
  
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  const result = response.data.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];

  const ohlc = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (quotes.open[i] && quotes.high[i] && quotes.low[i] && quotes.close[i]) {
      ohlc.push({
        open: quotes.open[i],
        high: quotes.high[i],
        low: quotes.low[i],
        close: quotes.close[i],
        datetime: new Date(timestamps[i] * 1000).toISOString()
      });
    }
  }
  return ohlc;
}

async function fetchTwelveDataOHLC(symbol, interval = '1min') {
  if (!TWELVE_DATA_API_KEY) throw new Error("Twelve Data API key missing");
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=100&apikey=${TWELVE_DATA_API_KEY}`;
  
  const response = await axios.get(url);
  if (response.data.status === 'error' || !response.data.values) {
    throw new Error(response.data.message || "Twelve Data Fetch Failed");
  }

  return response.data.values.reverse().map(item => ({
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    datetime: item.datetime
  }));
}

function detectFractals(ohlc) {
  const len = ohlc.length;
  if (len < 5) return { isUpFractal: false, isDownFractal: false };
  
  const i = len - 3;
  const isUpFractal = ohlc[i].high > ohlc[i-2].high && ohlc[i].high > ohlc[i-1].high &&
                      ohlc[i].high > ohlc[i+1].high && ohlc[i].high > ohlc[i+2].high;
                      
  const isDownFractal = ohlc[i].low < ohlc[i-2].low && ohlc[i].low < ohlc[i-1].low &&
                        ohlc[i].low < ohlc[i+1].low && ohlc[i].low < ohlc[i+2].low;

  return { isUpFractal, isDownFractal };
}

function detectPriceAction(ohlc) {
  const current = ohlc[ohlc.length - 1];
  const prev = ohlc[ohlc.length - 2];
  
  const isBullishEngulfing = prev.close < prev.open && current.close > current.open && current.close >= prev.open && current.open <= prev.close;
  const isBearishEngulfing = prev.close > prev.open && current.close < current.open && current.close <= prev.open && current.open >= prev.close;
  
  const body = Math.abs(current.close - current.open);
  const totalRange = current.high - current.low;
  const isPinbar = body / totalRange < 0.3 && (current.high - Math.max(current.open, current.close)) > body * 2;

  if (isBullishEngulfing) return "Bullish Engulfing";
  if (isBearishEngulfing) return "Bearish Engulfing";
  if (isPinbar) return "Pinbar Pattern";
  return current.close > current.open ? "Bullish Candle" : "Bearish Candle";
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/analyze', async (req, res) => {
  try {
    const asset = req.query.asset || 'EUR/USD';
    const timeframe = req.query.timeframe || '1m';
    const twelveInterval = timeframe === '1m' ? '1min' : timeframe;

    let ohlc = [];
    let dataSource = 'Twelve Data';

    try {
      ohlc = await fetchTwelveDataOHLC(asset, twelveInterval);
    } catch (err) {
      console.warn("Twelve Data failed, falling back to Yahoo Finance:", err.message);
      ohlc = await fetchYahooOHLC(asset, timeframe);
      dataSource = 'Yahoo Finance';
    }

    if (!ohlc || ohlc.length < 30) {
      return res.status(400).json({ error: "Insufficient market data to analyze." });
    }

    const closes = ohlc.map(d => d.close);
    const latestOHLC = ohlc[ohlc.length - 1];

    const ema20Arr = EMA.calculate({ period: 20, values: closes });
    const ema50Arr = EMA.calculate({ period: 50, values: closes });
    const rsiArr = RSI.calculate({ period: 14, values: closes });
    const macdArr = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });

    const ema20 = ema20Arr[ema20Arr.length - 1];
    const ema50 = ema50Arr[ema50Arr.length - 1];
    const rsi = rsiArr[rsiArr.length - 1];
    const macd = macdArr[macdArr.length - 1];

    const fractals = detectFractals(ohlc);
    const priceAction = detectPriceAction(ohlc);

    let buyScore = 0;
    let sellScore = 0;

    if (latestOHLC.close > ema20 && ema20 > ema50) buyScore += 25;
    if (latestOHLC.close < ema20 && ema20 < ema50) sellScore += 25;

    if (rsi > 50 && rsi < 70) buyScore += 20;
    if (rsi < 50 && rsi > 30) sellScore += 20;
    if (rsi <= 30) buyScore += 30;
    if (rsi >= 70) sellScore += 30;

    if (macd && macd.histogram > 0) buyScore += 25;
    if (macd && macd.histogram < 0) sellScore += 25;

    if (priceAction.includes("Bullish")) buyScore += 20;
    if (priceAction.includes("Bearish")) sellScore += 20;

    if (fractals.isDownFractal) buyScore += 10;
    if (fractals.isUpFractal) sellScore += 10;

    let signal = "NEUTRAL";
    let confidence = 50;

    if (buyScore > sellScore && buyScore >= 50) {
      signal = "BUY";
      confidence = Math.min(Math.round((buyScore / 110) * 100), 98);
    } else if (sellScore > buyScore && sellScore >= 50) {
      signal = "SELL";
      confidence = Math.min(Math.round((sellScore / 110) * 100), 98);
    }

    const entryTime = new Date().toISOString();

    const responseData = {
      asset,
      timeframe,
      signal,
      confidenceScore: confidence,
      dataSource,
      entryTime,
      ohlc: latestOHLC,
      indicators: {
        ema20: ema20 ? ema20.toFixed(5) : null,
        ema50: ema50 ? ema50.toFixed(5) : null,
        rsi: rsi ? rsi.toFixed(2) : null,
        macd: macd ? macd.histogram.toFixed(5) : null,
        priceAction,
        fractalStructure: fractals.isUpFractal ? "Up Fractal (Resistance)" : (fractals.isDownFractal ? "Down Fractal (Support)" : "None")
      }
    };

    signalHistory.unshift({
      id: Date.now(),
      asset,
      signal,
      confidence: confidence + '%',
      price: latestOHLC.close,
      time: new Date().toLocaleTimeString()
    });
    if (signalHistory.length > 20) signalHistory.pop();

    res.json({ success: true, data: responseData, history: signalHistory });

  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`📊 SS SIGNAL REAL MARKET ENGINE`);
  console.log(`🚀 PORT: ${PORT}`);
  console.log(`🔑 Twelve Data: ${TWELVE_DATA_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
  console.log(`=================================`);
  console.log(`Server running on http://localhost:${PORT}`);
});
