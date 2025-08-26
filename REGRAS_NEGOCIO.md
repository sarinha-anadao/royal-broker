# Regras de Negócio - Royal Broker

## 1. 🧭 Visão Geral

Este documento descreve as regras de negócio do sistema Home Broker Simulado. A aplicação permite que usuários realizem operações simuladas de compra e venda de ativos com base em cotações dinâmicas e regras simplificadas da bolsa de valores.

---

## 2. 🔐 Login e Logout

### Login
- O acesso ao sistema é feito por CPF e senha.
- O sistema possui dois usuários pré-cadastrados.
- Após o login, o sistema carrega:
    - Carteira
    - Saldo
    - Cotações dos ativos
    - Book de ordens
    - Extrato de operações

### Logout
- Ao clicar em "Sair", a sessão é encerrada.
- Todos os dados visuais da sessão são limpos da tela.

---

## 3. 📊 Cotação de Ativos

- Os ativos têm valores simulados, com **preços flutuando automaticamente**.
- Atualização ocorre **a cada 10 segundos**.
- A variação é de **R$0,01 por ciclo**, simulando mercado em movimento.
- Cotações são utilizadas como referência para comparação com as ordens enviadas.

---

## 4. 📝 Boleta de Compra e Venda

A boleta é o formulário onde o usuário envia ordens de compra ou venda.

### Campos obrigatórios:
- Tipo de operação: Compra ou Venda
- Ativo
- Quantidade de lotes (múltiplos de 100)
- Valor desejado por lote (informado manualmente)

### Regras:
- A ordem será:
    - **Executada**: se o valor informado for **igual à cotação atual**
    - **Aceita (pendente)**: se a diferença entre o valor informado e a cotação for **menor ou igual a R$5**
    - **Rejeitada**: se a diferença for **maior que R$5**
- Quantidades fracionárias não são permitidas. O mínimo de negociação é **100 unidades (1 lote)**.

---

## 5. 💸 Compra

Regras para envio de ordem de **compra**:

- O usuário deve possuir **saldo suficiente** para cobrir o total da ordem (`valor por lote * quantidade de lotes`).
- Se o valor informado for:
    - **Igual à cotação atual** → ordem executada imediatamente.
    - **Menor ou maior até R$5** da cotação → ordem aceita e pendente de execução.
    - **Diferença superior a R$5** → ordem rejeitada.

---

## 6. 🏷️ Venda

Regras para envio de ordem de **venda**:

- O usuário deve possuir **a quantidade de ativos** que deseja vender em carteira.
- As mesmas regras de comparação com a cotação se aplicam:
    - Valor igual → executada
    - Diferença ≤ R$5 → aceita
    - Diferença > R$5 → rejeitada

---

## 7. 📈 Livro de Ofertas (Book de Cotações)

- Lista em tempo real das cotações atuais dos ativos disponíveis.
- Atualizado automaticamente a cada 10 segundos.
- Utilizado para comparação com o valor informado na boleta.

---

## 8. 🔄 Atualização de Carteira

- Ao **executar uma compra**, os ativos são adicionados à carteira e o saldo é reduzido.
- Ao **executar uma venda**, os ativos são removidos da carteira e o saldo é aumentado.
- A carteira é atualizada visualmente após cada operação executada.

---

## 9. 📑 Book de Ordens

- Todas as ordens enviadas são registradas no Book.
- Campos registrados:
    - Tipo da operação (Compra/Venda)
    - Ativo
    - Quantidade
    - Valor informado por lote
    - Cotação no momento do envio
    - Status da ordem
    - Ação (Cancelar)

### Status possíveis:

| Status | Descrição |
| --- | --- |
| **Aceita** | Ordem válida, mas ainda não atingiu a cotação. Aguardando execução. |
| **Executada** | Ordem executada com sucesso quando cotação == valor informado |
| **Rejeitada** | Ordem recusada automaticamente (valor informado difere mais de R$5) |

---

## 10. ❌ Cancelamento de Ordem

- Somente ordens com **status "Aceita"** podem ser canceladas.
- Ao cancelar:
    - A ordem é removida do Book.
    - Nenhuma modificação ocorre na carteira ou saldo.
    - A ação é visível na coluna "Ação".

---

## 11. 🧾 Extrato de Operações

- Apenas ordens **executadas** são exibidas no extrato.
- Campos registrados:
    - Tipo da operação
    - Ativo
    - Quantidade
    - Valor total da operação (quantidade * valor por lote)

---

## 12. 🔁 Verificação Automática

- A cada 10 segundos:
    - Todas as **ordens pendentes ("Aceita")** são comparadas novamente com a cotação atual.
    - Se cotação == valor informado → a ordem é executada e atualizações são feitas:
        - Carteira
        - Saldo
        - Status da ordem
        - Registro no extrato

---

## 13. 📊 Análise Técnica

### Funcionalidades:
- Gráficos em tempo real (candlestick e linha)
- Múltiplos intervalos de tempo (10s, 1m, 5m, 30m, 1h, 1d, 1w)
- Visualização da carteira do usuário
- Operações diretas (compra/venda) a partir da análise

### Regras de Operação:
- Mesmas regras da boleta principal
- Seleção de ativo ao clicar na carteira
- Validação de saldo e quantidade disponível

---

## 14. 💾 Persistência de Dados

### Armazenamento:
- Dados do usuário: `localStorage` (rb_users)
- Carteira e saldo: `localStorage` (rb_port_[CPF])
- Sessão atual: `localStorage` (rb_cpf)

### Backup:
- Dados são mantidos entre sessões
- Carteira é persistida por usuário
- Histórico de operações é mantido

---

## 15. 📤 Exportação de Dados

### Formatos Suportados:
- **XLSX**: Planilha Excel
- **JSON**: Dados estruturados
- **PDF**: Relatório formatado

### Dados Exportáveis:
- Carteira de investimentos
- Book de ofertas
- Extrato de operações
- Book de ordens

---

## 16. 🔍 Filtros e Busca

### Extrato de Operações:
- Filtro por período (data inicial e final)
- Ordenação por data (mais recentes/antigas primeiro)
- Contagem de operações encontradas

---

## 17. 🎨 Interface e UX

### Validações em Tempo Real:
- CPF com formatação automática
- Telefone com formatação automática
- E-mail com validação de formato
- Senha com regras visuais (8-12 caracteres, maiúscula, minúscula, número, especial)

### Feedback Visual:
- Mensagens de sucesso/erro
- Indicadores de carregamento
- Cores diferenciadas para status
- Hover effects e transições

---

## 18. 🔒 Segurança

### Validações:
- CPF válido (formato e dígitos)
- Senha forte (múltiplos critérios)
- E-mail válido
- Telefone válido
- Nome completo obrigatório

### Histórico de Senhas:
- Não permite reutilizar as últimas 4 senhas
- Armazenamento seguro no localStorage

---

## 19. 📱 Responsividade

### Design:
- Interface adaptável para diferentes tamanhos de tela
- Elementos redimensionáveis
- Navegação otimizada para mobile

---

## 20. 🚀 Performance

### Otimizações:
- Atualizações em tempo real eficientes
- Carregamento assíncrono de dados
- Cache de informações do usuário
- Renderização otimizada de gráficos

---

*Este documento é atualizado conforme novas funcionalidades são implementadas no sistema.*

