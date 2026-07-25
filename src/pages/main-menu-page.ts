import { expect, Locator, Page } from '@playwright/test';

export const mainMenuItems = [
  'Admin',
  'PIM',
  'Leave',
  'Time',
  'Recruitment',
  'My Info',
  'Performance',
  'Dashboard',
  'Directory',
  'Maintenance',
  'Claim',
  'Buzz',
] as const;

export type MainMenuItem = (typeof mainMenuItems)[number];

export default class MainMenuPage {
  readonly menu: Locator;

  constructor(readonly page: Page) {
    this.menu = page.locator('nav[aria-label="Sidepanel"]');
  }

  item(name: MainMenuItem): Locator {
    return this.menu.getByRole('link', { name, exact: true });
  }

  async expectItemsInOrder() {
    await expect(this.menu.locator('.oxd-main-menu-item')).toHaveText(
      mainMenuItems,
    );
  }

  async open(name: MainMenuItem) {
    await this.item(name).click();
  }

  async confirmMaintenancePassword(password: string) {
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}
