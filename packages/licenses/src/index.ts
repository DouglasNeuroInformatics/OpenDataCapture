import _licenses from '../assets/licenses.json';

export type LicenseIdentifier = Extract<keyof typeof _licenses, string>;

export type License = {
  isOpenSource: boolean;
  name: string;
  reference: string;
};

export const licenses = new Map(Object.entries(_licenses)) as Map<LicenseIdentifier, License>;

