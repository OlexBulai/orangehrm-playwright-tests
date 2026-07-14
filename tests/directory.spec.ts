import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import DirectoryPage from '../src/pages/directory-page';
import { usernameLogin, passwordLogin } from '../env';
import { Page } from '@playwright/test';

test.describe('Directory Page', () => {
  let directoryPage: DirectoryPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
    directoryPage = new DirectoryPage(page);
  });

  test('Admin can open Directory page', async () => {
    await directoryPage.open();
    await expect(directoryPage.directoryHeading).toBeVisible();
    
  });

  test('Admin can search employee by name', async () => {
    await directoryPage.open();
    await directoryPage.fillEmployeeName('JoyToy  SmithSmith');
    await expect(directoryPage.directoryHeading).toBeVisible();
  });
});
