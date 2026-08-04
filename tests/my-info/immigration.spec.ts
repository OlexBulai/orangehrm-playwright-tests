import { test, expect } from '../fixtures/my-info/immigration.fixture';
import { createPassport } from '../helpers/my-info/immigration-test-helpers';

test.describe('My Info Immigration tests', () => {
  test('User can open Immigration', async ({ myInfoPage }) => {
    await myInfoPage.openImmigration();

    await expect(myInfoPage.page).toHaveURL(/viewImmigration\/empNumber\/\d+/);
  });

  test.describe('Immigration mutations', { tag: '@mutation' }, () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'The shared demo user must not be updated concurrently by browser projects.',
    );

    test.beforeEach(async ({ myInfoPage }) => {
      await myInfoPage.openImmigration();
    });

    test('User can add a passport', async ({
      myInfoPage,
      immigrationCleanup,
    }) => {
      const passport = createPassport();

      const saved =
        await myInfoPage.immigration.addImmigrationDocument(passport);
      immigrationCleanup.track(Number(saved.data.id));

      await myInfoPage.immigration.expectDocument(passport);
      expect(saved.data).toMatchObject({
        number: passport.number,
        type: 1,
        country: passport.issuedBy,
      });
    });
  });

  test('User cannot add an immigration document without its number', async ({
    myInfoPage,
  }) => {
    await myInfoPage.openImmigration();
    await myInfoPage.immigration.openAddForm();

    await myInfoPage.immigration.saveEmptyForm();

    await myInfoPage.immigration.expectRequiredError();
  });
});
