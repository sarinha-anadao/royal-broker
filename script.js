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

// ========= FUNÇÕES DE VALIDAÇÃO =========
function validarNomeCompleto(nome) {
  const nomeLimpo = (nome || "").trim();
  
  // Verifica se está vazio
  if (!nomeLimpo) {
    return { valido: false, mensagem: "Digite o nome completo." };
  }
  
  // Verifica se contém apenas letras, espaços e acentos (mais rigoroso)
  const nomeRegex = /^[a-zA-ZÀ-ÿ\u00C0-\u017F\s]+$/;
  if (!nomeRegex.test(nomeLimpo)) {
    return { valido: false, mensagem: "Nome deve conter apenas letras, espaços e acentos." };
  }
  
  // Verifica se não contém números ou caracteres especiais
  if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nomeLimpo)) {
    return { valido: false, mensagem: "Nome não pode conter números ou caracteres especiais." };
  }
  
  // Verifica se tem pelo menos 2 palavras (nome e sobrenome)
  const palavras = nomeLimpo.split(' ').filter(palavra => palavra.length > 0);
  if (palavras.length < 2) {
    return { valido: false, mensagem: "Digite o nome completo (nome e sobrenome)." };
  }
  
  // Verifica se cada palavra tem pelo menos 2 caracteres
  for (let palavra of palavras) {
    if (palavra.length < 2) {
      return { valido: false, mensagem: "Cada nome deve ter pelo menos 2 caracteres." };
    }
  }
  
  return { valido: true, mensagem: "" };
}

function validarCPF(cpf) {
  cpf = limparCPF(cpf);
  
  // Verifica se contém apenas números
  if (!/^\d+$/.test(cpf)) {
    return { valido: false, mensagem: "CPF deve conter apenas números." };
  }
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return { valido: false, mensagem: "CPF deve ter 11 dígitos." };
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return { valido: false, mensagem: "CPF inválido." };
  }
  
  // Para este sistema, aceitamos qualquer CPF com 11 dígitos diferentes
  // que não seja composto apenas por dígitos iguais
  return { valido: true, mensagem: "" };
}

function formatarCPF(cpf) {
  const limpo = limparCPF(cpf);
  if (limpo.length <= 3) return limpo;
  if (limpo.length <= 6) return limpo.replace(/(\d{3})(\d)/, '$1.$2');
  if (limpo.length <= 9) return limpo.replace(/(\d{3})(\d{3})(\d)/, '$1.$2.$3');
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d)/, '$1.$2.$3-$4');
}

function validarTelefone(telefone) {
  const limpo = (telefone || "").replace(/\D/g, '');
  
  // Verifica se contém apenas números
  if (!/^\d+$/.test(limpo)) {
    return { valido: false, mensagem: "Telefone deve conter apenas números." };
  }
  
  // Verifica se tem exatamente 11 dígitos (DDD + 9 + número)
  if (limpo.length !== 11) {
    return { valido: false, mensagem: "Telefone deve ter 11 dígitos (DDD + 9 + número)." };
  }
  
  // Verifica se começa com DDD válido (11-99)
  const ddd = parseInt(limpo.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return { valido: false, mensagem: "DDD inválido." };
  }
  
  // Verifica se o 9º dígito é 9 (celular)
  if (limpo.charAt(2) !== '9') {
    return { valido: false, mensagem: "Número deve começar com 9 após o DDD." };
  }
  
  // Verifica se o número não é composto apenas por dígitos iguais
  if (/^(\d)\1{10}$/.test(limpo)) {
    return { valido: false, mensagem: "Número de telefone inválido." };
  }
  
  return { valido: true, mensagem: "" };
}

function formatarTelefone(telefone) {
  const limpo = (telefone || "").replace(/\D/g, '');
  if (limpo.length <= 2) return limpo;
  if (limpo.length <= 7) return limpo.replace(/(\d{2})(\d)/, '($1) $2');
  return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function validarEmail(email) {
  // Verifica se está vazio
  if (!email || email.trim() === '') {
    return { valido: false, mensagem: "Digite um e-mail válido." };
  }
  
  // Regex mais rigoroso para validação de email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { valido: false, mensagem: "Formato de e-mail inválido (exemplo: usuario@dominio.com)." };
  }
  
  // Verifica se o domínio tem pelo menos 2 caracteres
  const partes = email.split('@');
  if (partes.length !== 2) {
    return { valido: false, mensagem: "E-mail deve conter um @." };
  }
  
  const dominio = partes[1];
  if (dominio.length < 3 || !dominio.includes('.')) {
    return { valido: false, mensagem: "Domínio do e-mail inválido." };
  }
  
  return { valido: true, mensagem: "" };
}

function validarSenha(senha) {
  const regras = {
    tamanho: senha.length >= 8 && senha.length <= 12,
    minuscula: /[a-z]/.test(senha),
    maiuscula: /[A-Z]/.test(senha),
    numero: /[0-9]/.test(senha),
    especial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)
  };
  
  const todasRegras = Object.values(regras).every(regra => regra);
  
  return {
    valido: todasRegras,
    mensagem: todasRegras ? "" : "Senha não atende aos requisitos.",
    regras: regras
  };
}

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

/* ---- Contas base "mockadas" por perfil A/B ---- */
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
let currentStoryIndex = 0;
const storiesPerView = 3;

function buildStories(){
  const el = $("#storiesWrap"); if(!el) return;
  const depo = [
    {who:"Carla • Campinas", text:"Comecei com R$ 300/mês e hoje invisto com disciplina. Faça como a Carla e mude de vida!"},
    {who:"Rafael • Recife", text:"Uso a boleta da Royal todo mês. Consistência faz diferença."},
    {who:"Aline • Floripa", text:"Diversifiquei entre ações e renda fixa. Dormi em paz e vi o patrimônio crescer."},
    {who:"Pedro • São Paulo", text:"Segui o plano com VALE3 e colhi resultado com o tempo."},
    {who:"Mariana • Belo Horizonte", text:"A plataforma Royal me deu confiança para investir. Resultados surpreendentes!"},
    {who:"Lucas • Porto Alegre", text:"Comecei do zero e hoje tenho uma carteira diversificada graças à Royal."}
  ];
  
  el.innerHTML = depo.map(d=>`
    <article class="story">
      <div class="who">${d.who}</div>
      <div class="text">${d.text}</div>
    </article>`).join("");
  
  // Criar dots
  const dotsContainer = $("#carouselDots");
  if (dotsContainer) {
    const totalPages = Math.ceil(depo.length / storiesPerView);
    dotsContainer.innerHTML = Array.from({length: totalPages}, (_, i) => 
      `<div class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="irParaPagina(${i})"></div>`
    ).join("");
  }
  
  atualizarCarrossel();
}

function moverCarrossel(direction) {
  const el = $("#storiesWrap");
  if (!el) return;
  
  const depo = [
    {who:"Carla • Campinas", text:"Comecei com R$ 300/mês e hoje invisto com disciplina. Faça como a Carla e mude de vida!"},
    {who:"Rafael • Recife", text:"Uso a boleta da Royal todo mês. Consistência faz diferença."},
    {who:"Aline • Floripa", text:"Diversifiquei entre ações e renda fixa. Dormi em paz e vi o patrimônio crescer."},
    {who:"Pedro • São Paulo", text:"Segui o plano com VALE3 e colhi resultado com o tempo."},
    {who:"Mariana • Belo Horizonte", text:"A plataforma Royal me deu confiança para investir. Resultados surpreendentes!"},
    {who:"Lucas • Porto Alegre", text:"Comecei do zero e hoje tenho uma carteira diversificada graças à Royal."}
  ];
  
  const totalPages = Math.ceil(depo.length / storiesPerView);
  currentStoryIndex = Math.max(0, Math.min(currentStoryIndex + direction, totalPages - 1));
  
  atualizarCarrossel();
}

function irParaPagina(pagina) {
  currentStoryIndex = pagina;
  atualizarCarrossel();
}

function atualizarCarrossel() {
  const el = $("#storiesWrap");
  const dotsContainer = $("#carouselDots");
  if (!el) return;
  
  const translateX = -currentStoryIndex * (100 / storiesPerView);
  el.style.transform = `translateX(${translateX}%)`;
  
  // Atualizar dots
  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentStoryIndex);
    });
  }
  
  // Atualizar botões
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  
  if (prevBtn) prevBtn.disabled = currentStoryIndex === 0;
  if (nextBtn) {
    const depo = [
      {who:"Carla • Campinas", text:"Comecei com R$ 300/mês e hoje invisto com disciplina. Faça como a Carla e mude de vida!"},
      {who:"Rafael • Recife", text:"Uso a boleta da Royal todo mês. Consistência faz diferença."},
      {who:"Aline • Floripa", text:"Diversifiquei entre ações e renda fixa. Dormi em paz e vi o patrimônio crescer."},
      {who:"Pedro • São Paulo", text:"Segui o plano com VALE3 e colhi resultado com o tempo."},
      {who:"Mariana • Belo Horizonte", text:"A plataforma Royal me deu confiança para investir. Resultados surpreendentes!"},
      {who:"Lucas • Porto Alegre", text:"Comecei do zero e hoje tenho uma carteira diversificada graças à Royal."}
    ];
    const totalPages = Math.ceil(depo.length / storiesPerView);
    nextBtn.disabled = currentStoryIndex === totalPages - 1;
  }
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

