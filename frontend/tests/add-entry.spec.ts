import { test, expect } from '@playwright/test';

test('Add queue entry and verify queue ticket appears', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
  // Login as Business Owner
  await page.getByRole('button', { name: 'Business Owner' }).click();
  await page.getByPlaceholder('Username').fill('owner1');
  await page.getByPlaceholder('Password').fill('hackme11');
  await page.getByRole('button', { name: 'Login' }).click();

  // Add Dine-in Entry
  await page.locator('div').filter({ hasText: /^Dine-inPick-upDrive-thruDeliveryAdd$/ }).getByRole('button').click();

  // Verify the "Quueue Name: Dine-in" is visible
  const dineInText = page.getByText('Queue Name: Dine-in');
  await expect(dineInText).toBeVisible();

  // Add Delivery Entry
  await page.locator('div').filter({ hasText: /^Dine-inPick-upDrive-thruDeliveryAdd$/ }).getByRole('button').click();
  await page.getByRole('combobox').selectOption('8');
  await page.locator('div').filter({ hasText: /^Dine-inPick-upDrive-thruDeliveryAdd$/ }).getByRole('button').click();

  // Verify the "Queue Name: Delivery" is visible
  const driveThruText = page.getByText('Queue Name: Delivery');
  await expect(driveThruText).toBeVisible();
});
