import { test, expect, Locator } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/';

test('Add queue entry and verify queue ticket appears with accurate cursor movement', async ({ page }) => {
  await page.goto(`${baseURL}`);
  
  // Add a custom cursor to the page
  await page.addStyleTag({
    content: `
      .playwright-cursor {
        width: 20px;
        height: 20px;
        background-color: black;
        border: 2px solid white;
        border-radius: 50%;
        position: absolute;
        z-index: 9999;
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease-out;
      }
    `
  });

  // Append cursor element to the DOM
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.classList.add('playwright-cursor');
    document.body.appendChild(cursor);
  });

  // Function to move cursor to an element and click
  async function moveCursorAndClick(locator: Locator) {
    const elementHandle = await locator.elementHandle();
    if (elementHandle) {
      const box = await elementHandle.boundingBox();
      if (box) {
        // Calculate the center position of the element
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
  
        // Update cursor position using evaluate to interact within the browser context
        await page.evaluate(({ x, y }) => {
          const cursor = document.querySelector('.playwright-cursor') as HTMLElement; // Correct type assertion
          if (cursor) {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
          }
        }, { x: centerX, y: centerY });
  
        // Perform the mouse move and click actions
        await page.mouse.move(centerX, centerY);
        await page.mouse.click(centerX, centerY);
      }
    }
  }
  

  // Click on Start Now button
  await page.waitForTimeout(2000);
  await moveCursorAndClick(page.getByRole('button', { name: 'Start Now!' }));

  // Login
  await page.waitForTimeout(2000);
  await moveCursorAndClick(page.getByPlaceholder('Username'));
  await page.getByPlaceholder('Username').fill('PwTest');
  await page.waitForTimeout(2000);
  await moveCursorAndClick(page.getByPlaceholder('Password'));
  await page.getByPlaceholder('Password').fill('hackme11');
  await page.waitForTimeout(2000);
  await moveCursorAndClick(page.getByRole('button', { name: 'Login' }));

  await page.waitForURL(`${baseURL}business`);
  await expect(page).toHaveURL(`${baseURL}business`);
  await page.waitForTimeout(2000);

  // Add Takeaway Entry
  await page.waitForTimeout(2000);
  await page.getByRole('combobox').selectOption('139');
  await page.waitForTimeout(1000);
  const addEntryButton = page.locator('div').filter({ hasText: /^ReservationWalk-inTakeawayDeliveryOrder PickupPaymentAdd$/ }).getByRole('button');
  await moveCursorAndClick(addEntryButton);
  addEntryButton.click()

  // Navigate to queue ticket page
  await page.waitForTimeout(2000);
  const ticketPromise = page.waitForEvent('popup');
  const ticketLink = page.getByRole('link', { name: 'https://queue-management-' });
  await moveCursorAndClick(ticketLink);
  await page.getByRole('link', { name: 'https://queue-management-' }).click();
  await page.waitForTimeout(1000);
  const ticketPage = await ticketPromise;
  await ticketPage.waitForTimeout(2000);

  // Bring the main page to front and navigate back to business page
  await page.bringToFront(); // Switch focus back to the main tab
  await page.goto(`${baseURL}business`);
  await page.waitForTimeout(3000);

  // Verify returned to the correct page
  await expect(page).toHaveURL(`${baseURL}business`);

  // Find all entries with "C<number>"
  const entries = await page.locator('div').filter({ hasText: /C\d+waitingcompletecancel$/ }).allTextContents();

  // Extract numbers from entries and find the smallest one
  const smallestEntry = entries
    .map((entry) => {
      const match = entry.match(/C(\d+)/); // Extract the number after "C"
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null)
    .sort((a, b) => a - b)[0];

  if (smallestEntry !== undefined) {
    const smallestEntryText = `C${smallestEntry}waitingcompletecancel`;
    // Click the waiting button for the smallest entry
    await page.locator('div').filter({ hasText: new RegExp(`^${smallestEntryText}$`) }).getByRole('button').click({ force: true });

    // Click the complete button in the dropdown
    await page.getByRole('button', { name: 'complete' }).click({ force: true });
  } else {
    console.log('No entries found matching the pattern.');
  }
  await page.waitForTimeout(2000);

  // Bring the ticket page to the front
  await ticketPage.bringToFront();
  await ticketPage.waitForTimeout(2000);
});
