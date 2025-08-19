/* ========= DADOS & ESTADO ========= */
const ativosB3 = {
  PETR4: 30.38, VALE3: 73.21, ITUB4: 32.33, BBDC4: 28.53,
  ABEV3: 15.72, MGLU3: 3.48,  BBAS3: 49.33, LREN3: 19.38
};
const logos = {
  PETR4:"img/petr4.png", VALE3:"img/vale3.png", ITUB4:"img/itub4.png", BBDC4:"img/bbdc4.png",
  ABEV3:"img/abev3.png", MGLU3:"img/mglu3.png", BBAS3:"img/bbas3.png", LREN3:"img/lren3.png"
};

/* ---- Usuários ---- */
const USERS_KEY = "rb_users";
const STATE_KEY_PREFIX = "rb_state_"; // ⇦ carteira/saldo/extrato/ordens por CPF

const DEFAULT_USERS = {
  "11111111111": { senha:"123", conta:"A", historicoSenhas:["123"], nome:"Conta A", email:"demo@royal.com", zap:"(11) 99999-0000", plano:"Premium" },
  "22222222222": { senha:"456", conta:"B", historicoSenhas:["456"], nome:"Conta B", email:"demo2@royal.com", zap:"(21) 98888-0000", plano:"Premium" }
};

function limparCPF(v){ return (v||"").replace(/\D/g,''); }
function loadUsers(){
  try{ return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); }
  catch{ return {}; }
}
function saveUsers(obj){
  localStorage.setItem(USERS_KEY, JSON.stringify(obj));
}
(function seedDefaultUsers(){
  const cur = loadUsers();
  let changed = false;
  for(const k of Object.keys(DEFAULT_USERS)){
    if(!cur[k]){ cur[k] = DEFAULT_USERS[k]; changed = true; }
  }
  if(changed) saveUsers(cur);
})();

function getUser(cpf){
  cpf = limparCPF(cpf);
  const store = loadUsers();
  return store[cpf] || null;
}
function setUser(cpf, data){
  cpf = limparCPF(cpf);
  const store = loadUsers();
  store[cpf] = { ...(store[cpf]||{}), ...data };
  saveUsers(store);
}
function userExists(cpf){
  cpf = limparCPF(cpf);
  const store = loadUsers();
  return !!store[cpf];
}

/* ---- Estado persistente por usuário (carteira, saldo, extrato, ordens) ---- */
function loadState(cpf){
  try{
    const raw = localStorage.getItem(STATE_KEY_PREFIX + limparCPF(cpf));
    if(!raw) return null;
    const st = JSON.parse(raw);
    // rehidrata datas do extrato
    if(Array.isArray(st.extrato)) st.extrato = st.extrato.map(e => ({...e, date: new Date(e.date)}));
    return st;
  }catch{ return null; }
}
function saveState(cpf){
  if(!usuarioAtual) return;
  const pack = {
    saldo: usuarioAtual.saldo,
    carteira: usuarioAtual.carteira,
    precoMedio: usuarioAtual.precoMedio,
    extrato: extrato.map(e => ({...e, date: (e.date instanceof Date ? e.date.toISOString() : e.date)})),
    ordens
  };
  localStorage.setItem(STATE_KEY_PREFIX + limparCPF(cpf), JSON.stringify(pack));
}

/* ---- Contas base “mockadas” por perfil A/B ---- */
const contas = {
  A:{ nome:"Conta A", saldo:100000, carteira:{ PETR4:300, VALE3:200, ITUB4:100 } },
  B:{ nome:"Conta B", saldo:100000, carteira:{ MGLU3:100, BBAS3:100 } }
};

let usuarioAtual=null, extrato=[], ordens=[], cpfAtual="";
const $ = sel => document.querySelector(sel);
const formatBR = v => (+v).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
(function(){ const y=$("#ano"); if(y) y.innerText=new Date().getFullYear(); })();

