import React, { useMemo, useState } from 'react';

import { HiChevronUp } from 'react-icons/hi2';

export interface ArrowToggleProps extends React.ComponentPropsWithoutRef<'button'> {
  position: 'up' | 'right' | 'down' | 'left';
  rotation: number;
}

export const ArrowToggle = ({ position, rotation, onClick, ...props }: ArrowToggleProps) => {
  const [isToggled, setIsToggled] = useState(false);

  const computedRotation = useMemo(() => {
    const toggleRotation = isToggled ? rotation : 0;
    switch (position) {
      case 'up':
        return 0 + toggleRotation;
      case 'right':
        return 90 + toggleRotation;
      case 'down':
        return 180 + toggleRotation;
      case 'left':
        return 270 + toggleRotation;
    }
  }, [position, rotation, isToggled]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setIsToggled(!isToggled);
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      <HiChevronUp
        className="transform-gpu transition-transform"
        data-testid="arrow-up-icon"
        style={{ transform: `rotate(${computedRotation}deg)` }}
      />
    </button>
  );
};
