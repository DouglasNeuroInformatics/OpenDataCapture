import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'flex' }}>
      <button
        style={{
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
          width: '20px'
        }}
        onClick={() => setCount(count - 1)}
      >
        -
      </button>
      <span
        style={{
          paddingLeft: '10px',
          paddingRight: '10px',
          fontSize: '14pt',
          fontFamily: 'monospace'
        }}
      >
        {count}
      </span>
      <h1 className="text-3xl">Hello World</h1>
      <button
        style={{
          cursor: 'pointer',
          border: 'none',
          borderRadius: '4px',
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
