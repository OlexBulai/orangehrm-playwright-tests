import { test } from '../fixtures/admin/admin-sections.fixture';
import type { AdminSection } from '../../src/pages/components/admin-sections-component';

const sections: AdminSection[] = [
  {
    name: 'General Information',
    heading: 'General Information',
    url: /admin\/viewOrganizationGeneralInformation/,
    group: 'Organization',
    endpoint: '/api/v2/admin/organization',
  },
  {
    name: 'Structure',
    heading: 'Organization Structure',
    url: /admin\/viewCompanyStructure/,
    group: 'Organization',
    endpoint: '/api/v2/admin/subunits?mode=tree',
  },
  {
    name: 'Corporate Branding',
    heading: 'Corporate Branding',
    url: /admin\/addTheme/,
  },
  {
    name: 'Email Configuration',
    heading: 'Email Configuration',
    url: /admin\/listMailConfiguration/,
    group: 'Configuration',
    endpoint: '/api/v2/admin/email-configuration',
    contentRole: 'paragraph',
  },
  {
    name: 'Email Subscriptions',
    heading: 'Email Subscriptions',
    url: /admin\/viewEmailNotification/,
    group: 'Configuration',
    endpoint: '/api/v2/admin/email-subscriptions?limit=50&offset=0',
  },
  {
    name: 'Localization',
    heading: 'Localization',
    url: /admin\/localization/,
    group: 'Configuration',
    endpoint: '/api/v2/admin/localization',
  },
  {
    name: 'Language Packages',
    heading: 'Language Packages',
    url: /admin\/languagePackage/,
    group: 'Configuration',
    endpoint:
      '/api/v2/admin/i18n/languages?limit=50&offset=0&sortOrder=ASC&activeOnly=true',
  },
  {
    name: 'Modules',
    heading: 'Module Configuration',
    url: /admin\/viewModules/,
    group: 'Configuration',
  },
  {
    name: 'Social Media Authentication',
    heading: 'Provider List',
    url: /admin\/openIdProvider/,
    group: 'Configuration',
  },
  {
    name: 'Register OAuth Client',
    heading: 'OAuth Client List',
    url: /admin\/registerOAuthClient/,
    group: 'Configuration',
  },
  {
    name: 'LDAP Configuration',
    heading: 'LDAP Configuration',
    url: /admin\/ldapConfiguration/,
    group: 'Configuration',
  },
];

test.describe('OrangeHRM Admin read-only sections', () => {
  test.describe.configure({ timeout: 90_000 });

  for (const section of sections) {
    test(`Admin can open ${section.name}`, async ({
      adminSections,
      adminSectionsApi,
    }) => {
      await adminSections.openSection(section);
      if (section.endpoint) {
        await adminSectionsApi.expectEndpointAvailable(section.endpoint);
      }
    });
  }
});
