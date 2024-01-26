import { useState } from 'react';

export type RootProps = Record<string, unknown>;

export const Root = (props: RootProps) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Hello World</h1>
      <div>
        <p>Count: {count}</p>
        <button type="button" onClick={() => setCount(count + 1)}>
          Increment Count
        </button>
      </div>
      <p>Props: {JSON.stringify(props, null, 2)}</p>
    </div>
  );
};
