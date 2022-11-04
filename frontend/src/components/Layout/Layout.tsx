import React from 'react';

import Container from 'react-bootstrap/Container';

import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='d-flex vh-100'>
      <Sidebar />
      <Container as='main' className='bg-light text-dark p-md-5'>
        {children}
      </Container>
    </div>
  );
};

export default Layout;