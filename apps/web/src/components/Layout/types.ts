export type NavItem = {
  [key: `data-${string}`]: unknown;
  disabled?: boolean;
  icon?: React.ComponentType<Omit<React.SVGProps<SVGSVGElement>, 'ref'>>;
  id: string;
  label: string;
};
