import { expect, test } from '../../fixtures/my-info/dependents.fixture';
import {
  createChildDependent,
  createOtherDependent,
} from '../../helpers/my-info/dependent-test-helpers';

test.describe('Dependents API', { tag: '@mutation' }, () => {
  test('supports the Dependent CRUD lifecycle', async ({
    dependentApi,
    dependentCleanup,
    employeeId,
  }) => {
    const original = createChildDependent();
    const updated = createOtherDependent();
    const id = await dependentApi.create(employeeId, original);
    dependentCleanup.track(id);

    expect(
      (await dependentApi.getAll(employeeId)).find((x) => Number(x.id) === id),
    ).toMatchObject({
      name: original.name,
      relationshipType: 'child',
    });
    await dependentApi.update(employeeId, id, updated);
    expect(
      (await dependentApi.getAll(employeeId)).find((x) => Number(x.id) === id),
    ).toMatchObject({
      name: updated.name,
      relationshipType: 'other',
      relationship: updated.relationship,
    });

    await dependentApi.delete(employeeId, [id]);
    dependentCleanup.forget(id);
    expect(
      (await dependentApi.getAll(employeeId)).some((x) => Number(x.id) === id),
    ).toBe(false);
  });
});
