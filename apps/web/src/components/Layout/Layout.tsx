import { Outlet } from 'react-router-dom';

import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="flex h-screen w-screen flex-col md:flex-row">
      <div className="md:hidden print:hidden">
        <Navbar />
      </div>
      <div className="hidden md:flex md:flex-shrink-0 print:hidden">
        <Sidebar />
      </div>
      <div className="scrollbar-none flex flex-grow flex-col overflow-y-scroll pt-16 md:pt-0">
        <main className="container flex flex-grow flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
