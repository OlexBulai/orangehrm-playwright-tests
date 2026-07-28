import { expect, Locator, Page } from '@playwright/test';
import {
  exactLabel,
  replaceInputValue,
  selectDropdownOption,
} from './form-controls';

export type WorkExperienceData = {
  company: string;
  jobTitle: string;
  fromDate: string;
  toDate: string;
  comment: string;
};

export type LanguageData = {
  language: string;
  fluency: string;
  competency: string;
  comment: string;
};

type SavedWorkExperience = { data: { id: number } };
type SavedLanguage = {
  data: {
    language: { id: number; name: string };
    fluency: { id: number; name: string };
  };
};

const sections = [
  'Work Experience',
  'Education',
  'Skills',
  'Languages',
  'License',
  'Attachments',
] as const;

export default class QualificationsComponent {
  readonly heading: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', {
      name: 'Qualifications',
      exact: true,
    });
  }

  section(name: (typeof sections)[number]): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  private form(): Locator {
    return this.page.locator('form:visible').last();
  }

  private input(label: string): Locator {
    return this.form()
      .locator('.oxd-input-group')
      .filter({ has: exactLabel(this.page, label) })
      .locator('input');
  }

  private textarea(label: string): Locator {
    return this.form()
      .locator('.oxd-input-group')
      .filter({ has: exactLabel(this.page, label) })
      .locator('textarea');
  }

  private rows(section: Locator): Locator {
    return section
      .locator(
        'xpath=following::div[contains(@class,"orangehrm-container")][1]',
      )
      .locator('.oxd-table-body .oxd-table-card');
  }

  private row(text: string): Locator {
    return this.page.getByRole('row').filter({ hasText: text });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
    for (const name of sections) {
      await expect(this.section(name)).toBeVisible();
    }
  }

  async openAddForm(index: number) {
    await this.page.getByRole('button', { name: 'Add' }).nth(index).click();
    await expect(this.form()).toBeVisible();
  }

  async addWorkExperience(data: WorkExperienceData): Promise<number> {
    await this.openAddForm(0);
    await this.fillWorkExperience(data);
    const saved = await this.save<SavedWorkExperience>(
      'POST',
      'work-experiences',
    );
    await expect(this.row(data.company)).toBeVisible();
    return saved.data.id;
  }

  async editWorkExperience(company: string, data: WorkExperienceData) {
    await this.row(company).locator('button:has(i.bi-pencil-fill)').click();
    await this.fillWorkExperience(data);
    await this.save('PUT', 'work-experiences');
    await this.page.reload();
    const updatedRow = this.row(data.company);
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText(data.jobTitle);
  }

  async deleteWorkExperience(company: string) {
    await this.deleteRow(company, 'work-experiences');
  }

  async addLanguage(data: LanguageData) {
    await this.openAddForm(3);
    const selects = this.form().locator('.oxd-select-text');
    await selectDropdownOption(this.page, selects.nth(0), data.language);
    await selectDropdownOption(this.page, selects.nth(1), data.fluency);
    await selectDropdownOption(this.page, selects.nth(2), data.competency);
    await this.form().locator('textarea').fill(data.comment);
    const saved = await this.save<SavedLanguage>('POST', 'languages');
    await expect(
      this.row(data.language).filter({ hasText: data.fluency }),
    ).toBeVisible();
    return {
      languageId: saved.data.language.id,
      fluencyId: saved.data.fluency.id,
    };
  }

  async deleteLanguage(language: string, fluency: string) {
    const row = this.row(language).filter({ hasText: fluency });
    await row.locator('button:has(i.bi-trash)').click();
    await this.confirmDelete('languages');
    await expect(row).toBeHidden();
  }

  async expectRows(sectionName: (typeof sections)[number], rows: string[][]) {
    const actualRows = this.rows(this.section(sectionName));
    await expect(actualRows).toHaveCount(rows.length);
    for (const expectedTexts of rows) {
      const row = actualRows.filter({ hasText: expectedTexts[0] });
      await expect(row).toBeVisible();
      for (const text of expectedTexts.slice(1)) {
        await expect(row).toContainText(text);
      }
    }
  }

  private async fillWorkExperience(data: WorkExperienceData) {
    await replaceInputValue(this.input('Company'), data.company);
    await replaceInputValue(this.input('Job Title'), data.jobTitle);
    await replaceInputValue(this.input('From'), data.fromDate);
    await replaceInputValue(this.input('To'), data.toDate);
    await this.textarea('Comment').fill(data.comment);
  }

  private async save<T>(method: 'POST' | 'PUT', endpoint: string): Promise<T> {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === method &&
        response.url().includes(`/pim/employees/`) &&
        response.url().includes(`/${endpoint}`),
    );
    await this.form().getByRole('button', { name: 'Save' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    return (await response.json()) as T;
  }

  private async deleteRow(text: string, endpoint: string) {
    const row = this.row(text);
    await row.locator('button:has(i.bi-trash)').click();
    await this.confirmDelete(endpoint);
    await expect(row).toBeHidden();
  }

  private async confirmDelete(endpoint: string) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        response.url().endsWith(`/${endpoint}`),
    );
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  }
}
