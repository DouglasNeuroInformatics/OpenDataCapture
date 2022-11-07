import React from 'react';

import Container from 'react-bootstrap/Container';

import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='d-flex bg-light text-dark vh-100'>
      <Sidebar />
      <Container as='main' className='p-md-5 overflow-scroll'>
        {children}
      </Container>
    </div>
  );
};

export default Layout;