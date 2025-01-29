import { useState } from '/runtime/v1/react@18.x';

import cowMoo from './cow-moo.mp3';

export const CowAudio: React.FC<{ onNext: (isCorrect: boolean) => void }> = ({ onNext }) => {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="animal-select">Which Animal Did You Hear?</label>
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
      <audio controls>
        <source src={cowMoo} type="audio/mpeg" />
      </audio>
      <button disabled={!value} type="button" onClick={() => onNext(value === 'cow')}>
        Next
      </button>
    </div>
  );
};
