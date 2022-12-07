import React from 'react';

import { RedocStandalone } from 'redoc';

import spec from 'openapi/spec.json';

export default function App() {
  console.log(spec);
  return <RedocStandalone spec={spec} />;
}
