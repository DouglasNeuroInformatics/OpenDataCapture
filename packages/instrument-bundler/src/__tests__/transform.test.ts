import { describe, expect, it } from 'vitest';

import { transformImports } from '../transform.js';

describe('transformImports', () => {
  it('should transform a default import', () => {
    expect(transformImports("import React from 'react';")).toBe("const { default: React } = await __import('react');");
  });
  it('should transform named imports', () => {
    expect(transformImports("import { useEffect, useState } from 'react';")).toBe(
      "const { useEffect, useState } = await __import('react');"
    );
  });
  it('should transform named and default imports from the same source', () => {
    expect(transformImports("import React, { useState } from 'react';")).toBe(
      "const { useState, default: React } = await __import('react');"
    );
  });
  it('should transform a namespace import', () => {
    expect(transformImports("import * as React from 'react';")).toBe("const React = await __import('react');");
  });
  it('should transform named and default imports from the same source', () => {
    expect(transformImports("import _ from 'lodash'; import { useEffect, useState } from 'react';")).toBe(
      "const { default: _ } = await __import('lodash'); const { useEffect, useState } = await __import('react');"
    );
  });
});
