require("dotenv").config();
const axios = require("axios");
const { calculateIndicators } = require("./indicators");
const { generateSignal } = require("./strategy");

const API_KEY = process.env.TWELVE_DATA_API_KEY;

// Store last processed candle timestamp to prevent duplicate signals
let lastProcessedTime = null;

async function fetchAndAnalyzeMarket() {
  try {
    const url = "https://api.twelvedata.com/time_series";

    const response = await axios.get(url, {
      params: {
        symbol: "EUR/USD",
        interval: "1min",
        outputsize: 50,
        apikey: API_KEY
      }
    });

    if (response.data.status === "error") {
      console.log("Twelve Data Error:", response.data.message);
      return;
    }

    const candles = response.data.values;
    const latestCandle = candles[0];

    // Check for duplicate candle timestamp
    if (latestCandle.datetime === lastProcessedTime) {
      console.log(`[${new Date().toLocaleTimeString()}] No new candle yet. Waiting for next candle...`);
      return;
    }

    // Update last processed timestamp
    lastProcessedTime = latestCandle.datetime;

    // Calculate Indicators & Strategy
    const indicators = calculateIndicators(candles);
    const signalResult = generateSignal(indicators, latestCandle);

    console.log("\n==============================================");
    console.log(`⏰ CANDLE TIME : ${latestCandle.datetime}`);
    console.log(`📊 CANDLE DATA : Open: ${latestCandle.open} | Close: ${latestCandle.close} | High: ${latestCandle.high} | Low: ${latestCandle.low}`);
    console.log(`🟢🔴 FINAL DECISION : ${signalResult.decision}`);
    console.log(`📈 STRATEGY SCORE  : ${signalResult.confidence}/100`);
    console.log("📌 SCORES          :", signalResult.scores);
    console.log("🔍 ANALYSIS        :", signalResult.breakdown);
    console.log("==============================================\n");

  } catch (error) {
    console.log("Request Error:", error.response?.data || error.message);
  }
}

// Initial Run
console.log("🚀 Starting SS Signal App Auto Engine (1-Minute Intervals)...");
fetchAndAnalyzeMarket();

// Auto-run every 15 seconds to catch new 1-minute candle as soon as it arrives
setInterval(() => {
  fetchAndAnalyzeMarket();
}, 15000);
