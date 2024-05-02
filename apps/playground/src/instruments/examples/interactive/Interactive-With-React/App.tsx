const { default: React, useState } = await import('/runtime/v1/react.js');

import reactLogo from './react.svg';

import './App.css';

export type AppProps = {
  done: (data: { count: number }) => void;
};

export const App = ({ done }: AppProps) => {
  const [count, setCount] = useState(0);
  return (
    <>
      <div>
        <a href="https://react.dev" rel="noreferrer" target="_blank">
          <img alt="React logo" className="logo react" src={reactLogo} />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      <button type="button" onClick={() => done({ count })}>
        Submit
      </button>
    </>
  );
};
