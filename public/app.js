async function fetchSignal() {
  const symbol = document.getElementById("symbolSelect").value;
  const interval = document.getElementById("intervalSelect").value;
  const btn = document.getElementById("generateBtn");

  btn.innerText = "⏳ Analyzing Market...";
  btn.disabled = true;

  try {
    const res = await fetch(`/api/signal?symbol=${encodeURIComponent(symbol)}&interval=${interval}`);
    const data = await res.json();

    if (data.error) {
      alert("API Error: " + data.error);
      return;
    }

    const cur = data.current;

    // Update Header & Price
    document.getElementById("marketBadge").innerText = `${cur.symbol} • ${cur.interval}`;
    document.getElementById("candleTime").innerText = cur.timestamp;
    document.getElementById("entryTime").innerText = cur.nextEntryTime;

    document.getElementById("pOpen").innerText = cur.price.open;
    document.getElementById("pHigh").innerText = cur.price.high;
    document.getElementById("pLow").innerText = cur.price.low;
    document.getElementById("pClose").innerText = cur.price.close;

    // Update Signal Decision
    const decBox = document.getElementById("decisionText");
    decBox.innerText = cur.signal;
    decBox.className = "decision-text " + cur.signal;

    // Progress Bar
    document.getElementById("confidenceValue").innerText = `${cur.confidence}/100`;
    document.getElementById("progressBar").style.width = `${cur.confidence}%`;

    // Indicators Breakdown
    document.getElementById("indPriceAction").innerText = cur.breakdown.priceAction;
    document.getElementById("indEma").innerText = cur.breakdown.ema;
    document.getElementById("indRsi").innerText = cur.breakdown.rsi;
    document.getElementById("indMacd").innerText = cur.breakdown.macd;
    document.getElementById("indFractal").innerText = cur.breakdown.fractal;
    document.getElementById("indVolume").innerText = cur.breakdown.volume;

    // History Table
    renderHistory(data.history);

  } catch (err) {
    console.error("Fetch Error:", err);
  } finally {
    btn.innerText = "🚀 Generate Signal";
    btn.disabled = false;
  }
}

function renderHistory(history) {
  const tbody = document.getElementById("historyTableBody");
  if (!history || history.length === 0) return;

  tbody.innerHTML = history.map(item => `
    <tr>
      <td>${item.timestamp}</td>
      <td style="color:#38ef7d; font-weight:bold;">${item.nextEntryTime}</td>
      <td class="${item.signal}"><b>${item.signal}</b></td>
      <td>${item.confidence}/100</td>
      <td>${item.price}</td>
    </tr>
  `).join('');
}

// Initial Auto Fetch
fetchSignal();

// Auto refresh frontend every 60 seconds
setInterval(fetchSignal, 60000);
