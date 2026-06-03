import { Outlet } from '@tanstack/react-router';

import { Footer } from '../Footer';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';

export const Layout = () => {
  return (
    // `w-full` (100% of #root, which excludes the scrollbar gutter) rather than
    // `w-screen` (100vw, which *includes* it): when a vertical scrollbar is
    // present, 100vw is wider than the document and pushes the body sideways,
    // exposing the slate body background. `overflow-clip` additionally prevents
    // any page or child from extending the layout below the footer.
    <div className="flex h-screen w-full flex-col overflow-clip md:flex-row" data-testid="layout">
      <div className="absolute md:hidden">
        <Navbar />
      </div>
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>
      {/*
        The main scroll region scrolls vertically. `overflow-x-clip` joins
        `overflow-y-scroll` so the region scrolls only along Y while still
        clipping any horizontal overflow without breaking `position: sticky`
        inside (clip does not create a separate scroll container).
      */}
      <div
        className="scrollbar-none flex grow flex-col overflow-x-clip overflow-y-scroll pt-14 md:pt-0"
        data-testid="layout-main"
      >
        <main className="container flex grow flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
