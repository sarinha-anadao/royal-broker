# 📋 REGRAS DE NEGÓCIO - ROYAL BROKER

## 🏢 **VISÃO GERAL DO SISTEMA**

O **Royal Broker** é uma plataforma de simulação de trading de ações brasileiras, desenvolvida como projeto front-end para demonstração de funcionalidades de corretora digital.

---

## 👤 **1. GESTÃO DE USUÁRIOS**

### **1.1 Cadastro de Usuários**
- **CPF**: Campo obrigatório, deve ter exatamente 11 dígitos
- **Nome Completo**: Mínimo 2 palavras (nome e sobrenome), cada palavra com pelo menos 2 caracteres
- **E-mail**: Formato válido obrigatório
- **Telefone**: 11 dígitos (DDD + 9 + número), deve começar com 9 após DDD
- **Senha**: 8-12 caracteres, incluindo:
  - Pelo menos 1 letra minúscula
  - Pelo menos 1 letra maiúscula
  - Pelo menos 1 número
  - Pelo menos 1 caractere especial (!@#$%^&*)
- **Confirmação de Senha**: Deve ser idêntica à senha

### **1.2 Login e Autenticação**
- **CPF e Senha**: Campos obrigatórios
- **Validação**: CPF deve existir no sistema e senha deve corresponder
- **Sessão**: Mantida via localStorage com CPF do usuário
- **Logout**: Limpa dados da sessão e redireciona para página inicial

### **1.3 Recuperação de Senha**
- **CPF**: Deve existir no sistema
- **E-mail**: Deve corresponder ao CPF cadastrado
- **Nova Senha**: Mesmas regras de validação do cadastro
- **Histórico**: Não permite reutilizar as últimas 4 senhas

### **1.4 Perfil de Usuário**
- **Dados Editáveis**: Nome, E-mail, WhatsApp
- **Dados Fixos**: CPF, Plano
- **Persistência**: Alterações salvas no localStorage

---

## 💰 **2. GESTÃO FINANCEIRA**

### **2.1 Contas e Saldos**
- **Saldo Inicial**: R$ 100.000,00 para contas demo
- **Moeda**: Real Brasileiro (R$)
- **Formato**: Duas casas decimais
- **Validação**: Saldo não pode ficar negativo

### **2.2 Carteira de Ativos**
- **Ativos Disponíveis**: PETR4, VALE3, ITUB4, BBDC4, ABEV3, MGLU3, BBAS3, LREN3
- **Preços**: Simulados e atualizados em tempo real
- **Quantidade**: Múltiplos de 100 ações
- **Preço Médio**: Calculado automaticamente por ativo

### **2.3 Operações de Trading**

#### **2.3.1 Compra de Ações**
- **Validação**: Saldo suficiente para a operação
- **Quantidade**: Múltiplos de 100 obrigatórios
- **Preço**: Pode ser diferente da cotação atual
- **Execução**: 
  - Diferença ≤ R$ 1,00: Executada imediatamente
  - Diferença > R$ 1,00: Aceita como ordem pendente

#### **2.3.2 Venda de Ações**
- **Validação**: Quantidade suficiente na carteira
- **Quantidade**: Múltiplos de 100 obrigatórios
- **Preço**: Pode ser diferente da cotação atual
- **Execução**: Mesmas regras da compra

#### **2.3.3 Ordens Pendentes**
- **Status**: "Aceita" ou "Parcial"
- **Cancelamento**: Permitido para ordens não executadas
- **Preenchimento**: Simulado com variações de preço

### **2.4 Custos e Taxas**
- **Taxa de Corretagem**: 0,5% do valor da operação
- **Taxa B3**: 0,03% do valor da operação
- **Total**: Soma das duas taxas
- **Aplicação**: Deduzida do saldo na execução

---

## 📊 **3. ANÁLISE TÉCNICA**

### **3.1 Gráficos**
- **Tipos**: Linha e Candlestick
- **Timeframes**: 10s, 1m, 5m, 30m, 1h, 1d, 1w
- **Dados**: Simulados em tempo real
- **Interatividade**: Tooltip com dados OHLC

### **3.2 Indicadores Técnicos**
- **RSI (14)**: Índice de Força Relativa
- **MACD**: Convergência/Divergência
- **Médias Móveis**: Período 21
- **Bandas de Bollinger**: Volatilidade
- **Estocástico**: Oscilador
- **Williams %R**: Momentum

### **3.3 Níveis de Suporte/Resistência**
- **Cálculo**: Baseado no preço atual
- **Tipos**: Forte, Médio, Psicológico
- **Distância**: ±3%, ±5%, ±8% do preço atual

### **3.4 Padrões de Candlestick**
- **Reconhecimento**: Martelo, Estrela da Noite, Doji, Três Soldados
- **Confiança**: Percentual de 60% a 92%
- **Análise**: Interpretação automática

---

## 🔔 **4. SISTEMA DE ALERTAS**

### **4.1 Alertas de Preço**
- **Tipos**: Acima ou abaixo de preço específico
- **Configuração**: Ativo, preço alvo, tipo de alerta
- **Notificações**: E-mail e push (simuladas)
- **Persistência**: Salvos no localStorage

### **4.2 Alertas de Análise**
- **Indicadores**: Sinais de compra/venda
- **Níveis**: Rompimento de suporte/resistência
- **Padrões**: Formação de padrões de candlestick

---

## 📈 **5. FERRAMENTAS DE ANÁLISE**

### **5.1 Calculadora de Risco**
- **Perfil**: Conservador, Moderado, Agressivo
- **Cálculo**: Baseado em questionário
- **Recomendações**: Ativos adequados ao perfil

### **5.2 Comparador de Ativos**
- **Métricas**: Preço, Variação, Volume
- **Gráfico**: Comparativo visual
- **Análise**: Correlação entre ativos

### **5.3 Ranking de Usuários**
- **Métricas**: Lucro/Prejuízo, Número de operações
- **Período**: Atualização em tempo real
- **Posicionamento**: Top 10 usuários

---

## 📰 **6. CONTEÚDO E INFORMAÇÕES**

### **6.1 Notícias Financeiras**
- **Fonte**: Simuladas
- **Frequência**: Atualização automática
- **Categorias**: Empresas, Mercado, Economia

### **6.2 Calendário de Eventos**
- **Tipos**: Resultados, Assembleias, Reuniões
- **Frequência**: Mensal
- **Notificações**: Alertas para eventos importantes

### **6.3 Análise de Setores**
- **Categorias**: Bancos, Mineração, Varejo, Tecnologia, Energia, Saúde
- **Métricas**: Variação percentual
- **Ranking**: Ordenação por performance

---

## 🎯 **7. PERFIL DE INVESTIDOR**

### **7.1 Questionário de Perfil**
- **Perguntas**: 10 questões sobre tolerância ao risco
- **Resultado**: Conservador, Moderado ou Agressivo
- **Recomendações**: Ativos adequados ao perfil

### **7.2 Estratégias Recomendadas**
- **Conservador**: Ações blue chips, dividendos
- **Moderado**: Mistura de crescimento e estabilidade
- **Agressivo**: Ações de crescimento, pequenas empresas

---

## 🔧 **8. CONFIGURAÇÕES E PREFERÊNCIAS**

### **8.1 Configurações de Interface**
- **Tema**: Azul Royal (padrão)
- **Modo**: Claro/Escuro
- **Idioma**: Português (padrão)

### **8.2 Configurações de Trading**
- **Moeda**: Real (R$)
- **Formato**: Brasileiro (vírgula decimal)
- **Horário**: Brasília (UTC-3)

### **8.3 Configurações de Notificações**
- **E-mail**: Ligado/Desligado
- **Push**: Ligado/Desligado
- **Frequência**: Imediato, Diário, Semanal

---

## 📱 **9. RESPONSIVIDADE E ACESSIBILIDADE**

### **9.1 Dispositivos Suportados**
- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

### **9.2 Funcionalidades Mobile**
- **Touch**: Otimizado para toque
- **Gestos**: Swipe para navegação
- **Performance**: Otimizada para dispositivos móveis

---

## 🔒 **10. SEGURANÇA E VALIDAÇÕES**

### **10.1 Validações de Entrada**
- **CPF**: Formato e dígitos verificadores
- **E-mail**: Formato válido
- **Telefone**: Formato brasileiro
- **Senha**: Complexidade obrigatória

### **10.2 Proteção de Dados**
- **LocalStorage**: Dados persistidos localmente
- **Sessão**: Controle de acesso por CPF
- **Logout**: Limpeza automática de dados

### **10.3 Validações de Negócio**
- **Saldo**: Verificação antes de operações
- **Quantidade**: Múltiplos de 100 obrigatórios
- **Preços**: Validação de valores válidos

---

## 📊 **11. MÉTRICAS E RELATÓRIOS**

### **11.1 Extrato de Operações**
- **Dados**: Data, Tipo, Ativo, Quantidade, Preço, Total
- **Ordenação**: Mais recente primeiro
- **Filtros**: Por ativo, tipo, período

### **11.2 Performance da Carteira**
- **Lucro/Prejuízo**: Calculado em tempo real
- **Variação**: Percentual diário
- **Distribuição**: Por ativo

### **11.3 Histórico de Ordens**
- **Status**: Executada, Aceita, Cancelada
- **Preenchimento**: Parcial ou total
- **Tempo**: Data e hora da operação

---

## 🚀 **12. FUNCIONALIDADES AVANÇADAS**

### **12.1 Favoritos**
- **Ativos**: Lista personalizada
- **Persistência**: Salva no localStorage
- **Acesso Rápido**: Widget na interface

### **12.2 Exportação de Dados**
- **Formatos**: JSON
- **Dados**: Carteira, Extrato, Configurações
- **Backup**: Funcionalidade de backup/restore

### **12.3 Modo Demo**
- **Usuários**: Contas pré-configuradas
- **Dados**: Saldo e carteira simulados
- **Limitações**: Apenas para demonstração

---

## 📋 **13. REGRAS ESPECÍFICAS**

### **13.1 Horário de Funcionamento**
- **Simulação**: 24/7 (dados simulados)
- **Atualizações**: Tempo real
- **Manutenção**: Não aplicável (front-end)

### **13.2 Limites Operacionais**
- **Quantidade Mínima**: 100 ações
- **Quantidade Máxima**: Limitada pelo saldo
- **Preço Mínimo**: R$ 0,01
- **Preço Máximo**: Sem limite

### **13.3 Regras de Execução**
- **Ordem a Mercado**: Execução imediata
- **Ordem Limitada**: Execução condicional
- **Stop Loss**: Não implementado
- **Take Profit**: Não implementado

---

## 🔄 **14. FLUXOS DE PROCESSO**

### **14.1 Fluxo de Cadastro**
1. Usuário preenche formulário
2. Validação de todos os campos
3. Verificação de CPF único
4. Criação da conta
5. Redirecionamento para login

### **14.2 Fluxo de Login**
1. Usuário informa CPF e senha
2. Validação de credenciais
3. Criação da sessão
4. Carregamento de dados
5. Redirecionamento para portal

### **14.3 Fluxo de Operação**
1. Usuário preenche boleta
2. Validação de dados
3. Verificação de saldo/carteira
4. Criação da ordem
5. Execução ou aceitação
6. Atualização de dados

---

## 📝 **15. OBSERVAÇÕES IMPORTANTES**

### **15.1 Limitações do Sistema**
- **Front-end Only**: Sem backend real
- **Dados Simulados**: Preços e notícias
- **Persistência Local**: localStorage apenas
- **Sem API Externa**: Todas as funcionalidades são simuladas

### **15.2 Compatibilidade**
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **JavaScript**: ES6+
- **CSS**: Flexbox e Grid
- **HTML**: HTML5

### **15.3 Performance**
- **Carregamento**: Otimizado para velocidade
- **Memória**: Uso eficiente do localStorage
- **Renderização**: Gráficos otimizados
- **Responsividade**: Adaptação automática

---

## 🎯 **16. OBJETIVOS DO SISTEMA**

### **16.1 Educacional**
- **Demonstração**: Funcionalidades de corretora
- **Aprendizado**: Conceitos de trading
- **Simulação**: Operações sem risco

### **16.2 Profissional**
- **Portfolio**: Demonstração de habilidades
- **Interface**: Design moderno e intuitivo
- **Funcionalidades**: Sistema completo

### **16.3 Técnico**
- **Front-end**: Desenvolvimento avançado
- **JavaScript**: Lógica complexa
- **CSS**: Design responsivo
- **UX/UI**: Experiência do usuário

---

*Documentação criada em: Dezembro 2024*  
*Versão: 1.0*  
*Sistema: Royal Broker - Simulador de Trading*
