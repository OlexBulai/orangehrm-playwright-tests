import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import AdminPage from '../src/pages/admin-page';
import { usernameLogin, passwordLogin, baseUrl } from '../env';
import { faker } from '@faker-js/faker';

test.describe('OrangeHRM admin tests', () => {
  const username = faker.internet.username();
  const employeeName = faker.person.firstName() + ' ' + faker.person.lastName();
  test.beforeEach('Navigate to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
  });

  test('Admin can fill System Users search form', async ({ page }) => {
    const adminPage = new AdminPage(page);

    await adminPage.openAdminPage();

    await adminPage.fillUsername(username);
    await adminPage.fillUserRole('Admin');
    await adminPage.fillEmployeeName(employeeName);
    await adminPage.fillStatus('Enabled');
  });
});
