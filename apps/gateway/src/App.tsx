import { useState } from 'react';

import { Layout } from './Layout';

export const App = () => {
  const [count, setCount] = useState(0);
  return (
    <Layout title="App">
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </Layout>
  );
};
