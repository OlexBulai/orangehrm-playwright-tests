import { test, expect } from '../fixtures/admin/pay-grades.fixture';
import { createPayGrade } from '../helpers/admin/pay-grades-test-helpers';

test.describe('OrangeHRM Admin Pay Grades tests', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ payGrades }) => {
    await payGrades.openPayGrades();
  });

  test('Admin can open Pay Grades', async ({ page, payGrades }) => {
    await expect(page).toHaveURL(/admin\/viewPayGrades/);
    await expect(payGrades.heading).toBeVisible();
  });

  test('Pay Grades table has expected columns', async ({ payGrades }) => {
    await payGrades.expectColumns();
  });

  test('Pay Grades table matches API data', async ({
    payGrades,
    payGradesApi,
  }) => {
    await payGrades.expectRecords(await payGradesApi.getPayGrades());
  });

  test.describe('Pay Grade mutations', { tag: '@mutation' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'Shared demo data must not be changed concurrently by browser projects.',
    );

    test('Admin can add a Pay Grade', async ({
      payGrades,
      payGradesApi,
      payGradeCleanup,
    }) => {
      const data = createPayGrade();
      await payGrades.addPayGrade(data);
      const id = await payGradesApi.getPayGradeIdByName(data.name);
      payGradeCleanup.track(id);
      await payGrades.openPayGrades();
      await payGrades.expectPayGrade(data);
    });

    test('Admin can edit and delete a Pay Grade', async ({
      page,
      payGrades,
      payGradeCleanup,
      createPayGradeThroughApi,
    }) => {
      const original = createPayGrade('ui-original');
      const updated = createPayGrade('ui-updated');
      const id = await createPayGradeThroughApi(original);
      await page.reload();

      await payGrades.editPayGrade(original.name, updated);
      await payGrades.openPayGrades();
      await payGrades.expectPayGrade(updated);
      await payGrades.deletePayGrade(updated.name);
      payGradeCleanup.forget(id);
    });

    test('Pay Grade name is required', async ({ payGrades }) => {
      await payGrades.expectRequiredNameValidation();
    });
  });
});
