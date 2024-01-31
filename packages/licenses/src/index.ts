import _licenses from '../assets/licenses.json';

type LicenseIdentifier = 'UNLICENSED' | Extract<keyof typeof _licenses, string>;

type License = {
  isOpenSource: boolean;
  name: string;
  reference: string;
};

const licenses = new Map(Object.entries(_licenses)) as Map<LicenseIdentifier, License>;

licenses.set('UNLICENSED', {
  isOpenSource: false,
  name: 'Unlicensed/Unknown',
  reference: 'https://choosealicense.com'
});
