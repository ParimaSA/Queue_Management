import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/';

test('Check components on Business page', async ({ page }) => {
  await page.goto(`${baseURL}`);

  // Click on Start Now button
  await page.getByRole('button', { name: 'Start Now!' }).click();

  // Login
  await page.getByPlaceholder('Username').fill('PwTest');
  await page.getByPlaceholder('Password').fill('hackme11');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(`${baseURL}business`);
  await expect(page).toHaveURL(`${baseURL}business`);

  await page.waitForURL(`${baseURL}business`);
  await expect(page).toHaveURL(`${baseURL}business`);

  // 1. Check if the card title "Add Entry" is visible
  await page.waitForSelector('h1.card-title', { state: 'visible' });
  const cardTitle = page.locator('h1.card-title', { hasText: 'Add Entry' });
  await expect(cardTitle).toBeVisible();  

  // Check if the select dropdown for queue options is visible
  const selectDropdown = page.locator('select.select-bordered');
  await expect(selectDropdown).toBeVisible();

  // Check the Add button
  const addButton = page.locator('button.btn').nth(0);
  await expect(addButton).toBeVisible();
  await page.locator('div').filter({ hasText: /^ReservationWalk-inTakeawayDeliveryOrder PickupPaymentAdd$/ }).getByRole('button').click();

  // Check if the entry data is visible once populated
  const queueName = page.getByText('Queue Name: ');
  await expect(queueName).toBeVisible();
  
  const timeIn = page.locator('p.text-amber-700', { hasText: 'Time in:' });
  await expect(timeIn).toBeVisible();

  // Check if the QR code is visible or shows the loading message
  const qrCode = page.locator('div.mx-auto.w-28.h-28');
  await expect(qrCode).toBeVisible();
  const qrCodeText = await qrCode.textContent();
  if (qrCodeText === "Generating QR Code...") {
    await expect(qrCodeText).toBe("Generating QR Code...");
  } else {
    const qrImage = page.locator('img[alt="QR Code"]');
    await expect(qrImage).toBeVisible();
  }

  // Check the URL
  const urlLink = page.locator('a', { hasText: '/customer/' });
  await expect(urlLink).toBeVisible();

  // Check the print button
  const printButton = page.locator('div.flex.justify-end button.btn');
  await expect(printButton).toBeVisible();

  // Check card title "All Queue"
  const cardTitle2 = page.locator('h2', { hasText: 'All Queue' });
  await expect(cardTitle2).toBeVisible();

  // Check Queue template button
  const templateButton = page.locator('button', { hasText: 'Add Queue' }); 
  await expect(templateButton).toBeVisible();

  // Check Add Queue button
  const addQueueButton = page.locator('button', { hasText: 'Add Queue' }); 
  await expect(addQueueButton).toBeVisible();
});
