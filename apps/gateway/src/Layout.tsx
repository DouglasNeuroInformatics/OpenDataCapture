import React from 'react';

export type LayoutProps = {
  children: React.ReactNode;
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
      </head>
      <body className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">{props.children}</body>
    </html>
  );
};
