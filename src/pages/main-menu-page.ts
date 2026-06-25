import { Page, Locator } from '@playwright/test';

export default class MainMenuPage {
  readonly page: Page;
  readonly adminLink: Locator;
  readonly pimLink: Locator;
  readonly leaveLink: Locator;
  readonly timeLink: Locator;
  readonly recruitmentLink: Locator;
  readonly myInfoLink: Locator;
  readonly performanceLink: Locator;
  readonly dashboardLink: Locator;
  readonly directoryLink: Locator;
  readonly maintenanceLink: Locator;
  readonly buzzLink: Locator;
  readonly claimLink: Locator;
  constructor(private page: Page) {
    this.page = page;
    this.adminLink = page.getByRole('link', { name: 'Admin' });
    this.pimLink = page.getByRole('link', { name: 'PIM' });
    this.leaveLink = page.getByRole('link', { name: 'Leave' });
    this.timeLink = page.getByRole('link', { name: 'Time' });
    this.recruitmentLink = page.getByRole('link', { name: 'Recruitment' });
    this.myInfoLink = page.getByRole('link', { name: 'My Info' });
    this.performanceLink = page.getByRole('link', { name: 'Performance' });
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.directoryLink = page.getByRole('link', { name: 'Directory' });
    this.maintenanceLink = page.getByRole('link', { name: 'Maintenance' });
    this.buzzLink = page.getByRole('link', { name: 'Buzz' });
    this.claimLink = page.getByRole('link', { name: 'Claim' });
  }
  async openAdmin() {
    await this.adminLink.click();
  }
  async openPIM() {
    await this.pimLink.click();
  }
  async openLeave() {
    await this.leaveLink.click();
  }
  async openTime() {
    await this.timeLink.click();
  }
  async openRecruitment() {
    await this.recruitmentLink.click();
  }
  async openMyInfo() {
    await this.myInfoLink.click();
  }
  async openPerformance() {
    await this.performanceLink.click();
  }
  async openDashboard() {
    await this.dashboardLink.click();
  }
  async openDirectory() {
    await this.directoryLink.click();
  }
  async openMaintenance() {
    await this.maintenanceLink.click();
  }
  async confirmMaintenancePassword(password: string) {
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.locator('button[type="submit"]').click();
  }
  async openBuzz() {
    await this.buzzLink.click();
  }
  async openClaim() {
    await this.claimLink.click();
  }
}
