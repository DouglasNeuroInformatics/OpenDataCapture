import React from 'react';

import logo from '@/assets/logo.png';
import { Footer } from '@/components';

export type EntryPageWrapperProps = {
  title: string;
  children: React.ReactNode;
};

/** Standalone page used as a wrapper for forms (e.g., on login page) */
export const EntryPageWrapper = ({ children, title }: EntryPageWrapperProps) => (
  <div className="flex h-screen items-center justify-center bg-slate-50 sm:bg-slate-100">
    <div className="flex flex-col items-center rounded-lg bg-slate-50 px-12 py-8 sm:w-[24rem]">
      <img alt="logo" className="m-1 w-16" src={logo} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="mt-3 w-full">{children}</div>
      <br className="my-2" />
      <Footer isLogin />
    </div>
  </div>
);
