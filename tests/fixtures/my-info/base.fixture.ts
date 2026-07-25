import { expect, test as base } from '../shared/authenticated.fixture';
import MyInfoPage from '../../../src/pages/my-info-page';
import AttachmentApi from '../../../src/pages/api/attachment-api';

type MyInfoFixtures = {
  myInfoPage: MyInfoPage;
  employeeId: string;
  attachmentApi: AttachmentApi;
};

export const test = base.extend<MyInfoFixtures>({
  myInfoPage: [
    async ({ page }, use) => {
      const myInfoPage = new MyInfoPage(page);
      await myInfoPage.openMyInfo();
      await use(myInfoPage);
    },
    { timeout: 60_000 },
  ],

  employeeId: async ({ myInfoPage }, use) => {
    await use(myInfoPage.getEmployeeId());
  },

  attachmentApi: async ({ page }, use) => {
    await use(new AttachmentApi(page.request));
  },
});

export { expect };
