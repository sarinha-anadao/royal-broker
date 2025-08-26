/* =========================
   Análise Técnica — Royal Broker
   analise.js (completo)
   ========================= */
(function(){
  "use strict";
  const logos = window.logos || { PETR4:"img/petr4.png", VALE3:"img/vale3.png", ITUB4:"img/itub4.png", BBDC4:"img/bbdc4.png", ABEV3:"img/abev3.png", MGLU3:"img/mglu3.png", BBAS3:"img/bbas3.png", LREN3:"img/lren3.png" };
  const ativosB3 = window.ativosB3 || { PETR4: 30.38, VALE3: 73.21, ITUB4: 32.33, BBDC4: 28.53, ABEV3: 15.72, MGLU3: 3.48,  BBAS3: 49.33, LREN3: 19.38 };
  const $ = (sel)=> document.querySelector(sel);
  const fmt = v => (v||0).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
  const limparCPF = v => String(v||"").replace(/\D/g, '');
  // Usar a função loadState do script.js principal
  const loadState = window.loadState || function(cpf){ try{ const key = "rb_state_" + limparCPF(cpf||""); const raw = localStorage.getItem(key); if(!raw) return null; const st = JSON.parse(raw); if(Array.isArray(st.extrato)) st.extrato = st.extrato.map(e => ({...e, date: new Date(e.date)})); return st; }catch{ return null; } };
  function getUserSafe(cpf){ try{ if(typeof window.getUser === "function") return window.getUser(cpf); }catch{} return null; }

  let anaBars = []; let anaTimer = null; let cross = null;
  function tfSeconds(){ const el = $("#anaInterval"); const val = +(el?.value || 60); return isFinite(val) && val>0 ? val : 60; }
  function genSeedBars(n){ const sym = $("#anaSymbol")?.value || "PETR4"; let p = +(ativosB3[sym] || 50); for(let i=0;i<n;i++){ const o=p; const h=o + Math.random()*2; const l=o - Math.random()*2; const c=l + Math.random()*(h-l); anaBars.push({o,h,l,c,t:Date.now()-(n-i)*1000}); p=c; } }
  function pushBarTick(intervalSec){ const last = anaBars[anaBars.length-1]; const now = Date.now(); if(!last || (now - last.t) >= intervalSec*1000){ const sym = $("#anaSymbol")?.value || "PETR4"; const base = last ? last.c : (ativosB3[sym]||50); const o=base, h=base, l=base, c=base; anaBars.push({o,h,l,c,t:now}); if(anaBars.length>220) anaBars.shift(); } else { const cur = anaBars[anaBars.length-1]; const c = cur.c + (Math.random()-0.5)*0.20; cur.c = c; cur.h = Math.max(cur.h, c); cur.l = Math.min(cur.l, c); } }
  function resetAna(){ if(anaTimer) clearInterval(anaTimer); anaBars = []; genSeedBars(80); drawAna(); const sec = tfSeconds(); anaTimer = setInterval(()=>{ pushBarTick(sec); drawAna(); }, 1000); }
  function drawAna(){ const c=$("#kChart"); if(!c) return; const ctx=c.getContext("2d"); const pad=40; const W=c.width, H=c.height; ctx.fillStyle="#0b1b26"; ctx.fillRect(0,0,W,H); ctx.strokeStyle="#123a5a"; for(let i=0;i<=4;i++){ const y=pad+((H-pad*2)*i/4); ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); } if(anaBars.length<2) return; const minP = Math.min(...anaBars.map(b=>b.l)); const maxP = Math.max(...anaBars.map(b=>b.h)); const xw = (W - pad*2) / (anaBars.length-1 || 1); const type = ($("#anaType")?.value || "candle").toLowerCase(); if(type === "line"){ ctx.beginPath(); anaBars.forEach((b,i)=>{ const x=pad+i*xw; const y=pad+(1-((b.c-minP)/((maxP-minP)||1)))*(H-pad*2); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.strokeStyle="#4da0ff"; ctx.lineWidth=1.4; ctx.stroke(); } else { const cw = Math.max(3, xw*0.6); anaBars.forEach((b,i)=>{ const x=pad+i*xw; const yO=pad+(1-((b.o-minP)/((maxP-minP)||1)))*(H-pad*2); const yC=pad+(1-((b.c-minP)/((maxP-minP)||1)))*(H-pad*2); const yH=pad+(1-((b.h-minP)/((maxP-minP)||1)))*(H-pad*2); const yL=pad+(1-((b.l-minP)/((maxP-minP)||1)))*(H-pad*2); const up = b.c>=b.o; ctx.strokeStyle = up ? "#39d98a" : "#ff6b6b"; ctx.fillStyle   = up ? "#1a3b2a" : "#3a2121"; ctx.beginPath(); ctx.moveTo(x, yH); ctx.lineTo(x, yL); ctx.stroke(); const h = Math.max(2, Math.abs(yC - yO)); ctx.fillRect(x - cw/2, Math.min(yO,yC), cw, h); ctx.strokeRect(x - cw/2, Math.min(yO,yC), cw, h); }); }
    if(cross){ const idx = Math.round((cross.x - pad) / xw); if(idx>=0 && idx<anaBars.length){ const b = anaBars[idx]; const x = pad + idx*xw; ctx.strokeStyle="rgba(255,255,255,.25)"; ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H-pad); ctx.stroke(); const y = pad+(1-((b.c-minP)/((maxP-minP)||1)))*(H-pad*2); ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W-pad, y); ctx.stroke(); const boxW=230, boxH=100, bx=Math.min(W-pad-boxW, Math.max(pad, x+10)), by=pad+10; ctx.fillStyle="rgba(12,20,32,.95)"; ctx.fillRect(bx,by,boxW,boxH); ctx.strokeStyle="#1c3650"; ctx.strokeRect(bx,by,boxW,boxH); ctx.fillStyle="#e7f6ff"; ctx.font="12px Inter, Arial"; const dt = new Date(b.t).toLocaleString(); ctx.fillText(dt, bx+10, by+18); ctx.fillStyle="#97c0de"; ctx.fillText("Abertura:", bx+10, by+38); ctx.fillStyle="#e7f6ff"; ctx.fillText(fmt(b.o), bx+140, by+38); ctx.fillStyle="#97c0de"; ctx.fillText("Máxima:", bx+10, by+54);   ctx.fillStyle="#39d98a"; ctx.fillText(fmt(b.h), bx+140, by+54); ctx.fillStyle="#97c0de"; ctx.fillText("Mínima:", bx+10, by+70);   ctx.fillStyle="#ff6b6b"; ctx.fillText(fmt(b.l), bx+140, by+70); ctx.fillStyle="#97c0de"; ctx.fillText("Fechamento:", bx+10, by+86); ctx.fillStyle="#e7f6ff"; ctx.fillText(fmt(b.c), bx+140, by+86); } }
  }
  function montarMiniWallet(){ 
    const container = document.getElementById('miniCarteiraList'); 
    if(!container) return; 
    
    container.innerHTML = '';
    
    const cpf = localStorage.getItem("rb_cpf");
    const st = cpf ? loadState(cpf) : null;
    let carteira = {};
    let pmRef = {};
    
    if(st && st.carteira){
      carteira = st.carteira || {};
      pmRef = st.precoMedio || {};
    } else {
      const u = getUserSafe(cpf);
      const cts = (window.contas||{});
      const conta = (u && cts[u.conta]) ? cts[u.conta] : null;
      if(conta){
        carteira = conta.carteira || {};
        pmRef = Object.fromEntries(Object.keys(carteira).map(k=>[k, ativosB3[k]||0]));
      }
    }
    
    if (Object.keys(carteira).length === 0) {
      container.innerHTML = '<p style="color: var(--muted); text-align: center; font-size: 12px;">Nenhum ativo na carteira</p>';
      return;
    }
    
    Object.keys(carteira).forEach(ativo => {
      const quantidade = carteira[ativo];
      const precoMedio = pmRef[ativo] || ativosB3[ativo] || 0;
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
  function setLogoFromSymbol(){ const sym = $("#anaSymbol")?.value || "PETR4"; const img = $("#anaLogo"); if(img){ img.src = logos[sym] || "img/royal-logo.png"; img.alt = sym; } }
  function anaInit(){ const symSel = $("#anaSymbol"), intSel = $("#anaInterval"), typeSel= $("#anaType"), chart  = $("#kChart"); if(!chart) return; if(symSel){ symSel.innerHTML = Object.keys(ativosB3).map(k=>`<option value="${k}">${k}</option>`).join(""); symSel.onchange = ()=>{ setLogoFromSymbol(); resetAna(); }; } if(intSel){ intSel.onchange = resetAna; } if(typeSel){ typeSel.onchange = drawAna; } setLogoFromSymbol(); resetAna(); montarMiniWallet(); chart.addEventListener("mousemove", e=>{ const r=chart.getBoundingClientRect(); cross={x:e.clientX - r.left, y:e.clientY - r.top}; drawAna(); }); chart.addEventListener("mouseleave", ()=>{ cross=null; drawAna(); }); }
  function voltarPortal(){ window.location.href = "portal.html"; }
  window.addEventListener("DOMContentLoaded", ()=>{ if(document.body.classList.contains("analise")) anaInit(); });
  window.anaInit = anaInit; window.voltarPortal = window.voltarPortal || voltarPortal;
  
  // ========= FUNÇÕES DAS FERRAMENTAS DE ANÁLISE =========
  function abrirIndicadores() {
    const ativo = document.getElementById('anaSymbol')?.value || 'PETR4';
    const preco = ativosB3[ativo] || 0;
    
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
              <div class="indicador-valor">${(Math.random() * 30 + 35).toFixed(1)}</div>
              <div class="indicador-status ${Math.random() > 0.5 ? 'positive' : 'neutral'}">${Math.random() > 0.5 ? 'Compra' : 'Neutro'}</div>
              <div class="indicador-desc">Índice de Força Relativa - ${Math.random() > 0.5 ? 'Não está em sobrecompra nem sobrevenda' : 'Próximo da sobrecompra'}</div>
            </div>
            <div class="indicador-card">
              <h4>MACD</h4>
              <div class="indicador-valor">${(Math.random() * 2 - 1).toFixed(2)}</div>
              <div class="indicador-status ${Math.random() > 0.5 ? 'positive' : 'negative'}">${Math.random() > 0.5 ? 'Compra' : 'Venda'}</div>
              <div class="indicador-desc">Convergência/Divergência - ${Math.random() > 0.5 ? 'Sinal de compra ativo' : 'Sinal de venda ativo'}</div>
            </div>
            <div class="indicador-card">
              <h4>Média Móvel (21)</h4>
              <div class="indicador-valor">R$ ${(preco * (0.95 + Math.random() * 0.1)).toFixed(2)}</div>
              <div class="indicador-status ${Math.random() > 0.5 ? 'positive' : 'negative'}">${Math.random() > 0.5 ? 'Suporte' : 'Resistência'}</div>
              <div class="indicador-desc">Preço está ${Math.random() > 0.5 ? 'acima' : 'abaixo'} da média móvel - Tendência de ${Math.random() > 0.5 ? 'alta' : 'baixa'}</div>
            </div>
            <div class="indicador-card">
              <h4>Bandas de Bollinger</h4>
              <div class="indicador-valor">${['Superior', 'Centro', 'Inferior'][Math.floor(Math.random() * 3)]}</div>
              <div class="indicador-status neutral">Neutro</div>
              <div class="indicador-desc">Preço está no ${Math.random() > 0.5 ? 'centro' : Math.random() > 0.5 ? 'topo' : 'base'} das bandas - Volatilidade ${Math.random() > 0.5 ? 'normal' : 'alta'}</div>
            </div>
            <div class="indicador-card">
              <h4>Estocástico</h4>
              <div class="indicador-valor">${(Math.random() * 100).toFixed(1)}</div>
              <div class="indicador-status ${Math.random() > 0.5 ? 'positive' : 'negative'}">${Math.random() > 0.5 ? 'Compra' : 'Venda'}</div>
              <div class="indicador-desc">Oscilador estocástico - ${Math.random() > 0.5 ? 'Indica reversão' : 'Não indica reversão'}</div>
            </div>
            <div class="indicador-card">
              <h4>Williams %R</h4>
              <div class="indicador-valor">-${(Math.random() * 80 + 20).toFixed(1)}</div>
              <div class="indicador-status ${Math.random() > 0.5 ? 'positive' : 'neutral'}">${Math.random() > 0.5 ? 'Compra' : 'Neutro'}</div>
              <div class="indicador-desc">${Math.random() > 0.5 ? 'Não está em sobrevenda' : 'Próximo da sobrevenda'} - ${Math.random() > 0.5 ? 'Possível oportunidade' : 'Aguarde confirmação'}</div>
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
              <span class="nivel-tipo">Suporte</span>
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

  function abrirAlertaPreco() {
    const ativo = document.getElementById('anaSymbol')?.value || 'PETR4';
    const preco = ativosB3[ativo] || 0;
    
    const modal = document.createElement('div');
    modal.className = 'modal-alerta';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>🔔 Alertas de Preço - ${ativo}</h3>
          <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="alerta-form">
            <div class="alerta-tipo">
              <label>
                <input type="radio" name="tipoAlerta" value="acima" checked>
                <span>Acima de R$ ${(preco * 1.02).toFixed(2)}</span>
              </label>
              <label>
                <input type="radio" name="tipoAlerta" value="abaixo">
                <span>Abaixo de R$ ${(preco * 0.98).toFixed(2)}</span>
              </label>
            </div>
            <div class="alerta-preco">
              <label>Preço alvo (R$)
                <input type="number" id="precoAlvo" value="${(preco * 1.02).toFixed(2)}" step="0.01" min="0.01">
              </label>
            </div>
            <div class="alerta-acoes">
              <label>
                <input type="checkbox" id="notificarEmail" checked>
                <span>Notificar por e-mail</span>
              </label>
              <label>
                <input type="checkbox" id="notificarPush" checked>
                <span>Notificação push</span>
              </label>
            </div>
          </div>
          <div class="alerta-actions">
            <button class="btn-royal" onclick="criarAlertaPreco()">Criar Alerta</button>
            <button class="btn-turq" onclick="verAlertasAtivos()">Ver Alertas Ativos</button>
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

  function abrirHistoricoOperacoes() {
    const modal = document.createElement('div');
    modal.className = 'modal-historico';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>📊 Histórico de Operações</h3>
          <button onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="historico-filtros">
            <select id="filtroAtivo" class="rb-input">
              <option value="">Todos os ativos</option>
              <option value="PETR4">PETR4</option>
              <option value="VALE3">VALE3</option>
              <option value="ITUB4">ITUB4</option>
              <option value="BBDC4">BBDC4</option>
            </select>
            <select id="filtroTipo" class="rb-input">
              <option value="">Todos os tipos</option>
              <option value="Compra">Compra</option>
              <option value="Venda">Venda</option>
            </select>
          </div>
          <div class="historico-lista">
            <div class="historico-item compra">
              <div class="historico-info">
                <div class="historico-ativo">PETR4</div>
                <div class="historico-tipo">Compra</div>
                <div class="historico-data">15/12/2024 14:30</div>
              </div>
              <div class="historico-valores">
                <div class="historico-qtd">100 ações</div>
                <div class="historico-preco">R$ 30,50</div>
                <div class="historico-total">R$ 3.050,00</div>
              </div>
            </div>
            <div class="historico-item venda">
              <div class="historico-info">
                <div class="historico-ativo">VALE3</div>
                <div class="historico-tipo">Venda</div>
                <div class="historico-data">14/12/2024 11:15</div>
              </div>
              <div class="historico-valores">
                <div class="historico-qtd">200 ações</div>
                <div class="historico-preco">R$ 73,20</div>
                <div class="historico-total">R$ 14.640,00</div>
              </div>
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

  function criarAlertaPreco() {
    const ativo = document.getElementById('anaSymbol')?.value || 'PETR4';
    const precoAlvo = document.getElementById('precoAlvo')?.value;
    const tipoAlerta = document.querySelector('input[name="tipoAlerta"]:checked')?.value;
    
    if (!precoAlvo || !tipoAlerta) {
      alert('Preencha todos os campos do alerta');
      return;
    }
    
    // Simular criação do alerta
    alert(`Alerta criado com sucesso!\n${ativo} ${tipoAlerta === 'acima' ? 'acima' : 'abaixo'} de R$ ${precoAlvo}`);
    
    // Fechar modal
    document.querySelector('.modal-alerta').remove();
  }

  function verAlertasAtivos() {
    alert('Funcionalidade de visualização de alertas ativos será implementada em breve!');
  }

  // Exportar funções para o escopo global
  window.abrirIndicadores = abrirIndicadores;
  window.abrirNiveis = abrirNiveis;
  window.abrirPadroes = abrirPadroes;
  window.abrirAlertaPreco = abrirAlertaPreco;
  window.abrirHistoricoOperacoes = abrirHistoricoOperacoes;
  window.criarAlertaPreco = criarAlertaPreco;
  window.verAlertasAtivos = verAlertasAtivos;
})();