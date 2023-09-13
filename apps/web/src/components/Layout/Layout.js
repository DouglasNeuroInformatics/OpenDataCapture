import React from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../Footer';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
export var Layout = function () {
  return React.createElement(
    'div',
    { className: 'flex h-screen w-screen flex-col md:flex-row' },
    React.createElement('div', { className: 'print:hidden md:hidden' }, React.createElement(Navbar, null)),
    React.createElement(
      'div',
      { className: 'hidden print:hidden md:flex md:flex-shrink-0' },
      React.createElement(Sidebar, null)
    ),
    React.createElement(
      'div',
      { className: 'scrollbar-none flex flex-grow flex-col overflow-y-scroll' },
      React.createElement('main', { className: 'container flex-grow' }, React.createElement(Outlet, null)),
      React.createElement(Footer, null)
    )
  );
};
