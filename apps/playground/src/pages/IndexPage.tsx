import React from 'react';

import { Separator } from '@douglasneuroinformatics/libui/components';

import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';

const IndexPage = () => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden px-8 xl:px-12 2xl:px-16">
      <Header />
      <Separator />
      <MainContent />
    </div>
  );
};

export default IndexPage;
