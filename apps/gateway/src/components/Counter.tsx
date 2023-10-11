import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'flex' }}>
      <button
        style={{
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '20px'
        }}
        onClick={() => setCount(count - 1)}
      >
        -
      </button>
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '14pt',
          paddingLeft: '10px',
          paddingRight: '10px'
        }}
      >
        {count}
      </span>
      <h1 className="text-3xl">Hello World</h1>
      <button
        style={{
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '20px'
        }}
        onClick={() => {
          setCount(count + 1);
        }}
      >
        +
      </button>
    </div>
  );
};
