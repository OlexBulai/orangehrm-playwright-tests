import { test as base, expect } from './base.fixture';
import MembershipsApi from '../../../src/pages/api/memberships-api';

type Cleanup = {
  trackMembership(id: number): void;
  forgetMembership(id: number): void;
  trackAttachment(id: number): void;
  forgetAttachment(id: number): void;
};

export const test = base.extend<{
  membershipsApi: MembershipsApi;
  membershipsCleanup: Cleanup;
}>({
  membershipsApi: async ({ page }, use) => {
    await use(new MembershipsApi(page.request));
  },
  membershipsCleanup: async (
    { membershipsApi, attachmentApi, employeeId },
    use,
  ) => {
    const membershipIds = new Set<number>();
    const attachmentIds = new Set<number>();
    const cleanup: Cleanup = {
      trackMembership: (id) => membershipIds.add(id),
      forgetMembership: (id) => membershipIds.delete(id),
      trackAttachment: (id) => attachmentIds.add(id),
      forgetAttachment: (id) => attachmentIds.delete(id),
    };
    try {
      await use(cleanup);
    } finally {
      for (const id of attachmentIds) {
        await attachmentApi.deleteAttachment(employeeId, id, 'membership');
      }
      await membershipsApi.delete(employeeId, [...membershipIds]);
    }
  },
});

export { expect };
