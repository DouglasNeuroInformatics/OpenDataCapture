import React, { useState } from 'react';

import { Outlet } from 'react-router-dom';

import { Footer } from '../Footer';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="flex h-screen w-screen flex-col md:flex-row">
      <div className="md:hidden">
        <Navbar />
      </div>
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>
      <main className="container flex-grow overflow-scroll">
        <Outlet />
      </main>
    </div>
  );
};
