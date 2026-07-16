import { Page, Locator, expect } from '@playwright/test';
import AttachmentsComponent from './components/attachments-component';

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
  readonly attachments: AttachmentsComponent;

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
    this.qualificationsLink = page.getByRole('link', {
      name: 'Qualifications',
    });
    this.membershipLink = page.getByRole('link', { name: 'Membership' });
    this.attachments = new AttachmentsComponent(page);
  }

  async openMyInfo() {
    await this.myInfoLink.click();
    await expect(this.page).toHaveURL(
      /viewPersonalDetails\/empNumber\/\d+/,
    );
  }
  getEmployeeId(): string {
    const employeeId = this.page.url().match(/empNumber\/(\d+)/)?.[1];

    if (employeeId === undefined) {
      throw new Error(
        `Employee ID was not found in My Info URL: ${this.page.url()}`,
      );
    }

    return employeeId;
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

  async updatePersonalDetails(
    firstName: string,
    middleName: string,
    lastName: string,
    employeeId: string,
    otherId: string,
    driverLicenseNumber: string,
    licenseExpiryDate: string,

    nationality: string,
    maritalStatus: string,
  ) {
    const employeeIdInput = this.page
      .getByText('Employee Id')
      .locator('..')
      .locator('..')
      .locator('input');
    const otherIdInput = this.page
      .getByText('Other Id')
      .locator('..')
      .locator('..')
      .locator('input');
    const driverLicenseNumberInput = this.page
      .getByText("Driver's License Number")
      .locator('..')
      .locator('..')
      .locator('input');
    const licenseExpiryDateInput = this.page
      .locator('input[placeholder="yyyy-dd-mm"]')
      .first();

    const nationalitySelect = this.page
      .getByText('Nationality')
      .locator('..')
      .locator('..')
      .locator('.oxd-select-text');
    const maritalStatusSelect = this.page
      .getByText('Marital Status')
      .locator('..')
      .locator('..')
      .locator('.oxd-select-text');
    await this.page.locator('input[name="firstName"]').click();
    await this.page.locator('input[name="firstName"]').press('Control+A');
    await this.page.locator('input[name="firstName"]').fill(firstName);
    await this.page.locator('input[name="middleName"]').click();
    await this.page.locator('input[name="middleName"]').press('Control+A');
    await this.page.locator('input[name="middleName"]').fill(middleName);
    await this.page.locator('input[name="lastName"]').click();
    await this.page.locator('input[name="lastName"]').press('Control+A');
    await this.page.locator('input[name="lastName"]').fill(lastName);

    await expect(this.page.locator('input[name="firstName"]')).toHaveValue(
      firstName,
    );
    await expect(this.page.locator('input[name="middleName"]')).toHaveValue(
      middleName,
    );
    await expect(this.page.locator('input[name="lastName"]')).toHaveValue(
      lastName,
    );

    await this.fillInputWithValue(employeeIdInput, employeeId);
    await this.fillInputWithValue(otherIdInput, otherId);
    await this.fillInputWithValue(
      driverLicenseNumberInput,
      driverLicenseNumber,
    );
    await this.fillInputWithValue(licenseExpiryDateInput, licenseExpiryDate);

    await this.selectDropdownOption(nationalitySelect, nationality);
    await this.selectDropdownOption(maritalStatusSelect, maritalStatus);

    await this.page.getByRole('button', { name: 'Save' }).first().click();
    await expect(
      this.page.locator('div').getByText('Successfully Updated'),
    ).toBeVisible();
  }
  async fillInputWithValue(inputLocator: Locator, value: string) {
    await inputLocator.click();
    await inputLocator.press('Control+A');
    await inputLocator.fill(value);
  }
  async selectDropdownOption(dropdownLocator: Locator, option: string) {
    await dropdownLocator.click();

    const optionLocator = this.page.getByRole('option', { name: option });
    await expect(optionLocator).toBeVisible();
    await optionLocator.click();
  }
}
