import { Slider, ThemeToggle } from '@douglasneuroinformatics/ui';
import { Branding } from '@open-data-capture/react-core';
import { useTranslation } from 'react-i18next';

import { Navigation } from './Navigation';

import type { NavItem } from './types';

export type MobileSliderProps = {
  activeItemId?: string;
  isOpen: boolean;
  items: NavItem[] | NavItem[][];
  onNavigate?: (id: string) => void;
  setIsOpen: (isOpen: boolean) => void;
};

export const MobileSlider = ({ activeItemId, isOpen, items, onNavigate, setIsOpen }: MobileSliderProps) => {
  const { i18n } = useTranslation();
  return (
    <Slider isOpen={isOpen} setIsOpen={setIsOpen} title={<Branding />}>
      <div className="flex h-full flex-col">
        <div className="flex-grow">
          <Navigation
            activeItemId={activeItemId}
            isAlwaysDark={false}
            items={items}
            orientation="vertical"
            onNavigate={onNavigate}
          />
        </div>
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <button
            className="rounded-md p-2 font-medium hover:backdrop-brightness-95 dark:hover:backdrop-brightness-150"
            type="button"
            onClick={() => {
              void i18n.changeLanguage(i18n.resolvedLanguage === 'en' ? 'fr' : 'en');
            }}
          >
            {i18n.resolvedLanguage === 'en' ? 'Français' : 'English'}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </Slider>
  );
};
