import { Outlet } from '@tanstack/react-router';

import { Footer } from '../Footer';
import { Navbar } from '../Navbar';
import { Sidebar } from '../Sidebar';

export const Layout = () => {
  return (
    <div className="flex h-screen w-screen flex-col md:flex-row">
      <div className="absolute md:hidden">
        <Navbar />
      </div>
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>
      <div className="scrollbar-none flex grow flex-col overflow-y-scroll pt-14 md:pt-0">
        <main className="container flex grow flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
