import { expect, test } from '../../fixtures/my-info/immigration.fixture';
import {
  createPassport,
  createVisa,
} from '../../helpers/my-info/immigration-test-helpers';

test.describe('Immigration API', { tag: '@mutation' }, () => {
  test('supports the Immigration CRUD lifecycle', async ({
    employeeId,
    immigrationApi,
    immigrationCleanup,
  }) => {
    const original = createPassport();
    const updated = createVisa();
    const id = await immigrationApi.create(employeeId, original);
    immigrationCleanup.track(id);

    expect(
      (await immigrationApi.getAll(employeeId)).find(
        (x) => Number(x.id) === id,
      ),
    ).toMatchObject({
      number: original.number,
      type: 1,
    });
    await immigrationApi.update(employeeId, id, updated);
    expect(
      (await immigrationApi.getAll(employeeId)).find(
        (x) => Number(x.id) === id,
      ),
    ).toMatchObject({
      number: updated.number,
      type: 2,
    });

    await immigrationApi.delete(employeeId, [id]);
    immigrationCleanup.forget(id);
    expect(
      (await immigrationApi.getAll(employeeId)).some(
        (x) => Number(x.id) === id,
      ),
    ).toBe(false);
  });

  test('rejects an Immigration document without a number', async ({
    employeeId,
    immigrationApi,
  }) => {
    const response = await immigrationApi.createResponse(employeeId, {
      ...createPassport(),
      number: '',
    });
    expect(response.status()).toBe(422);
  });
});
