import { expect, test as base } from './shared/authenticated.fixture';
import MainMenuPage from '../../src/pages/main-menu-page';

type MainMenuFixtures = {
  mainMenuPage: MainMenuPage;
};

export const test = base.extend<MainMenuFixtures>({
  mainMenuPage: [
    async ({ page }, use) => {
      await use(new MainMenuPage(page));
    },
    { timeout: 60_000 },
  ],
});

export { expect };
