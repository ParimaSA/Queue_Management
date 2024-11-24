import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/';

test('Business Owner Login and Check Profile', async ({ page }) => {
    await page.goto(`${baseURL}`);
    
    // Click on Business Owner button
    await page.getByRole('button', { name: 'Start Now' }).click();

    // Login
    await page.getByPlaceholder('Username').fill('PwTest');
    await page.getByPlaceholder('Password').fill('hackme11');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL(`${baseURL}business`);
    await expect(page).toHaveURL(`${baseURL}business`);

    // Add Delivery Entry
    await page.getByRole('combobox').selectOption('140');
    await page.locator('div').filter({ hasText: /^ReservationWalk-inTakeawayDeliveryOrder PickupPaymentAdd$/ }).getByRole('button').click();
  
    // Navigate to queue ticket page    
    const ticketPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'https://queue-management-' }).click();
    const ticketPage = await ticketPromise;

    // Cancel entry
    await ticketPage.getByRole('button', { name: 'Cancel' }).click();

    // Wait for the navigation event triggered by Cancel
    await expect(ticketPage).toHaveURL(`${baseURL}customer`);

    // Verify the text "No queue entry found." is visible after canceling
    const element = ticketPage.locator('text="No queue entry found."');
    await expect(element).toBeVisible();
    await expect(element).toHaveText("No queue entry found.");
});