/* Gráfico do hero melhorado */
(function drawHero(){ 
  const c=$("#canvasHero"); 
  if(!c) return; 
  const ctx=c.getContext("2d"); 
  const W=c.width,H=c.height,p=28; 
  const months=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]; 
  
  function step(){ 
    // Fundo com gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#0b1b26");
    gradient.addColorStop(1, "#0f1821");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,W,H);
    
    // Grid mais suave
    ctx.strokeStyle="#1a2f3d"; 
    ctx.lineWidth = 0.5;
    for(let i=0;i<=4;i++){ 
      const y=p+((H-p*1.6)*i/4); 
      ctx.beginPath(); 
      ctx.moveTo(p,y); 
      ctx.lineTo(W-p,y); 
      ctx.stroke(); 
    }
    
    // Meses com melhor posicionamento
    ctx.fillStyle="#7aa6c2"; 
    ctx.font = "12px Arial";
    months.slice(0,6).forEach((m,i)=>{ 
      const x=p+((W-p*2)/5)*i; 
      ctx.fillText(m, x-12, H-8); 
    });
    
    const t = Date.now()/800; 
    const colors = ["#39d98a","#3fd0ff","#ffd261"];
    const gradients = [
      ctx.createLinearGradient(0, 0, 0, H),
      ctx.createLinearGradient(0, 0, 0, H),
      ctx.createLinearGradient(0, 0, 0, H)
    ];
    
    // Configurar gradientes
    gradients[0].addColorStop(0, "rgba(57, 217, 138, 0.8)");
    gradients[0].addColorStop(1, "rgba(57, 217, 138, 0.1)");
    gradients[1].addColorStop(0, "rgba(63, 208, 255, 0.8)");
    gradients[1].addColorStop(1, "rgba(63, 208, 255, 0.1)");
    gradients[2].addColorStop(0, "rgba(255, 210, 97, 0.8)");
    gradients[2].addColorStop(1, "rgba(255, 210, 97, 0.1)");
    
    [0,1,2].forEach(si=>{
      ctx.beginPath();
      for(let i=0;i<=60;i++){
        const x=p+i*((W-p*2)/60);
        // Linha crescente com oscilação
        const base = H - p - (i* (8 + si*3)) - Math.sin(t*0.5)*10;
        const y = base + Math.sin((t+i*0.3)+si)*8 + Math.cos(t*0.3+i*0.1)*4;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      
      // Preencher área sob a linha
      ctx.lineTo(W-p, H-p);
      ctx.lineTo(p, H-p);
      ctx.closePath();
      ctx.fillStyle = gradients[si];
      ctx.fill();
      
      // Linha principal
      ctx.beginPath();
      for(let i=0;i<=60;i++){
        const x=p+i*((W-p*2)/60);
        const base = H - p - (i* (8 + si*3)) - Math.sin(t*0.5)*10;
        const y = base + Math.sin((t+i*0.3)+si)*8 + Math.cos(t*0.3+i*0.1)*4;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=colors[si]; 
      ctx.lineWidth=2.5; 
      ctx.stroke();
    });
    
    requestAnimationFrame(step);
  } 
  step(); 
})();

window.addEventListener("load", ()=>{ montarTicker(); buildCarousel(); buildStories(); countUp(); });
// COMENTADO: Não mudar preços constantemente para manter Book estável
// setInterval(()=>{ for (const k in ativosB3){ ativosB3[k]=+(ativosB3[k] + (Math.random()-0.5)*0.3).toFixed(2); } montarTicker(); buildCarousel(); }, 8000);

/* ========= CHAT ========= */
function toggleChat(){
  const b = document.getElementById("rbChat");
  if(!b) return;
  const opened = b.style.display === "block";
  b.style.display = opened ? "none" : "block";
  b.setAttribute("aria-hidden", opened ? "true" : "false");
}
const faq = [
  {k:/abrir|criar conta|cadastro/i, a:"Para abrir sua conta, clique em 'Abrir Conta' e preencha seus dados. A aprovação é rápida."},
  {k:/taxa|custodia|corretagem/i, a:"Plano padrão: isenção de custódia e corretagem zero em BDRs/ETFs elegíveis. Em ações à vista, condições promocionais."},
  {k:/suporte|atend|contato/i, a:"Você pode falar por telefone (11) 4000-0000, e-mail atendimento@royalbroker.com ou chat aqui mesmo."},
  {k:/senha|esqueci|redefin/i, a:"Use 'Esqueci minha senha' no login. Enviaremos instruções ao seu e-mail."},
  {k:/dep[oó]sito|pix|transfer/i, a:"Deposite via PIX TED no app do seu banco. O saldo aparece em minutos."},
  {k:/saque|retirada/i, a:"Saque pelo menu > Minha conta > Saques. Transferimos para sua conta cadastrada."},
  {k:/extrato|relat[oó]rio/i, a:"No Portal, acesse 'Extrato de Operações' e use 'Baixar Extrato' para XLSX/JSON."},
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
  const msg=$("#loginMsg");
  
  // Validação de campos vazios
  if(!cpf || !senha){
    if(msg){ 
      msg.className="error"; 
      msg.textContent="Preencha todos os campos obrigatórios."; 
    }
    return;
  }
  
  // Validação básica de CPF para login (apenas verifica se tem 11 dígitos)
  if(cpf.length !== 11){
    if(msg){ 
      msg.className="error"; 
      msg.textContent="CPF deve ter 11 dígitos."; 
    }
    return;
  }
  
  const user = getUser(cpf);
  if(user && user.senha===senha){
    localStorage.setItem("rb_cpf", cpf);
    localStorage.setItem("rb_last_login_"+cpf, new Date().toISOString());
    window.open("portal.html","_blank","noopener");
    if(msg){ msg.className="success"; msg.textContent="Login efetuado! Portal aberto em nova aba."; }
  } else {
    if(msg){ msg.className="error"; msg.textContent="CPF ou senha incorretos."; }
  }
}

function salvarCadastro(){
  const cpf = limparCPF($("#cadCpf")?.value),
        nome=$("#cadNome")?.value?.trim(),
        zap=$("#cadZap")?.value?.trim(),
        email=$("#cadEmail")?.value?.trim(),
        s=$("#cadSenha")?.value, c=$("#cadConfSenha")?.value, msg=$("#cadMsg");
  
  // Validação de campos vazios
  if(!nome || !cpf || !zap || !email || !s || !c){ 
    msg.className="error";
    msg.textContent="Preencha todos os campos obrigatórios."; 
    return; 
  }
  
  // Forçar validação de todos os campos antes de prosseguir
  const validacoes = {
    nome: validarNomeCompleto(nome),
    cpf: validarCPF(cpf),
    telefone: validarTelefone(zap),
    email: validarEmail(email),
    senha: validarSenha(s)
  };
  
  // Verificar se há algum erro de validação
  const erros = [];
  for (const [campo, validacao] of Object.entries(validacoes)) {
    if (!validacao.valido) {
      erros.push(validacao.mensagem);
    }
  }
  
  if (erros.length > 0) {
    msg.className="error";
    msg.textContent=erros[0]; // Mostra o primeiro erro
    return;
  }
  
  // Verificar se CPF já existe
  if(userExists(cpf)){ 
    msg.className="error";
    msg.textContent="CPF já cadastrado."; 
    return; 
  }
  
  // Validação de senhas
  if(s!==c){ 
    msg.className="error";
    msg.textContent="As senhas não coincidem."; 
    return; 
  }
  
  const validacaoSenha = validarSenha(s);
  if(!validacaoSenha.valido){ 
    msg.className="error";
    msg.textContent=validacaoSenha.mensagem; 
    return; 
  }

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
  const cpf = limparCPF($("#recCpf")?.value);
  const email = $("#recEmail")?.value?.trim();
  const msg=$("#recMsg"); 
  
  if(!msg) return;
  
  // Validação de campos vazios
  if(!cpf || !email){
    msg.className="error";
    msg.textContent="Preencha todos os campos obrigatórios.";
    return;
  }
  
  // Validação de CPF
  const validacaoCPF = validarCPF(cpf);
  if(!validacaoCPF.valido){
    msg.className="error";
    msg.textContent=validacaoCPF.mensagem;
    return;
  }
  
  // Validação de e-mail
  const validacaoEmail = validarEmail(email);
  if(!validacaoEmail.valido){
    msg.className="error";
    msg.textContent=validacaoEmail.mensagem;
    return;
  }
  
  // Verificar se o usuário existe e se o e-mail corresponde
  const user = getUser(cpf);
  if(!user){
    msg.className="error";
    msg.textContent="CPF não encontrado no sistema.";
    return;
  }
  
  if(user.email !== email){
    msg.className="error";
    msg.textContent="E-mail não corresponde ao CPF cadastrado.";
    return;
  }
  
  // Se chegou até aqui, as credenciais são válidas
  msg.className="success"; 
  msg.textContent="Enviamos instruções para o email cadastrado.";
  setTimeout(()=>{ window.open("redefinir.html","_blank","noopener"); }, 700);
}

