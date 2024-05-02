import _licenses from '../assets/licenses.json';

type License = {
  isOpenSource: boolean;
  name: string;
  reference: string;
};

type LicenseIdentifier =
  | 'NON-FREE-COMMERCIAL-NOS'
  | 'NON-FREE-NON-COMMERCIAL-NOS'
  | 'NON-FREE-NOS'
  | 'PUBLIC-DOMAIN'
  | 'UNLICENSED'
  | Extract<keyof typeof _licenses, string>;

const licenses = new Map(Object.entries(_licenses)) as Map<LicenseIdentifier, License>;

licenses.set('NON-FREE-COMMERCIAL-NOS', {
  isOpenSource: false,
  name: 'Non-Free License (Commercial, Not Otherwise Specified)',
  reference: 'https://choosealicense.com'
});

licenses.set('NON-FREE-NON-COMMERCIAL-NOS', {
  isOpenSource: false,
  name: 'Non-Free License (Non-Commercial, Not Otherwise Specified)',
  reference: 'https://choosealicense.com'
});

licenses.set('NON-FREE-NOS', {
  isOpenSource: false,
  name: 'Non-Free License (Not Otherwise Specified)',
  reference: 'https://choosealicense.com'
});

licenses.set('UNLICENSED', {
  isOpenSource: false,
  name: 'Unlicensed/Unknown',
  reference: 'https://choosealicense.com'
});

licenses.set('PUBLIC-DOMAIN', {
  isOpenSource: true,
  name: 'Public Domain',
  reference: 'https://choosealicense.com'
});

export { type License, type LicenseIdentifier, licenses };
