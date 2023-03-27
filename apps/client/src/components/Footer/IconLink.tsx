import React from 'react';

import { type IconType } from 'react-icons';

export interface IconLinkProps {
  href: string;
  icon: React.ReactElement<IconType>;
}

export const IconLink = ({ href, icon }: IconLinkProps) => {
  return (
    <a className="transition-transform hover:scale-125" href={href} rel="noreferrer" target="_blank">
      {icon}
    </a>
  );
};
