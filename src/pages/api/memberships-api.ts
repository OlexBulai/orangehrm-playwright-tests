import { APIRequestContext, expect } from '@playwright/test';
import { baseUrl } from '../../../env';
import type { MembershipRecord } from '../components/memberships-component';

export type MembershipApiData = {
  membershipId: number;
  paidBy: 'Company' | 'Individual';
  amount: string;
  currencyId: string;
  commenceDate: string;
  renewalDate: string;
};

const toApiDate = (date: string) => {
  const [year, day, month] = date.split('-');
  return `${year}-${month}-${day}`;
};

export default class MembershipsApi {
  constructor(private readonly request: APIRequestContext) {}

  private url(employeeId: string) {
    return `${baseUrl}/api/v2/pim/employees/${employeeId}/memberships`;
  }

  async create(employeeId: string, data: MembershipApiData) {
    const response = await this.request.post(this.url(employeeId), {
      data: {
        membershipId: data.membershipId,
        subscriptionPaidBy: data.paidBy,
        subscriptionFee: data.amount,
        currencyTypeId: data.currencyId,
        subscriptionCommenceDate: toApiDate(data.commenceDate),
        subscriptionRenewalDate: toApiDate(data.renewalDate),
      },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: { id: number } }).data.id;
  }

  async delete(employeeId: string, ids: number[]) {
    if (ids.length === 0) return;
    const response = await this.request.delete(this.url(employeeId), {
      data: { ids },
    });
    expect(response.status()).toBe(200);
  }

  async getAll(employeeId: string) {
    const response = await this.request.get(this.url(employeeId), {
      params: { limit: 50, offset: 0 },
    });
    expect(response.status()).toBe(200);
    return ((await response.json()) as { data: MembershipRecord[] }).data;
  }

  async getCustomFieldCount(employeeId: string) {
    const response = await this.request.get(
      `${baseUrl}/api/v2/pim/employees/${employeeId}/custom-fields`,
      { params: { screen: 'membership' } },
    );
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { meta: { fields: unknown[] } };
    return body.meta.fields.length;
  }
}
