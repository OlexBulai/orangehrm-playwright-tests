import { expect, test } from '../../fixtures/admin/pay-grades.fixture';
import { createPayGrade } from '../../helpers/admin/pay-grades-test-helpers';

test.describe('Pay Grades API', { tag: '@mutation' }, () => {
  test('supports the Pay Grade CRUD lifecycle', async ({
    createPayGradeThroughApi,
    payGradeCleanup,
    payGradesApi,
  }) => {
    const original = createPayGrade('api-original');
    const updated = createPayGrade('api-updated');
    const id = await createPayGradeThroughApi(original);

    expect(await payGradesApi.getPayGradeIdByName(original.name)).toBe(id);
    await payGradesApi.updatePayGrade(id, updated);
    expect(await payGradesApi.getPayGradeIdByName(updated.name)).toBe(id);

    await payGradesApi.deletePayGrades([id]);
    payGradeCleanup.forget(id);
    expect((await payGradesApi.getPayGrades()).some((x) => x.id === id)).toBe(
      false,
    );
  });

  test('rejects an empty Pay Grade name', async ({ payGradesApi }) => {
    const response = await payGradesApi.createPayGradeResponse({ name: '' });
    expect(response.status()).toBe(422);
  });
});
