import { Locator, Page } from '@playwright/test';
import { baseUrl } from '../../env';

export default class LoginPage {
  readonly usernameInput = 'input[name="username"]';
  readonly passwordInput = 'input[name="password"]';
  readonly loginButton = 'button[type="submit"]';
  readonly forgotPasswordLink: Locator;
  readonly resetPasswordHeading: Locator;
  readonly resetPasswordButton: Locator;
  readonly cancelResetButton: Locator;

  constructor(private page: Page) {
    this.forgotPasswordLink = page.getByText('Forgot your password?', {
      exact: true,
    });
    this.resetPasswordHeading = page.getByRole('heading', {
      name: 'Reset Password',
      exact: true,
    });
    this.resetPasswordButton = page.getByRole('button', {
      name: 'Reset Password',
      exact: true,
    });
    this.cancelResetButton = page.getByRole('button', {
      name: 'Cancel',
      exact: true,
    });
  }

  async open() {
    const attempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await this.page.goto(`${baseUrl}/auth/login`, {
          timeout: 30_000,
          waitUntil: 'domcontentloaded',
        });

        if (!response || response.status() >= 500) {
          throw new Error(
            `OrangeHRM login returned HTTP ${response?.status() ?? 'unknown'}`,
          );
        }

        return;
      } catch (error) {
        lastError = error;
        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 10_000));
        }
      }
    }

    throw lastError;
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

  async openForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async submitPasswordReset() {
    await this.resetPasswordButton.click();
  }

  async cancelPasswordReset() {
    await this.cancelResetButton.click();
  }
}
