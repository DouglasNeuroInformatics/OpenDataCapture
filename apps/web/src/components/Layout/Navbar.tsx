import React, { useEffect, useState } from 'react';

import { useMediaQuery } from '@douglasneuroinformatics/libui/hooks';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Branding } from '@opendatacapture/react-core';

import { MobileSlider } from './MobileSlider';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // This is to prevent ugly styling when resizing the viewport
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (isDesktop) {
      setIsOpen(false);
    }
  }, [isDesktop]);

  return (
    <React.Fragment>
      <div className="fixed top-0 z-10 w-full bg-white/80 text-slate-700 shadow backdrop-blur-lg dark:bg-slate-800/75 dark:text-slate-300">
        <div className="h--full w-full bg-inherit">
          <div className="container flex items-center justify-between bg-inherit py-3 font-medium">
            <Branding className="[&>span]:hidden" />
            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
              }}
            >
              <Bars3Icon height={36} width={36} />
            </button>
          </div>
        </div>
      </div>
      <MobileSlider
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onNavigate={() => {
          setIsOpen(false);
        }}
      />
    </React.Fragment>
  );
};
