import { test, expect } from '@playwright/test';

test('Business Owner Login and Check Profile', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  
  // Click on Business Owner button
  await page.getByRole('button', { name: 'Business Owner' }).click();

  // Login
  await page.getByPlaceholder('Username').fill('owner1');
  await page.getByPlaceholder('Password').fill('hackme11');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('http://localhost:3000/business');
  await expect(page).toHaveURL('http://localhost:3000/business');

  // Go to the profile page
  await page.getByText('Account').click();
  await page.getByRole('link', { name: 'Profile' }).click();

  await page.waitForURL('http://localhost:3000/business/profile');
  await expect(page).toHaveURL('http://localhost:3000/business/profile');

  // Have correct business name
  const element = page.locator('text="TestRestaurant"');
  await expect(element).toBeVisible();
  await expect(element).toHaveText('TestRestaurant');

});
