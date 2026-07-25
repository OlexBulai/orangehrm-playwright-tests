import { test as base, expect } from '../shared/authenticated.fixture';
import AdminSectionsApi from '../../../src/pages/api/admin-sections-api';
import AdminSectionsComponent from '../../../src/pages/components/admin-sections-component';

export const test = base.extend<{
  adminSections: AdminSectionsComponent;
  adminSectionsApi: AdminSectionsApi;
}>({
  adminSections: async ({ page }, use) => {
    await use(new AdminSectionsComponent(page));
  },
  adminSectionsApi: async ({ page }, use) => {
    await use(new AdminSectionsApi(page.request));
  },
});

export { expect };
