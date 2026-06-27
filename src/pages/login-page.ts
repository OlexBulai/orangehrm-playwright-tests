import { Page } from '@playwright/test';
import { baseUrl } from '../../env';

export default class LoginPage {
  readonly usernameInput = 'input[name="username"]';
  readonly passwordInput = 'input[name="password"]';
  readonly loginButton = 'button[type="submit"]';
  constructor(private page: Page) {}
  async open() {
    await this.page.goto(`${baseUrl}/auth/login`);
  }

  async fillUsername(username: string) {
    await this.page.locator(this.usernameInput).fill(username);
  }
  async fillPassword(password: string) {
    await this.page.locator(this.passwordInput).fill(password);
  }
  async clickLoginButton() {
    await this.page.locator(this.loginButton).click();
  }
}
