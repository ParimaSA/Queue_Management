import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/'; 

test('Add queue entry and verify queue ticket appears', async ({ page }) => {
  await page.goto(`${baseURL}`);
  
  // Click on Start Now button
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Start Now!' }).click();
  await page.waitForTimeout(1000);

  // Login
  await page.getByPlaceholder('Username').fill('PwTest');
  await page.waitForTimeout(500);
  await page.getByPlaceholder('Password').fill('hackme11');
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(`${baseURL}business`);
  await expect(page).toHaveURL(`${baseURL}business`);
  await page.waitForTimeout(1000);

  // Add Reservation Entry
  await page.waitForTimeout(500);
  await page.locator('div').filter({ hasText: /^ReservationWalk-inTakeawayDeliveryOrder PickupPaymentAdd$/ }).getByRole('button').click();
  await page.waitForTimeout(1000);

  // Navigate to queue ticket page    
  const ticketPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'https://queue-management-' }).click();
  await page.waitForTimeout(1000);
  const ticketPage = await ticketPromise;
  await ticketPage.waitForTimeout(1000);

  // Bring the main page to front and navigate back to business page
  await page.bringToFront(); // Switch focus back to the main tab
  await page.goto(`${baseURL}business`);
  await page.waitForTimeout(3000);

  // Verify returned to the correct page
  await expect(page).toHaveURL(`${baseURL}business`);

  // Find all entries with "A<number>"
  const entries = await page.locator('div').filter({ hasText: /A\d+waitingcompletecancel$/ }).allTextContents();

  // Extract numbers from entries
  const smallestEntry = entries
    .map((entry) => {
      const match = entry.match(/A(\d+)/); // Extract the number after "A"
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null) // Remove null values
    .sort((a, b) => a - b)[0]; // Sort numbers and get the smallest one

  if (smallestEntry !== undefined) {
    const smallestEntryText = `A${smallestEntry}waitingcompletecancel`;
    // Click the waiting button for the smallest entry
    await page.locator('div').filter({ hasText: new RegExp(`^${smallestEntryText}$`) }).getByRole('button').click();
    // Click the complete button in the dropdown
    await page.getByRole('button', { name: 'complete' }).click();
  } else {
    console.log('No entries found matching the pattern.');
  }
  await page.waitForTimeout(2000);

  // Bring the ticket page to the front
  await ticketPage.bringToFront();
  await ticketPage.waitForTimeout(1000);
});
