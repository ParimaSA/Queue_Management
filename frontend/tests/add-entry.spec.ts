import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/'; 

test('Add queue entry and verify queue ticket appears', async ({ page }) => {
  await page.goto(`${baseURL}`);
  
  // Login as Business Owner
  await page.getByRole('button', { name: 'Business Owner' }).click();
  await page.getByPlaceholder('Username').fill('PwTest');
  await page.getByPlaceholder('Password').fill('hackme11');
  await page.getByRole('button', { name: 'Login' }).click();

  // Add Delivery Entry
  await page.getByRole('combobox').selectOption('140');
  await page.locator('div').filter({ hasText: /^ReservationWalk-inTakeawayDeliveryOrder PickupPaymentAdd$/ }).getByRole('button').click();
  
  // Verify the "Quueue Name: Delivery" is visible
  const DeliveryText = page.getByText('Queue Name: Delivery');
  await expect(DeliveryText).toBeVisible();

  // Add Takeaway Enrty
  await page.getByRole('combobox').selectOption('139');
  await page.locator('div').filter({ hasText: /^ReservationWalk-inTakeawayDeliveryOrder PickupPaymentAdd$/ }).getByRole('button').click();

  // Verify the "Quueue Name: Takeaway" is visible
  const TakeawayText = page.getByText('Queue Name: Takeaway');
  await expect(TakeawayText).toBeVisible();

});
