import React from 'react';

import { RedocStandalone } from 'redoc';

import spec from 'schemas/spec/example.yaml';

export default function App() {
  console.log(spec);
  return (
    <RedocStandalone spec={spec} />
  );
}
