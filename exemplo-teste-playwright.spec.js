// Exemplo de teste Playwright usando Test IDs
// Arquivo: exemplo-teste-playwright.spec.js

const { test, expect } = require('@playwright/test');

test.describe('Royal Broker - Testes com Test IDs', () => {
  
  test.beforeEach(async ({ page }) => {
    // Configuração comum para todos os testes
    await page.goto('http://localhost:3000'); // Ajuste a URL conforme necessário
  });

  test('Login com CPF válido usando Test IDs', async ({ page }) => {
    // Navegar para página de login
    await page.goto('/login.html');
    
    // Preencher formulário usando Test IDs
    await page.fill('[data-testid="login-cpf"]', '11111111111');
    await page.fill('[data-testid="login-senha"]', '123');
    
    // Clicar em entrar
    await page.click('[data-testid="login-entrar"]');
    
    // Verificar se foi redirecionado para o portal
    await expect(page).toHaveURL(/.*portal\.html/);
    
    // Verificar se está logado
    await expect(page.locator('text=Conta A')).toBeVisible();
  });

  test('Cadastro de novo usuário usando Test IDs', async ({ page }) => {
    // Navegar para página de cadastro
    await page.goto('/cadastro.html');
    
    // Preencher formulário de cadastro
    await page.fill('[data-testid="cadastro-nome"]', 'João Silva Santos');
    await page.fill('[data-testid="cadastro-whatsapp"]', '11987654321');
    await page.fill('[data-testid="cadastro-email"]', 'joao@teste.com');
    await page.fill('[data-testid="cadastro-cpf"]', '12345678901');
    await page.fill('[data-testid="cadastro-senha"]', 'Senha123!');
    await page.fill('[data-testid="cadastro-confirmar-senha"]', 'Senha123!');
    
    // Clicar em criar conta
    await page.click('[data-testid="cadastro-criar-conta"]');
    
    // Verificar mensagem de sucesso
    await expect(page.locator('text=Conta criada com sucesso')).toBeVisible();
  });

  test('Editar dados na Minha Conta usando Test IDs', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login.html');
    await page.fill('[data-testid="login-cpf"]', '11111111111');
    await page.fill('[data-testid="login-senha"]', '123');
    await page.click('[data-testid="login-entrar"]');
    
    // Abrir modal Minha Conta (assumindo que há um botão para isso)
    await page.click('text=Minha conta');
    
    // Verificar se os campos estão preenchidos
    await expect(page.locator('[data-testid="minha-conta-nome"]')).toHaveValue('Conta A');
    await expect(page.locator('[data-testid="minha-conta-email"]')).toHaveValue('demo@royal.com');
    
    // Editar nome (clicar no botão de editar)
    await page.click('text=✏️'); // Botão de editar
    
    // Preencher novo nome
    await page.fill('[data-testid="minha-conta-nome"]', 'Conta A Atualizada');
    
    // Salvar alterações
    await page.click('[data-testid="minha-conta-salvar"]');
    
    // Verificar mensagem de sucesso
    await expect(page.locator('text=Alterações salvas com sucesso')).toBeVisible();
  });

  test('Validação de campos obrigatórios no cadastro', async ({ page }) => {
    await page.goto('/cadastro.html');
    
    // Tentar submeter formulário vazio
    await page.click('[data-testid="cadastro-criar-conta"]');
    
    // Verificar se os campos obrigatórios mostram erro
    await expect(page.locator('[data-testid="cadastro-nome"]')).toHaveAttribute('required');
    await expect(page.locator('[data-testid="cadastro-email"]')).toHaveAttribute('required');
    await expect(page.locator('[data-testid="cadastro-cpf"]')).toHaveAttribute('required');
  });

  test('Navegação entre páginas usando Test IDs', async ({ page }) => {
    // Testar navegação do login para cadastro
    await page.goto('/login.html');
    await page.click('text=Cadastre-se');
    await expect(page).toHaveURL(/.*cadastro\.html/);
    
    // Testar navegação do cadastro para login
    await page.click('text=Entrar');
    await expect(page).toHaveURL(/.*login\.html/);
  });

  test('Seletores com fallback (múltiplas opções)', async ({ page }) => {
    await page.goto('/login.html');
    
    // Usar seletor com fallback: testid OU placeholder OU id
    const cpfField = page.locator(':is([data-testid="login-cpf"], [placeholder*="cpf" i], #cpf)');
    await cpfField.fill('11111111111');
    
    // Usar seletor com fallback para botão: testid OU texto
    const entrarButton = page.locator(':is([data-testid="login-entrar"], button:has-text("Entrar"))');
    await entrarButton.click();
    
    await expect(page).toHaveURL(/.*portal\.html/);
  });

  test('Teste de acessibilidade usando roles', async ({ page }) => {
    await page.goto('/login.html');
    
    // Usar getByRole para melhor acessibilidade
    await page.getByRole('textbox', { name: 'CPF' }).fill('11111111111');
    await page.getByRole('textbox', { name: 'Senha' }).fill('123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    await expect(page).toHaveURL(/.*portal\.html/);
  });

  test('Teste de responsividade com Test IDs', async ({ page }) => {
    // Testar em mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login.html');
    
    // Verificar se os elementos estão visíveis em mobile
    await expect(page.locator('[data-testid="login-cpf"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-senha"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-entrar"]')).toBeVisible();
    
    // Testar em desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    // Verificar se os elementos continuam funcionando
    await expect(page.locator('[data-testid="login-cpf"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-senha"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-entrar"]')).toBeVisible();
  });
});

// Exemplo de teste de performance
test('Performance dos Test IDs', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/login.html');
  
  // Medir tempo de localização com Test ID
  const cpfField = page.locator('[data-testid="login-cpf"]');
  await cpfField.fill('11111111111');
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Verificar se a localização foi rápida (< 1 segundo)
  expect(duration).toBeLessThan(1000);
});

// Exemplo de teste de erro
test('Tratamento de erro com Test IDs', async ({ page }) => {
  await page.goto('/login.html');
  
  // Tentar login com dados inválidos
  await page.fill('[data-testid="login-cpf"]', '00000000000');
  await page.fill('[data-testid="login-senha"]', 'senhaerrada');
  await page.click('[data-testid="login-entrar"]');
  
  // Verificar mensagem de erro
  await expect(page.locator('text=CPF ou senha inválidos')).toBeVisible();
});

// Exemplo de teste de estado
test('Estado dos campos com Test IDs', async ({ page }) => {
  await page.goto('/cadastro.html');
  
  // Verificar estado inicial dos campos
  await expect(page.locator('[data-testid="cadastro-nome"]')).toBeEmpty();
  await expect(page.locator('[data-testid="cadastro-email"]')).toBeEmpty();
  
  // Preencher e verificar estado
  await page.fill('[data-testid="cadastro-nome"]', 'Teste');
  await expect(page.locator('[data-testid="cadastro-nome"]')).toHaveValue('Teste');
  
  // Limpar e verificar estado
  await page.fill('[data-testid="cadastro-nome"]', '');
  await expect(page.locator('[data-testid="cadastro-nome"]')).toBeEmpty();
});
