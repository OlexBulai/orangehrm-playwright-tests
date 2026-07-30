import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test as setup } from '@playwright/test';
import LoginPage from '../src/pages/login-page';
import { passwordLogin, usernameLogin } from '../env';

const authFile = 'playwright/.auth/user.json';

setup('authenticate once for CI', async ({ page }) => {
  setup.setTimeout(90_000);

  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.fillUsername(usernameLogin);
  await loginPage.fillPassword(passwordLogin);
  await loginPage.clickLoginButton();
  await expect(page).toHaveURL(/dashboard/, { timeout: 60_000 });

  mkdirSync(dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
