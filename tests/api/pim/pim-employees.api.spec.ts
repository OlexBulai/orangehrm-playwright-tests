import { expect, test } from '../../fixtures/pim.fixture';
import { createPimEmployee } from '../../helpers/pim-test-helpers';

test.describe('PIM Employees API', { tag: '@mutation' }, () => {
  test('supports the Employee CRUD lifecycle', async ({
    createEmployeeThroughApi,
    pimApi,
    pimCleanup,
  }) => {
    const original = createPimEmployee('Original');
    const employeeNumber = await createEmployeeThroughApi(original);

    await expect
      .poll(() => pimApi.getEmployeeByEmployeeId(original.employeeId))
      .toMatchObject({ ...original, empNumber: employeeNumber });

    const updated = {
      ...createPimEmployee('Updated'),
      employeeId: original.employeeId,
    };
    await pimApi.updateEmployee(employeeNumber, updated);

    await expect
      .poll(() => pimApi.getEmployeeByEmployeeId(original.employeeId))
      .toMatchObject({ ...updated, empNumber: employeeNumber });

    await pimApi.deleteEmployees([employeeNumber]);
    pimCleanup.forget(employeeNumber);

    await expect
      .poll(() => pimApi.getEmployeeByEmployeeId(original.employeeId))
      .toBeUndefined();
  });
});
