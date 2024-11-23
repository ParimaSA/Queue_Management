import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000'; 

test('Business Owner Sign Up and Login', async ({ page }) => {
  await page.goto(`${baseURL}`);

  // Navigate to Sign-Up page
  await page.getByRole('button', { name: 'Business Owner' }).click();
  await page.getByRole('link', { name: 'Sign up' }).click();

  // Fill in Sign-Up form
  await page.getByPlaceholder('Username').click();
  await page.getByPlaceholder('Username').fill('owner0');
  await page.getByPlaceholder('Business Name').fill('TestRestaurant0');
  await page.getByPlaceholder('Username').click();
  await page.locator('#password1').fill('test1234567890'); // Password
  await page.locator('#password2').fill('test1234567890'); // Confirm Password

  // Submit form
  await page.getByRole('button', { name: 'Sign up' }).click();

  await page.waitForURL(`${baseURL}/business/login`);
  await expect(page).toHaveURL(`${baseURL}/business/login`);

  // Login with new credentials
  await page.getByPlaceholder('Username').fill('owner0');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('test1234567890');
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to Profile page
  const accountMenu = page.locator('summary.font-bold', { hasText: 'Account' });
  await accountMenu.click();
  await page.getByRole('link', { name: 'Profile' }).click();

  // Verify correct business name
  const businessNameElement = page.getByText('TestRestaurant0');
  await expect(businessNameElement).toBeVisible();
});
