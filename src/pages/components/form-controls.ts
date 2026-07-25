import { Locator, Page } from '@playwright/test';

export function exactLabel(page: Page, label: string): Locator {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page.locator('label').filter({
    hasText: new RegExp(`^\\s*${escapedLabel}\\s*$`),
  });
}

export function inputGroup(page: Page, label: string): Locator {
  return page
    .locator('.oxd-input-group')
    .filter({ has: exactLabel(page, label) });
}

export async function replaceInputValue(input: Locator, value: string) {
  await input.click();
  await input.press('Control+A');
  await input.pressSequentially(value);
  await input.press('Tab');
}

export async function selectDropdownOption(
  page: Page,
  dropdown: Locator,
  option: string,
) {
  await dropdown.click();
  await page.getByRole('option', { name: option, exact: true }).click();
}
