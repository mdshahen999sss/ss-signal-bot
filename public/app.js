let countdownInterval = null;

async function generateSignal() {
  const assetSelect = document.getElementById('asset');
  const timeframeSelect = document.getElementById('timeframe');
  const btn = document.getElementById('generateBtn') || document.querySelector('button');

  const asset = assetSelect ? assetSelect.value : 'EUR/USD';
  const timeframe = timeframeSelect ? timeframeSelect.value : '1m';

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Analyzing Market...";
  }

  try {
    const res = await fetch(`/api/analyze?asset=${encodeURIComponent(asset)}&timeframe=${timeframe}`);
    const result = await res.json();

    if (!result.success) {
      alert("Error fetching signal: " + (result.error || "Unknown error"));
      return;
    }

    const data = result.data;

    // UI Elements Update with REAL Data
    const signalText = document.getElementById('signalText') || document.getElementById('taSignal');
    if (signalText) {
      signalText.innerText = data.signal;
      signalText.className = data.signal;
    }

    const confidenceVal = document.getElementById('confidenceVal') || document.getElementById('taScore');
    if (confidenceVal) {
      confidenceVal.innerText = data.confidenceScore + '%';
    }

    const entryTime = document.getElementById('entryTime');
    if (entryTime) {
      entryTime.innerText = new Date(data.entryTime).toLocaleTimeString();
    }

    // Countdown Timer Start
    const timeframeMinutes = parseInt(timeframe) || 1;
    startCountdown(timeframeMinutes);

    // OHLC Update
    if (document.getElementById('openVal')) document.getElementById('openVal').innerText = data.ohlc.open;
    if (document.getElementById('highVal')) document.getElementById('highVal').innerText = data.ohlc.high;
    if (document.getElementById('lowVal')) document.getElementById('lowVal').innerText = data.ohlc.low;
    if (document.getElementById('closeVal')) document.getElementById('closeVal').innerText = data.ohlc.close;

    // Technical Indicators Update
    if (document.getElementById('emaVal')) document.getElementById('emaVal').innerText = `${data.indicators.ema20 || '-'} / ${data.indicators.ema50 || '-'}`;
    if (document.getElementById('rsiVal') || document.getElementById('taRSI')) {
      const rsiEl = document.getElementById('rsiVal') || document.getElementById('taRSI');
      rsiEl.innerText = data.indicators.rsi || '-';
    }
    if (document.getElementById('macdVal') || document.getElementById('taMACD')) {
      const macdEl = document.getElementById('macdVal') || document.getElementById('taMACD');
      macdEl.innerText = data.indicators.macd || '-';
    }
    if (document.getElementById('paVal') || document.getElementById('taPA')) {
      const paEl = document.getElementById('paVal') || document.getElementById('taPA');
      paEl.innerText = data.indicators.priceAction;
    }
    if (document.getElementById('fractalVal') || document.getElementById('taFractal')) {
      const fracEl = document.getElementById('fractalVal') || document.getElementById('taFractal');
      fracEl.innerText = data.indicators.fractalStructure;
    }
    if (document.getElementById('sourceVal')) {
      document.getElementById('sourceVal').innerText = data.dataSource;
    }

    // Render Real History
    if (result.history) {
      renderHistory(result.history);
    }

  } catch (err) {
    console.error("Fetch Error:", err);
    alert("Connection error with server.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = "⚡ Get Signal ⭐";
    }
  }
}

function startCountdown(durationMinutes) {
  if (countdownInterval) clearInterval(countdownInterval);

  let secondsLeft = durationMinutes * 60;
  const countdownEl = document.getElementById('countdown') || document.getElementById('taTimer');

  if (!countdownEl) return;

  countdownInterval = setInterval(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;

    countdownEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      countdownEl.innerText = "EXPIRED";
    }
    secondsLeft--;
  }, 1000);
}

function renderHistory(history) {
  const tbody = document.getElementById('historyBody') || document.getElementById('historyTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  history.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.time}</td>
      <td>${item.asset}</td>
      <td style="color:${item.signal === 'BUY' ? '#22c55e' : (item.signal === 'SELL' ? '#ef4444' : '#fff')}; font-weight:bold;">${item.signal}</td>
      <td>${item.price}</td>
      <td>${item.confidence}</td>
    `;
    tbody.appendChild(tr);
  });
}
