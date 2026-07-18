import type { MembershipData } from '../../src/pages/components/memberships-component';
import type { MembershipApiData } from '../../src/pages/api/memberships-api';

export const membershipData: MembershipData & MembershipApiData = {
  membership: 'ACCA',
  membershipId: 4,
  paidBy: 'Company',
  amount: '100',
  currency: 'Afghanistan Afghani',
  currencyId: 'AFN',
  commenceDate: '2025-01-01',
  renewalDate: '2026-31-12',
};
