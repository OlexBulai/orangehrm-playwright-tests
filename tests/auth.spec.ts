import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import { baseUrl, usernameLogin, passwordLogin } from '../env';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('OrangeHRM auth tests', { tag: '@auth' }, () => {
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

  test('Login shows validation for empty credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.clickLoginButton();

    await expect(page.getByText('Required')).toHaveCount(2);
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('Login rejects invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillUsername('invalid-user');
    await loginPage.fillPassword('invalid-password');
    await loginPage.clickLoginButton();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('User can open and cancel password reset', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.openForgotPassword();

    await expect(page).toHaveURL(/auth\/requestPasswordResetCode/);
    await expect(loginPage.resetPasswordHeading).toBeVisible();

    await loginPage.cancelPasswordReset();

    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.locator(loginPage.loginButton)).toBeVisible();
  });

  test('Password reset requires a username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.openForgotPassword();

    await loginPage.submitPasswordReset();

    await expect(page.getByText('Required', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/auth\/requestPasswordResetCode/);
  });

  test('Dashboard redirects an unauthenticated user to Login', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await page.goto(`${baseUrl}/dashboard/index`);

    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.locator(loginPage.loginButton)).toBeVisible();
  });

  test('User can log out', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
    await expect(page).toHaveURL(/dashboard/);

    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.locator(loginPage.loginButton)).toBeVisible();
  });
});
