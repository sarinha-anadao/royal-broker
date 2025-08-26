# Instruções para Testar o Login

## Problema Reportado
O login não está funcionando e mostra a mensagem "faça corresponder o formato pedido".

## Passos para Debug

### 1. Primeiro, verifique se há usuários cadastrados
- Acesse: `debug_login.html`
- Clique em "Verificar Usuários"
- Se não houver usuários, clique em "Criar Usuário Teste"

### 2. Teste o login manual
- Acesse: `login.html`
- Digite o CPF: `453.235.178-05` (ou `45323517805`)
- Digite a senha: `Senha123!`
- Clique em "Testar Login Direto" (botão amarelo)
- Verifique o console do navegador (F12) para ver os logs

### 3. Se o teste direto funcionar
- Tente fazer login normal clicando em "Entrar"
- Verifique se há diferença entre os dois métodos

### 4. Se o teste direto não funcionar
- Verifique se o usuário foi criado corretamente
- Use o `debug_login.html` para investigar mais

## Possíveis Causas

1. **Usuário não foi salvo corretamente**
2. **Problema na função `getUser()`**
3. **Problema na função `limparCPF()`**
4. **Validação HTML5 interferindo**
5. **Cache do navegador**

## Soluções Implementadas

✅ Removido `pattern="[0-9]*"` do campo CPF
✅ Adicionado debug com console.log
✅ Criado botão de teste direto
✅ Simplificada validação de CPF no login

## Próximos Passos

1. Teste o `debug_login.html` primeiro
2. Verifique se há usuários cadastrados
3. Teste o login direto
4. Reporte os resultados para continuarmos o debug

