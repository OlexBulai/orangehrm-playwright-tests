import { expect, Page } from '@playwright/test';

export type AdminSection = {
  name: string;
  heading: string;
  url: RegExp;
  group?: 'Organization' | 'Configuration';
  endpoint?: string;
  contentRole?: 'heading' | 'paragraph';
};

export default class AdminSectionsComponent {
  constructor(private readonly page: Page) {}

  async openSection(section: AdminSection): Promise<void> {
    await this.page.getByRole('link', { name: 'Admin' }).click();
    const navigation = this.page.getByRole('navigation', {
      name: 'Topbar Menu',
    });
    if (section.group) {
      await navigation.getByText(section.group, { exact: true }).click();
      await this.page
        .getByRole('menuitem', { name: section.name, exact: true })
        .click();
    } else {
      await navigation.getByRole('link', { name: section.name }).click();
    }
    await expect(this.page).toHaveURL(section.url);
    const content =
      section.contentRole === 'paragraph'
        ? this.page.getByText(section.heading, { exact: true })
        : this.page.getByRole('heading', {
            name: section.heading,
            exact: true,
          });
    await expect(content).toBeVisible();
  }
}
