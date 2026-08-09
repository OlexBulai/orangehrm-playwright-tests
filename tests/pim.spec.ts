import { test, expect } from './fixtures/pim.fixture';
import PimPage from '../src/pages/pim-page';
import { faker } from '@faker-js/faker';
import { baseUrl } from '../env';
import { createPimEmployee } from './helpers/pim-test-helpers';

test.describe('OrangeHRM PIM tests', () => {
  test.describe.configure({ mode: 'serial' });
  const employeeName = faker.person.firstName() + ' ' + faker.person.lastName();
  const employeeId = faker.number.int({ min: 1000, max: 9999 }).toString();
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  test('Admin can fill Employee Information search form', async ({ page }) => {
    const pimPage = new PimPage(page);
    await pimPage.openPimPage();
    await expect(page.getByRole('heading', { name: 'PIM' })).toBeVisible();

    await pimPage.fillEmployeeName(employeeName);
    await pimPage.fillSearchEmployeeId(employeeId);
  });

  test('Admin can search Employee List without changing data', async ({
    page,
  }) => {
    const pimPage = new PimPage(page);
    await pimPage.openPimPage();

    expect((await pimPage.searchEmployees()).ok()).toBeTruthy();
  });

  test('Admin can reset Employee Information filters', async ({ page }) => {
    const pimPage = new PimPage(page);
    await pimPage.openPimPage();
    await pimPage.fillSearchEmployeeId('temporary-id');
    await pimPage.resetButton.click();

    await expect(pimPage.searchEmployeeIdInput).toHaveValue('');
  });

  test(
    'Admin can create employee and search it in Employee List',
    {
      tag: '@mutation',
    },
    async ({ page }) => {
      const pimPage = new PimPage(page);
      let createdEmployeeNumber: number | undefined;

      try {
        await pimPage.openPimPage();
        await pimPage.clickAddButton();

        await expect(
          page.getByRole('heading', { name: 'Add Employee' }),
        ).toBeVisible();

        await pimPage.fillFirstName(firstName);
        await pimPage.fillLastName(lastName);
        await pimPage.fillAddEmployeeId(employeeId);

        const createResponsePromise = page.waitForResponse(
          (response) =>
            response.request().method() === 'POST' &&
            response.url().endsWith('/api/v2/pim/employees'),
        );
        await pimPage.clickSaveButton();
        const createResponse = await createResponsePromise;
        expect(createResponse.status()).toBe(200);
        const body = (await createResponse.json()) as {
          data: { empNumber: number };
        };
        createdEmployeeNumber = body.data.empNumber;

        await expect(
          page.getByRole('heading', { name: 'Personal Details' }),
        ).toBeVisible();
        await pimPage.openEmployeeList();

        await pimPage.fillSearchEmployeeId(employeeId);
        await pimPage.clickSearchButton();
        await expect(page.getByText(employeeId)).toBeVisible();
      } finally {
        if (createdEmployeeNumber !== undefined) {
          const deleteResponse = await page.request.delete(
            `${baseUrl}/api/v2/pim/employees`,
            { data: { ids: [createdEmployeeNumber] } },
          );
          expect(deleteResponse.status()).toBe(200);
        }
      }
    },
  );

  test(
    'Admin can edit and delete an employee through UI',
    { tag: '@mutation' },
    async ({ page, createEmployeeThroughApi, pimCleanup }) => {
      const original = createPimEmployee('ui-original');
      const updated = {
        ...createPimEmployee('ui-updated'),
        employeeId: original.employeeId,
      };
      const employeeNumber = await createEmployeeThroughApi(original);
      const pimPage = new PimPage(page);

      await pimPage.openPimPage();
      await pimPage.fillSearchEmployeeId(original.employeeId);
      await pimPage.clickSearchButton();
      await pimPage.openEmployeeDetails(original.employeeId);

      await pimPage.personalDetails.fillEmployeeName(updated);
      await pimPage.personalDetails.savePersonalDetails();

      await pimPage.openEmployeeList();
      await pimPage.fillSearchEmployeeId(original.employeeId);
      await pimPage.clickSearchButton();
      await pimPage.expectEmployeeInList(
        original.employeeId,
        updated.firstName,
        updated.lastName,
      );

      await pimPage.deleteEmployee(original.employeeId);
      pimCleanup.forget(employeeNumber);
    },
  );
});
