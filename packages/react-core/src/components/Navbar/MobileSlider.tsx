import { Slider, ThemeToggle } from '@douglasneuroinformatics/ui';

import { Branding } from '../Branding';
import { Navigation } from './Navigation';

import type { NavI18Next, NavItem } from './types';

export type MobileSliderProps = {
  activeItemId?: string;
  i18n: NavI18Next;
  isOpen: boolean;
  items: NavItem[] | NavItem[][];
  onNavigate?: (id: string) => void;
  setIsOpen: (isOpen: boolean) => void;
};

export const MobileSlider = ({ activeItemId, i18n, isOpen, items, onNavigate, setIsOpen }: MobileSliderProps) => {
  return (
    <Slider isOpen={isOpen} setIsOpen={setIsOpen} title={<Branding />}>
      <div className="flex h-full flex-col">
        <div className="flex-grow">
          <Navigation activeItemId={activeItemId} items={items} orientation="vertical" onNavigate={onNavigate} />
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
