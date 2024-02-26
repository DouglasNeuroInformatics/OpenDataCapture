export type NavItem = {
  [key: `data-${string}`]: unknown;
  icon?: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  id: string;
  label: string;
};
