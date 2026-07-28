import { expect, Locator, Page } from '@playwright/test';

export type ReportingRelation = {
  subordinate?: EmployeeName;
  supervisor?: EmployeeName;
  reportingMethod: { id: number; name: string };
};

type EmployeeName = {
  firstName: string;
  middleName: string;
  lastName: string;
};

function fullName(employee: EmployeeName): string {
  return [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(' ');
}

export default class ReportToComponent {
  readonly heading: Locator;
  readonly supervisorsHeading: Locator;
  readonly subordinatesHeading: Locator;
  readonly attachmentsHeading: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', {
      name: 'Report to',
      exact: true,
    });
    this.supervisorsHeading = page.getByRole('heading', {
      name: 'Assigned Supervisors',
    });
    this.subordinatesHeading = page.getByRole('heading', {
      name: 'Assigned Subordinates',
    });
    this.attachmentsHeading = page.getByRole('heading', {
      name: 'Attachments',
    });
  }

  private tableAfter(heading: Locator): Locator {
    return heading.locator(
      'xpath=following::div[contains(@class,"orangehrm-container")][1]',
    );
  }

  private rowsAfter(heading: Locator): Locator {
    return this.tableAfter(heading).locator('.oxd-table-body .oxd-table-card');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.supervisorsHeading).toBeVisible();
    await expect(this.subordinatesHeading).toBeVisible();
    await expect(this.attachmentsHeading).toBeVisible();
  }

  async expectRelationColumns(heading: Locator) {
    const table = this.tableAfter(heading);
    await expect(
      table.getByRole('columnheader', { name: 'Name', exact: true }),
    ).toBeVisible();
    await expect(
      table.getByRole('columnheader', {
        name: 'Reporting Method',
        exact: true,
      }),
    ).toBeVisible();
  }

  async expectReadOnly() {
    await expect(this.page.getByRole('button', { name: 'Add' })).toHaveCount(0);
    await expect(this.page.locator('button:has(i.bi-pencil-fill)')).toHaveCount(
      0,
    );
    await expect(this.page.locator('button:has(i.bi-trash)')).toHaveCount(0);
  }

  async expectSupervisors(relations: ReportingRelation[]) {
    await this.expectRelations(
      this.supervisorsHeading,
      relations,
      'supervisor',
    );
  }

  async expectSubordinates(relations: ReportingRelation[]) {
    await this.expectRelations(
      this.subordinatesHeading,
      relations,
      'subordinate',
    );
  }

  private async expectRelations(
    heading: Locator,
    relations: ReportingRelation[],
    employeeKey: 'supervisor' | 'subordinate',
  ) {
    const rows = this.rowsAfter(heading);
    await expect(rows).toHaveCount(relations.length);

    for (const relation of relations) {
      const employee = relation[employeeKey];
      if (employee === undefined) {
        throw new Error(`${employeeKey} was not returned by Report-to API`);
      }

      const row = rows.filter({ hasText: fullName(employee) });
      await expect(row).toBeVisible();
      await expect(row).toContainText(relation.reportingMethod.name);
    }
  }
}