function escapeHTML(s=""){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ========= HOME ========= */
function goTo(id){ document.getElementById(id)?.scrollIntoView({behavior:"smooth"}); }
function montarTicker(){
  const el=$("#ticker"); if(!el) return;
  el.innerHTML = Object.entries(ativosB3).map(([k,v])=>
    `<span><span class="sym">${k}</span><span class="price">${v.toFixed(2)}</span></span>`).join("");
}
function buildStories(){
  const el = $("#storiesWrap"); if(!el) return;
  const depo = [
    {who:"Carla • Campinas", text:"Comecei com R$ 300/mês e hoje invisto com disciplina. Faça como a Carla e mude de vida!"},
    {who:"Rafael • Recife", text:"Uso a boleta da Royal todo mês. Consistência faz diferença."},
    {who:"Aline • Floripa", text:"Diversifiquei entre ações e renda fixa. Dormi em paz e vi o patrimônio crescer."},
    {who:"Pedro • São Paulo", text:"Segui o plano com VALE3 e colhi resultado com o tempo."}
  ];
  el.innerHTML = depo.map(d=>`
    <article class="story">
      <div class="who">${d.who}</div>
      <div class="text">${d.text}</div>
    </article>`).join("");
}
function buildCarousel(){
  const track=$("#carouselTrack"); if(!track) return;
  const items=[];
  Object.keys(ativosB3).forEach(tk=>{
    const src=logos[tk];
    items.push(`
      <div class="citem">
        ${src ? `<img src="${src}" alt="${tk}" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<span class=\\'avatar\\'>${tk.slice(0,2)}</span>')">`
               : `<span class="avatar">${tk.slice(0,2)}</span>`}
        <div class="ctext"><b>${tk}</b><small>R$ ${ativosB3[tk].toFixed(2)}</small></div>
      </div>`);
  });
  track.innerHTML = items.join("") + items.join("");
}
function countUp(){ document.querySelectorAll("[data-countup]").forEach(el=>{ const t=+el.getAttribute("data-countup"); let c=0; const s=Math.max(1,Math.floor(t/120)); (function tick(){ c+=s; if(c>=t)c=t; el.textContent=t>=1000?c.toLocaleString("pt-BR"):c; if(c<t) requestAnimationFrame(tick); })(); }); }

/* Gráfico do hero */
(function drawHero(){ const c=$("#canvasHero"); if(!c) return; const ctx=c.getContext("2d"); const W=c.width,H=c.height,p=28; const months=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; function step(){ ctx.fillStyle="#0b1b26"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#123a5a"; for(let i=0;i<=4;i++){ const y=p+((H-p*1.6)*i/4); ctx.beginPath(); ctx.moveTo(p,y); ctx.lineTo(W-p,y); ctx.stroke(); }
  ctx.fillStyle="#7aa6c2"; months.slice(0,6).forEach((m,i)=>{ const x=p+((W-p*2)/5)*i; ctx.fillText(m, x-8, H-8); });
  const t = Date.now()/650; const colors = ["#3fd0ff","#6ce36c","#ffd261"];
  [0,1,2].forEach(si=>{
    ctx.beginPath();
    for(let i=0;i<=60;i++){
      const x=p+i*((W-p*2)/60);
      const base = H - p - (i* (6 + si*2));
      const y = base + Math.sin((t+i*0.25)+si)*6;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle=colors[si]; ctx.lineWidth=1.6; ctx.stroke();
  });
  requestAnimationFrame(step);} step(); })();

window.addEventListener("load", ()=>{ montarTicker(); buildCarousel(); buildStories(); countUp(); });
setInterval(()=>{ for (const k in ativosB3){ ativosB3[k]=+(ativosB3[k] + (Math.random()-0.5)*0.3).toFixed(2); } montarTicker(); buildCarousel(); }, 8000);

/* ========= CHAT ========= */
function toggleChat(){
  const b = document.getElementById("rbChat");
  if(!b) return;
  const opened = b.style.display === "block";
  b.style.display = opened ? "none" : "block";
  b.setAttribute("aria-hidden", opened ? "true" : "false");
}
const faq = [
  {k:/abrir|criar conta|cadastro/i, a:"Para abrir sua conta, clique em “Abrir Conta” e preencha seus dados. A aprovação é rápida."},
  {k:/taxa|custodia|corretagem/i, a:"Plano padrão: isenção de custódia e corretagem zero em BDRs/ETFs elegíveis. Em ações à vista, condições promocionais."},
  {k:/suporte|atend|contato/i, a:"Você pode falar por telefone (11) 4000-0000, e-mail atendimento@royalbroker.com ou chat aqui mesmo."},
  {k:/senha|esqueci|redefin/i, a:"Use “Esqueci minha senha” no login. Enviaremos instruções ao seu e-mail."},
  {k:/dep[oó]sito|pix|transfer/i, a:"Deposite via PIX TED no app do seu banco. O saldo aparece em minutos."},
  {k:/saque|retirada/i, a:"Saque pelo menu > Minha conta > Saques. Transferimos para sua conta cadastrada."},
  {k:/extrato|relat[oó]rio/i, a:"No Portal, acesse “Extrato de Operações” e use “Baixar Extrato” para XLSX/JSON."},
  {k:/hor[aá]rio|preg[aã]o/i, a:"Pregão regular da B3: 10:00–18:00, after-market e pré-abertura conforme calendário."}
];
function enviarChat(){
  const i = $("#chatInput"), body=$("#chatBody");
  if(!i || !body) return;
  const t = (i.value || "").trim(); if(!t) return;
  const safe = t.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  body.insertAdjacentHTML("beforeend", `<div class="msg user">${safe}</div>`);
  i.value = "";
  let resp = "Obrigado! Recebemos sua mensagem. Nossa equipe entrará em contato em breve.";
  for(const f of faq){ if(f.k.test(t)){ resp = f.a + " Se precisar, nossa equipe entra em contato em breve."; break; } }
  setTimeout(()=>{ body.insertAdjacentHTML("beforeend", `<div class="msg bot">${resp}</div>`); body.scrollTop = body.scrollHeight; }, 350);
  body.scrollTop = body.scrollHeight;
}

/* ========= LOGIN / CADASTRO ========= */
function toggleSenha(id, el){ const f=document.getElementById(id); if(!f) return; f.type = f.type==="password" ? "text" : "password"; if(el) el.textContent = f.type==="password" ? "👁️" : "🙈"; }

function loginApp(){
  const cpf = limparCPF($("#cpf")?.value), senha=$("#senha")?.value;
  const user = getUser(cpf);
  const msg=$("#loginMsg");
  if(user && user.senha===senha){
    localStorage.setItem("rb_cpf", cpf);
    localStorage.setItem("rb_last_login_"+cpf, new Date().toISOString());
    window.open("portal.html","_blank","noopener");
    if(msg){ msg.className="success"; msg.textContent="Login efetuado! Portal aberto em nova aba."; }
  } else {
    if(msg){ msg.className="error"; msg.textContent="CPF ou senha inválidos."; }
  }
}

function salvarCadastro(){
  const cpf = limparCPF($("#cadCpf")?.value),
        nome=$("#cadNome")?.value?.trim(),
        zap=$("#cadZap")?.value?.trim(),
        email=$("#cadEmail")?.value?.trim(),
        s=$("#cadSenha")?.value, c=$("#cadConfSenha")?.value, msg=$("#cadMsg");
  if(!nome || !cpf || !zap || !email || !s || !c){ msg.textContent="Preencha todos os campos."; return; }
  if(userExists(cpf)){ msg.textContent="CPF já cadastrado."; return; }
  if(s!==c){ msg.textContent="As senhas não coincidem."; return; }
  if(s.length<6 || !/[A-Za-z]/.test(s) || !/[0-9]/.test(s)){ msg.textContent="Senha fraca."; return; }

  setUser(cpf, {senha:s, conta:"A", historicoSenhas:[s], nome, email, zap, plano:"Premium"});
  // cria estado inicial desta conta
  const base = contas.A;
  localStorage.setItem(STATE_KEY_PREFIX+cpf, JSON.stringify({
    saldo: base.saldo,
    carteira: base.carteira,
    precoMedio: Object.fromEntries(Object.keys(base.carteira).map(k=>[k, ativosB3[k]||0])),
    extrato: [],
    ordens: []
  }));

  msg.className="success"; msg.textContent="Conta criada com sucesso.";
  setTimeout(()=>{ window.location.href="login.html"; }, 900);
}

function recuperarSenha(){
  const msg=$("#recMsg"); if(!msg) return;
  msg.className="success"; msg.textContent="Enviamos instruções para o email cadastrado.";
  setTimeout(()=>{ window.open("redefinir.html","_blank","noopener"); }, 700);
}

function salvarNovaSenha(){
  const nova = $("#novaSenhaRec")?.value;
  const conf = $("#confirmarSenhaRec")?.value;
  const msg = $("#msgRedefinicao");
  const cpf = localStorage.getItem("rb_cpf") || "11111111111";
  if(!nova || !conf){ msg.className="error"; msg.textContent="Preencha os dois campos."; return; }
  if(nova!==conf){ msg.className="error"; msg.textContent="As senhas não coincidem."; return; }
  if(nova.length<6 || !/[A-Za-z]/.test(nova) || !/[0-9]/.test(nova)){ msg.className="error"; msg.textContent="A senha precisa de 6+ caracteres, 1 letra e 1 número."; return; }

  const u = getUser(cpf) || {conta:"A", historicoSenhas:[]};
  const hist = u.historicoSenhas || [];
  if(hist.slice(0,4).includes(nova)){ msg.className="error"; msg.textContent="Não é permitido reutilizar nenhuma das últimas 4 senhas."; return; }
  u.senha = nova;
  u.historicoSenhas = [nova, ...hist].slice(0,4);
  setUser(cpf, u);

  msg.className="success"; msg.textContent="Senha redefinida com sucesso. Redirecionando para o login...";
  setTimeout(()=>{ window.location.href="login.html"; }, 1200);
}

/* ========= MODAIS (Minha Conta / Alterar Senha) ========= */
function showModal(id){
  const m = document.getElementById(id);
  const back = document.getElementById("modalBackdrop");
  if(!m) return;
  m.classList.add("show");
  m.setAttribute("aria-hidden","false");
  if(back){ back.classList.add("show"); }
}
function hideModal(id){
  const m = document.getElementById(id);
  const back = document.getElementById("modalBackdrop");
  if(!m) return;
  m.classList.remove("show");
  m.setAttribute("aria-hidden","true");
  if(back){ back.classList.remove("show"); }
}
// Fecha qualquer modal ao clicar no backdrop
function closeModal(ev){
  const back = document.getElementById('modalBackdrop');
  if(!back) return;
  if(ev.target === back){
    hideModal('modalConta');
    hideModal('modalSenha');
  }
}

// Abre o modal de Alterar Senha (usado no menu)
function abrirAlterarSenha(){
  const msg = document.getElementById('senhaMsgModal');
  if(msg){ msg.textContent = ''; msg.className = ''; }
  showModal('modalSenha');
  // foca no campo de nova senha, se existir
  setTimeout(()=> document.getElementById('novaSenhaModal')?.focus(), 50);
}

/* ========= MODAIS (Minha Conta / Alterar Senha) ========= */
function formatCPFView(v){
  const s = limparCPF(v||"");
  return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function abrirMinhaConta(){
  const cpf = cpfAtual || localStorage.getItem("rb_cpf");
  const u = getUser(cpf);
  if(!u){ alert("Sessão expirada. Faça login novamente."); return; }

  // preenche os inputs do formulário (um embaixo do outro)
  const nome  = document.getElementById("mcNome");
  const zap   = document.getElementById("mcZap");
  const email = document.getElementById("mcEmail");
  const cpfI  = document.getElementById("mcCpf");
  const plano = document.getElementById("mcPlano");
  const msg   = document.getElementById("contaMsg");

  if(nome)  nome.value  = u.nome  || "";
  if(zap)   zap.value   = u.zap   || "";
  if(email) email.value = u.email || "";
  if(cpfI)  cpfI.value  = formatCPFView(cpf);
  if(plano) plano.value = u.plano || "Premium";
  if(msg){ msg.textContent = ""; msg.className = "success"; }

  showModal("modalConta");
}

function salvarMinhaConta(){
  const cpf = cpfAtual || localStorage.getItem("rb_cpf");
  const u = getUser(cpf);
  const msg = document.getElementById("contaMsg");

  if(!u){ if(msg){ msg.className="error"; msg.textContent="Sessão expirada."; } return; }

  const nome  = document.getElementById("mcNome")?.value?.trim();
  const zap   = document.getElementById("mcZap")?.value?.trim();
  const email = document.getElementById("mcEmail")?.value?.trim();

  if(!nome || !zap || !email){
    if(msg){ msg.className="error"; msg.textContent="Preencha Nome, WhatsApp e E-mail."; }
    return;
  }

  setUser(cpf, { nome, zap, email });                 // salva
  if(document.getElementById("username")) document.getElementById("username").innerText = nome; // reflete no header

  if(msg){ msg.className="success"; msg.textContent="Dados atualizados com sucesso!"; }
  setTimeout(()=> hideModal("modalConta"), 900);
}


/* Alterar senha (modal ou seção antiga) */
function alterarSenha(){
  const nova = $("#novaSenhaModal")?.value || $("#novaSenha")?.value;
  const conf = $("#confSenhaModal")?.value || $("#novaSenha")?.value;
  const msg = $("#senhaMsgModal") || $("#senhaMsg");
  const cpf = cpfAtual || localStorage.getItem("rb_cpf");

  if(!nova || !conf){ if(msg){ msg.className="error"; msg.textContent="Preencha os campos de senha."; } return; }
  if(nova!==conf){ if(msg){ msg.className="error"; msg.textContent="As senhas não coincidem."; } return; }
  if(nova.length<6 || !/[A-Za-z]/.test(nova) || !/[0-9]/.test(nova)){
    if(msg){ msg.className="error"; msg.textContent="A senha precisa de 6+ caracteres, 1 letra e 1 número."; }
    return;
  }

  const u = getUser(cpf);
  if(!u){ if(msg){ msg.className="error"; msg.textContent="Sessão expirada. Faça login novamente."; } return; }
  const hist = u.historicoSenhas || [];
  if(hist.slice(0,4).includes(nova)){ if(msg){ msg.className="error"; msg.textContent="Não é permitido reutilizar nenhuma das últimas 4 senhas."; } return; }

  u.senha = nova;
  u.historicoSenhas = [nova, ...hist].slice(0,4);
  setUser(cpf, u);

  if(msg){ msg.className="success"; msg.textContent="Senha alterada com sucesso!"; }
  if($("#senhaMsgModal")) setTimeout(()=> hideModal("modalSenha"), 900);
}

/* ========= PORTAL ========= */
function abrirAnalise(){ // ⇦ faltava esta função
  window.location.href = "analise.html";
}
/* === Persistência de carteira por usuário (NOVO) === */
const PORT_SNAP = (cpf)=> `rb_port_${limparCPF(cpf)}`;

function loadPortfolioForUser(cpf){
  try{
    const raw = localStorage.getItem(PORT_SNAP(cpf));
    if(!raw) return null;
    return JSON.parse(raw);
  }catch{ return null; }
}
function savePortfolioForUser(cpf){
  if(!usuarioAtual) return;
  const snap = {
    saldo: usuarioAtual.saldo,
    carteira: usuarioAtual.carteira,
    precoMedio: usuarioAtual.precoMedio
  };
  localStorage.setItem(PORT_SNAP(cpf), JSON.stringify(snap));
}

/* ========= PORTAL ========= */
function portalInit(){
  const cpf = localStorage.getItem("rb_cpf");
  if(!cpf){ window.location.href = "login.html"; return; }

  const user = getUser(cpf);
  if(!user){ localStorage.removeItem("rb_cpf"); window.location.href="login.html"; return; }

  cpfAtual = cpf;
  const contaBase = contas[user.conta] || contas.A;

  // base do usuário (mock) + cpf
  usuarioAtual = JSON.parse(JSON.stringify(contaBase));
  usuarioAtual.cpf = cpf;

  // === Carrega carteira/saldo persistidos, se existirem ===
  const snap = loadPortfolioForUser(cpf);
  if(snap){
    usuarioAtual.saldo      = (snap.saldo      ?? usuarioAtual.saldo);
    usuarioAtual.carteira   = (snap.carteira   ?? usuarioAtual.carteira);
    usuarioAtual.precoMedio = (snap.precoMedio ?? usuarioAtual.precoMedio);
  }

  // garante precoMedio para todos os ativos já existentes
  usuarioAtual.precoMedio = usuarioAtual.precoMedio || {};
  for(const atv in usuarioAtual.carteira){
    if(!usuarioAtual.precoMedio[atv]) usuarioAtual.precoMedio[atv] = (ativosB3?.[atv]||0);
  }

  if($("#username")) $("#username").innerText = user.nome || contaBase.nome;
  if($("#saldo")) $("#saldo").innerText = formatBR(usuarioAtual.saldo);

  // último acesso (decorativo)
  const last = localStorage.getItem('rb_last_login_'+cpf);
  if(last && $("#lastLogin")){
    const d = new Date(last);
    $("#lastLogin").innerText = `Último acesso: ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }

  preencherSelectAtivos(); preencherRtSelect();
  atualizarCarteira(); atualizarBook(); atualizarExtrato(); atualizarOrdens();
  startRtChart(); startSpark();

  // MENU (≡) ao lado do 📈
  const btn = $("#menuBtn"), drop = $("#menuDropdown");
  if(btn && drop){
    btn.addEventListener("click", ()=>{
      const open = drop.getAttribute("aria-hidden")==="false";
      drop.setAttribute("aria-hidden", open ? "true" : "false");
    });
    document.addEventListener("click", (e)=>{
      if(!drop.contains(e.target) && e.target!==btn){ drop.setAttribute("aria-hidden","true"); }
    });
  }

  // Prefill (?ativo=PETR4&tipo=Compra)
  const q = new URLSearchParams(location.search);
  const qAtivo = q.get("ativo"); const qTipo = q.get("tipo");
  if(qAtivo && $("#ativo")) $("#ativo").value = qAtivo;
  if(qTipo && $("#tipo")) $("#tipo").value = qTipo;

  // Bloqueia autofill indevido na boleta
  guardNoAutofillBoleta();
  setTimeout(guardNoAutofillBoleta, 800);
  setTimeout(guardNoAutofillBoleta, 2000);

  // Fechar modais com ESC / clique no backdrop
  document.addEventListener('keydown', (ev)=>{
    if(ev.key === 'Escape'){ hideModal('modalConta'); hideModal('modalSenha'); }
  });
  ["modalConta","modalSenha"].forEach(id=>{
    const m = document.getElementById(id);
    if(m){
      m.addEventListener('click', (e)=>{ if(e.target === m) hideModal(id); });
    }
  });
}


/* Sparkline com VIÉS DE ALTA — SUBSTITUÍDO: 12 barras responsivas e com clipping */
function startSpark(){
  const c = document.getElementById("invSpark");
  if(!c) return;
  const ctx = c.getContext("2d");

  // Ajusta o canvas ao container para nunca sair do retângulo
  function resize(){
    const boxW = (c.parentElement?.clientWidth || 240);
    c.width  = Math.max(180, Math.floor(boxW));
    c.height = 76;
  }
  resize();
  window.addEventListener("resize", resize);

  // 12 valores (12 meses) normalizados
  let vals = Array.from({length:12}, () => 0.55 + Math.random()*0.35);

  function draw(){
    ctx.clearRect(0,0,c.width,c.height);

    const padX = 8, padY = 8;
    const W = c.width  - padX*2;
    const H = c.height - padY*2;

    const n = 12;
    const unit = W / n;
    const barW = Math.max(6, unit * 0.68); // largura da barra
    const gap  = unit - barW;              // espaço entre barras

    for(let i=0;i<n;i++){
      const v = Math.min(1, Math.max(0, vals[i]));
      const h = Math.max(2, v * H);
      const x = padX + i*(barW+gap);
      const y = padY + (H - h);
      ctx.fillStyle = "#39d98a";
      ctx.fillRect(x, y, barW, h);
    }

    // desloca e acrescenta suavemente
    const last = vals[vals.length-1];
    const next = Math.min(1, Math.max(0.15, last + (Math.random()-0.5)*0.08));
    vals = vals.slice(1).concat([next]);

    requestAnimationFrame(draw);
  }
  draw();
}


/* Selects e tabelas */
function preencherSelectAtivos(){
  const select=$("#ativo"); if(!select) return;
  select.innerHTML=""; for (let a in ativosB3){ select.innerHTML += `<option value="${a}">${a}</option>`; }
}
function atualizarCarteira(){
  const t=$("#carteira tbody"); if(!t || !usuarioAtual) return;
  t.innerHTML="";
  for (let ativo in usuarioAtual.carteira){
    const qtd = usuarioAtual.carteira[ativo] || 0;
    const pm  = usuarioAtual.precoMedio[ativo] || 0;
    const cot = ativosB3[ativo] || 0;
    const vm  = qtd * cot;
    const pnl = (cot - pm) * qtd;
    const varp = pm>0 ? ((cot/pm)-1)*100 : 0;
    const logo = logos[ativo] ? `<img src="${logos[ativo]}" alt="${ativo}" class="logo-mini">` : '';
    t.innerHTML += `<tr>
      <td>${logo}</td><td>${ativo}</td><td>${qtd}</td><td>${pm.toFixed(2)}</td><td>${vm.toFixed(2)}</td>
      <td style="color:${pnl>=0?'#2ecc71':'#ff6b6b'}">${pnl>=0?'+':''}${pnl.toFixed(2)}</td>
      <td style="color:${varp>=0?'#2ecc71':'#ff6b6b'}">${varp>=0?'+':''}${varp.toFixed(2)}%</td>
    </tr>`;
  }
  if($("#saldo")) $("#saldo").innerText = formatBR(usuarioAtual.saldo);
}
function atualizarBook(){
  const t=$("#book tbody"); if(!t) return; t.innerHTML="";
  for (let ativo in ativosB3){
    const p = ativosB3[ativo];
    const chg = (Math.random()*6 - 3);
    const logo = logos[ativo] ? `<img src="${logos[ativo]}" class="logo-mini" alt="${ativo}">` : '';
    t.innerHTML += `<tr data-ativo="${ativo}">
      <td>${logo}</td><td>${ativo}</td><td>${p.toFixed(2)}</td>
      <td style="color:${chg>=0?'#2ecc71':'#ff6b6b'}">${chg>=0?'+':''}${chg.toFixed(2)}%</td>
    </tr>`;
  }
  t.querySelectorAll("tr").forEach(tr=>{
    tr.addEventListener("click", ()=>{
      const a = tr.getAttribute("data-ativo");
      if($("#ativo")) $("#ativo").value = a;
      if($("#valor")) $("#valor").value = ativosB3[a].toFixed(2);
      const m=$("#mensagem"); if(m){ m.className="msg-inline"; m.textContent="Ao clicar nos ativos, os dados são preenchidos automaticamente na Boleta."; }
    });
  });
}

function preencherRtSelect(){
  const sel=$("#rtSymbol"); if(!sel) return; sel.innerHTML="";
  Object.keys(ativosB3).forEach(k=> sel.innerHTML+=`<option value="${k}">${k}</option>`);
  sel.onchange = ()=>{ rtSeries=[]; $("#rtPrice").textContent = ativosB3[sel.value].toFixed(2); };
  $("#rtPrice").textContent = ativosB3[sel.value || Object.keys(ativosB3)[0]].toFixed(2);
}

/* Boleta */
function executarOperacao(){
  const tipo=$("#tipo").value, ativo=$("#ativo").value;
  const qtd=parseInt($("#quantidade").value), valor=parseFloat($("#valor").value);
  const cotacao=ativosB3[ativo], total=qtd*valor, msg=$("#mensagem"); 
  msg.textContent=""; msg.className="msg-inline";

  if(isNaN(qtd)||qtd<=0||qtd%100!==0||isNaN(valor)){
    msg.textContent="Preencha quantidade válida (múltiplos de 100) e valor.";
    msg.classList.add("error"); return;
  }
  if(tipo==="Compra" && total>usuarioAtual.saldo){
    msg.textContent="Saldo insuficiente para essa compra.";
    msg.classList.add("error"); return;
  }
  if(tipo==="Venda" && (!usuarioAtual.carteira[ativo] || usuarioAtual.carteira[ativo]<qtd)){
    msg.textContent="Você não possui ativos suficientes para vender.";
    msg.classList.add("error"); return;
  }

  const ordem = { 
    tipo, ativo, qtd, valor, cotacao,
    status: Math.abs(valor-cotacao)<=1 ? "Executada":"Aceita",
    id: Date.now(), date: new Date(), filled:0, avgFillPrice:0
  };

  if (ordem.status==="Executada"){
    aplicarParcial(ordem, ordem.qtd, valor);
    extrato.unshift({ ...ordem, price: valor, total: ordem.qtd*valor });

    // mensagem neutra (sem “saldo negativo” indevido)
    msg.textContent = "Ordem executada.";
    msg.classList.remove("error");
    msg.classList.add(usuarioAtual.saldo >= 0 ? "success" : "error");
  } else {
    msg.textContent="Ordem aceita. Aguardando preenchimentos.";
    msg.classList.remove("error","success");
  }

  ordens.unshift(ordem);
  atualizarOrdens(); atualizarCarteira(); atualizarExtrato();
}
/* ==== ENGINE de ordens, extrato e carteira (NOVO) ==== */
function aplicarParcial(ordem, qtdFill, precoFill){
  if(!usuarioAtual) return;
  const ativo = ordem.ativo;
  const qtdAnt = usuarioAtual.carteira[ativo] || 0;
  const pmAnt  = usuarioAtual.precoMedio?.[ativo] || 0;

  if(ordem.tipo === "Compra"){
    // saldo
    usuarioAtual.saldo -= (qtdFill * precoFill);
    // posição
    const novaQtd = qtdAnt + qtdFill;
    const novoPM  = novaQtd > 0 ? ((pmAnt * qtdAnt) + (precoFill * qtdFill)) / novaQtd : 0;
    usuarioAtual.carteira[ativo] = novaQtd;
    usuarioAtual.precoMedio[ativo] = +novoPM.toFixed(2);
  } else {
    // Venda
    usuarioAtual.saldo += (qtdFill * precoFill);
    const novaQtd = Math.max(0, qtdAnt - qtdFill);
    usuarioAtual.carteira[ativo] = novaQtd;
    // Mantém pm; se zera posição, preservo pm para exibição (ou zere se preferir)
    if(novaQtd === 0 && usuarioAtual.precoMedio[ativo] == null){
      usuarioAtual.precoMedio[ativo] = pmAnt;
    }
  }

  // Persiste
  savePortfolioForUser(cpfAtual);
  saveState(cpfAtual);
}

function atualizarOrdens(){
  const t = document.querySelector("#ordens tbody");
  if(!t) return;
  t.innerHTML = "";

  (ordens || []).forEach(o=>{
    const filledPct = o.qtd ? Math.round((o.filled || 0) / o.qtd * 100) : 0;
    const podeCancelar = o.status === "Aceita" || (String(o.status).startsWith("Parcial") && (o.filled||0) < o.qtd);

    t.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${o.id}</td>
        <td>${o.tipo}</td>
        <td>${o.ativo}</td>
        <td>${o.qtd}</td>
        <td>${(+o.valor).toFixed(2)}</td>
        <td>${filledPct}%</td>
        <td>${escapeHTML(o.status)}</td>
        <td>
          ${podeCancelar ? `<button class="btn sm" onclick="cancelarOrdem(${o.id})">Cancelar</button>` : `—`}
        </td>
      </tr>
    `);
  });
}

function cancelarOrdem(id){
  const o = (ordens || []).find(x => x.id === id);
  if(!o) return;
  if(o.status === "Executada" || o.status === "Cancelada") return;
  o.status = "Cancelada";
  atualizarOrdens();
  saveState(cpfAtual);
}

function atualizarExtrato(){
  const t = document.querySelector("#extrato tbody");
  if(!t) return;
  t.innerHTML = "";

  (extrato || []).forEach(e=>{
    const dt = e.date instanceof Date ? e.date : new Date(e.date);
    const preco = +(e.price || e.valor || 0);
    const tot   = +(e.total || (e.qtd || 0) * preco);

    t.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}</td>
        <td>${e.tipo}</td>
        <td>${e.ativo}</td>
        <td>${e.qtd}</td>
        <td>${preco.toFixed(2)}</td>
        <td>${tot.toFixed(2)}</td>
      </tr>
    `);
  });
}

function filtrarExtrato(){
  // Implementação simples: se existirem selects com id extratoTipo/extratoAtivo, filtra;
  // senão, apenas re-renderiza tudo.
  const selTipo  = document.getElementById("extratoTipo");
  const selAtivo = document.getElementById("extratoAtivo");
  const tipo  = selTipo  ? (selTipo.value || "")  : "";
  const ativo = selAtivo ? (selAtivo.value || "") : "";

  let lista = extrato.slice();
  if(tipo)  lista = lista.filter(e => String(e.tipo).toLowerCase() === tipo.toLowerCase());
  if(ativo) lista = lista.filter(e => String(e.ativo).toUpperCase() === ativo.toUpperCase());

  const t = document.querySelector("#extrato tbody");
  if(!t) return;
  t.innerHTML = "";

  lista.forEach(e=>{
    const dt = e.date instanceof Date ? e.date : new Date(e.date);
    const preco = +(e.price || e.valor || 0);
    const tot   = +(e.total || (e.qtd || 0) * preco);
    t.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}</td>
        <td>${e.tipo}</td>
        <td>${e.ativo}</td>
        <td>${e.qtd}</td>
        <td>${preco.toFixed(2)}</td>
        <td>${tot.toFixed(2)}</td>
      </tr>
    `);
  });
}

/* ========= GRÁFICO RT ========= */
let rtSeries=[], rtTimer=null;
function startRtChart(){
  const c=$("#rtCanvas"); if(!c) return; const ctx=c.getContext("2d"); const pad=28; rtSeries=[];
  function tick(){ const sym=$("#rtSymbol").value || Object.keys(ativosB3)[0]; const last=rtSeries.length?rtSeries[rtSeries.length-1].p:ativosB3[sym]; const p=+(last + (Math.random()-0.5)*0.12).toFixed(2); rtSeries.push({t:Date.now(),p}); if(rtSeries.length>240) rtSeries.shift(); $("#rtPrice").textContent = ativosB3[sym].toFixed(2); }
  function draw(){ const W=c.width,H=c.height; ctx.fillStyle="#0b1b26"; ctx.fillRect(0,0,W,H); ctx.strokeStyle="#123a5a"; for(let i=0;i<=4;i++){ const y=pad+((H-pad*2)*i/4); ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); } if(rtSeries.length>1){ const minT=rtSeries[0].t,maxT=rtSeries[rtSeries.length-1].t; const minP=Math.min(...rtSeries.map(s=>s.p)),maxP=Math.max(...rtSeries.map(s=>s.p)); ctx.beginPath(); rtSeries.forEach((s,i)=>{ const x=pad+((s.t-minT)/((maxT-minT)||1))*(W-pad*2); const y=pad+(1-((s.p-minP)/((maxP-minP)||1)))*(H-pad*2); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); const g=ctx.createLinearGradient(0,0,W,0); g.addColorStop(0,"#4da0ff"); g.addColorStop(1,"#2e78ff"); ctx.strokeStyle=g; ctx.lineWidth=2; ctx.stroke(); } requestAnimationFrame(draw); }
  if(rtTimer) clearInterval(rtTimer); rtTimer=setInterval(tick,1000); draw();
}

/* ========= ENGINE ========= */
setInterval(()=>{
  for (let k in ativosB3){ ativosB3[k] = parseFloat((ativosB3[k] + 0.01).toFixed(2)); }
  if(usuarioAtual){
    ordens.forEach(o=>{
      if(o.status==="Aceita" || o.status.startsWith("Parcial")){
        if(Math.random() < 0.6){
          const restante = o.qtd - o.filled;
          const chunk = Math.max(0, Math.min(restante, Math.round(o.qtd * (0.2 + Math.random()*0.25))));
          if(chunk>0){
            const fillPrice = +(o.cotacao + (Math.random()-0.5)*0.6).toFixed(2);
            aplicarParcial(o, chunk, fillPrice);
            o.avgFillPrice = ((o.avgFillPrice * o.filled) + (fillPrice * chunk)) / (o.filled + chunk || 1);
            o.filled += chunk;
            o.status = o.filled < o.qtd ? `Parcial ${Math.round(o.filled/o.qtd*100)}%` : "Executada";
            if(o.status==="Executada"){ extrato.unshift({ ...o, price:+(o.avgFillPrice||o.valor), total:o.qtd * +(o.avgFillPrice||o.valor) }); saveState(cpfAtual); }
          }
        }
      }
    });
    atualizarBook(); atualizarOrdens(); atualizarCarteira(); atualizarExtrato();
  }
}, 10000);

/* ========= EXPORTAÇÕES ========= */
function abrirBaixar(qual){
  const el = document.getElementById(`drop-${qual}`);
  if(!el) return;
  const open = el.getAttribute("aria-hidden")==="false";
  el.setAttribute("aria-hidden", open ? "true" : "false");
}
function download(filename, mime, content){ const a=document.createElement('a'); a.href=`data:${mime};charset=utf-8,`+encodeURIComponent(content); a.download=filename; a.click(); }
function exportarJSON(qual){
  let data=[];
  if(qual==='carteira'){ data = Object.keys(usuarioAtual.carteira).map(k=>({ativo:k, quantidade:usuarioAtual.carteira[k], precoMedio:+(usuarioAtual.precoMedio[k]||0).toFixed(2), valorMercado:+(usuarioAtual.carteira[k]*(ativosB3[k]||0)).toFixed(2)})); }
  else if(qual==='book'){ data = Object.keys(ativosB3).map(k=>({ativo:k, preco:ativosB3[k]})); }
  else if(qual==='extrato'){ data = extrato.map(e=>({data:e.date, tipo:e.tipo, ativo:e.ativo, qtd:e.qtd, preco:(e.price||e.valor), total:(e.total||e.qtd*(e.price||e.valor))})); }
  else if(qual==='ordens'){ data = ordens.map(o=>({tipo:o.tipo, ativo:o.ativo, qtd:o.qtd, precoLimite:o.valor, filled:o.filled, status:o.status})); }
  download(`${qual}.json`,'application/json',JSON.stringify(data,null,2));
}
function tableToSpreadsheetML(tableId, sheet){ const t=document.getElementById(tableId); let rows=''; for(const tr of t.querySelectorAll('tr')){ rows+='<Row>'; for(const cell of tr.children){ const v=(cell.textContent||'').replace(/&/g,'&amp;').replace(/</g,'&lt;'); rows+=`<Cell><Data ss:Type="String">${v}</Data></Cell>`; } rows+='</Row>'; } return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${sheet}"><Table>${rows}</Table></Worksheet></Workbook>`; }
function exportarXLS(qual){ const map={carteira:'carteira',book:'book',extrato:'extrato',ordens:'ordens'}; const id=map[qual]; if(!id) return; const xml=tableToSpreadsheetML(id,qual.toUpperCase()); download(`${qual}.xls`,'application/vnd.ms-excel',xml); }

/* ========= LOGOUT ========= */
function logout(){ usuarioAtual=null; extrato=[]; ordens=[]; cpfAtual=""; localStorage.removeItem("rb_cpf"); window.location.href="index.html"; }

/* ========= ANÁLISE TÉCNICA ========= */
let anaBars=[], anaTimer=null, cross=null;
function anaInit(){
  const symSel=$("#anaSymbol"), intSel=$("#anaInterval"), typeSel=$("#anaType");
  const chart=$("#kChart"); if(!chart) return;

  if(symSel){
    symSel.innerHTML = Object.keys(ativosB3).map(k=>`<option value="${k}">${k}</option>`).join("");
    symSel.onchange = ()=>{ $("#anaLogo").src = logos[symSel.value] || "img/royal-logo.png"; resetAna(); };
  }
  if(intSel){ intSel.onchange = resetAna; }
  if(typeSel){ typeSel.onchange = ()=> drawAna(); }
  $("#anaLogo").src = logos[symSel?.value||"PETR4"] || "img/royal-logo.png";

  resetAna();
  montarMiniWallet();

  $("#btnBuy")?.addEventListener("click", ()=>{ const a=symSel.value; window.location.href=`portal.html?ativo=${a}&tipo=Compra`; });
  $("#btnSell")?.addEventListener("click", ()=>{ const a=symSel.value; window.location.href=`portal.html?ativo=${a}&tipo=Venda`; });

  chart.addEventListener("mousemove", e=>{ const r=chart.getBoundingClientRect(); cross={x:e.clientX - r.left, y:e.clientY - r.top}; drawAna(); });
  chart.addEventListener("mouseleave", ()=>{ cross=null; drawAna(); });
}
function resetAna(){
  if(anaTimer) clearInterval(anaTimer);
  anaBars=[]; genSeedBars(80); drawAna();
  const sec = +($("#anaInterval").value || 60);
  anaTimer = setInterval(()=>{ pushBarTick(sec); drawAna(); }, 1000);
}
function genSeedBars(n){
  let p = ativosB3[$("#anaSymbol").value || "PETR4"] || 50;
  for(let i=0;i<n;i++){ const o=p; const h=o + Math.random()*2; const l=o - Math.random()*2; const c=l + Math.random()*(h-l); anaBars.push({o,h,l,c,t:Date.now()-(n-i)*1000}); p=c; }
}
function pushBarTick(intervalSec){
  const last = anaBars[anaBars.length-1];
  const now = Date.now();
  if(!last || (now - last.t) >= intervalSec*1000){
    const base = last ? last.c : (ativosB3[$("#anaSymbol").value]||50);
    const o=base, h=base, l=base, c=base;
    anaBars.push({o,h,l,c,t:now});
    if(anaBars.length>200) anaBars.shift();
  }else{
    const cur = anaBars[anaBars.length-1];
    let c = cur.c + (Math.random()-0.5)*0.2;
    cur.c = c; cur.h = Math.max(cur.h, c); cur.l = Math.min(cur.l, c);
  }
}
function drawAna(){
  const c=$("#kChart"); if(!c) return; const ctx=c.getContext("2d"); const pad=40; const W=c.width, H=c.height;
  ctx.fillStyle="#0b1b26"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#123a5a"; for(let i=0;i<=4;i++){ const y=pad+((H-pad*2)*i/4); ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); }

  if(anaBars.length<2) return;
  const minP = Math.min(...anaBars.map(b=>b.l));
  const maxP = Math.max(...anaBars.map(b=>b.h));
  const xw = (W - pad*2) / (anaBars.length-1 || 1);

  if(($("#anaType").value||"candle")==="line"){
    ctx.beginPath();
    anaBars.forEach((b,i)=>{ const x=pad+i*xw; const y=pad+(1-((b.c-minP)/((maxP-minP)||1)))*(H-pad*2); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.strokeStyle="#4da0ff"; ctx.lineWidth=1.2; ctx.stroke();
  } else {
    const cw = Math.max(3, xw*0.6);
    anaBars.forEach((b,i)=>{
      const x=pad+i*xw;
      const yO=pad+(1-((b.o-minP)/((maxP-minP)||1)))*(H-pad*2);
      const yC=pad+(1-((b.c-minP)/((maxP-minP)||1)))*(H-pad*2);
      const yH=pad+(1-((b.h-minP)/((maxP-minP)||1)))*(H-pad*2);
      const yL=pad+(1-((b.l-minP)/((maxP-minP)||1)))*(H-pad*2);
      const up = b.c>=b.o;
      ctx.strokeStyle = up ? "#39d98a" : "#ff6b6b";
      ctx.fillStyle = up ? "#1a3b2a" : "#3a2121";
      ctx.beginPath(); ctx.moveTo(x, yH); ctx.lineTo(x, yL); ctx.stroke();
      ctx.fillRect(x - cw/2, Math.min(yO,yC), cw, Math.max(2, Math.abs(yC - yO)));
      ctx.strokeRect(x - cw/2, Math.min(yO,yC), cw, Math.max(2, Math.abs(yC - yO)));
    });
  }

  if(cross){
    const idx = Math.round((cross.x - pad) / xw);
    if(idx>=0 && idx<anaBars.length){
      const b = anaBars[idx];
      const x = pad + idx*xw;
      ctx.strokeStyle="rgba(255,255,255,.25)";
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H-pad); ctx.stroke();
      const y = pad+(1-((b.c-minP)/((maxP-minP)||1)))*(H-pad*2);
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W-pad, y); ctx.stroke();

      const boxW=230, boxH=100, bx=Math.min(W-pad-boxW, Math.max(pad, x+10)), by=pad+10;
      ctx.fillStyle="rgba(12,20,32,.95)"; ctx.fillRect(bx,by,boxW,boxH);
      ctx.strokeStyle="#1c3650"; ctx.strokeRect(bx,by,boxW,boxH);
      ctx.fillStyle="#e7f6ff"; ctx.font="12px Inter, Arial";
      const dt = new Date(b.t).toLocaleString();
      ctx.fillText(dt, bx+10, by+18);
      ctx.fillStyle="#97c0de";
      ctx.fillText(`Abertura:`, bx+10, by+38); ctx.fillStyle="#e7f6ff"; ctx.fillText(b.o.toFixed(2), bx+140, by+38);
      ctx.fillStyle="#97c0de"; ctx.fillText(`Máxima:`, bx+10, by+54); ctx.fillStyle="#39d98a"; ctx.fillText(b.h.toFixed(2), bx+140, by+54);
      ctx.fillStyle="#97c0de"; ctx.fillText(`Mínima:`, bx+10, by+70); ctx.fillStyle="#ff6b6b"; ctx.fillText(b.l.toFixed(2), bx+140, by+70);
      ctx.fillStyle="#97c0de"; ctx.fillText(`Fechamento:`, bx+10, by+86); ctx.fillStyle="#e7f6ff"; ctx.fillText(b.c.toFixed(2), bx+140, by+86);
    }
  }
}
function montarMiniWallet(){
  const t=$("#miniWallet tbody"); if(!t) return;
  const cpf = localStorage.getItem("rb_cpf");
  const st = loadState(cpf);
  const baseCarteira = st?.carteira || (contas[getUser(cpf)?.conta||"A"]?.carteira) || {};
  const basePM = st?.precoMedio || {};
  t.innerHTML = Object.keys(baseCarteira).map(k=>{
    const logo = logos[k] ? `<img src="${logos[k]}" class="logo-mini big">` : '';
    const pm = (basePM[k] ?? ativosB3[k] ?? 0).toFixed(2);
    return `<tr><td>${logo}</td><td>${k}</td><td>${baseCarteira[k]}</td><td>${pm}</td></tr>`;
  }).join("");
}
function voltarPortal(){ window.location.href="portal.html"; }

/* ========= BLOQUEIO DE AUTOFILL NA BOLETA ========= */
function guardNoAutofillBoleta(){
  const ids = ['quantidade','valor'];
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;

    el.setAttribute('name', id + '_' + Math.random().toString(36).slice(2));
    el.setAttribute('autocomplete','off');
    el.setAttribute('autocorrect','off');
    el.setAttribute('autocapitalize','off');
    el.setAttribute('aria-autocomplete','none');

    const limparSeParecerCPF = () => {
      const digits = String(el.value || '').replace(/\D/g,'');
      if (digits.length >= 11) el.value = '';
    };

    limparSeParecerCPF();

    el.readOnly = true;
    if (document.activeElement !== el) el.value = '';

    setTimeout(()=>{
      el.readOnly = false;
      limparSeParecerCPF();
    }, 300);

    el.removeEventListener('input', limparSeParecerCPF);
    el.removeEventListener('change', limparSeParecerCPF);
    el.addEventListener('input', limparSeParecerCPF);
    el.addEventListener('change', limparSeParecerCPF);
  });
}

