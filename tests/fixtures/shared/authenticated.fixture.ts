import { expect, test as base } from '@playwright/test';
import { baseUrl, passwordLogin, usernameLogin } from '../../../env';
import LoginPage from '../../../src/pages/login-page';

type AuthenticatedFixtures = {
  authenticated: void;
};

export const test = base.extend<AuthenticatedFixtures>({
  authenticated: [
    async ({ page }, use) => {
      if (process.env.CI) {
        await page.goto(`${baseUrl}/dashboard/index`);
        if (!/dashboard/.test(page.url())) {
          const loginPage = new LoginPage(page);
          await loginPage.fillUsername(usernameLogin);
          await loginPage.fillPassword(passwordLogin);
          await loginPage.clickLoginButton();
          await expect(page).toHaveURL(/dashboard/, { timeout: 60_000 });
          await page
            .context()
            .storageState({ path: 'playwright/.auth/user.json' });
        }
        await use();
        return;
      }

      const loginPage = new LoginPage(page);
      await loginPage.open();
      await loginPage.fillUsername(usernameLogin);
      await loginPage.fillPassword(passwordLogin);
      await loginPage.clickLoginButton();
      await expect(page).toHaveURL(/dashboard/, { timeout: 20_000 });
      await use();
    },
    { auto: true, timeout: 120_000 },
  ],
});

export { expect };
