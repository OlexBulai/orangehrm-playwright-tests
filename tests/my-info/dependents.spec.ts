import { test, expect } from '../fixtures/my-info/dependents.fixture';
import { createChildDependent } from '../helpers/my-info/dependent-test-helpers';

test.describe('My Info Dependents tests', () => {
  test('User can open Dependents', async ({ myInfoPage }) => {
    await myInfoPage.openDependents();

    await expect(myInfoPage.page).toHaveURL(/viewDependents\/empNumber\/\d+/);
  });

  test.describe('Dependent mutations', { tag: '@mutation' }, () => {
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

      const saved = await myInfoPage.dependents.addDependent(dependent);
      dependentCleanup.track(Number(saved.data.id));

      await myInfoPage.dependents.expectDependent(dependent);
      expect(saved.data).toMatchObject({
        name: dependent.name,
        relationshipType: 'child',
      });
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
