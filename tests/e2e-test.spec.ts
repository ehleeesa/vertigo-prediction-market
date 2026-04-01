import { test, expect } from '@playwright/test';

test('TEST 1: REGULAR USER PERSPECTIVE', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('/auth/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await page.getByLabel(/Email/i).fill('oscar.rau75.pkdv8m.1@seed.local'); 
  await page.waitForTimeout(500);
  await page.getByLabel(/Password/i).fill('password123');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForTimeout(2000);

  await expect(page.getByText('Markets').first()).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(1000);
  
  const openMarketBtn = page.getByRole('button', { name: 'Place Bet' }).first();
  await openMarketBtn.click();
  await page.waitForTimeout(1500);

  const amountInput = page.locator('#amount');
  const confirmBetBtn = page.getByRole('button', { name: 'Place Bet', exact: true });

  await amountInput.fill('-50');
  await page.waitForTimeout(1000);
  await confirmBetBtn.click();
  await page.waitForTimeout(1500);
  
  await expect(page.getByText('Please enter a valid amount greater than 0')).toBeVisible();
  await page.waitForTimeout(1000);
  
  await amountInput.fill(''); 
  await page.waitForTimeout(500);
  await amountInput.fill('100');
  await page.waitForTimeout(1000);
  await confirmBetBtn.click();
  await page.waitForTimeout(2500); 

  await page.getByRole('button', { name: '← Back to Markets' }).click();
  await page.waitForTimeout(1500);

  await page.getByRole('button', { name: 'Leaderboard' }).click();
  await page.waitForTimeout(2000);
  
  await page.goBack();
  await page.waitForTimeout(1500);

  await page.getByRole('button', { name: 'My Profile' }).click();
  await page.waitForTimeout(1500);
  await expect(page.getByText('User Dashboard')).toBeVisible();
  
  await page.getByRole('button', { name: 'Generate Key' }).click();
  await page.waitForTimeout(2000);
  await expect(page.getByText('No API Key generated yet')).not.toBeVisible();

  await expect(page.getByText(/Active Bets/i)).toBeVisible();
  await page.goBack();
  await page.waitForTimeout(2000);


  const sortDropdown = page.locator('select');

  await sortDropdown.selectOption('createdAt');
  await page.waitForTimeout(1500);

  await sortDropdown.selectOption('totalBet');
  await page.waitForTimeout(1500);

  await sortDropdown.selectOption('participants');
  await page.waitForTimeout(1500);

});

test('TEST 2: ADMINISTRATOR PERSPECTIVE', async ({ page }) => {
  await page.goto('/auth/login');
  await page.waitForTimeout(1500);

  await page.getByLabel(/Email/i).fill('admin@seed.local'); 
  await page.waitForTimeout(500);
  await page.getByLabel(/Password/i).fill('password123');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(2000);

  await expect(page.getByText('Markets').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('span.bg-purple-100:has-text("Admin")')).toBeVisible();
  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'Create Market' }).click();
  await page.waitForTimeout(1500);

  await page.locator('#title').fill('Will Meow-Tech Corp acquire the Whiskers startup by May 2026?');
  await page.waitForTimeout(500);
  await page.locator('#description').fill('A high-stakes market tracking the potential merger in the automated cat-feeder industry.');
  await page.waitForTimeout(500);
  await page.getByPlaceholder('Outcome 1').fill('Yes');
  await page.waitForTimeout(500);
  await page.getByPlaceholder('Outcome 2').fill('No');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Create Market', exact: true }).click();
  await page.waitForTimeout(2500);

  const newMarket = page.getByText('Will Meow-Tech Corp acquire the Whiskers startup by May 2026?');
  await expect(newMarket).toBeVisible();
  
  await page.locator('div').filter({ has: newMarket }).getByRole('button', { name: 'Place Bet' }).click();
  await page.waitForTimeout(2000);

  await expect(page.getByText('Admin Controls')).toBeVisible();
  await page.waitForTimeout(1000);

  page.once('dialog', async dialog => {
    await dialog.accept();
  });

  await page.getByRole('button', { name: 'Resolve as "Yes"' }).click();
  await page.waitForTimeout(2500);

  await page.getByRole('button', { name: '← Back to Markets' }).click();
  await page.waitForTimeout(1500);

  await page.getByRole('button', { name: 'Resolved', exact: true }).click();
  await page.waitForTimeout(2000);

});