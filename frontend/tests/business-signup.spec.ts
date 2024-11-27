import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/';

test('Business Owner Sign Up and Login', async ({ page }) => {
  // Generate unique username and business name using random numbers
  const uniqueUsername = 'pwtest' + Math.random().toString().slice(2, 12);
  const businessName = 'business' + Math.random().toString().slice(2, 12);

  await page.goto(`${baseURL}`, { waitUntil: 'networkidle' });

  // Navigate to Sign-Up page
  await page.getByRole('button', { name: 'Start Now' }).click();
  await page.getByRole('link', { name: 'Sign up' }).click();

  // Ensure the page is fully loaded
  await page.waitForLoadState('domcontentloaded');

  // Use more specific selectors if necessary
  const usernameInput = page.locator('input[placeholder="Username"]');
  await usernameInput.waitFor({ state: 'visible' });
  await usernameInput.click();
  await usernameInput.fill(uniqueUsername);

  await page.locator('input[placeholder="Business Name"]').fill(businessName);
  await page.locator('#password1').fill('hackme11'); // Password
  await page.locator('#password2').fill('hackme11'); // Confirm Password

  await usernameInput.click();
  await usernameInput.fill(uniqueUsername);

  // Submit form
  await page.getByRole('button', { name: 'Sign up' }).click();

  await page.waitForURL(`${baseURL}business/login`, { timeout: 60000 });
  await expect(page).toHaveURL(`${baseURL}business/login`);

  // Login with new credentials
  await usernameInput.fill(uniqueUsername);
  await page.locator('input[placeholder="Password"]').click();
  await page.locator('input[placeholder="Password"]').fill('hackme11');
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to Profile page
  const accountMenu = page.locator('summary.font-bold', { hasText: 'Account' });
  await accountMenu.click();
  await page.getByRole('link', { name: 'Profile' }).click();

  // Verify correct business name
  const businessNameElement = page.getByText(businessName);
  await expect(businessNameElement).toBeVisible();
});
