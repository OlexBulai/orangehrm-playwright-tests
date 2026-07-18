import { test, expect } from "@playwright/test";
import LoginPage from "../src/pages/login-page";
import { usernameLogin, passwordLogin } from "../env";

test.describe("OrangeHRM auth tests", () => {
  const dashboardTitle = "h6";

  test.beforeEach("Navigate to login page", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
  });
  test("Login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillUsername(usernameLogin);
    await loginPage.fillPassword(passwordLogin);
    await loginPage.clickLoginButton();
    await expect(
      page.locator(dashboardTitle).getByText("Dashboard"),
    ).toBeVisible();
  });
});

