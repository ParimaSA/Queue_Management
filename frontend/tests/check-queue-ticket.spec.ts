import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/';

test('Business Owner Login and Check Profile', async ({ page }) => {
    await page.goto(`${baseURL}`);
    
    // Click on Business Owner button
    await page.getByRole('button', { name: 'Business Owner' }).click();

    // Login
    await page.getByPlaceholder('Username').fill('PwTest');
    await page.getByPlaceholder('Password').fill('hackme11');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(`${baseURL}business`);
    await expect(page).toHaveURL(`${baseURL}business`);

    // Add Delivery Entry
    await page.getByRole('combobox').selectOption('140');
    await page.locator('div').filter({ hasText: /^ReservationWalk-inTakeawayDeliveryOrder PickupPaymentAdd$/ }).getByRole('button').click();
  
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'https://queue-management-' }).click();
    const page1 = await page1Promise;
    await page1.getByRole('heading', { name: 'PwRestaurant' }).click();
});
