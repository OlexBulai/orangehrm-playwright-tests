import { test, expect } from './fixtures/my-info-dependents.fixture';
import {
  createChildDependent,
  createOtherDependent,
} from './helpers/dependent-test-helpers';

test.describe('My Info Dependents tests', () => {
  test('User can open Dependents', async ({ myInfoPage }) => {
    await myInfoPage.openDependents();

    await expect(myInfoPage.page).toHaveURL(/viewDependents\/empNumber\/\d+/);
  });

  test.describe('Dependent mutations', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'The shared demo user must not be updated concurrently by browser projects.',
    );

    test.beforeEach(async ({ myInfoPage }) => {
      await myInfoPage.openDependents();
    });

    test('User can add a child dependent', async ({
      myInfoPage,
      dependentCleanup,
    }) => {
      const dependent = createChildDependent();

      const saved = await myInfoPage.dependents.add(dependent);
      dependentCleanup.track(Number(saved.data.id));

      await myInfoPage.dependents.expectDependent(dependent);
      expect(saved.data).toMatchObject({
        name: dependent.name,
        relationshipType: 'child',
      });
    });

    test('User can add a dependent with custom relationship', async ({
      myInfoPage,
      dependentCleanup,
    }) => {
      const dependent = createOtherDependent();

      const saved = await myInfoPage.dependents.add(dependent);
      dependentCleanup.track(Number(saved.data.id));

      await myInfoPage.dependents.expectDependent(dependent);
      expect(saved.data).toMatchObject({
        name: dependent.name,
        relationshipType: 'other',
        relationship: dependent.relationship,
      });
    });

    test('User can edit a dependent', async ({
      myInfoPage,
      dependentSetup,
    }) => {
      const original = createChildDependent();
      await dependentSetup.create(original);
      const updated = createOtherDependent();

      const saved = await myInfoPage.dependents.edit(original.name, updated);

      expect(saved.requestData).toMatchObject({
        name: updated.name,
        relationshipType: 'other',
        relationship: updated.relationship,
      });
    });

    test('User can delete a dependent', async ({
      myInfoPage,
      dependentSetup,
      dependentCleanup,
    }) => {
      const dependent = createChildDependent();
      const id = await dependentSetup.create(dependent);

      await myInfoPage.dependents.delete(dependent.name);
      dependentCleanup.forget(id);
    });
  });

  test('User cannot add a dependent without required fields', async ({
    myInfoPage,
  }) => {
    await myInfoPage.openDependents();
    await myInfoPage.dependents.openAddForm();

    await myInfoPage.dependents.saveEmptyForm();

    await myInfoPage.dependents.expectRequiredErrors();
  });
});
