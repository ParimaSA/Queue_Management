import { test, expect } from '@playwright/test';

test('Check components on Home page', async ({ page }) => {
  await page.goto('https://queue-management-taupe.vercel.app');

  const queueHeading = page.locator('h1', { hasText: 'Queue' });
  await expect(queueHeading).toBeVisible();

  const managementHeading = page.locator('span.text-green3', { hasText: 'Management' });
  await expect(managementHeading).toBeVisible();

  const paragraphText = page.locator('p', { hasText: 'Keep your business organized and your customers happy' });
  await expect(paragraphText).toBeVisible();

  // Test button
  const startNowButton = page.locator('button', { hasText: 'Start Now!' });
  await expect(startNowButton).toBeVisible();
  await startNowButton.click();

  await expect(page).toHaveURL('https://queue-management-taupe.vercel.app/business/login');
  await page.goBack();

  const sectionHeading = page.locator('h2', { hasText: 'Why Choose Our Solution?' });
  await expect(sectionHeading).toBeVisible();

  const efficiencyCard = page.locator('div.bg-white.p-6.rounded-lg.shadow-lg h3', { hasText: 'Efficiency' });
  await expect(efficiencyCard).toBeVisible();

  const customerSatisfactionCard = page.locator('div.bg-white.p-6.rounded-lg.shadow-lg h3', { hasText: 'Customer Satisfaction' });
  await expect(customerSatisfactionCard).toBeVisible();

  const dataInsightsCard = page.locator('div.bg-white.p-6.rounded-lg.shadow-lg h3', { hasText: 'Data Insights' });
  await expect(dataInsightsCard).toBeVisible();

  const efficiencyDetail = page.locator('div.bg-white.p-6.rounded-lg.shadow-lg p', { hasText: 'Streamline your queue management' });
  await expect(efficiencyDetail).toBeVisible();

  const customerSatisfactionDetail = page.locator('div.bg-white.p-6.rounded-lg.shadow-lg p', { hasText: 'Ensure a smooth and pleasant experience' });
  await expect(customerSatisfactionDetail).toBeVisible();

  const dataInsightsDetail = page.locator('div.bg-white.p-6.rounded-lg.shadow-lg', { hasText: 'Access real-time data to make informed decisions' });
  await expect(dataInsightsDetail).toBeVisible();
});
