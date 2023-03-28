import React, { useEffect, useRef, useState } from 'react';

import { HiBars3 } from 'react-icons/hi2';

import { Branding } from './Branding';
import { Navigation } from './Navigation';

export interface NavbarProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const Navbar = ({ containerRef }: NavbarProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownHeight, setDropdownHeight] = useState(0);

  useEffect(() => {
    if (dropdownRef.current) {
      let sum = 0;
      Array.from(dropdownRef.current.childNodes).forEach((node) => {
        if (node instanceof HTMLElement) {
          sum += node.offsetHeight;
        }
      });
      setDropdownHeight(sum);
    }
  }, [isOpen]);

  return (
    <div className="flex flex-col bg-slate-900 px-2 text-slate-300 duration-700">
      <div className="flex w-full justify-between py-2">
        <Branding />
        <button type="button" onClick={() => setIsOpen(!isOpen)}>
          <HiBars3 className="h-9 w-9" />
        </button>
      </div>
      <div
        className="overflow-hidden transition-all duration-500"
        ref={dropdownRef}
        style={{ height: isOpen ? dropdownHeight : 0 }}
      >
        <div className="border-spacing-2 border-t py-2">
          <Navigation onClick={() => setIsOpen(false)} />
        </div>
      </div>
    </div>
  );
};
