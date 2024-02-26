import { ThemeToggle } from '@douglasneuroinformatics/ui';
import { Branding } from '@open-data-capture/react-core';

import { Navigation } from './Navigation';
import { UserDropup } from './UserDropup';

import type { NavItem } from './types';

export type SidebarProps = {
  activeItemId: string;
  items: NavItem[] | NavItem[][];
  onNavigate: (id: string) => void;
};

export const Sidebar = ({ activeItemId, items, onNavigate }: SidebarProps) => {
  return (
    <div className="flex h-screen w-80 flex-col bg-slate-900 p-3 text-slate-300 shadow-lg dark:border-r dark:border-slate-700">
      <Branding className="h-14 md:p-2" logoVariant="light" />
      <hr className="my-1 h-[1px] border-none bg-slate-700" />
      <Navigation
        activeItemId={activeItemId}
        btn={{
          activeClassName: 'text-slate-100 bg-slate-800',
          className: 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
        }}
        isAlwaysDark={true}
        items={items}
        orientation="vertical"
        onNavigate={onNavigate}
      />
      <hr className="my-1 mt-auto h-[1px] border-none bg-slate-700" />
      <div className="flex items-center">
        <UserDropup />
        <ThemeToggle className="hover:backdrop-brightness-150" />
      </div>
    </div>
  );
};
