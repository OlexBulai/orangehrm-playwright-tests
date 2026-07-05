import { test, expect } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import PimPage from '../src/pages/pim-page';
import { usernameLogin, passwordLogin } from '../env';
import { faker } from '@faker-js/faker';

test.describe('OrangeHRM PIM tests', () => {
  const employeeName = faker.person.firstName() + ' ' + faker.person.lastName();
  const employeeId = faker.number.int({ min: 1000, max: 9999 }).toString();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  test.beforeEach('Navigate to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
  });
  test('Admin can fill Employee Information search form', async ({ page }) => {
    const pimPage = new PimPage(page);
    await pimPage.openPimPage();
    await expect(page.getByRole('heading', { name: 'PIM' })).toBeVisible();

    await pimPage.fillEmployeeName(employeeName);
    await pimPage.fillSearchEmployeeId(employeeId);
  });

  test('Admin can create employee and search it in Employee List', async ({
    page,
  }) => {
    const pimPage = new PimPage(page);

    await pimPage.openPimPage();
    await pimPage.clickAddButton();

    await expect(
      page.getByRole('heading', { name: 'Add Employee' }),
    ).toBeVisible();

    await pimPage.fillFirstName(firstName);
    await pimPage.fillLastName(lastName);
    await pimPage.fillAddEmployeeId(employeeId);

    await pimPage.clickSaveButton();
    await expect(
      page.getByRole('heading', { name: 'Personal Details' }),
    ).toBeVisible();
    await pimPage.openEmployeeList();

    await pimPage.fillSearchEmployeeId(employeeId);
    await pimPage.clickSearchButton();

    await expect(page.getByText(employeeId)).toBeVisible();
    
  });
});
