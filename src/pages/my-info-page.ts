import { Page, Locator, expect } from '@playwright/test';
import AttachmentsComponent from './components/attachments-component';
import ContactDetailsComponent from './components/contact-details-component';
import EmergencyContactsComponent from './components/emergency-contacts-component';
import PersonalDetailsComponent from './components/personal-details-component';
import DependentsComponent from './components/dependents-component';
import ImmigrationComponent from './components/immigration-component';
import JobComponent from './components/job-component';
import SalaryComponent from './components/salary-component';
import ReportToComponent from './components/report-to-component';
import QualificationsComponent from './components/qualifications-component';
import MembershipsComponent from './components/memberships-component';

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
  readonly contactDetails: ContactDetailsComponent;
  readonly emergencyContacts: EmergencyContactsComponent;
  readonly personalDetails: PersonalDetailsComponent;
  readonly dependents: DependentsComponent;
  readonly immigration: ImmigrationComponent;
  readonly job: JobComponent;
  readonly salary: SalaryComponent;
  readonly reportTo: ReportToComponent;
  readonly qualifications: QualificationsComponent;
  readonly memberships: MembershipsComponent;

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
    this.contactDetails = new ContactDetailsComponent(page);
    this.emergencyContacts = new EmergencyContactsComponent(page);
    this.personalDetails = new PersonalDetailsComponent(page);
    this.dependents = new DependentsComponent(page);
    this.immigration = new ImmigrationComponent(page);
    this.job = new JobComponent(page);
    this.salary = new SalaryComponent(page);
    this.reportTo = new ReportToComponent(page);
    this.qualifications = new QualificationsComponent(page);
    this.memberships = new MembershipsComponent(page);
  }

  async openMyInfo() {
    await this.myInfoLink.click();
    await expect(this.page).toHaveURL(/viewPersonalDetails\/empNumber\/\d+/);
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
  async openContactDetails() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        /\/api\/v2\/pim\/employee\/\d+\/contact-details$/.test(response.url()),
    );
    await this.contactDetailsLink.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await this.contactDetails.expectVisible();
  }
  async openEmergencyContacts() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        /\/api\/v2\/pim\/employees\/\d+\/emergency-contacts/.test(
          response.url(),
        ),
    );
    await this.emergencyContactsLink.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await this.emergencyContacts.expectVisible();
  }
  async openDependents() {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        /\/api\/v2\/pim\/employees\/\d+\/dependents/.test(response.url()),
    );
    await this.dependentsLink.click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await this.dependents.expectVisible();
  }
  async openImmigration() {
    await this.immigrationLink.click();
    await this.immigration.expectVisible();
  }
  async openJob() {
    await this.jobLink.click();
    await this.job.expectVisible();
  }
  async openSalary() {
    await this.salaryLink.click();
    await this.salary.expectVisible();
  }
  async openReportTo() {
    await this.reportToLink.click();
    await this.reportTo.expectVisible();
  }
  async openQualifications() {
    await this.qualificationsLink.click();
    await this.qualifications.expectVisible();
  }
  async openMembership() {
    await this.membershipLink.click();
    await this.memberships.expectVisible();
  }
}
