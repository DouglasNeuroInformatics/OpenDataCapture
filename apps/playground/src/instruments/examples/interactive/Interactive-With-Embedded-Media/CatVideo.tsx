import React, { useState } from '/runtime/v1/react@19.x';

import catVideo from './cat-video.mp4';

export const CatVideo: React.FC<{ onNext: (isCorrect: boolean) => void }> = ({ onNext }) => {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="animal-select">Which Animal Did You See?</label>
        <select
          id="animal-select"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        >
          <option value="">--Please choose an option--</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="hamster">Hamster</option>
          <option value="parrot">Parrot</option>
          <option value="cow">Cow</option>
          <option value="spider">Spider</option>
          <option value="goldfish">Goldfish</option>
        </select>
      </div>
      <video controls>
        <source src={catVideo} type="video/mp4" />
      </video>
      <button disabled={!value} type="button" onClick={() => onNext(value === 'cat')}>
        Next
      </button>
    </div>
  );
};
