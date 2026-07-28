import { test, expect } from './fixtures/shared/authenticated.fixture';
import DirectoryPage from '../src/pages/directory-page';

test.describe('Directory Page', () => {
  let directoryPage: DirectoryPage;

  test.beforeEach(async ({ page }) => {
    directoryPage = new DirectoryPage(page);
  });

  test('Admin can open Directory page', async () => {
    await directoryPage.open();
    await expect(directoryPage.directoryHeading).toBeVisible();
  });

  test('Admin can fill employee name search field', async () => {
    await directoryPage.open();
    await directoryPage.fillEmployeeName('JoyToy  SmithSmith');
    await expect(directoryPage.employeeNameInput).toHaveValue(
      'JoyToy  SmithSmith',
    );
    await expect(directoryPage.directoryHeading).toBeVisible();
  });

  test('Admin can search Directory without changing data', async () => {
    await directoryPage.open();

    expect((await directoryPage.search()).ok()).toBeTruthy();
  });

  test('Admin can reset Directory filters', async () => {
    await directoryPage.open();
    await directoryPage.selectFirstJobTitle();
    await expect(directoryPage.jobTitleSelect).not.toContainText('Select');

    await directoryPage.resetButton.click();

    await expect(directoryPage.jobTitleSelect).toContainText('Select');
  });
});
