import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { useEffect, useState } from '/runtime/v1/react@18.x';
import { createRoot } from '/runtime/v1/react-dom@18.x/client.js';
import { z } from '/runtime/v1/zod@3.23.x';

import catVideo from './cat-video.mp4';

const Task: React.FC<{ done: (data: { success: boolean }) => void }> = ({ done }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [value, setValue] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((value) => value && value - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!secondsRemaining) {
      done({ success: false });
    }
  }, [done, secondsRemaining]);

  useEffect(() => {
    if (value.toLowerCase() === 'cat') {
      done({ success: true });
    }
  }, [value]);

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        justifyContent: 'center',
        minHeight: '80vh'
      }}
    >
      <h3>Which animal is in the video?</h3>
      <div>
        <label htmlFor="response">Response: </label>
        <input id="response" name="response" value={value} onChange={(event) => setValue(event.target.value)} />
      </div>
      <div>
        <span>Time Remaining: {secondsRemaining}</span>
      </div>
      <video controls muted>
        <source src={catVideo} type="video/mp4" />
      </video>
    </div>
  );
};

export default defineInstrument({
  clientDetails: {
    estimatedDuration: 1,
    instructions: ['Please watch the video and then answer the question.']
  },
  content: {
    render(done) {
      const rootElement = document.createElement('div');
      document.body.appendChild(rootElement);
      const root = createRoot(rootElement);
      root.render(<Task done={done} />);
    }
  },
  details: {
    authors: ['Joshua Unrau'],
    description: 'This test assesses whether a person knows what a cat is',
    license: 'Apache-2.0',
    title: 'Breakout Task'
  },
  internal: {
    edition: 1,
    name: 'CAT_VIDEO_TASK'
  },
  kind: 'INTERACTIVE',
  language: 'en',
  measures: {
    success: {
      kind: 'const',
      ref: 'success'
    }
  },
  tags: ['Interactive', 'React'],
  validationSchema: z.object({
    success: z.boolean()
  })
});
