import { expect, test } from '@playwright/test';

test('login, perfil e carteiras', async ({ page }) => {
  await page.goto('/perfil');
  await expect(page.getByRole('dialog')).toBeVisible();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'E-mail', exact: true }).fill('usuario@kurio.com');
  await dialog.getByRole('textbox', { name: 'Senha', exact: true }).fill('123456');
  await dialog.getByRole('button', { name: /^entrar$/i }).last().click();
  await page.goto('/perfil');
  await expect(page.getByRole('heading', { name: /perfil do colecionador/i })).toBeVisible();
  await page.getByRole('button', { name: /carteiras/i }).click();
  await expect(page.getByRole('heading', { name: /carteira principal/i })).toBeVisible();
});
