import { twMerge } from 'tailwind-merge';

import { Logo } from '../Logo';

export type BrandingProps = {
  className?: string;
  showText?: boolean;
};

export const Branding = ({ className, showText = true }: BrandingProps) => {
  return (
    <div className={twMerge('flex h-10 items-center', className)}>
      <Logo className="h-full w-auto" />
      {showText && <span className="font-lg ml-3 whitespace-nowrap font-semibold">Open Data Capture</span>}
    </div>
  );
};
