import { Outlet } from '@tanstack/react-router';

import { Footer } from '../Footer';
import { GroupSwitcher } from '../GroupSwitcher';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';

export const Layout = () => {
  return (
    <div className="flex h-screen w-screen flex-col md:flex-row" data-testid="layout">
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
        className="scrollbar-none relative flex grow flex-col overflow-y-scroll pt-14 md:pt-0"
        data-testid="layout-main"
      >
        <GroupSwitcher />
        <main className="container flex grow flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