function salvarNovaSenha(){
  const nova = $("#novaSenhaRec")?.value;
  const conf = $("#confirmarSenhaRec")?.value;
  const msg = $("#msgRedefinicao");
  const cpf = localStorage.getItem("rb_cpf");
  
  // Verificar se há um CPF válido (usuário logado ou em processo de recuperação)
  if(!cpf){
    msg.className="error"; 
    msg.textContent="Sessão inválida. Tente novamente o processo de recuperação."; 
    return; 
  }
  
  // Validação de campos vazios
  if(!nova || !conf){ 
    msg.className="error"; 
    msg.textContent="Preencha os dois campos."; 
    return; 
  }
  
  // Validação de senhas
  if(nova!==conf){ 
    msg.className="error"; 
    msg.textContent="As senhas não coincidem."; 
    return; 
  }
  
  const validacaoSenha = validarSenha(nova);
  if(!validacaoSenha.valido){ 
    msg.className="error"; 
    msg.textContent=validacaoSenha.mensagem; 
    return; 
  }

  // Verificar se o usuário existe
  const u = getUser(cpf);
  if(!u){
    msg.className="error"; 
    msg.textContent="Usuário não encontrado. Tente novamente o processo de recuperação."; 
    return; 
  }
  
  const hist = u.historicoSenhas || [];
  if(hist.slice(0,4).includes(nova)){ 
    msg.className="error"; 
    msg.textContent="Não é permitido reutilizar nenhuma das últimas 4 senhas."; 
    return; 
  }
  
  u.senha = nova;
  u.historicoSenhas = [nova, ...hist].slice(0,4);
  setUser(cpf, u);

  msg.className="success"; 
  msg.textContent="Senha redefinida com sucesso. Redirecionando para o login...";
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

  // Inicializa campos em modo de visualização
  resetarCamposMinhaConta();
  
  // Esconde botão de salvar
  const btnSalvar = document.getElementById("btnSalvarConta");
  if(btnSalvar) btnSalvar.style.display = "none";

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

  // Verificar se houve alterações
  const houveAlteracao = (nome !== u.nome) || (zap !== u.zap) || (email !== u.email);
  
  if (!houveAlteracao) {
    if(msg){ msg.className="error"; msg.textContent="Nenhuma alteração foi feita."; }
    return;
  }

  // Validação dos campos antes de salvar
  const validacaoNome = validarNomeCompleto(nome);
  if(!validacaoNome.valido) {
    if(msg){ msg.className="error"; msg.textContent=validacaoNome.mensagem; }
    return;
  }

  const validacaoTelefone = validarTelefone(zap);
  if(!validacaoTelefone.valido) {
    if(msg){ msg.className="error"; msg.textContent=validacaoTelefone.mensagem; }
    return;
  }

  const validacaoEmail = validarEmail(email);
  if(!validacaoEmail.valido) {
    if(msg){ msg.className="error"; msg.textContent=validacaoEmail.mensagem; }
    return;
  }

  // Atualizar apenas os campos que mudaram
  const dadosAtualizados = { ...u };
  if (nome !== u.nome) dadosAtualizados.nome = nome;
  if (zap !== u.zap) dadosAtualizados.zap = zap;
  if (email !== u.email) dadosAtualizados.email = email;

  setUser(cpf, dadosAtualizados);
  if(document.getElementById("username")) document.getElementById("username").innerText = nome; // reflete no header

  if(msg){ msg.className="success"; msg.textContent="Dados atualizados com sucesso!"; }
  
  // Resetar campos para modo de visualização após salvar
  setTimeout(() => {
    resetarCamposMinhaConta();
    const btnSalvar = document.getElementById("btnSalvarConta");
    if(btnSalvar) btnSalvar.style.display = "none";
  }, 500);
  
  setTimeout(()=> hideModal("modalConta"), 900);
}


/* Alterar senha (modal ou seção antiga) */
function alterarSenha(){
  const nova = $("#novaSenhaModal")?.value;
  const conf = $("#confSenhaModal")?.value;
  const msg = $("#senhaMsgModal");
  const cpf = cpfAtual || localStorage.getItem("rb_cpf");

  // Validação de campos vazios
  if(!nova || !conf){ 
    if(msg){ msg.className="error"; msg.textContent="Preencha todos os campos obrigatórios."; } 
    return; 
  }
  
  // Validação de senhas
  if(nova !== conf){ 
    if(msg){ msg.className="error"; msg.textContent="As senhas não coincidem."; } 
    return; 
  }
  
  // Validação de senha com regras específicas
  const validacaoSenha = validarSenha(nova);
  if(!validacaoSenha.valido){
    if(msg){ msg.className="error"; msg.textContent=validacaoSenha.mensagem; }
    return;
  }

  const u = getUser(cpf);
  if(!u){ 
    if(msg){ msg.className="error"; msg.textContent="Sessão expirada. Faça login novamente."; } 
    return; 
  }
  
  const hist = u.historicoSenhas || [];
  if(hist.slice(0,4).includes(nova)){ 
    if(msg){ msg.className="error"; msg.textContent="Não é permitido reutilizar nenhuma das últimas 4 senhas."; } 
    return; 
  }

  // Atualizar senha
  u.senha = nova;
  u.historicoSenhas = [nova, ...hist].slice(0,4);
  setUser(cpf, u);

  if(msg){ msg.className="success"; msg.textContent="Senha alterada com sucesso!"; }
  setTimeout(()=> hideModal("modalSenha"), 900);
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
  atualizarCarteira(); montarBook(); atualizarExtrato(); atualizarOrdens();
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
    // Variação fixa para cada ativo (não muda constantemente)
    const chg = getVariacaoFixa(ativo);
    const logo = logos[ativo] ? `<img src="${logos[ativo]}" class="logo-mini" alt="${ativo}">` : '';
    const isFavorito = favoritos.includes(ativo);
    
    t.innerHTML += `<tr data-ativo="${ativo}">
      <td>
        <button class="favorito-btn ${isFavorito ? 'favoritado' : 'nao-favoritado'}" 
                onclick="event.stopPropagation(); event.preventDefault(); toggleFavorito('${ativo}'); return false;"
                style="z-index: 1000; position: relative;">
          ${isFavorito ? '⭐' : '☆'}
        </button>
      </td>
      <td>${logo}</td><td>${ativo}</td><td>${p.toFixed(2)}</td>
      <td style="color:${chg>=0?'#2ecc71':'#ff6b6b'}">${chg>=0?'+':''}${Math.abs(chg).toFixed(2)}%</td>
    </tr>`;
  }
  t.querySelectorAll("tr").forEach(tr=>{
    tr.addEventListener("click", (e)=>{
      // NUNCA executa se clicou no botão de favorito - proteção total
      if (e.target.closest('.favorito-btn') || e.target.classList.contains('favorito-btn')) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
      
      const a = tr.getAttribute("data-ativo");
      if($("#ativo")) $("#ativo").value = a;
      if($("#valor")) $("#valor").value = ativosB3[a].toFixed(2);
      const m=$("#mensagem"); if(m){ m.className="msg-inline"; m.textContent="Ao clicar nos ativos, os dados são preenchidos automaticamente na Boleta."; }
      
      // Chama a função para preencher o valor da boleta
      if(typeof preencherValorBoleta === 'function') {
        preencherValorBoleta();
      }
    });
  });
}

