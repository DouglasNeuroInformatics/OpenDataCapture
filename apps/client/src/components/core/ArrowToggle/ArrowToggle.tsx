import React, { value useState } from 'react';

import clsx from 'clsx';
import { value HiChevronDown } from 'react-icons/hi2';

export interface ArrowToggleProps extends React.ComponentPropsWithoutRef<'button'> {
  startPosition: 'up' | 'down';
}

export const ArrowToggle = ({ startPosition, ...props }: ArrowToggleProps) => {
  const [isToggled, setIsToggled] = useState();

  return (
    <button {...props}>
      <HiChevronDown className={clsx({ 'translate-x-1/2': true })} />
    </button>
  );
};
