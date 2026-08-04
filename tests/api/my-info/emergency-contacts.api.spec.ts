import {
  expect,
  test,
} from '../../fixtures/my-info/emergency-contacts.fixture';
import { createEmergencyContact } from '../../helpers/my-info/emergency-contact-test-helpers';

test.describe('Emergency Contacts API', { tag: '@mutation' }, () => {
  test('supports the Emergency Contact CRUD lifecycle', async ({
    emergencyContactApi,
    emergencyContactCleanup,
    employeeId,
  }) => {
    const original = createEmergencyContact();
    const updated = createEmergencyContact();
    const id = await emergencyContactApi.create(employeeId, original);
    emergencyContactCleanup.track(id);

    expect(
      (await emergencyContactApi.getAll(employeeId)).find(
        (x) => Number(x.id) === id,
      ),
    ).toMatchObject({
      name: original.name,
      relationship: original.relationship,
    });
    await emergencyContactApi.update(employeeId, id, updated);
    expect(
      (await emergencyContactApi.getAll(employeeId)).find(
        (x) => Number(x.id) === id,
      ),
    ).toMatchObject({
      name: updated.name,
      relationship: updated.relationship,
      mobilePhone: updated.mobilePhone,
    });

    await emergencyContactApi.delete(employeeId, [id]);
    emergencyContactCleanup.forget(id);
    expect(
      (await emergencyContactApi.getAll(employeeId)).some(
        (x) => Number(x.id) === id,
      ),
    ).toBe(false);
  });

  test('rejects an Emergency Contact without required data', async ({
    emergencyContactApi,
    employeeId,
  }) => {
    const response = await emergencyContactApi.createResponse(employeeId, {
      name: '',
      relationship: '',
      homePhone: '',
      mobilePhone: '',
      workPhone: '',
    });
    expect(response.status()).toBe(422);
  });
});