// Função para obter variação fixa para cada ativo (não muda)
function getVariacaoFixa(ativo) {
  const variacoesFixas = {
    'PETR4': 2.38,
    'VALE3': 1.33,
    'ITUB4': 2.49,
    'BBDC4': 1.51,
    'ABEV3': 0.85,
    'MGLU3': -0.57,
    'BBAS3': 1.92,
    'LREN3': 0.78
  };
  return variacoesFixas[ativo] || 0;
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

  // Validação rigorosa da quantidade
  if(isNaN(qtd) || qtd <= 0){
    msg.textContent="Quantidade deve ser um número maior que zero.";
    msg.classList.add("error"); 
    return;
  }
  
  if(qtd < 100){
    msg.textContent="Quantidade mínima é 100 ações por ordem.";
    msg.classList.add("error"); 
    return;
  }
  
  if(qtd % 100 !== 0){
    msg.textContent="Quantidade deve ser múltipla de 100 (100, 200, 300, etc.).";
    msg.classList.add("error"); 
    return;
  }
  
  // Validação rigorosa do valor - deve corresponder ao preço atual do ativo
  if(isNaN(valor) || valor <= 0){
    msg.textContent="Valor deve ser um número maior que zero.";
    msg.classList.add("error"); 
    return;
  }
  
  // Verifica se o valor corresponde ao preço atual do ativo (com tolerância de R$ 0,01)
  if(Math.abs(valor - cotacao) > 0.01){
    msg.textContent=`Valor inválido! O preço atual de ${ativo} é R$ ${cotacao.toFixed(2)}. Apenas valores exatos são aceitos.`;
    msg.classList.add("error"); 
    return;
  }
  
  // Validação do ativo
  if(!ativo || ativo.trim() === ''){
    msg.textContent="Selecione um ativo válido.";
    msg.classList.add("error"); 
    return;
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

    msg.textContent = `Ordem executada com sucesso! ${qtd} ações de ${ativo} por R$ ${valor.toFixed(2)}.`;
    msg.classList.remove("error");
    msg.classList.add("success");
  } else {
    msg.textContent=`Ordem aceita! ${qtd} ações de ${ativo} por R$ ${valor.toFixed(2)}. Aguardando execução no mercado.`;
    msg.classList.remove("error","success");
    msg.classList.add("info");
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

          // Determinar a classe CSS baseada no status
      let statusClass = '';
      if(o.status === 'Executada') statusClass = 'success';
      else if(o.status === 'Cancelada') statusClass = 'error';
      else if(o.status.startsWith('Parcial')) statusClass = 'warning';
      else statusClass = 'info';

      t.insertAdjacentHTML("beforeend", `
        <tr class="${statusClass}">
          <td>${o.id}</td>
          <td>${o.tipo}</td>
          <td>${o.ativo}</td>
          <td>${o.qtd}</td>
          <td>${(+o.valor).toFixed(2)}</td>
          <td>${filledPct}%</td>
          <td>${escapeHTML(o.status)}${o.motivo ? ` (${o.motivo})` : ''}</td>
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
  const dataInicial = document.getElementById("dataInicial")?.value;
  const dataFinal = document.getElementById("dataFinal")?.value;
  const ordenacao = document.getElementById("ordenacao")?.value || "desc";
  const msg = document.getElementById("filtroMsg");

  let lista = extrato.slice();

  // Filtro por data
  if (dataInicial || dataFinal) {
    lista = lista.filter(e => {
      const dataOperacao = e.date instanceof Date ? e.date : new Date(e.date);
      const dataOp = new Date(dataOperacao.getFullYear(), dataOperacao.getMonth(), dataOperacao.getDate());
      
      if (dataInicial && dataFinal) {
        const inicio = new Date(dataInicial);
        const fim = new Date(dataFinal);
        return dataOp >= inicio && dataOp <= fim;
      } else if (dataInicial) {
        const inicio = new Date(dataInicial);
        return dataOp >= inicio;
      } else if (dataFinal) {
        const fim = new Date(dataFinal);
        return dataOp <= fim;
      }
      return true;
    });
  }

  // Ordenação
  lista.sort((a, b) => {
    const dataA = a.date instanceof Date ? a.date : new Date(a.date);
    const dataB = b.date instanceof Date ? b.date : new Date(b.date);
    return ordenacao === "desc" ? dataB - dataA : dataA - dataB;
  });

  const t = document.querySelector("#extrato tbody");
  if(!t) return;
  t.innerHTML = "";

  if (lista.length === 0) {
    t.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted);">Nenhuma operação encontrada no período selecionado</td></tr>';
    if (msg) {
      msg.className = "error";
      msg.textContent = "Nenhuma operação encontrada no período selecionado.";
    }
    return;
  }

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

  if (msg) {
    msg.className = "success";
    msg.textContent = `${lista.length} operação(ões) encontrada(s).`;
  }
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
// COMENTADO: Não mudar preços constantemente para manter Book estável
// setInterval(()=>{
//   for (let k in ativosB3){ ativosB3[k] = parseFloat((ativosB3[k] + 0.01).toFixed(2)); }
//       if(usuarioAtual){
//       ordens.forEach(o=>{
//         if(o.status==="Aceita" || o.status.startsWith("Parcial")){
//           // Verificar se a quantidade é válida
//           if(o.qtd < 100 || o.qtd % 100 !== 0){
//             o.status = "Cancelada";
//             o.motivo = "Quantidade inválida";
//             return; // Usar return em vez de continue
//           }
//           
//           // Verificar se o valor é válido
//           if(!o.valor || o.valor <= 0){
//             o.status = "Cancelada";
//             o.motivo = "Valor inválido";
//             return; // Usar return em vez de continue
//           }
//           
//           // Processar apenas ordens válidas
//           if(Math.random() < 0.6){
//           const restante = o.qtd - o.filled;
//           const chunk = Math.max(0, Math.min(restante, Math.round(o.qtd * (0.2 + Math.random()*0.25))));
//           if(chunk>0){
//             const fillPrice = +(o.cotacao + (Math.random()-0.5)*0.6).toFixed(2);
//             aplicarParcial(o, chunk, fillPrice);
//             o.avgFillPrice = ((o.avgFillPrice * o.filled) + (fillPrice * chunk)) / (o.filled + chunk || 1);
//             o.filled += chunk;
//             o.status = o.filled < o.qtd ? `Parcial ${Math.round(o.filled/o.qtd*100)}%` : "Executada";
//             if(o.status==="Executada"){ extrato.unshift({ ...o, price:+(o.avgFillPrice||o.valor), total:o.qtd * +(o.avgFillPrice||o.valor) }); saveState(cpfAtual); }
//           }
//         }
//       }
//     });
//     atualizarBook(); atualizarOrdens(); atualizarCarteira(); atualizarExtrato();
//   }
// }, 10000);

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

function exportarPDF(qual){
  let data = [];
  let titulo = '';
  
  if(qual==='carteira'){ 
    data = Object.keys(usuarioAtual.carteira).map(k=>({ativo:k, quantidade:usuarioAtual.carteira[k], precoMedio:+(usuarioAtual.precoMedio[k]||0).toFixed(2), valorMercado:+(usuarioAtual.carteira[k]*(ativosB3[k]||0)).toFixed(2)})); 
    titulo = 'Carteira de Investimentos';
  }
  else if(qual==='book'){ 
    data = Object.keys(ativosB3).map(k=>({ativo:k, preco:ativosB3[k]})); 
    titulo = 'Book de Ofertas';
  }
  else if(qual==='extrato'){ 
    data = extrato.map(e=>({data:e.date, tipo:e.tipo, ativo:e.ativo, qtd:e.qtd, preco:(e.price||e.valor), total:(e.total||e.qtd*(e.price||e.valor))})); 
    titulo = 'Extrato de Operações';
  }
  else if(qual==='ordens'){ 
    data = ordens.map(o=>({tipo:o.tipo, ativo:o.ativo, qtd:o.qtd, precoLimite:o.valor, filled:o.filled, status:o.status})); 
    titulo = 'Book de Ordens';
  }
  
  // Gerar HTML para PDF
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${titulo} - Royal Broker</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #123a5a; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${titulo}</h1>
        <p>Royal Broker - Relatório gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      <table>
        <thead>
          <tr>
  `;
  
  // Cabeçalhos baseados no tipo
  if(qual === 'carteira') {
    html += '<th>Ativo</th><th>Quantidade</th><th>Preço Médio (R$)</th><th>Valor Mercado (R$)</th>';
  } else if(qual === 'book') {
    html += '<th>Ativo</th><th>Preço Atual (R$)</th>';
  } else if(qual === 'extrato') {
    html += '<th>Data</th><th>Tipo</th><th>Ativo</th><th>Quantidade</th><th>Preço (R$)</th><th>Total (R$)</th>';
  } else if(qual === 'ordens') {
    html += '<th>Tipo</th><th>Ativo</th><th>Quantidade</th><th>Preço Limite (R$)</th><th>Executado</th><th>Status</th>';
  }
  
  html += '</tr></thead><tbody>';
  
  // Dados
  data.forEach(item => {
    html += '<tr>';
    Object.values(item).forEach(value => {
      html += `<td>${value}</td>`;
    });
    html += '</tr>';
  });
  
  html += `
        </tbody>
      </table>
      <div class="footer">
        <p>© 2025 Royal Broker - Todos os direitos reservados</p>
      </div>
    </body>
    </html>
  `;
  
  // Usar jsPDF ou similar para gerar PDF
  // Por enquanto, vamos usar uma abordagem simples com print
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

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
    return `<tr onclick="selecionarAtivoCarteira('${k}')" style="cursor: pointer;" class="carteira-row">
      <td>${logo}</td>
      <td>${k}</td>
      <td>${baseCarteira[k]}</td>
      <td>${pm}</td>
    </tr>`;
  }).join("");
}

function selecionarAtivoCarteira(ativo) {
  // Atualizar o select de ativo na análise técnica
  const selectAtivo = document.getElementById('anaSymbol');
  if (selectAtivo) {
    selectAtivo.value = ativo;
    // Disparar evento de change para atualizar o gráfico
    selectAtivo.dispatchEvent(new Event('change'));
  }
  
  // Mostrar feedback visual
  const rows = document.querySelectorAll('.carteira-row');
  rows.forEach(row => {
    row.style.backgroundColor = '';
    row.style.borderColor = '';
  });
  
  const selectedRow = document.querySelector(`tr[onclick*="${ativo}"]`);
  if (selectedRow) {
    selectedRow.style.backgroundColor = 'rgba(57, 217, 138, 0.1)';
    selectedRow.style.borderColor = '#39d98a';
  }
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

// ========= PROTEÇÃO ABSOLUTA PARA FAVORITOS =========
document.addEventListener('DOMContentLoaded', function() {
  // Garante que os botões de favorito tenham prioridade total
  setTimeout(() => {
    const favoritoBtns = document.querySelectorAll('.favorito-btn');
    favoritoBtns.forEach(btn => {
      // Remove qualquer evento conflitante
      btn.replaceWith(btn.cloneNode(true));
      
      // Adiciona o evento de favorito com prioridade máxima
      const newBtn = document.querySelector(`[onclick*="toggleFavorito('${btn.getAttribute('onclick').match(/'([^']+)'/)[1]}')"]`);
      if (newBtn) {
        newBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          e.stopImmediatePropagation();
          
          // Executa a função favoritar
          const ativo = this.getAttribute('onclick').match(/'([^']+)'/)[1];
          toggleFavorito(ativo);
          
          return false;
        }, true); // true = capture phase (executa primeiro)
      }
    });
  }, 100);
});