/* ========= AUTO INIT ========= */
window.addEventListener("DOMContentLoaded", ()=>{
  if(document.body.classList.contains("portal")) portalInit();
  if(document.body.classList.contains("analise")) anaInit();
});

/* ========= EXPOSE ========= */
window.toggleSenha=toggleSenha;
window.loginApp=loginApp;
window.salvarCadastro=salvarCadastro;
window.simularEnvio=(t)=>alert(t==="email"?"Simulando envio de e-mail...":"Simulando chamada telefônica...");
window.toggleChat=toggleChat;
window.enviarChat=enviarChat;
window.closeModal = closeModal;
window.portalInit=portalInit;
window.executarOperacao=executarOperacao;
window.filtrarExtrato=filtrarExtrato;
window.cancelarOrdem=cancelarOrdem;
window.exportarJSON=exportarJSON;
window.exportarXLS=exportarXLS;
window.alterarSenha=alterarSenha;
window.logout=logout;
window.recuperarSenha=recuperarSenha;
window.salvarNovaSenha=salvarNovaSenha;
window.abrirAnalise=abrirAnalise;
window.abrirBaixar=abrirBaixar;
window.voltarPortal=voltarPortal;
window.abrirMinhaConta=abrirMinhaConta;
window.abrirAlterarSenha=abrirAlterarSenha;
window.showModal=showModal;
window.hideModal=hideModal;
