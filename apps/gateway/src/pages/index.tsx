import { useState } from 'react';

type IndexPageProps = {
  title?: string;
};

const IndexPage = ({ title }: IndexPageProps) => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
    </div>
  );
};

export default IndexPage;