/* ========= AUTO INIT ========= */
window.addEventListener("DOMContentLoaded", ()=>{
  if(document.body.classList.contains("portal")) {
    portalInit();
    // Inicializar funcionalidades do portal
    setTimeout(() => {
      atualizarConquistas();
      atualizarCalendario();
      atualizarAlertasList();
      preencherSelectsComparador();
      atualizarRankingUsuarios();
    }, 1000);
  }
  if(document.body.classList.contains("analise")) {
    anaInit();
    // Inicializar mini carteira
    setTimeout(() => {
      if (typeof atualizarMiniCarteira === 'function') atualizarMiniCarteira();
    }, 1000);
  }
  if(document.body.classList.contains("home")) {
    criarCarrosselAtivos();
    // Auto-play do carrossel
    setInterval(() => moverAtivosCarousel(1), 5000);
    
    // Inicializar todas as funcionalidades da página inicial
    atualizarRanking();
    atualizarRankingUsuarios();
    atualizarConquistas();
    atualizarNewsFeed();
    atualizarCalendario();
    atualizarRankingSetores();
    atualizarAlertasList();
    
    // Preencher selects do comparador
    preencherSelectsComparador();
    
    // Atualizar rankings a cada minuto
    setInterval(atualizarRanking, 60000);
    setInterval(atualizarNewsFeed, 30000);
  }
  
  // Verificar dark mode globalmente
  if (localStorage.getItem('royal_dark_mode') === 'true') {
    document.body.classList.add('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    if (icon) icon.textContent = '☀️';
  }
});

function preencherSelectsComparador() {
  const select1 = document.getElementById('ativo1');
  const select2 = document.getElementById('ativo2');
  
  if (select1 && select2) {
    Object.keys(ativosB3).forEach(ativo => {
      const option1 = document.createElement('option');
      option1.value = ativo;
      option1.textContent = ativo;
      select1.appendChild(option1);
      
      const option2 = document.createElement('option');
      option2.value = ativo;
      option2.textContent = ativo;
      select2.appendChild(option2);
    });
  }
}

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
window.editarCampo=editarCampo;
window.resetarCamposMinhaConta=resetarCamposMinhaConta;
window.validarCampoMinhaConta=validarCampoMinhaConta;
window.showModal=showModal;
window.hideModal=hideModal;
window.validarCPF=validarCPF;
window.validarTelefone=validarTelefone;
window.validarEmail=validarEmail;
window.validarNomeCompleto=validarNomeCompleto;
window.validarSenha=validarSenha;
window.formatarCPF=formatarCPF;
window.formatarTelefone=formatarTelefone;
window.selecionarAtivoCarteira=selecionarAtivoCarteira;
window.moverAtivosCarousel=moverAtivosCarousel;
window.toggleFavorito=toggleFavorito;
window.toggleFavoritos=toggleFavoritos;
window.montarBook=montarBook;
window.preencherBoleta=preencherBoleta;
window.abrirIndicadores=abrirIndicadores;
window.abrirNiveis=abrirNiveis;
window.abrirPadroes=abrirPadroes;
window.mostrarFavoritos=mostrarFavoritos;
window.removerFavorito=removerFavorito;
window.toggleDarkMode=toggleDarkMode;
window.iniciarQuiz=iniciarQuiz;
window.selecionarOpcao=selecionarOpcao;
window.reiniciarQuiz=reiniciarQuiz;
window.compararAtivos=compararAtivos;
window.criarAlerta=criarAlerta;
window.removerAlerta=removerAlerta;
window.calcularCustos=calcularCustos;
window.mostrarDetalhesEvento=mostrarDetalhesEvento;
window.abrirOperacao=abrirOperacao;
window.executarOperacaoAnalise=executarOperacaoAnalise;
window.atualizarMiniCarteira=atualizarMiniCarteira;
window.limparBoleta=limparBoleta;
window.navegarPara=navegarPara;
window.voltarPortal=voltarPortal;

// ========= FUNÇÃO VOLTAR PORTAL =========
function voltarPortal() {
  window.location.href = 'portal.html';
}

// ========= FUNÇÃO LIMPAR BOLETA =========
function limparBoleta() {
  document.getElementById('quantidade').value = '';
  document.getElementById('valor').value = '';
  document.getElementById('tipo').value = 'Compra';
  document.getElementById('ativo').value = '';
}

// ========= FUNÇÃO DE NAVEGAÇÃO =========
function navegarPara(pagina) {
  event.preventDefault();
  window.location.href = pagina;
}

// ========= FUNÇÕES DAS FERRAMENTAS DE ANÁLISE =========
function abrirIndicadores() {
  const ativo = document.getElementById('anaSymbol')?.value || 'PETR4';
  const modal = document.createElement('div');
  modal.className = 'modal-indicadores';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>📊 Indicadores Técnicos - ${ativo}</h3>
        <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="indicadores-grid">
          <div class="indicador-card">
            <h4>RSI (14)</h4>
            <div class="indicador-valor">65.4</div>
            <div class="indicador-status neutral">Neutro</div>
            <div class="indicador-desc">Índice de Força Relativa - Não está em sobrecompra nem sobrevenda</div>
          </div>
          <div class="indicador-card">
            <h4>MACD</h4>
            <div class="indicador-valor">+0.23</div>
            <div class="indicador-status positive">Compra</div>
            <div class="indicador-desc">Convergência/Divergência - Sinal de compra ativo</div>
          </div>
          <div class="indicador-card">
            <h4>Média Móvel (21)</h4>
            <div class="indicador-valor">R$ 32.15</div>
            <div class="indicador-status positive">Suporte</div>
            <div class="indicador-desc">Preço está acima da média móvel - Tendência de alta</div>
          </div>
          <div class="indicador-card">
            <h4>Bandas de Bollinger</h4>
            <div class="indicador-valor">Centro</div>
            <div class="indicador-status neutral">Neutro</div>
            <div class="indicador-desc">Preço está no centro das bandas - Volatilidade normal</div>
          </div>
          <div class="indicador-card">
            <h4>Estocástico</h4>
            <div class="indicador-valor">45.2</div>
            <div class="indicador-status neutral">Neutro</div>
            <div class="indicador-desc">Oscilador estocástico - Não indica reversão</div>
          </div>
          <div class="indicador-card">
            <h4>Williams %R</h4>
            <div class="indicador-valor">-55.8</div>
            <div class="indicador-status positive">Compra</div>
            <div class="indicador-desc">Não está em sobrevenda - Possível oportunidade</div>
          </div>
        </div>
      </div>
    </div>
  `;
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center;
  `;
  document.body.appendChild(modal);
}

function abrirNiveis() {
  const ativo = document.getElementById('anaSymbol')?.value || 'PETR4';
  const preco = ativosB3[ativo] || 0;
  
  const modal = document.createElement('div');
  modal.className = 'modal-niveis';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>🎯 Níveis de Suporte/Resistência - ${ativo}</h3>
        <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="niveis-container">
          <div class="nivel-item resistencia">
            <span class="nivel-tipo">Resistência</span>
            <span class="nivel-preco">R$ ${(preco * 1.08).toFixed(2)}</span>
            <span class="nivel-forca">Forte</span>
          </div>
          <div class="nivel-item resistencia">
            <span class="nivel-tipo">Resistência</span>
            <span class="nivel-preco">R$ ${(preco * 1.05).toFixed(2)}</span>
            <span class="nivel-forca">Média</span>
          </div>
          <div class="nivel-item suporte">
            <span class="nivel-tipo">Suporte</span>
            <span class="nivel-preco">R$ ${(preco * 0.95).toFixed(2)}</span>
            <span class="nivel-forca">Forte</span>
          </div>
          <div class="nivel-item suporte">
            <span class="nivel-preco">R$ ${(preco * 0.92).toFixed(2)}</span>
            <span class="nivel-forca">Média</span>
          </div>
          <div class="nivel-item psicologico">
            <span class="nivel-tipo">Psicológico</span>
            <span class="nivel-preco">R$ ${Math.round(preco)}</span>
            <span class="nivel-forca">Médio</span>
          </div>
        </div>
        <div class="niveis-info">
          <p><strong>Análise:</strong> O ativo está próximo ao suporte forte em R$ ${(preco * 0.95).toFixed(2)}. 
          Se romper esse nível, pode cair para R$ ${(preco * 0.92).toFixed(2)}.</p>
        </div>
      </div>
    </div>
  `;
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center;
  `;
  document.body.appendChild(modal);
}

function abrirPadroes() {
  const ativo = document.getElementById('anaSymbol')?.value || 'PETR4';
  
  const modal = document.createElement('div');
  modal.className = 'modal-padroes';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>📈 Padrões de Candlestick - ${ativo}</h3>
        <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="padroes-container">
          <div class="padrao-item positivo">
            <div class="padrao-icon">🟢</div>
            <div class="padrao-info">
              <h4>Martelo</h4>
              <p>Sinal de reversão de alta - Ocorreu há 2 sessões</p>
            </div>
            <div class="padrao-confianca">85%</div>
          </div>
          <div class="padrao-item negativo">
            <div class="padrao-icon">🔴</div>
            <div class="padrao-info">
              <h4>Estrela da Noite</h4>
              <p>Sinal de reversão de baixa - Ocorreu há 1 sessão</p>
            </div>
            <div class="padrao-confianca">78%</div>
          </div>
          <div class="padrao-item neutro">
            <div class="padrao-icon">⚪</div>
            <div class="padrao-info">
              <h4>Doji</h4>
              <p>Indecisão do mercado - Ocorreu hoje</p>
            </div>
            <div class="padrao-confianca">60%</div>
          </div>
          <div class="padrao-item positivo">
            <div class="padrao-icon">🟢</div>
            <div class="padrao-info">
              <h4>Três Soldados Brancos</h4>
              <p>Forte tendência de alta - Ocorreu há 3 sessões</p>
            </div>
            <div class="padrao-confianca">92%</div>
          </div>
        </div>
        <div class="padroes-info">
          <p><strong>Análise:</strong> O ativo mostra sinais mistos. O Martelo e Três Soldados Brancos indicam força, 
          mas o Doji de hoje sugere indecisão. Aguarde confirmação.</p>
        </div>
      </div>
    </div>
  `;
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center;
  `;
  document.body.appendChild(modal);
}

// ========= FUNÇÕES DO CARROSSEL DE ATIVOS =========
let ativosCarouselIndex = 0;
const ativosCarouselItems = Object.keys(ativosB3);

function moverAtivosCarousel(direction) {
  const track = document.getElementById('ativosCarousel');
  if (!track) return;
  
  ativosCarouselIndex += direction;
  
  if (ativosCarouselIndex < 0) {
    ativosCarouselIndex = ativosCarouselItems.length - 1;
  } else if (ativosCarouselIndex >= ativosCarouselItems.length) {
    ativosCarouselIndex = 0;
  }
  
  const translateX = -ativosCarouselIndex * 280; // 260px (card width) + 20px (gap)
  track.style.transform = `translateX(${translateX}px)`;
}

function criarCarrosselAtivos() {
  const track = document.getElementById('ativosCarousel');
  if (!track) return;
  
  track.innerHTML = '';
  
  ativosCarouselItems.forEach(ativo => {
    const preco = ativosB3[ativo];
    const logo = logos[ativo];
    const variacao = (Math.random() * 10 - 5).toFixed(2); // Variação aleatória entre -5% e +5%
    const isPositive = parseFloat(variacao) >= 0;
    
    const card = document.createElement('div');
    card.className = 'ativo-card';
    card.innerHTML = `
      <div class="ativo-header">
        <img src="${logo}" alt="${ativo}" class="ativo-logo">
        <div class="ativo-info">
          <h4>${ativo}</h4>
          <span class="ativo-preco">R$ ${preco.toFixed(2)}</span>
        </div>
      </div>
      <div class="ativo-variacao ${isPositive ? 'positive' : 'negative'}">
        ${isPositive ? '▲' : '▼'} ${Math.abs(variacao)}%
      </div>
    `;
    
    track.appendChild(card);
  });
}

// ========= FUNÇÕES DE FAVORITOS =========
let favoritos = JSON.parse(localStorage.getItem('royal_favoritos') || '[]');
let mostrarApenasFavoritos = false;

function toggleFavorito(ativo) {
  // Proteção total - sempre executa independente de outros eventos
  try {
    const index = favoritos.indexOf(ativo);
    if (index > -1) {
      favoritos.splice(index, 1);
    } else {
      favoritos.push(ativo);
    }
    
    localStorage.setItem('royal_favoritos', JSON.stringify(favoritos));
    
    // Força a atualização do book
    setTimeout(() => {
      montarBook();
    }, 10);
    
    // Feedback visual imediato
    const btn = event.target;
    if (btn) {
      btn.style.transform = 'scale(1.2)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 200);
    }
  } catch (error) {
    console.error('Erro ao favoritar:', error);
    // Fallback: recarrega a página se houver erro
    alert('Erro ao favoritar. Recarregando...');
    location.reload();
  }
}

function toggleFavoritos() {
  mostrarApenasFavoritos = !mostrarApenasFavoritos;
  const btn = document.getElementById('btnFavoritos');
  const icon = document.getElementById('favoritosIcon');
  
  if (mostrarApenasFavoritos) {
    btn.style.background = 'linear-gradient(135deg, var(--gold) 0%, var(--gold-2) 100%)';
    btn.style.color = '#0a0f14';
    icon.textContent = '⭐';
  } else {
    btn.style.background = 'linear-gradient(135deg, var(--turq) 0%, var(--turq-2) 100%)';
    btn.style.color = '#082027';
    icon.textContent = '⭐';
  }
  
  montarBook();
}

function montarBook() {
  const tbody = document.querySelector('#book tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  const ativosParaMostrar = mostrarApenasFavoritos ? favoritos : Object.keys(ativosB3);
  
  ativosParaMostrar.forEach(ativo => {
    const preco = ativosB3[ativo];
    const logo = logos[ativo];
    // Variação fixa para cada ativo (não muda constantemente)
    const variacao = getVariacaoFixa(ativo);
    const isPositive = variacao >= 0;
    const isFavorito = favoritos.includes(ativo);
    
    const row = document.createElement('tr');
    row.className = 'book-row';
    
    // Adiciona evento de clique para preencher a boleta
    row.addEventListener('click', (e) => {
      // NUNCA executa se clicou no botão de favorito - proteção total
      if (e.target.closest('.favorito-btn') || e.target.classList.contains('favorito-btn')) {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
      preencherBoleta(ativo);
    });
    
    row.innerHTML = `
      <td>
        <button class="favorito-btn ${isFavorito ? 'favoritado' : 'nao-favoritado'}" 
                onclick="event.stopPropagation(); event.preventDefault(); toggleFavorito('${ativo}'); return false;"
                style="z-index: 1000; position: relative;">
          ${isFavorito ? '⭐' : '☆'}
        </button>
      </td>
      <td><img src="${logo}" alt="${ativo}" class="logo-mini"></td>
      <td><strong>${ativo}</strong></td>
      <td>R$ ${preco.toFixed(2)}</td>
      <td class="${isPositive ? 'positive' : 'negative'}">
        ${isPositive ? '▲' : '▼'} ${Math.abs(variacao).toFixed(2)}%
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// ========= FUNÇÕES DAS FERRAMENTAS DE ANÁLISE =========
function abrirIndicadores() {
  alert('Indicadores Técnicos:\n\n• RSI (Índice de Força Relativa)\n• MACD (Convergência/Divergência)\n• Médias Móveis (9, 21, 50, 200)\n• Bandas de Bollinger\n• Estocástico\n• Williams %R\n\nFuncionalidade em desenvolvimento!');
}

function abrirNiveis() {
  alert('Níveis de Suporte/Resistência:\n\n• Identificação automática de níveis importantes\n• Análise de volume por preço\n• Níveis psicológicos\n• Fibonacci retracements\n\nFuncionalidade em desenvolvimento!');
}

// ========= FUNÇÕES DE FAVORITOS MELHORADAS =========

// Proteção global para favoritos - sempre funciona
window.addEventListener('load', function() {
  // Garante que a função toggleFavorito seja sempre acessível
  if (typeof window.toggleFavorito === 'undefined') {
    window.toggleFavorito = function(ativo) {
      try {
        const index = favoritos.indexOf(ativo);
        if (index > -1) {
          favoritos.splice(index, 1);
        } else {
          favoritos.push(ativo);
        }
        
        localStorage.setItem('royal_favoritos', JSON.stringify(favoritos));
        montarBook();
      } catch (error) {
        console.error('Erro ao favoritar:', error);
        alert('Erro ao favoritar. Tente novamente.');
      }
    };
  }
});

function mostrarFavoritos() {
  const section = document.getElementById('favoritosSection');
  const btn = document.getElementById('btnFavoritosCarteira');
  const icon = document.getElementById('favoritosIconCarteira');
  
  if (section.style.display === 'none') {
    section.style.display = 'block';
    btn.style.background = 'linear-gradient(135deg, var(--gold) 0%, var(--gold-2) 100%)';
    btn.style.color = '#0a0f14';
    icon.textContent = '⭐';
    montarFavoritosList();
  } else {
    section.style.display = 'none';
    btn.style.background = 'linear-gradient(135deg, var(--turq) 0%, var(--turq-2) 100%)';
    btn.style.color = '#082027';
    icon.textContent = '⭐';
  }
}

// ========= FUNÇÕES DE OPERAÇÕES =========
function abrirOperacao(tipo) {
  const ativo = document.getElementById('anaSymbol')?.value || 'PETR4';
  const preco = ativosB3[ativo] || 32.50; // Preço padrão se não existir
  
  const modal = document.createElement('div');
  modal.className = 'modal-operacao';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${tipo} ${ativo}</h3>
        <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="modal-body">
        <div class="operacao-info">
          <div class="info-item">
            <span class="info-label">Ativo:</span>
            <span class="info-valor">${ativo}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Preço Atual:</span>
            <span class="info-valor">R$ ${preco.toFixed(2)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tipo:</span>
            <span class="info-valor">${tipo}</span>
          </div>
        </div>
        
        <div class="operacao-form">
          <label>Quantidade (múltiplos de 100):
            <input type="number" id="qtdOperacao" class="rb-input" placeholder="100, 200, 300..." min="100" step="100" value="100">
          </label>
          <label>Preço por ação (R$):
            <input type="number" id="precoOperacao" class="rb-input" placeholder="0,00" step="0.01" value="${preco.toFixed(2)}">
          </label>
        </div>
        
        <div class="operacao-actions">
          <button class="btn-royal" onclick="executarOperacaoAnalise('${tipo}', '${ativo}')">Confirmar ${tipo}</button>
          <button class="btn-turq ghost" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">Cancelar</button>
        </div>
      </div>
    </div>
  `;
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
    align-items: center; justify-content: center;
  `;
  document.body.appendChild(modal);
}

function executarOperacaoAnalise(tipo, ativo) {
  const quantidade = parseInt(document.getElementById('qtdOperacao')?.value) || 0;
  const preco = parseFloat(document.getElementById('precoOperacao')?.value) || 0;
  
  if (!quantidade || quantidade < 100 || quantidade % 100 !== 0) {
    alert('Quantidade deve ser múltipla de 100');
    return;
  }
  
  if (!preco || preco <= 0) {
    alert('Preço deve ser maior que zero');
    return;
  }
  
  // Verifica se o preço corresponde ao preço atual do ativo
  const precoAtual = ativosB3[ativo];
  if (Math.abs(preco - precoAtual) > 0.01) {
    alert(`Preço inválido! O preço atual de ${ativo} é R$ ${precoAtual.toFixed(2)}. Apenas valores exatos são aceitos.`);
    return;
  }
  
  // Simular execução da operação
  const ordem = {
    id: Date.now(),
    data: new Date().toLocaleDateString('pt-BR'),
    tipo: tipo,
    ativo: ativo,
    quantidade: quantidade,
    preco: preco,
    valorTotal: quantidade * preco
  };
  
  // Adicionar à lista de ordens (se existir)
  if (typeof ordens !== 'undefined') {
    ordens.unshift(ordem);
    if (typeof atualizarOrdens === 'function') atualizarOrdens();
    if (typeof atualizarCarteira === 'function') atualizarCarteira();
    if (typeof atualizarExtrato === 'function') atualizarExtrato();
  }
  
  // Fechar modal
  const modal = document.querySelector('.modal-operacao');
  if (modal) modal.remove();
  
  // Mostrar confirmação
  alert(`${tipo} de ${quantidade} ações de ${ativo} por R$ ${preco.toFixed(2)} executada com sucesso!`);
  
  // Atualizar mini carteira
  setTimeout(() => {
    if (typeof atualizarMiniCarteira === 'function') atualizarMiniCarteira();
  }, 500);
}

// ========= FUNÇÃO PARA ATUALIZAR MINI CARTEIRA =========
function atualizarMiniCarteira() {
  const container = document.getElementById('miniCarteiraList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!usuarioAtual || !usuarioAtual.carteira) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">Nenhum ativo na carteira</p>';
    return;
  }
  
  Object.keys(usuarioAtual.carteira).forEach(ativo => {
    const quantidade = usuarioAtual.carteira[ativo];
    const precoMedio = usuarioAtual.precoMedio[ativo] || 0;
    const precoAtual = ativosB3[ativo] || 0;
    const variacao = ((precoAtual - precoMedio) / precoMedio * 100);
    
    const div = document.createElement('div');
    div.className = 'mini-carteira-item';
    div.innerHTML = `
      <div class="mini-carteira-header">
        <img src="${logos[ativo] || 'img/royal-logo.png'}" alt="${ativo}" class="mini-logo">
        <div class="mini-info">
          <div class="mini-ativo">${ativo}</div>
          <div class="mini-qtd">${quantidade} ações</div>
        </div>
      </div>
      <div class="mini-carteira-footer">
        <div class="mini-preco">R$ ${precoMedio.toFixed(2)}</div>
        <div class="mini-variacao ${variacao >= 0 ? 'positive' : 'negative'}">
          ${variacao >= 0 ? '▲' : '▼'} ${Math.abs(variacao).toFixed(2)}%
        </div>
      </div>
    `;
    
    container.appendChild(div);
  });
}

function montarFavoritosList() {
  const container = document.getElementById('favoritosList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (favoritos.length === 0) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">Nenhum ativo favoritado ainda. Clique nas estrelas no Book de Ofertas para favoritar!</p>';
    return;
  }
  
  favoritos.forEach(ativo => {
    const preco = ativosB3[ativo] || 0;
    const logo = logos[ativo] || 'img/royal-logo.png';
    
    const item = document.createElement('div');
    item.className = 'favorito-item';
    item.innerHTML = `
      <img src="${logo}" alt="${ativo}">
      <div class="ativo-info">
        <div class="ativo-nome">${ativo}</div>
        <div class="ativo-preco">R$ ${preco.toFixed(2)}</div>
      </div>
      <button class="remove-btn" onclick="removerFavorito('${ativo}')">×</button>
    `;
    
    container.appendChild(item);
  });
}

function removerFavorito(ativo) {
  const index = favoritos.indexOf(ativo);
  if (index > -1) {
    favoritos.splice(index, 1);
    localStorage.setItem('royal_favoritos', JSON.stringify(favoritos));
    montarFavoritosList();
    montarBook();
  }
}

// ========= DARK MODE =========
function toggleDarkMode() {
  const body = document.body;
  const btn = document.getElementById('darkModeBtn');
  const icon = document.getElementById('darkModeIcon');
  
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    icon.textContent = '🌙';
    localStorage.setItem('royal_dark_mode', 'false');
  } else {
    body.classList.add('dark-mode');
    icon.textContent = '☀️';
    localStorage.setItem('royal_dark_mode', 'true');
  }
}

// ========= RANKING DO DIA =========
function atualizarRanking() {
  const gainers = document.getElementById('topGainers');
  const losers = document.getElementById('topLosers');
  
  if (gainers) {
    gainers.innerHTML = '';
    const topGainers = Object.keys(ativosB3)
      .map(ativo => ({
        ativo,
        variacao: (Math.random() * 8 + 2).toFixed(2) // 2% a 10%
      }))
      .sort((a, b) => parseFloat(b.variacao) - parseFloat(a.variacao))
      .slice(0, 5);
    
    topGainers.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'ranking-item';
      div.innerHTML = `
        <span class="ativo">${item.ativo}</span>
        <span class="variacao positive">▲ ${item.variacao}%</span>
      `;
      gainers.appendChild(div);
    });
  }
  
  if (losers) {
    losers.innerHTML = '';
    const topLosers = Object.keys(ativosB3)
      .map(ativo => ({
        ativo,
        variacao: (Math.random() * 8 + 2).toFixed(2) // 2% a 10%
      }))
      .sort((a, b) => parseFloat(a.variacao) - parseFloat(b.variacao))
      .slice(0, 5);
    
    topLosers.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'ranking-item';
      div.innerHTML = `
        <span class="ativo">${item.ativo}</span>
        <span class="variacao negative">▼ ${item.variacao}%</span>
      `;
      losers.appendChild(div);
    });
  }
}

// ========= QUIZ PERFIL =========
const quizQuestions = [
  {
    question: "Qual é sua experiência com investimentos?",
    options: [
      { text: "Iniciante - Nunca investi", points: 1 },
      { text: "Intermediário - Já investi algumas vezes", points: 2 },
      { text: "Avançado - Tenho experiência significativa", points: 3 }
    ]
  },
  {
    question: "Por quanto tempo você pretende manter seus investimentos?",
    options: [
      { text: "Menos de 1 ano", points: 1 },
      { text: "1 a 5 anos", points: 2 },
      { text: "Mais de 5 anos", points: 3 }
    ]
  },
  {
    question: "Como você reagiria se seus investimentos caíssem 20%?",
    options: [
      { text: "Venderia tudo imediatamente", points: 1 },
      { text: "Aguardaria para ver se recupera", points: 2 },
      { text: "Compraria mais aproveitando a queda", points: 3 }
    ]
  },
  {
    question: "Qual percentual do seu patrimônio você investiria?",
    options: [
      { text: "Até 10%", points: 1 },
      { text: "10% a 30%", points: 2 },
      { text: "Mais de 30%", points: 3 }
    ]
  },
  {
    question: "Qual tipo de retorno você busca?",
    options: [
      { text: "Segurança acima de tudo", points: 1 },
      { text: "Equilíbrio entre risco e retorno", points: 2 },
      { text: "Máximo retorno possível", points: 3 }
    ]
  }
];

let currentQuestion = 0;
let quizScore = 0;

function iniciarQuiz() {
  document.getElementById('quizContainer').style.display = 'none';
  document.getElementById('quizQuestions').style.display = 'block';
  mostrarQuestao();
}

function mostrarQuestao() {
  const container = document.getElementById('quizQuestions');
  const question = quizQuestions[currentQuestion];
  
  container.innerHTML = `
    <div class="quiz-question">
      <h4>${question.question}</h4>
      <div class="quiz-options">
        ${question.options.map((option, index) => `
          <div class="quiz-option" onclick="selecionarOpcao(${index})">
            ${option.text}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function selecionarOpcao(index) {
  quizScore += quizQuestions[currentQuestion].options[index].points;
  currentQuestion++;
  
  if (currentQuestion < quizQuestions.length) {
    mostrarQuestao();
  } else {
    mostrarResultado();
  }
}

function mostrarResultado() {
  const container = document.getElementById('quizQuestions');
  let perfil, descricao, cor;
  
  if (quizScore <= 8) {
    perfil = 'Conservador';
    descricao = 'Você prefere segurança e estabilidade. Recomendamos investimentos de baixo risco como renda fixa e fundos conservadores.';
    cor = 'conservador';
  } else if (quizScore <= 12) {
    perfil = 'Moderado';
    descricao = 'Você busca equilíbrio entre risco e retorno. Uma carteira diversificada com ações e renda fixa é ideal para você.';
    cor = 'moderado';
  } else {
    perfil = 'Arrojado';
    descricao = 'Você está disposto a assumir mais riscos por maiores retornos. Ações e fundos de alto risco podem ser adequados.';
    cor = 'arrojado';
  }
  
  container.innerHTML = `
    <div class="quiz-result ${cor}">
      <h3>Seu perfil é: ${perfil}</h3>
      <p>${descricao}</p>
      <button class="btn-royal" onclick="reiniciarQuiz()">Fazer novamente</button>
    </div>
  `;
}

function reiniciarQuiz() {
  currentQuestion = 0;
  quizScore = 0;
  document.getElementById('quizContainer').style.display = 'block';
  document.getElementById('quizQuestions').style.display = 'none';
  document.getElementById('quizResult').style.display = 'none';
}

// ========= COMPARADOR DE ATIVOS =========
function compararAtivos() {
  const ativo1 = document.getElementById('ativo1').value;
  const ativo2 = document.getElementById('ativo2').value;
  
  if (!ativo1 || !ativo2) {
    alert('Selecione dois ativos para comparar');
    return;
  }
  
  const preco1 = ativosB3[ativo1] || 0;
  const preco2 = ativosB3[ativo2] || 0;
  const variacao1 = (Math.random() * 10 - 5).toFixed(2);
  const variacao2 = (Math.random() * 10 - 5).toFixed(2);
  
  const container = document.getElementById('comparadorResult');
  container.innerHTML = `
    <div class="comparador-card">
      <h4>${ativo1}</h4>
      <div class="preco">R$ ${preco1.toFixed(2)}</div>
      <div class="variacao ${parseFloat(variacao1) >= 0 ? 'positive' : 'negative'}">
        ${parseFloat(variacao1) >= 0 ? '▲' : '▼'} ${Math.abs(variacao1)}%
      </div>
    </div>
    <div class="comparador-card">
      <h4>${ativo2}</h4>
      <div class="preco">R$ ${preco2.toFixed(2)}</div>
      <div class="variacao ${parseFloat(variacao2) >= 0 ? 'positive' : 'negative'}">
        ${parseFloat(variacao2) >= 0 ? '▲' : '▼'} ${Math.abs(variacao2)}%
      </div>
    </div>
  `;
}

// ========= ALERTAS PERSONALIZADOS =========
let alertas = JSON.parse(localStorage.getItem('royal_alertas') || '[]');

function criarAlerta() {
  const ativo = document.getElementById('alertaAtivo').value.toUpperCase();
  const condicao = document.getElementById('alertaCondicao').value;
  const preco = parseFloat(document.getElementById('alertaPreco').value);
  
  if (!ativo || !preco) {
    alert('Preencha todos os campos');
    return;
  }
  
  const alerta = {
    id: Date.now(),
    ativo,
    condicao,
    preco,
    ativo: false
  };
  
  alertas.push(alerta);
  localStorage.setItem('royal_alertas', JSON.stringify(alertas));
  
  document.getElementById('alertaAtivo').value = '';
  document.getElementById('alertaPreco').value = '';
  
  atualizarAlertasList();
}

function atualizarAlertasList() {
  const container = document.getElementById('alertasList');
  if (!container) return;
  
  container.innerHTML = '';
  
  alertas.forEach(alerta => {
    const div = document.createElement('div');
    div.className = 'alerta-item';
    div.innerHTML = `
      <div class="alerta-info">
        <div class="alerta-texto">
          ${alerta.ativo} ${alerta.condicao === 'acima' ? 'subir acima' : 'cair abaixo'} de R$ ${alerta.preco.toFixed(2)}
        </div>
      </div>
      <button class="remove-alerta" onclick="removerAlerta(${alerta.id})">×</button>
    `;
    container.appendChild(div);
  });
}

function removerAlerta(id) {
  alertas = alertas.filter(alerta => alerta.id !== id);
  localStorage.setItem('royal_alertas', JSON.stringify(alertas));
  atualizarAlertasList();
}

// ========= RANKING DE USUÁRIOS =========
function atualizarRankingUsuarios() {
  const container = document.getElementById('rankingUsuarios');
  if (!container) return;
  
  const usuarios = [
    { nome: 'Trader Pro', resultado: '+R$ 45.230' },
    { nome: 'Investidor Elite', resultado: '+R$ 32.150' },
    { nome: 'Mestre do Mercado', resultado: '+R$ 28.900' },
    { nome: 'Estrategista Royal', resultado: '+R$ 25.400' },
    { nome: 'Analista Premium', resultado: '+R$ 22.100' }
  ];
  
  container.innerHTML = '';
  usuarios.forEach((usuario, index) => {
    const div = document.createElement('div');
    div.className = 'usuario-item';
    div.innerHTML = `
      <div class="posicao">${index + 1}</div>
      <div class="nome">${usuario.nome}</div>
      <div class="resultado">${usuario.resultado}</div>
    `;
    container.appendChild(div);
  });
}

// ========= SISTEMA DE CONQUISTAS =========
const conquistas = [
  { id: 'primeira_operacao', titulo: 'Trader Iniciante', desc: 'Primeira operação realizada', icon: '🎯', desbloqueada: true, progresso: 1, maximo: 1 },
  { id: 'dez_operacoes', titulo: 'Trader Ativo', desc: '10 operações realizadas', icon: '⚡', desbloqueada: true, progresso: 7, maximo: 10 },
  { id: 'cinquenta_operacoes', titulo: 'Tubarão do Mercado', desc: '50 operações realizadas', icon: '🦈', desbloqueada: false, progresso: 23, maximo: 50 },
  { id: 'primeiro_lucro', titulo: 'Primeiro Lucro', desc: 'Primeira operação lucrativa', icon: '💰', desbloqueada: true, progresso: 1, maximo: 1 },
  { id: 'diversificacao', titulo: 'Diversificador', desc: 'Investiu em 5 ativos diferentes', icon: '📊', desbloqueada: true, progresso: 4, maximo: 5 },
  { id: 'primeira_analise', titulo: 'Analista Técnico', desc: 'Primeira análise técnica realizada', icon: '📈', desbloqueada: true, progresso: 1, maximo: 1 },
  { id: 'primeiro_alerta', titulo: 'Vigilante', desc: 'Primeiro alerta configurado', icon: '🔔', desbloqueada: true, progresso: 1, maximo: 1 },
  { id: 'primeiro_favorito', titulo: 'Favoritos', desc: 'Primeiro ativo favoritado', icon: '⭐', desbloqueada: true, progresso: 1, maximo: 1 }
];

function atualizarConquistas() {
  const container = document.getElementById('conquistasList');
  if (!container) return;
  
  container.innerHTML = '';
  conquistas.forEach(conquista => {
    const div = document.createElement('div');
    div.className = `conquista-card ${conquista.desbloqueada ? '' : 'bloqueada'}`;
    
    if (conquista.desbloqueada) {
      const percentual = Math.round((conquista.progresso / conquista.maximo) * 100);
      div.innerHTML = `
        <div class="conquista-icon">${conquista.icon}</div>
        <div class="conquista-titulo">${conquista.titulo}</div>
        <div class="conquista-desc">${conquista.desc}</div>
        <div class="conquista-progresso">
          <div class="progresso-bar">
            <div class="progresso-fill" style="width: ${percentual}%"></div>
          </div>
          <span class="progresso-texto">${conquista.progresso}/${conquista.maximo}</span>
        </div>
        <div class="conquista-status">✅ Desbloqueada</div>
      `;
    } else {
      div.innerHTML = `
        <div class="conquista-icon">${conquista.icon}</div>
        <div class="conquista-titulo">${conquista.titulo}</div>
        <div class="conquista-desc">${conquista.desc}</div>
        <div class="conquista-progresso">
          <div class="progresso-bar">
            <div class="progresso-fill" style="width: ${Math.round((conquista.progresso / conquista.maximo) * 100)}%"></div>
          </div>
          <span class="progresso-texto">${conquista.progresso}/${conquista.maximo}</span>
        </div>
        <div class="conquista-status bloqueada">🔒 Bloqueada</div>
      `;
    }
    
    container.appendChild(div);
  });
}

// ========= FEED DE NOTÍCIAS =========
const noticias = [
  'Petrobras anuncia novo plano de investimentos',
  'Banco Central mantém taxa de juros em 13,75%',
  'Vale divulga resultados do terceiro trimestre',
  'Itaú lidera ranking de bancos mais rentáveis',
  'B3 registra recorde de volume de negociações',
  'Dólar opera em queda frente ao real',
  'Ações de tecnologia lideram alta na bolsa',
  'Fundos imobiliários registram forte valorização'
];

function atualizarNewsFeed() {
  const container = document.getElementById('newsFeed');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Mostrar 5 notícias aleatórias
  const noticiasAleatorias = noticias.sort(() => 0.5 - Math.random()).slice(0, 5);
  
  noticiasAleatorias.forEach(noticia => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `
      <div class="news-time">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
      <div class="news-texto">${noticia}</div>
    `;
    container.appendChild(div);
  });
}

// ========= CALCULADORA DE CUSTOS =========
function calcularCustos() {
  const valor = parseFloat(document.getElementById('valorOrdem').value);
  if (!valor) {
    alert('Digite um valor válido');
    return;
  }
  
  const taxaCorretagem = valor * 0.005; // 0.5%
  const taxaB3 = valor * 0.0003; // 0.03%
  const total = taxaCorretagem + taxaB3;
  
  const container = document.getElementById('custosResult');
  container.innerHTML = `
    <div class="custo-item">
      <span>Taxa de Corretagem (0.5%)</span>
      <span>R$ ${taxaCorretagem.toFixed(2)}</span>
    </div>
    <div class="custo-item">
      <span>Taxa B3 (0.03%)</span>
      <span>R$ ${taxaB3.toFixed(2)}</span>
    </div>
    <div class="custo-item">
      <span>Total de Custos</span>
      <span>R$ ${total.toFixed(2)}</span>
    </div>
  `;
}

// ========= CALENDÁRIO DE EVENTOS =========
const eventos = [
  { data: '20/01', titulo: 'Divulgação resultado PETR4' },
  { data: '25/01', titulo: 'Reunião COPOM' },
  { data: '30/01', titulo: 'Resultado VALE3' },
  { data: '05/02', titulo: 'Assembleia ITUB4' },
  { data: '10/02', titulo: 'Relatório inflação' },
  { data: '15/02', titulo: 'Resultado BBDC4' },
  { data: '20/02', titulo: 'Resultado ABEV3' },
  { data: '25/02', titulo: 'Reunião FED' }
];

function atualizarCalendario() {
  const container = document.getElementById('calendarioEventos');
  if (!container) return;
  
  container.innerHTML = '';
  eventos.forEach(evento => {
    const div = document.createElement('div');
    div.className = 'evento-card';
    div.onclick = () => mostrarDetalhesEvento(evento);
    div.innerHTML = `
      <div class="evento-data">${evento.data}</div>
      <div class="evento-titulo">${evento.titulo}</div>
    `;
    container.appendChild(div);
  });
}

function mostrarDetalhesEvento(evento) {
  alert(`Evento: ${evento.titulo}\nData: ${evento.data}\n\nDetalhes do evento serão exibidos aqui.`);
}

// ========= RANKING DE SETORES =========
const setores = [
  { nome: 'Bancos', variacao: '+3.2%' },
  { nome: 'Mineração', variacao: '+2.8%' },
  { nome: 'Varejo', variacao: '+1.5%' },
  { nome: 'Tecnologia', variacao: '+4.1%' },
  { nome: 'Energia', variacao: '+0.8%' },
  { nome: 'Saúde', variacao: '-0.5%' }
];

function atualizarRankingSetores() {
  const container = document.getElementById('rankingSetores');
  if (!container) return;
  
  container.innerHTML = '';
  setores.forEach(setor => {
    const div = document.createElement('div');
    div.className = 'setor-card';
    div.innerHTML = `
      <div class="setor-nome">${setor.nome}</div>
      <div class="setor-variacao ${setor.variacao.startsWith('+') ? 'positive' : 'negative'}">${setor.variacao}</div>
    `;
    container.appendChild(div);
  });
}

// ========= FUNÇÃO PREENCHER BOLETA =========
function preencherBoleta(ativo) {
  if($("#ativo")) $("#ativo").value = ativo;
  if($("#valor")) $("#valor").value = ativosB3[ativo].toFixed(2);
  const m=$("#mensagem"); 
  if(m){ 
    m.className="msg-inline"; 
    m.textContent="Ativo selecionado! Preencha a quantidade e confirme a ordem."; 
  }
}

// ========= FUNÇÕES DO MODAL MINHA CONTA =========
// Função para resetar campos para modo de visualização
function resetarCamposMinhaConta(){
  const campos = ['mcNome', 'mcEmail', 'mcZap'];
  
  campos.forEach(campoId => {
    const campo = document.getElementById(campoId);
    const errorDiv = document.getElementById(campoId + 'Error');
    
    if(campo) {
      campo.readOnly = true;
      campo.style.background = '#0b1320';
      campo.style.borderColor = 'var(--grid)';
      campo.style.color = 'var(--muted)';
    }
    
    if(errorDiv) {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    }
  });
}

// Função para editar um campo específico
function editarCampo(campoId){
  const campo = document.getElementById(campoId);
  const errorDiv = document.getElementById(campoId + 'Error');
  const btnSalvar = document.getElementById("btnSalvarConta");
  
  if(!campo) return;
  
  // Habilita edição do campo
  campo.readOnly = false;
  campo.style.background = '#0f1821';
  campo.style.borderColor = 'var(--royal)';
  campo.style.color = 'var(--ink)';
  campo.focus();
  
  // Limpa mensagem de erro
  if(errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }
  
  // Mostra botão de salvar
  if(btnSalvar) btnSalvar.style.display = 'block';
  
  // Adiciona validação em tempo real
  campo.addEventListener('input', function() {
    validarCampoMinhaConta(campoId, this.value);
  });
  
  // Aplica máscara específica para telefone
  if (campoId === 'mcZap') {
    campo.addEventListener('input', function() {
      // Formata o telefone em tempo real
      const valor = this.value.replace(/\D/g, '');
      if (valor.length > 0) {
        this.value = formatarTelefone(valor);
      }
    });
  }
}

// Função para validar campo específico
function validarCampoMinhaConta(campoId, valor){
  const errorDiv = document.getElementById(campoId + 'Error');
  let valido = true;
  let mensagem = '';
  
  switch(campoId) {
    case 'mcNome':
      const validacaoNome = validarNomeCompleto(valor);
      valido = validacaoNome.valido;
      mensagem = validacaoNome.mensagem;
      break;
      
    case 'mcEmail':
      const validacaoEmail = validarEmail(valor);
      valido = validacaoEmail.valido;
      mensagem = validacaoEmail.mensagem;
      break;
      
    case 'mcZap':
      const validacaoTelefone = validarTelefone(valor);
      valido = validacaoTelefone.valido;
      mensagem = validacaoTelefone.mensagem;
      break;
  }
  
  if(errorDiv) {
    if(!valido && valor.trim()) {
      errorDiv.textContent = mensagem;
      errorDiv.style.display = 'block';
      errorDiv.classList.add('show');
    } else {
      errorDiv.style.display = 'none';
      errorDiv.classList.remove('show');
    }
  }
  
  return valido;
}