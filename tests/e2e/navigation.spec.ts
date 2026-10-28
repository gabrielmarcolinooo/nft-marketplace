import { expect, test } from '@playwright/test';

test.describe('rotas públicas do KURIO', () => {
  test('Início, Mercado, Criadores e Aprenda carregam', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /seja dono/i })).toBeVisible();
    await page.goto('/mercado');
    await expect(page.getByPlaceholder(/buscar no mercado/i)).toBeVisible();
    await page.goto('/criadores');
    await expect(page.getByRole('heading').first()).toBeVisible();
    await page.goto('/aprenda');
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('mobile apresenta navegação inferior e filtro', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Cobertura exclusiva de viewport mobile.');
    await page.goto('/');
    await expect(page.getByTestId('mobile-bottom-navigation')).toBeVisible();
    await page.getByRole('button', { name: /filtrar nfts/i }).click();
    await expect(page.getByRole('dialog', { name: /filtros do catálogo/i })).toBeVisible();
  });
});
