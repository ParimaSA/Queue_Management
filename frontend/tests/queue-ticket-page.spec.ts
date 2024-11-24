import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/';

test('Check components on the queue ticket', async ({ page }) => {
    await page.goto(`${baseURL}`);
    
    // Click on Start Now button
    await page.getByRole('button', { name: 'Start Now!' }).click();

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
    await ticketPage.waitForLoadState('load');

    // Check components
    const businessName = ticketPage.locator('h3', { hasText: 'PwRestaurant' });
    await expect(businessName).toBeVisible();

    const queueNameText = ticketPage.locator('text=Queue Name: Delivery');
    await expect(queueNameText).toBeVisible();

    const qrCode = ticketPage.locator('img[alt="QR Code"]');
    await expect(qrCode).toBeVisible();

    const statusText = ticketPage.locator('text=[ Status: waiting ]');
    await expect(statusText).toBeVisible();

    const estimatedTimeText = ticketPage.locator('text=Estimated Time');
    await expect(estimatedTimeText).toBeVisible();

    const aheadOfYouText = ticketPage.locator('text=Ahead of you');
    await expect(aheadOfYouText).toBeVisible();

    // Check URL
    const page2Promise = ticketPage.waitForEvent('popup');
    await ticketPage.getByRole('link', { name: 'https://queue-management-' }).click();
    const ticketPage2 = await page2Promise;
});
