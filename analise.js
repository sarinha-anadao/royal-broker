const logos={
  PETR4:"img/petr4.png", VALE3:"img/vale3.png", ITUB4:"img/itub4.png", BBDC4:"img/bbdc4.png",
  ABEV3:"img/abev3.png", MGLU3:"img/mglu3.png", BBAS3:"img/bbas3.png", LREN3:"img/lren3.png"
};
const fmt = v => (v||0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});

let series=[], mode='line', timer=null, sym='PETR4', tf='10s';

function init(){
  const atv=document.getElementById('atv'), tfSel=document.getElementById('tf'), btLine=document.getElementById('btLine'), btC=document.getElementById('btCandle');
  atv.addEventListener('change', ()=>{ sym=atv.value; setLogo(); reset(); });
  tfSel.addEventListener('change', ()=>{ tf=tfSel.value; reset(); });
  btLine.onclick=()=>{ mode='line'; btLine.classList.add('on'); btC.classList.remove('on'); };
  btC.onclick=()=>{ mode='candle'; btC.classList.add('on'); btLine.classList.remove('on'); };
  setLogo(); reset(); loadCarteira();
}
function setLogo(){ const img=document.getElementById('atvLogo'); img.src=logos[sym]||''; img.alt=sym; }
function reset(){ series=[]; if(timer) clearInterval(timer); seed(); timer=setInterval(tick, 1000); drawLoop(); }
function tfToStep(){ const map={'10s':10000,'1m':60000,'5m':300000,'30m':1800000,'1h':3600000,'2h':7200000,'4h':14400000,'1d':86400000,'1w':604800000}; return map[tf]||60000; }
function seed(){ const step=tfToStep(); let t=Date.now()-step*80; let p=60; for(let i=0;i<80;i++){ const o=p; const c=p+= (Math.random()-0.5)*1.2; const h=Math.max(o,c)+Math.random()*1.2; const l=Math.min(o,c)-Math.random()*1.2; series.push({t, o, h, l, c}); t+=step; } }
function tick(){ const step=tfToStep(); const last=series[series.length-1]; const t=last? last.t+step:Date.now(); const o=last? last.c:60; const c=o + (Math.random()-0.5)*1.4; const h=Math.max(o,c)+Math.random()*1.1; const l=Math.min(o,c)-Math.random()*1.1; series.push({t,o,h,l,c}); if(series.length>150) series.shift(); draw(); }

const c=document.getElementById('kChart'), ctx=c.getContext('2d'); let mouse=null;
c.addEventListener('mousemove', e=>{ const rect=c.getBoundingClientRect(); mouse={x:e.clientX-rect.left, y:e.clientY-rect.top}; draw(); });
c.addEventListener('mouseleave', ()=>{ mouse=null; draw(); });

function drawAxes(W,H,pad){ ctx.strokeStyle="#123a5a"; for(let i=0;i<=4;i++){ const y=pad+(H-pad*2)*i/4; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); } }
function draw(){ const W=c.width, H=c.height, pad=28; ctx.fillStyle="#0b1b26"; ctx.fillRect(0,0,W,H); drawAxes(W,H,pad); if(series.length<2) return;
  const minT=series[0].t, maxT=series[series.length-1].t; const minP=Math.min(...series.map(s=>s.l)), maxP=Math.max(...series.map(s=>s.h)); const XR=W-pad*2, YR=H-pad*2;
  if(mode==='line'){ ctx.beginPath(); series.forEach((s,i)=>{ const x=pad+((s.t-minT)/(maxT-minT))*XR; const y=pad+(1-((s.c-minP)/(maxP-minP)))*YR; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); const g=ctx.createLinearGradient(0,0,W,0); g.addColorStop(0,"#4da0ff"); g.addColorStop(1,"#2e78ff"); ctx.strokeStyle=g; ctx.lineWidth=1.6; ctx.stroke(); }
  else{ const bw=XR/series.length*0.7; series.forEach(s=>{ const x=pad+((s.t-minT)/(maxT-minT))*XR; const yO=pad+(1-((s.o-minP)/(maxP-minP)))*YR; const yC=pad+(1-((s.c-minP)/(maxP-minP)))*YR; const yH=pad+(1-((s.h-minP)/(maxP-minP)))*YR; const yL=pad+(1-((s.l-minP)/(maxP-minP)))*YR; ctx.strokeStyle="#cfe8ff"; ctx.beginPath(); ctx.moveTo(x,yH); ctx.lineTo(x,yL); ctx.stroke(); ctx.fillStyle = s.c>=s.o ? "#2ecc71":"#ff6b6b"; ctx.fillRect(x-bw/2, Math.min(yO,yC), bw, Math.max(2,Math.abs(yC-yO))); }); }
  if(mouse){ const mX=mouse.x, mY=mouse.y; ctx.strokeStyle="rgba(200,220,255,.35)"; ctx.beginPath(); ctx.moveTo(mX,pad); ctx.lineTo(mX,H-pad); ctx.stroke(); ctx.beginPath(); ctx.MoveTo; ctx.moveTo(pad,mY); ctx.lineTo(W-pad,mY); ctx.stroke();
    const idx = Math.max(0, Math.min(series.length-1, Math.round(((mX-pad)/XR)*series.length)));
    const s=series[idx]; const dt=new Date(s.t); const boxX=Math.min(W-240, Math.max(pad+6, mX+10)); const boxY=Math.max(pad+6, mY-70);
    const lines=[`${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`, `Abertura: ${fmt(s.o)}`, `Máxima: ${fmt(s.h)}`, `Mínima: ${fmt(s.l)}`, `Fechamento: ${fmt(s.c)}`];
    ctx.fillStyle="rgba(15,24,33,.95)"; ctx.strokeStyle="#2a4158"; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(boxX,boxY,210,88,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle="#cfe8ff"; ctx.font="12px sans-serif"; lines.forEach((t,i)=> ctx.fillText(t, boxX+10, boxY+18+i*14));
  }
}
function drawLoop(){ draw(); requestAnimationFrame(drawLoop); }

function loadCarteira(){
  let snap = {}; try{ snap = JSON.parse(localStorage.getItem('rb_carteira_snapshot')||"{}"); }catch{}
  const tb=document.getElementById('anaCarteira').querySelector('tbody'); tb.innerHTML="";
  Object.entries(snap).forEach(([k,v])=>{ tb.innerHTML+=`<tr><td><img src="${logos[k]||''}" style="width:18px;height:18px;background:#fff;border-radius:4px"></td><td>${k}</td><td>${v}</td></tr>`; });
}
function goBack(){ history.length>1 ? history.back() : window.close(); }

window.addEventListener('DOMContentLoaded', init);
