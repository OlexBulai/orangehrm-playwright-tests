import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';

import { usernameLogin, passwordLogin } from '../env';
import MainMenuPage from '../src/pages/main-menu-page';

test.describe('OrangeHRM auth tests', () => {
  let loginPage: LoginPage;
  let mainMenuPage: MainMenuPage;

  test.beforeEach('Navigate to login page', async ({ page }) => {
    loginPage = new LoginPage(page);
    mainMenuPage = new MainMenuPage(page);
    await loginPage.open();
  });

  test('User can navigate through main menu tabs', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const mainMenuPage = new MainMenuPage(page);

    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
    await mainMenuPage.openAdmin();
    await expect(page).toHaveURL(/admin/);
    await mainMenuPage.openPIM();
    await expect(page).toHaveURL(/pim/);
    await mainMenuPage.openLeave();
    await expect(page).toHaveURL(/leave/);
    await mainMenuPage.openTime();
    await expect(page).toHaveURL(/time/);
    await mainMenuPage.openRecruitment();
    await expect(page).toHaveURL(/recruitment/);
    await mainMenuPage.openMyInfo();
    await expect(page).toHaveURL(/viewPersonalDetails/);
    await mainMenuPage.openPerformance();
    await expect(page).toHaveURL(/performance/);
    await mainMenuPage.openDashboard();
    await expect(page).toHaveURL(/dashboard/);
    await mainMenuPage.openDirectory();
    await expect(page).toHaveURL(/directory/);
    await mainMenuPage.openMaintenance();
    await mainMenuPage.confirmMaintenancePassword(passwordLogin);
    await expect(page).toHaveURL(/maintenance/);
    await mainMenuPage.openBuzz();
    await expect(page).toHaveURL(/buzz/);
    await mainMenuPage.openClaim();
    await expect(page).toHaveURL(/claim/);
  });
});
