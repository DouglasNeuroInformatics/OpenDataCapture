import { Slider } from '@douglasneuroinformatics/ui';
import type { Assignment } from '@open-data-capture/types';

export type AssignmentSliderProps = {
  assignment: Assignment | null;
  onClose: () => void;
};

/** Component for modifying an existing assignment */
export const AssignmentSlider = ({ assignment, onClose }: AssignmentSliderProps) => {
  return (
    <Slider isOpen={assignment !== null} setIsOpen={onClose} title={assignment?.title}>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Deserunt architecto libero incidunt, quaerat quidem
      numquam voluptatum repellendus soluta harum nulla! Consequuntur sunt laudantium praesentium iure possimus soluta
      et alias tempora?
    </Slider>
  );
};
