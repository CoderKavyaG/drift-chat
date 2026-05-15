import { test, expect } from '@playwright/test';

test.describe('Drift Chat Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the local development server
    await page.goto('http://localhost:5173');
  });

  test('should display the main headline', async ({ page }) => {
    await expect(page.getByText('ANONYMOUS VIDEO CHAT')).toBeVisible();
  });

  test('should show user identity in the navbar', async ({ page }) => {
    // The name is generated randomly, so we just check for the pattern #\d{4}
    const identityBadge = page.locator('header').getByText(/#\d{4}/);
    await expect(identityBadge).toBeVisible();
  });

  test('should navigate to a room when "Start Drifting" is clicked', async ({ page }) => {
    const startButton = page.getByRole('button', { name: 'Start Drifting' });
    await expect(startButton).toBeVisible();
    
    await startButton.click();
    
    // Should navigate to /room/[uuid]
    await expect(page).toHaveURL(/\/room\/[a-f0-9-]+/);
    
    // Verify room elements are visible
    await expect(page.getByText(/1 person|people/i)).toBeVisible();
    await expect(page.getByLabelText('Mute')).toBeVisible();
  });

  test('should open settings modal when Settings button is clicked in the room', async ({ page }) => {
    // Go to a room first
    await page.getByRole('button', { name: 'Start Drifting' }).click();
    
    const settingsButton = page.getByLabelText('Settings');
    await settingsButton.click();
    
    // Verify modal is open
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByText('Camera Source')).toBeVisible();
    await expect(page.getByText('Audio Input')).toBeVisible();
  });
});
