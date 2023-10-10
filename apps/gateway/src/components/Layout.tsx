import React from 'react';

export type LayoutProps = {
  children: React.ReactNode
  title: string;
};

export const Layout = (props: LayoutProps) => {
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
        <div className="App" role="main">
          <article className="App-article">
            <img alt="logo" className="App-logo" src={'/bunlogo.svg'} />

            <div style={{ height: '30px' }}></div>
            <h3>{props.title}</h3>

            <div style={{ height: '30px' }}></div>
            {props.children}
          </article>
        </div>
      </body>
    </html>
  );
};
