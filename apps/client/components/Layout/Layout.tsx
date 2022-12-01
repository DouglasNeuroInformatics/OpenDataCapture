import React, { useEffect, useState } from 'react';

import { Container } from 'react-bootstrap';
import { useMedia } from 'react-use';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [collapseSidebarMobile, setCollapseSidebarMobile] = useState(true);
  const isMobile = useMedia('(max-width: 768px)');

  useEffect(() => {
    if (!isMobile) {
      setCollapseSidebarMobile(true);
    }
  }, [isMobile]);

  return (
    <React.Fragment>
      <Navbar onToggleClick={() => setCollapseSidebarMobile(false)} />
      <div className="d-md-flex bg-light text-dark vh-100">
        <Sidebar collapsed={collapseSidebarMobile} onClose={() => setCollapseSidebarMobile(true)} />
        <main className="main">
          <Container className="p-3 p-md-5">{children}</Container>
        </main>
      </div>
    </React.Fragment>
  );
};

export default Layout;
