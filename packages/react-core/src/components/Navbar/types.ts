import type { Promisable } from 'type-fest';

export type NavItem = {
  icon?: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  id: number | string;
  label: string;
  onClick: (id: number | string) => void;
};

export type NavI18Next = {
  changeLanguage: (lang: string) => Promisable<unknown>;
  resolvedLanguage?: string;
};
