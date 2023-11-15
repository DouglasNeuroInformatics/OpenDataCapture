import type { Promisable } from 'type-fest';

export type NavItem = {
  id: number | string;
  label: string;
  onClick: (id: number | string) => void;
};

export type NavI18Next = {
  changeLanguage: (lang: string) => Promisable<unknown>;
  resolvedLanguage?: string;
};
