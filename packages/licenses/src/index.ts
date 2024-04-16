import _licenses from '../assets/licenses.json';

type License = {
  isOpenSource: boolean;
  name: string;
  reference: string;
};

type LicenseIdentifier = 'PUBLIC_DOMAIN' | 'UNLICENSED' | Extract<keyof typeof _licenses, string>;

const licenses = new Map(Object.entries(_licenses)) as Map<LicenseIdentifier, License>;

licenses.set('UNLICENSED', {
  isOpenSource: false,
  name: 'Unlicensed/Unknown',
  reference: 'https://choosealicense.com'
});

licenses.set('PUBLIC_DOMAIN', {
  isOpenSource: true,
  name: 'Public Domain',
  reference: 'https://choosealicense.com'
});

export { type License, type LicenseIdentifier, licenses };
