import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import MyInfoPage from '../src/pages/my-info-page';
import { usernameLogin, passwordLogin, baseUrl } from '../env';

test.describe('OrangeHRM auth tests', () => {
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
  test('User can navigate through My Info tabs', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const myInfoPage = new MyInfoPage(page);
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
    await myInfoPage.openMyInfo();
    await myInfoPage.openContactDetails();
    await expect(page).toHaveURL(/contactDetails/);
    await myInfoPage.expectContactDetailsVisible();
    await myInfoPage.openEmergencyContacts();
    await expect(page).toHaveURL(/viewEmergencyContacts/);
    await myInfoPage.expectEmergencyContactsVisible();
    await myInfoPage.openDependents();
    await expect(page).toHaveURL(/viewDependents/);
    await myInfoPage.expectDependentsVisible();
    await myInfoPage.openImmigration();
    await expect(page).toHaveURL(/viewImmigration/);
    await myInfoPage.expectImmigrationVisible();
    await myInfoPage.openJob();
    await expect(page).toHaveURL(/viewJob/);
    await myInfoPage.expectJobVisible();
    await myInfoPage.openSalary();
    await expect(page).toHaveURL(/viewSalary/);
    await myInfoPage.expectSalaryVisible();
    await myInfoPage.openReportTo();
    await expect(page).toHaveURL(/viewReportTo/);
    await myInfoPage.expectReportToVisible();
    await myInfoPage.openQualifications();
    await expect(page).toHaveURL(/viewQualifications/);
    await myInfoPage.expectQualificationsVisible();
    await myInfoPage.openMembership();
    await expect(page).toHaveURL(/viewMembership/);
    await myInfoPage.expectMembershipVisible();
  });
});
