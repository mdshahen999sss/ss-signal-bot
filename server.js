require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const { calculateIndicators } = require("./indicators");
const { generateSignal } = require("./strategy");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TWELVE_DATA_API_KEY;

let signalHistory = [];

app.use(express.static(path.join(__dirname, "public")));

// Helper function to format Current System Time (Matches device clock)
function getCurrentClockTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = "00"; // Candles align to minute start
  return `${hours}:${minutes}:${seconds}`;
}

function getNextMinuteClockTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = "00";
  return `${hours}:${minutes}:${seconds}`;
}

app.get("/api/signal", async (req, res) => {
  const symbol = req.query.symbol || "EUR/USD";
  const interval = req.query.interval || "1min";

  try {
    const url = "https://api.twelvedata.com/time_series";

    const response = await axios.get(url, {
      params: {
        symbol: symbol,
        interval: interval,
        outputsize: 50,
        apikey: API_KEY
      }
    });

    if (response.data.status === "error") {
      return res.status(400).json({ error: response.data.message });
    }

    const candles = response.data.values;
    const latestCandle = candles[0];

    const indicators = calculateIndicators(candles);
    const signalResult = generateSignal(indicators, latestCandle);

    // Sync directly with current clock time (Matches Phone Clock Perfectly)
    const candleTimeFormatted = getCurrentClockTime();
    const nextEntryTimeFormatted = getNextMinuteClockTime();

    const fullAnalysis = {
      timestamp: candleTimeFormatted,
      nextEntryTime: nextEntryTimeFormatted,
      symbol: symbol,
      interval: interval,
      price: {
        open: latestCandle.open,
        high: latestCandle.high,
        low: latestCandle.low,
        close: latestCandle.close
      },
      signal: signalResult.decision,
      confidence: signalResult.confidence,
      scores: signalResult.scores,
      indicators: indicators,
      breakdown: {
        priceAction: signalResult.breakdown.priceAction || "Neutral",
        ema: signalResult.breakdown.ema || "Neutral",
        rsi: signalResult.breakdown.rsi || "Neutral",
        macd: signalResult.breakdown.macd || "Neutral",
        fractal: typeof signalResult.breakdown.fractal === 'string' ? signalResult.breakdown.fractal : "Neutral",
        volume: typeof signalResult.breakdown.volume === 'string' ? signalResult.breakdown.volume : "N/A"
      }
    };

    const exists = signalHistory.some(item => item.timestamp === candleTimeFormatted && item.symbol === symbol);
    if (!exists) {
      signalHistory.unshift({
        timestamp: candleTimeFormatted,
        nextEntryTime: nextEntryTimeFormatted,
        symbol: symbol,
        interval: interval,
        signal: signalResult.decision,
        confidence: signalResult.confidence,
        price: latestCandle.close
      });

      if (signalHistory.length > 20) signalHistory.pop();
    }

    res.json({
      current: fullAnalysis,
      history: signalHistory
    });

  } catch (error) {
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 SS Signal App is running live at: http://localhost:${PORT}`);
});
