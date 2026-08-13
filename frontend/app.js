const $=id=>document.getElementById(id);
const canvas=$('chart'),ctx=canvas.getContext('2d');
let symbol='AMZN', timer=null, points=[];
const watch=[['AMZN','Amazon'],['AAPL','Apple'],['MSFT','Microsoft'],['NVDA','NVIDIA'],['ABBV','AbbVie'],['EURUSD','EUR/USD']];

function money(n){return Number.isFinite(n)?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n):'—'}
function setStatus(ok,text){$('marketStatus').className='status '+(ok?'ok':'');$('marketStatus').innerHTML='<i></i> '+text}
function resize(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);draw()}
window.addEventListener('resize',resize);

function draw(){
  const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#172a3d';
  for(let i=1;i<6;i++){let y=i*h/6;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  if(points.length<2)return;
  const min=Math.min(...points),max=Math.max(...points),span=max-min||1;
  ctx.beginPath();points.forEach((p,i)=>{let x=i*(w-16)/(points.length-1)+8,y=h-((p-min)/span)*h*.84-h*.04;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
  ctx.strokeStyle='#4da3ff';ctx.lineWidth=2.5;ctx.stroke();
}

function renderWatch(){
  $('watchlist').innerHTML=watch.map(([s,n])=>`<div class="watchItem" onclick="selectSymbol('${s}')"><div><b>${s}</b><small>${n}</small></div><div><b id="w_${s}">—</b><small id="c_${s}">—</small></div></div>`).join('');
}

function selectSymbol(s){$('symbolSearch').value=s;loadSymbol(s)}

async function fetchQuote(s){
  // Backend endpoint. It is intentionally not replaced with fake prices.
  const r=await fetch(`/api/quote?symbol=${encodeURIComponent(s)}`,{cache:'no-store'});
  if(!r.ok)throw new Error('Backend quote unavailable');
  return await r.json();
}

async function loadSymbol(s){
  symbol=s.toUpperCase();$('symbol').textContent=symbol;$('feedLabel').textContent='Secure backend feed';
  try{
    const d=await fetchQuote(symbol);
    if(!Number.isFinite(Number(d.price)))throw new Error('Invalid price');
    $('price').textContent=money(Number(d.price));
    const ch=Number(d.changePercent);$('change').textContent=Number.isFinite(ch)?(ch>=0?'+':'')+ch.toFixed(2)+'%':'—';
    $('change').className=ch>=0?'green':'red';
    $('open').textContent=money(Number(d.open));$('high').textContent=money(Number(d.high));$('low').textContent=money(Number(d.low));
    $('volume').textContent=Number.isFinite(Number(d.volume))?Number(d.volume).toLocaleString():'—';
    $('updated').textContent=d.updated?new Date(d.updated).toLocaleTimeString():'—';
    $('session').textContent=d.session||'Unknown';points=d.history||[Number(d.price)];draw();analyse(ch);setStatus(true,'LIVE DATA CONNECTED');
  }catch(e){
    setStatus(false,'LIVE DATA NOT CONNECTED');$('feedLabel').textContent='Awaiting backend connection';
    $('price').textContent='—';$('change').textContent='Live feed unavailable';
    console.warn(e);
  }
}
function analyse(ch){
  const signal=Number(ch)>0.5?'BUY':Number(ch)<-0.5?'SELL':'WAIT';
  $('signal').textContent=signal;$('signal').className=signal==='BUY'?'green':signal==='SELL'?'red':'';
  const confidence=Math.min(95,Math.max(50,55+Math.abs(Number(ch)||0)*8));$('confidence').textContent=confidence.toFixed(0)+'%';$('bar').style.width=confidence+'%';
  $('trend').textContent=signal==='WAIT'?'NEUTRAL':signal==='BUY'?'BULLISH':'BEARISH';$('momentum').textContent=Number.isFinite(Number(ch))?Number(ch).toFixed(2)+'%':'—';
}
async function loadWatch(){
  for(const [s] of watch){try{const d=await fetchQuote(s);const p=Number(d.price);const c=Number(d.changePercent);$('w_'+s).textContent=s==='EURUSD'?p.toFixed(5):money(p);$('c_'+s).textContent=Number.isFinite(c)?(c>=0?'+':'')+c.toFixed(2)+'%':'—';$('c_'+s).className=Number(c)>=0?'green':'red'}catch(e){}}
}
async function load(){await loadSymbol(symbol);loadWatch();clearTimeout(timer);timer=setTimeout(load,15000)}
$('searchBtn').onclick=()=>loadSymbol($('symbolSearch').value.trim()||'AMZN');
$('symbolSearch').addEventListener('keydown',e=>{if(e.key==='Enter')$('searchBtn').click()});
renderWatch();setTimeout(resize,50);load();
