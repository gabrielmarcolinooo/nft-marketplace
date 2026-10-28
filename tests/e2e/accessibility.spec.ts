import { expect, test } from '@playwright/test';

test('navegação por teclado abre e fecha a autenticação', async ({ page }, testInfo) => {
  await page.goto('/');
  const trigger = testInfo.project.name === 'mobile'
    ? page.getByRole('button', { name: /perfil/i })
    : page.getByRole('button', { name: /^entrar$/i });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
