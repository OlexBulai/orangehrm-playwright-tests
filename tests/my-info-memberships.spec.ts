import { test, expect } from './fixtures/my-info-memberships.fixture';
import { membershipData } from './helpers/memberships-test-helpers';
import { createAttachmentFile } from './helpers/attachment-test-helpers';

test.describe('My Info Memberships tests', () => {
  test.beforeEach(async ({ myInfoPage }) => {
    await myInfoPage.openMembership();
  });

  test('User can open Memberships sections', async ({ page, myInfoPage }) => {
    await expect(page).toHaveURL(/viewMemberships\/empNumber\/\d+/);
    await myInfoPage.memberships.expectVisible();
  });

  test('Membership table has all columns', async ({ myInfoPage }) => {
    await myInfoPage.memberships.expectColumns();
  });

  test.describe('Memberships mutations', () => {
    test.describe.configure({ mode: 'serial' });
    test.skip(
      ({ browserName }) => browserName !== 'chromium',
      'The shared demo employee must not be updated concurrently.',
    );

    test('User can add a membership', async ({ myInfoPage, membershipsCleanup }) => {
      const id = await myInfoPage.memberships.add(membershipData);
      membershipsCleanup.trackMembership(id);
    });

    test('User can edit a membership', async ({
      page, myInfoPage, membershipsApi, membershipsCleanup, employeeId,
    }) => {
      const id = await membershipsApi.create(employeeId, membershipData);
      membershipsCleanup.trackMembership(id);
      await page.reload();
      await myInfoPage.memberships.edit(membershipData.membership, {
        ...membershipData,
        amount: '150',
      });
    });

    test('User can delete a membership', async ({
      page, myInfoPage, membershipsApi, membershipsCleanup, employeeId,
    }) => {
      const id = await membershipsApi.create(employeeId, membershipData);
      membershipsCleanup.trackMembership(id);
      await page.reload();
      await myInfoPage.memberships.delete(membershipData.membership);
      membershipsCleanup.forgetMembership(id);
    });

    test('Membership is required', async ({ myInfoPage }) => {
      await myInfoPage.memberships.openAddForm();
      await myInfoPage.memberships.saveEmptyForm();
      await myInfoPage.memberships.expectRequiredError();
    });

    test('User can add a Membership attachment', async ({
      myInfoPage, attachmentApi, membershipsCleanup, employeeId,
    }) => {
      const file = createAttachmentFile({
        prefix: 'membership-ui',
        description: 'Membership UI attachment',
      });
      await myInfoPage.memberships.attachments.addAttachment(
        file,
        file.description,
      );
      await myInfoPage.memberships.attachments.expectAttachment({
        fileName: file.name,
        comment: file.description,
      });
      const attachments = await attachmentApi.getAll(employeeId, 'membership');
      const created = attachments.data.find((item) => item.filename === file.name);
      expect(created).toBeDefined();
      membershipsCleanup.trackAttachment(created!.id);
    });

    test('User can delete a Membership attachment', async ({
      page, myInfoPage, attachmentApi, membershipsCleanup, employeeId,
    }) => {
      const file = createAttachmentFile({
        prefix: 'membership-delete',
        description: 'Delete membership attachment',
      });
      const id = await attachmentApi.createAttachment(employeeId, file, 'membership');
      membershipsCleanup.trackAttachment(id);
      await page.reload();
      await myInfoPage.memberships.attachments.deleteAttachment(file.name);
      membershipsCleanup.forgetAttachment(id);
    });
  });

  test('Membership table matches API data', async ({
    myInfoPage, membershipsApi, employeeId,
  }) => {
    await myInfoPage.memberships.expectRecords(
      await membershipsApi.getAll(employeeId),
    );
  });

  test('Membership custom fields API is available', async ({
    membershipsApi, employeeId,
  }) => {
    expect(await membershipsApi.getCustomFieldCount(employeeId)).toBeGreaterThanOrEqual(0);
  });

  test('Membership attachments match API data', async ({
    myInfoPage, attachmentApi, employeeId,
  }) => {
    const attachments = await attachmentApi.getAll(employeeId, 'membership');
    await myInfoPage.memberships.attachments.expectCount(attachments.meta.total);
    for (const item of attachments.data) {
      await myInfoPage.memberships.attachments.expectAttachment({
        fileName: item.filename,
        comment: item.description,
      });
    }
  });
});
