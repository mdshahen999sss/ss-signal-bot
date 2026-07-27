const http = require("http");

const PORT = 3000;

let history = [];
let lastSignalMinute = null;

const page = `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
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
  padding:18px 15px;
  text-align:center;
  background:#171a22;
}

.header h1{
  margin:0;
  font-size:22px;
}

.header p{
  color:#9da4b2;
  margin:6px 0 0;
  font-size:12px;
}

.container{
  max-width:500px;
  margin:20px auto;
  padding:15px;
}

.card{
  background:#1a1f2b;
  border-radius:16px;
  padding:18px;
  margin-bottom:15px;
  box-shadow:0 4px 15px rgba(0,0,0,.2);
}

label{
  display:block;
  color:#9da4b2;
  margin-bottom:7px;
  font-size:14px;
}

select,button{
  width:100%;
  padding:14px;
  border-radius:10px;
  border:0;
  font-size:16px;
}

select{
  background:#252b38;
  color:white;
  margin-bottom:15px;
}

button{
  background:#287ff0;
  color:white;
  font-weight:bold;
  cursor:pointer;
}

.signal-title{
  text-align:center;
  color:#9da4b2;
  font-size:14px;
}

.signal{
  text-align:center;
  font-size:42px;
  font-weight:bold;
  margin:10px 0;
}

.buy{color:#21d477}
.sell{color:#ff4f64}
.wait{color:#ffc857}

.details{
  text-align:center;
  color:#aeb4c0;
  margin:8px 0;
}

.next{
  text-align:center;
  color:#ffcc55;
  font-size:14px;
  margin-top:10px;
}

.history-title{
  font-size:18px;
  font-weight:bold;
  margin-bottom:15px;
}

.history{
  color:#c8cdd7;
  line-height:1.9;
  font-size:13px;
}
</style>
</head>

<body>

<div class="header">
  <h1>📊 SS SIGNAL APP</h1>
  <p>Next Candle Signal</p>
</div>

<div class="container">

  <div class="card">

    <label>Market</label>

    <select id="market">
      <option>EUR/USD</option>
      <option>GBP/USD</option>
      <option>USD/JPY</option>
      <option>USD/CHF</option>
      <option>AUD/USD</option>
      <option>USD/CAD</option>
      <option>XAU/USD</option>
    </select>

    <label>Timeframe</label>

    <select id="timeframe">
      <option value="1">1 Minute</option>
    </select>

    <button onclick="generateSignal()">
      🚀 Generate Signal
    </button>

  </div>

  <div class="card">

    <div class="signal-title">
      CURRENT SIGNAL
    </div>

    <div id="signal" class="signal wait">
      WAIT
    </div>

    <div id="details" class="details">
      EUR/USD • 1 Minute
    </div>

    <div id="next" class="next">
      Preparing next candle...
    </div>

  </div>

  <div class="card">

    <div class="history-title">
      📜 Signal History
    </div>

    <div id="history" class="history">
      No signal yet
    </div>

  </div>

</div>

<script>

let currentSignalMinute = null;

/*
  পরবর্তী candle-এর সময় বের করে।
  উদাহরণ:
  এখন 12:46 হলে signal হবে 12:47 → 12:48
*/

function getNextCandle(){

  const now = new Date();

  const start = new Date(now);

  start.setSeconds(0);
  start.setMilliseconds(0);

  start.setMinutes(start.getMinutes() + 1);

  const end = new Date(start);

  end.setMinutes(end.getMinutes() + 1);

  return {
    start:start,
    end:end
  };
}


function formatMinute(date){

  return date.toLocaleTimeString([],{
    hour:"2-digit",
    minute:"2-digit",
    hour12:false
  });

}


/*
  প্রতি মিনিটের জন্য deterministic signal।
  একই মিনিটে বারবার click করলেও
  একই signal থাকবে।
*/

function signalForMinute(market, minuteKey){

  let hash = 0;

  const text = market + "-" + minuteKey;

  for(let i=0;i<text.length;i++){
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % 2 === 0
    ? "BUY"
    : "SELL";
}


/*
  নতুন signal তৈরি
*/

function generateSignal(){

  const market =
    document.getElementById("market").value;

  const candle = getNextCandle();

  const startText =
    formatMinute(candle.start);

  const endText =
    formatMinute(candle.end);

  /*
    minuteKey শুধু hour + minute।
    seconds এখানে ব্যবহার করা হচ্ছে না।
  */

  const minuteKey =
    candle.start.getFullYear() + "-" +
    candle.start.getMonth() + "-" +
    candle.start.getDate() + "-" +
    candle.start.getHours() + "-" +
    candle.start.getMinutes();

  /*
    একই মিনিটে আবার signal generate হতে দেবে না।
  */

  if(currentSignalMinute === minuteKey){

    return;
  }

  currentSignalMinute = minuteKey;

  const signal =
    signalForMinute(market, minuteKey);

  document.getElementById("signal").innerText =
    signal;

  document.getElementById("signal").className =
    "signal " +
    signal.toLowerCase();

  document.getElementById("details").innerText =
    market + " • 1 Minute";

  document.getElementById("next").innerText =
    "🎯 Signal For: " +
    startText + " → " + endText;


  /*
    History-তে একই candle-এর duplicate ঢুকবে না।
  */

  const historyItem =
    "⏱️ " +
    startText +
    " → " +
    endText +
    " — " +
    market +
    " — " +
    signal;

  history.unshift(historyItem);

  history =
    history.slice(0,10);

  document.getElementById("history").innerHTML =
    history.join("<br>");
}


/*
  পেজ খোলার সাথে সাথে প্রথম signal
*/

generateSignal();


/*
  প্রতি ১ সেকেন্ডে check করবে নতুন minute এসেছে কিনা।
  কিন্তু signal কেবল নতুন minute এ একবার তৈরি হবে।
*/

setInterval(function(){

  const candle = getNextCandle();

  const minuteKey =
    candle.start.getFullYear() + "-" +
    candle.start.getMonth() + "-" +
    candle.start.getDate() + "-" +
    candle.start.getHours() + "-" +
    candle.start.getMinutes();

  if(currentSignalMinute !== minuteKey){

    generateSignal();

  }

},1000);

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

  console.log("==============================");
  console.log("📊 SS Signal App");
  console.log("🚀 Server started");
  console.log("🌐 Port: " + PORT);
  console.log("==============================");

});
