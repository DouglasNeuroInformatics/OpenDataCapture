import React, { useMemo, useState } from 'react';

import { HiChevronUp } from 'react-icons/hi2';

type ArrowTogglePosition = 'up' | 'right' | 'down' | 'left';

type Rotation = 0 | 90 | 180 | -90;

const defaultRotations: Record<ArrowTogglePosition, Rotation> = {
  up: 0,
  right: 90,
  down: 180,
  left: -90
};

export interface ArrowToggleProps extends React.ComponentPropsWithoutRef<'button'> {
  position: ArrowTogglePosition;
  rotation: Rotation;
}

export const ArrowToggle = ({ position, rotation, onClick, ...props }: ArrowToggleProps) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setIsToggled(!isToggled);
    if (onClick) {
      onClick(event);
    }
  };

  const rotationClassName = useMemo(() => {
    let computedRotation = defaultRotations[position];
    if (isToggled) {
      const toggledRotation = computedRotation + rotation;
      if (toggledRotation === -180) {
        computedRotation = 180;
      } else if (toggledRotation > 180) {
        computedRotation = -(toggledRotation - 180) as Rotation;
      } else {
        computedRotation = toggledRotation as Rotation;
      }
    }
    return computedRotation >= 0 ? `rotate-${computedRotation}` : `-rotate-${Math.abs(computedRotation)}`;
  }, [position, rotation, isToggled]);

  return (
    <button onClick={handleClick} {...props}>
      <HiChevronUp className={`transform-gpu transition-transform ${rotationClassName}`} />
    </button>
  );
};
