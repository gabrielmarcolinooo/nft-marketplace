import { expect, test } from '@playwright/test';

test.describe('marketplace, detalhes e carrinho', () => {
  test('busca, detalhes e carrinho funcionam', async ({ page }) => {
    await page.goto('/mercado');
    await page.getByPlaceholder(/buscar no mercado/i).fill('Emerald');
    await page.getByPlaceholder(/buscar no mercado/i).press('Enter');
    await page.getByRole('link', { name: /ver detalhes de emerald ape/i }).click();
    await expect(page.getByRole('heading', { name: /emerald ape/i })).toBeVisible();
    await page.getByRole('button', { name: /comprar nft|comprar/i }).first().click();
    await expect(page).toHaveURL(/\/carrinho$/);
  });

  test('cupom inválido apresenta erro', async ({ page }) => {
    await page.goto('/carrinho');
    await page.getByPlaceholder(/digite o código promocional/i).fill('INVALIDO');
    await page.getByRole('button', { name: /aplicar/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
