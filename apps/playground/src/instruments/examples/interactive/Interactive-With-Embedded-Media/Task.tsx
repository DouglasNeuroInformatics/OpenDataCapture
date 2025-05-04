import React, { useEffect, useState } from '/runtime/v1/react@19.x';
import { match } from '/runtime/v1/ts-pattern@5.x';
import { z } from '/runtime/v1/zod@3.23.x';

import { CatVideo } from './CatVideo.tsx';
import { CowAudio } from './CowAudio.tsx';

export const $TaskData = z.object({
  identifiedCat: z.boolean(),
  identifiedCow: z.boolean(),
  seconds: z.number().int().nonnegative()
});

export type TaskData = z.infer<typeof $TaskData>;

export const Task: React.FC<{ done: (data: TaskData) => void }> = ({ done }) => {
  const [index, setIndex] = useState<0 | 1 | 2>(0);
  const [seconds, setSeconds] = useState(0);
  const [identifiedCow, setIdentifiedCow] = useState<boolean>();

  useEffect(() => {
    if (index === 0) {
      return;
    }
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [index]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '0px 10px' }}>
      {index > 0 && <p>Time Elapsed: {seconds}</p>}
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'center'
        }}
      >
        {match(index)
          .with(0, () => (
            <>
              <h1 style={{ textAlign: 'center' }}>Welcome</h1>
              <button
                style={{
                  backgroundColor: 'blue',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '8px 24px'
                }}
                type="button"
                onClick={() => {
                  setIndex(1);
                }}
              >
                Begin
              </button>
            </>
          ))
          .with(1, () => (
            <CowAudio
              onNext={(identifiedCow) => {
                setIdentifiedCow(identifiedCow);
                setIndex(2);
              }}
            />
          ))
          .with(2, () => (
            <CatVideo
              onNext={(identifiedCat) => {
                done({ identifiedCat, identifiedCow: identifiedCow!, seconds });
              }}
            />
          ))
          .exhaustive()}
      </div>
    </div>
  );
};
