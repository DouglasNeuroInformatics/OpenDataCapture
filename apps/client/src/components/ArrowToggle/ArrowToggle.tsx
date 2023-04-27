import React, { useMemo, useState } from 'react';

import { clsx } from 'clsx';
import { HiChevronUp } from 'react-icons/hi2';

export interface ArrowToggleProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'content'> {
  position: 'up' | 'right' | 'down' | 'left';
  rotation: number;
  content?: React.ReactNode;
  contentPosition?: 'left' | 'right';
}

export const ArrowToggle = ({
  className,
  position,
  rotation,
  onClick,
  content,
  contentPosition,
  ...props
}: ArrowToggleProps) => {
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
    <button
      className={clsx('flex items-center justify-center', className)}
      type="button"
      onClick={handleClick}
      {...props}
    >
      {content && contentPosition === 'left' && <span className="mr-1">{content}</span>}
      <HiChevronUp
        className="transform-gpu transition-transform"
        data-testid="arrow-up-icon"
        style={{ transform: `rotate(${computedRotation}deg)` }}
      />
      {content && contentPosition === 'right' && <span className="ml-1">{content}</span>}
    </button>
  );
};
