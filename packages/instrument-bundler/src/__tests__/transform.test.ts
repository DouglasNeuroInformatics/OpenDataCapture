import { describe, expect, it } from 'vitest';

import { transformStaticImports } from '../transform.js';

describe('transformStaticImports', () => {
  it('should transform a default import', () => {
    expect(transformStaticImports("import React from 'react';")).toBe(
      "const { default: React } = await import('react');"
    );
  });
  it('should transform named imports', () => {
    expect(transformStaticImports("import { useEffect, useState } from 'react';")).toBe(
      "const { useEffect, useState } = await import('react');"
    );
  });
  it('should transform named and default imports from the same source', () => {
    expect(transformStaticImports("import React, { useState } from 'react';")).toBe(
      "const { useState, default: React } = await import('react');"
    );
  });
  it('should transform a namespace import', () => {
    expect(transformStaticImports("import * as React from 'react';")).toBe("const React = await import('react');");
  });
  it('should transform named and default imports from the same source', () => {
    expect(transformStaticImports("import _ from 'lodash'; import { useEffect, useState } from 'react';")).toBe(
      "const { default: _ } = await import('lodash'); const { useEffect, useState } = await import('react');"
    );
  });
});
