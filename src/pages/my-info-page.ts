import { Page, Locator, expect } from '@playwright/test';

export default class MyInfoPage {
  readonly page: Page;
  readonly myInfoLink: Locator;
  readonly contactDetailsLink: Locator;
  readonly emergencyContactsLink: Locator;
  readonly dependentsLink: Locator;
  readonly immigrationLink: Locator;
  readonly jobLink: Locator;
  readonly salaryLink: Locator;
  readonly reportToLink: Locator;
  readonly qualificationsLink: Locator;
  readonly membershipLink: Locator;

  readonly personalDetailsTitle = 'h6';
  readonly contactDetailsTitle = 'h6';
  readonly emergencyContactTitle = 'h6';
  readonly dependentsTitle = 'h6';
  readonly immigrationTitle = 'h6';
  readonly jobTitle = 'h6';
  readonly salaryTitle = 'h6';
  readonly reportToTitle = 'h6';
  readonly qualificationsTitle = 'h6';
  readonly membershipTitle = 'h6';

  constructor(page: Page) {
    this.page = page;
    this.myInfoLink = page.getByRole('link', { name: 'My Info' });
    this.contactDetailsLink = page.getByRole('link', {
      name: 'Contact Details',
    });
    this.emergencyContactsLink = page.getByRole('link', {
      name: 'Emergency Contacts',
    });
    this.dependentsLink = page.getByRole('link', { name: 'Dependents' });
    this.immigrationLink = page.getByRole('link', { name: 'Immigration' });
    this.jobLink = page.getByRole('link', { name: 'Job' });
    this.salaryLink = page.getByRole('link', { name: 'Salary' });
    this.reportToLink = page.getByRole('link', { name: 'Report-to' });
    this.qualificationsLink = page.getByRole('link', { name: 'Qualifications' });
    this.membershipLink = page.getByRole('link', { name: 'Membership' });
  }
  
  async openMyInfo() {
    await this.myInfoLink.click();
  }
  async expectPersonalDetailsVisible() {
    await expect(
      this.page
        .locator(this.personalDetailsTitle)
        .getByText('Personal Details'),
    ).toBeVisible();
  }
  async openContactDetails() {
    await this.contactDetailsLink.click();
  }
  async expectContactDetailsVisible() {
    await expect(
      this.page.locator(this.contactDetailsTitle).getByText('Contact Details'),
    ).toBeVisible();
  }
  async openEmergencyContacts() {
    await this.emergencyContactsLink.click();
  }
  async expectEmergencyContactsVisible() {
    await expect(
      this.page
        .locator(this.emergencyContactTitle)
        .getByText('Emergency Contacts'),
    ).toBeVisible();
  }
  async openDependents() {
    await this.dependentsLink.click();
  }
  async expectDependentsVisible() {
    await expect(
      this.page.locator(this.dependentsTitle).getByText('Dependents'),
    ).toBeVisible();
  }
  async openImmigration() {
    await this.page.getByRole('link', { name: 'Immigration' }).click();
  }
  async expectImmigrationVisible() {
    await expect(
      this.page.locator(this.immigrationTitle).getByText('Immigration'),
    ).toBeVisible();
  }
  async openJob() {
    await this.page.getByRole('link', { name: 'Job' }).click();
  }
  async expectJobVisible() {
    await expect(
      this.page.locator(this.jobTitle).getByText('Job'),
    ).toBeVisible();
  }
  async openSalary() {
    await this.page.getByRole('link', { name: 'Salary' }).click();
  }
  async expectSalaryVisible() {
    await expect(
      this.page.locator(this.salaryTitle).getByText('Salary'),
    ).toBeVisible();
  }
  async openReportTo() {
    await this.page.getByRole('link', { name: 'Report-to' }).click();
  }
  async expectReportToVisible() {
    await expect(
      this.page.locator(this.reportToTitle).getByText('Report To'),
    ).toBeVisible();
  }
  async openQualifications() {
    await this.page.getByRole('link', { name: 'Qualifications' }).click();
  }
  async expectQualificationsVisible() {
    await expect(
      this.page.locator(this.qualificationsTitle).getByText('Qualifications'),
    ).toBeVisible();
  }
  async openMembership() {
    await this.page.getByRole('link', { name: 'Membership' }).click();
  }
  async expectMembershipVisible() {
    await expect(
      this.page.locator(this.membershipTitle).getByText('Membership'),
    ).toBeVisible();
  }
}
