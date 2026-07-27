const http = require("http");

const PORT = 3000;

const page = `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SS Signal App</title>

<style>
*{box-sizing:border-box}

body{
  margin:0;
  background:#0f1117;
  color:white;
  font-family:Arial,sans-serif;
}

.header{
  padding:22px 15px;
  text-align:center;
  background:#171a22;
}

.header h1{
  margin:0;
  font-size:25px;
}

.header p{
  color:#9da4b2;
}

.container{
  max-width:500px;
  margin:25px auto;
  padding:15px;
}

.card{
  background:#1b1f2a;
  padding:18px;
  border-radius:15px;
  margin-bottom:15px;
}

label{
  display:block;
  margin-bottom:7px;
  color:#aeb5c2;
}

select,button{
  width:100%;
  padding:14px;
  border:0;
  border-radius:9px;
  margin-bottom:15px;
  font-size:16px;
}

select{
  background:#252a36;
  color:white;
}

button{
  background:#287cff;
  color:white;
  font-weight:bold;
}

button:active{
  transform:scale(.98);
}

.signal{
  text-align:center;
  font-size:30px;
  font-weight:bold;
  padding:15px;
}

.wait{color:#ffd166}
.buy{color:#22c55e}
.sell{color:#ef4444}

.history{
  font-size:13px;
  color:#c5cad3;
  line-height:1.8;
}
</style>
</head>

<body>

<div class="header">
  <h1>📊 SS Signal App</h1>
  <p>Trading Signal Dashboard</p>
</div>

<div class="container">

  <div class="card">

    <label>Market</label>

    <select id="market">
      <option>EUR/USD</option>
      <option>GBP/USD</option>
      <option>USD/JPY</option>
      <option>XAU/USD</option>
      <option>USD/BRL</option>
    </select>

    <label>Timeframe</label>

    <select id="timeframe">
      <option>1 Minute</option>
      <option>5 Minutes</option>
    </select>

    <button onclick="generateSignal()">
      🚀 Generate Signal
    </button>

  </div>

  <div class="card">

    <div style="text-align:center;color:#9da4b2">
      CURRENT SIGNAL
    </div>

    <div id="signal" class="signal wait">
      WAIT
    </div>

    <div id="details"
         style="text-align:center;color:#9da4b2">
      Select market and generate signal
    </div>

  </div>

  <div class="card">

    <h3>📜 Signal History</h3>

    <div id="history" class="history">
      No signal yet.
    </div>

  </div>

</div>

<script>

let history = [];

function generateSignal(){

  const market =
    document.getElementById("market").value;

  const timeframe =
    document.getElementById("timeframe").value;

  /*
    DEMO SIGNAL LOGIC:
    এটি বাস্তব মার্কেট ডেটা নয়।
    শুধু অ্যাপের UI/ফাংশন পরীক্ষা করার জন্য।
  */

  const signals = ["BUY", "SELL", "WAIT"];

  const signal =
    signals[Math.floor(Math.random() * signals.length)];

  const signalBox =
    document.getElementById("signal");

  signalBox.textContent = signal;

  signalBox.className = "signal " +
    signal.toLowerCase();

  document.getElementById("details").textContent =
    market + " • " + timeframe;

  const time =
    new Date().toLocaleTimeString();

  history.unshift(
    time + " — " +
    market + " — " +
    timeframe + " — " +
    signal
  );

  history = history.slice(0,10);

  document.getElementById("history").innerHTML =
    history.join("<br>");

}

</script>

</body>
</html>
`;

const server = http.createServer((req,res)=>{

  res.writeHead(200,{
    "Content-Type":"text/html; charset=utf-8"
  });

  res.end(page);

});

server.listen(PORT,"0.0.0.0",()=>{

  console.log("================================");
  console.log("📊 SS Signal App");
  console.log("🚀 Server started");
  console.log("🌐 Port: " + PORT);
  console.log("================================");

});
