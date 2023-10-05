import React from 'react';

import { clsx } from 'clsx';
import { type IconType } from 'react-icons/lib';
import { Link, type LinkProps } from 'react-router-dom';

export type VisualizationModeProps = Omit<LinkProps, 'children'> & {
  icon: React.ReactElement<IconType>;
  title: string;
};

export const VisualizationMode = ({ className, icon, title, ...props }: VisualizationModeProps) => {
  return (
    <Link
      className={clsx(
        'flex flex-col items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105 [&>svg]:h-24 [&>svg]:w-24',
        className
      )}
      {...props}
    >
      {icon}
      {title}
    </Link>
  );
};
