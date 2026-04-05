import phoneData from '@/data/mock-phones.json';
import type { MockPhone } from '@/types/phone';

export const mockPhones = phoneData as MockPhone[];

export function getMockPhone(phoneId: string) {
  return mockPhones.find((phone) => phone.id === phoneId) ?? null;
}
