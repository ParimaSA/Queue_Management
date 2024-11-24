import { test, expect } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'https://queue-management-taupe.vercel.app/';

test('Business Owner Login and Check Profile', async ({ page }) => {
  await page.goto(`${baseURL}`);
  
  // Click on Start Now button
  await page.getByRole('button', { name: 'Start Now!' }).click();

  // Login
  await page.getByPlaceholder('Username').fill('PwTest');
  await page.getByPlaceholder('Password').fill('hackme11');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL(`${baseURL}business`);
  await expect(page).toHaveURL(`${baseURL}business`);

  // Go to the profile page
  await page.getByText('Account').click();
  await page.getByRole('link', { name: 'Profile' }).click();

  await page.waitForURL(`${baseURL}business/profile`);
  await expect(page).toHaveURL(`${baseURL}business/profile`);

  // Have business name
  const element = page.locator('text="PwRestaurant"');
  await expect(element).toBeVisible();
  await expect(element).toHaveText('PwRestaurant');

  // Check "Top 3 Queues" text
  const top3QueuesText = page.getByText('Top 3 Queues');
  await expect(top3QueuesText).toBeVisible();

  // Check "Entry Status"
  const entryStatusHeading = page.getByRole('heading', { name: 'Entry Status' });
  await expect(entryStatusHeading).toBeVisible();

  // Check if the image inside the tabpanel is visible
  const imageInTabPanel = page.getByRole('tabpanel').getByRole('img');
  await expect(imageInTabPanel).toBeVisible();

  // Check Summary checkbox
  const summaryCheckbox = page.getByLabel('Summary');
  await expect(summaryCheckbox).toBeVisible();

  // Check Time checkbox
  const timeCheckbox = page.getByLabel('Time', { exact: true });
  await expect(timeCheckbox).toBeVisible();
  await timeCheckbox.click()

  // Check "Time Slot Entries Chart" heading
  const timeSlotEntriesChartHeading = page.getByRole('heading', { name: 'Time Slot Entries Chart' });
  await expect(timeSlotEntriesChartHeading).toBeVisible();

  // Check if the first canvas inside the tabpanel is visible
  const firstCanvasInTimeSlotEntriesChart = page.getByRole('tabpanel').locator('canvas').first();
  await expect(firstCanvasInTimeSlotEntriesChart).toBeVisible();

  // Check "Waiting Time by Time Slot" heading
  const waitingTimeByTimeSlotHeading = page.getByRole('heading', { name: 'Waiting Time by Time Slot' });
  await expect(waitingTimeByTimeSlotHeading).toBeVisible();

  // Check if the second canvas inside the tabpanel is visible
  const secondCanvasInWaitingTimeByTimeSlot = page.getByRole('tabpanel').locator('canvas').nth(1);
  await expect(secondCanvasInWaitingTimeByTimeSlot).toBeVisible();

  // Check Day checkbox
  const dayCheckbox = page.getByLabel('Day');
  await expect(dayCheckbox).toBeVisible();
  await dayCheckbox.click()

  // Check "Average Weekly Entries Chart" heading
  const averageWeeklyEntriesChartHeading = page.getByRole('heading', { name: 'Average Weekly Entries Chart' });
  await expect(averageWeeklyEntriesChartHeading).toBeVisible();

  // Check if the first canvas inside the tabpanel for Weekly Entries Chart is visible
  const firstCanvasInAverageWeeklyEntriesChart = page.getByRole('tabpanel').locator('canvas').first();
  await expect(firstCanvasInAverageWeeklyEntriesChart).toBeVisible();

  // Check "Waiting Time by Day Chart" heading
  const waitingTimeByDayChartHeading = page.getByRole('heading', { name: 'Waiting Time by Day Chart' });
  await expect(waitingTimeByDayChartHeading).toBeVisible();

  // Check if the second canvas inside the tabpanel for Waiting Time by Day Chart is visible
  const secondCanvasInWaitingTimeByDayChart = page.getByRole('tabpanel').locator('canvas').nth(1);
  await expect(secondCanvasInWaitingTimeByDayChart).toBeVisible();

  // Check Queue checkbox
  const queueCheckbox = page.getByLabel('Queue');
  await expect(queueCheckbox).toBeVisible();
  await queueCheckbox.click()

  // Check "Queue Entries Chart" heading
  const queueEntriesChartHeading = page.getByRole('heading', { name: 'Queue Entries Chart' });
  await expect(queueEntriesChartHeading).toBeVisible();

  // Check if the first canvas inside the tabpanel for Queue Entries Chart is visible
  const firstCanvasInQueueEntriesChart = page.getByRole('tabpanel').locator('canvas').first();
  await expect(firstCanvasInQueueEntriesChart).toBeVisible();

  // Check "Waiting Time by Queue Chart" heading
  const waitingTimeByQueueChartHeading = page.getByRole('heading', { name: 'Waiting Time by Queue Chart' });
  await expect(waitingTimeByQueueChartHeading).toBeVisible();

  // Check if the second canvas inside the tabpanel for Waiting Time by Queue Chart is visible
  const secondCanvasInWaitingTimeByQueueChart = page.getByRole('tabpanel').locator('canvas').nth(1);
  await expect(secondCanvasInWaitingTimeByQueueChart).toBeVisible();
});