import { useState } from 'react';

import { evaluateInstrument } from '@open-data-capture/common/instrument';

type IndexPageProps = {
  bundle: string;
  title?: string;
};

const IndexPage = ({ bundle, title }: IndexPageProps) => {
  const [count, setCount] = useState(0);
  const instrument = evaluateInstrument(bundle);

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Count</button>
      {bundle}
      {JSON.stringify(instrument)}
    </div>
  );
};

export default IndexPage;
