import { expect, test } from '@playwright/test';

test('demo hum creates and plays an arrangement', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hum-to-Orchestra' })).toBeVisible();
  await page.getByRole('button', { name: 'Demo Hum' }).click();
  await expect(page.getByText(/notes detected/)).toBeVisible();
  await page.getByRole('radio', { name: /Orchestra/ }).click();
  await expect(page.getByRole('heading', { name: 'Full Orchestra' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Star on GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/hum-to-orchestra'
  );
  await expect(page.getByRole('link', { name: 'Support' })).toHaveAttribute(
    'href',
    'https://www.paypal.com/paypalme/florinbadita'
  );
});
