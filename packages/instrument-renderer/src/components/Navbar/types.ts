import type { Promisable } from 'type-fest';

export type NavItem = {
  [key: `data-${string}`]: unknown;
  icon?: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  id: string;
  label: string;
};

export type NavI18Next = {
  changeLanguage: (lang: string) => Promisable<unknown>;
  resolvedLanguage?: string;
};
