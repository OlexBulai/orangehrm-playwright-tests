import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import MyInfoPage from '../src/pages/my-info-page';

test.describe('OrangeHRM auth tests', () => {
  const usernameLogin = 'Admin';
  const passwordLogin = 'admin123';
  const dashboardTitle = 'h6';

  test.beforeEach('Navigate to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
  });
  test('Login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
    await expect(
      page.locator(dashboardTitle).getByText('Dashboard'),
    ).toBeVisible();
  });
  test('User can open My Info page after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myInfoPage = new MyInfoPage(page);
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
    await myInfoPage.openMyInfo();
    await expect(page).toHaveURL(/viewPersonalDetails/);
    await myInfoPage.expectPersonalDetailsVisible();
  });
  test('User can open Contact Details from My Info page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myInfoPage = new MyInfoPage(page);
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
    await myInfoPage.openMyInfo();
    await myInfoPage.openContactDetails();
    await expect(page).toHaveURL(/contactDetails/);
    await myInfoPage.expectContactDetailsVisible();
  });
});
