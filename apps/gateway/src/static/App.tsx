import React, { useState } from 'react';

export const App = () => {
  const [count, setCount] = useState(0);
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link href="/favicon.ico" rel="icon" type="image/svg+xml" />
        <meta content="width=device-width, initial-scale=1.0" name="viewport" />
        <title>Open Data Capture</title>
        <link href="main.css" rel="stylesheet" />
      </head>
      <body className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <div>
          <h1>Counter</h1>
          <p>Count: {count}</p>
          <button
            onClick={() => {
              setCount(count + 1);
            }}
          >
            Increment
          </button>
        </div>
      </body>
    </html>
  );
};
