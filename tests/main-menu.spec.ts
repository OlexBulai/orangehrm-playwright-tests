import { passwordLogin } from '../env';
import { mainMenuItems } from '../src/pages/main-menu-page';
import { test, expect } from './fixtures/main-menu.fixture';
import { apiCases, navigationCases } from './helpers/main-menu-test-data';

test.describe('Main menu tests', () => {
  test('Main menu shows all items in the correct order', async ({
    mainMenuPage,
  }) => {
    await mainMenuPage.expectItemsInOrder();

    for (const name of mainMenuItems) {
      await expect(mainMenuPage.item(name)).toBeVisible();
    }
  });

  test('User can navigate through main menu sections', async ({
    page,
    mainMenuPage,
  }) => {
    for (const navigation of navigationCases) {
      await test.step(`Open ${navigation.name}`, async () => {
        await mainMenuPage.open(navigation.name);
        await expect(page).toHaveURL(navigation.url);
        await expect(
          page
            .getByRole('heading', {
              name: navigation.heading,
              exact: true,
            })
            .first(),
        ).toBeVisible();
      });
    }
  });

  test('Key menu sections load their API data', async ({
    page,
    mainMenuPage,
  }) => {
    for (const apiCase of apiCases) {
      await test.step(`${apiCase.name} API responds successfully`, async () => {
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(apiCase.apiPath) &&
            response.request().method() === 'GET',
        );

        await mainMenuPage.open(apiCase.name);
        const response = await responsePromise;

        expect(response.ok()).toBeTruthy();
      });
    }
  });

  test('User can confirm access to Maintenance', async ({
    page,
    mainMenuPage,
  }) => {
    await mainMenuPage.open('Maintenance');
    await expect(page).toHaveURL(/maintenance\/purgeEmployee/);

    await mainMenuPage.confirmMaintenancePassword(passwordLogin);

    await expect(page).toHaveURL(/maintenance\/purgeEmployee/);
    await expect(
      page.getByRole('heading', { name: 'Purge Employee Records' }),
    ).toBeVisible();
  });
});
