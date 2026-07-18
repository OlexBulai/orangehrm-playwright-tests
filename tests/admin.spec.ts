import { test, expect } from './fixtures/authenticated.fixture';
import AdminPage from '../src/pages/admin-page';
import { faker } from '@faker-js/faker';

test.describe('OrangeHRM admin tests', () => {
  const username = faker.internet.username();
  const employeeName = faker.person.firstName() + ' ' + faker.person.lastName();
  test('Admin can fill System Users search form', async ({ page }) => {
    const adminPage = new AdminPage(page);

    await adminPage.openAdminPage();

    await adminPage.fillUsername(username);
    await adminPage.fillUserRole('Admin');
    await adminPage.fillEmployeeName(employeeName);
    await adminPage.fillStatus('Enabled');
    await expect(adminPage.usernameInput).toHaveValue(username);
    await expect(adminPage.userRoleDropdown).toContainText('Admin');
    await expect(adminPage.employeeNameInput).toHaveValue(employeeName);
    await expect(adminPage.statusDropdown).toContainText('Enabled');
  });
});
