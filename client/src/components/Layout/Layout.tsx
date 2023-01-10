import React from 'react';

import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <React.Fragment>
      <Sidebar />
      <main>{children}</main>
    </React.Fragment>
  );
};

export { Layout as default, type LayoutProps };
