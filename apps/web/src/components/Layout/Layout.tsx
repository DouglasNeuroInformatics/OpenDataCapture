import { cn } from '@douglasneuroinformatics/libui/utils';
import { Outlet } from '@tanstack/react-router';

import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useAppStore } from '@/store';
import { getInstanceCardStyle, INSTANCE_CARD_VARIABLES } from '@/utils/card-color';

import { Footer } from '../Footer';
import { GroupSwitcher, useIsGroupSwitcherVisible } from '../GroupSwitcher';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';

export const Layout = () => {
  const groupSwitcherPosition = useAppStore((store) => store.groupSwitcherPosition);
  const isGroupSwitcherVisible = useIsGroupSwitcherVisible();
  const setupState = useSetupStateQuery().data;

  return (
    <div
      className={cn('flex h-screen w-screen flex-col md:flex-row', INSTANCE_CARD_VARIABLES)}
      data-testid="layout"
      style={getInstanceCardStyle(setupState)}
    >
      <div className="absolute md:hidden">
        <Navbar />
      </div>
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>
      {/* `relative` establishes a containing block so absolutely-positioned
          descendants (e.g. the visually-hidden native inputs inside libui
          Checkbox/RadioGroup/Switch) are anchored to — and clipped by — this
          scroll container rather than escaping to the viewport and inflating
          the document height. */}
      <div
        className="relative flex grow scrollbar-none flex-col overflow-y-scroll pt-14 md:pt-0"
        data-testid="layout-main"
      >
        {groupSwitcherPosition === 'topbar' && isGroupSwitcherVisible && (
          <div className="bg-background/80 sticky top-0 z-20 hidden items-center justify-end px-4 py-2 backdrop-blur-lg md:flex md:h-16">
            <GroupSwitcher className="w-45" />
          </div>
        )}
        <main className="container flex grow flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
