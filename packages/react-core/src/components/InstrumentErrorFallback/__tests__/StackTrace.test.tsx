import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { StackTrace } from '../StackTrace';

describe('StackTrace', () => {
  afterEach(cleanup);

  it('should render one frame per line of the parsed stack, behind the Stack toggle', () => {
    const stack = ['Error: boom', '    at foo (/app/index.js:10:5)', '    at bar (/app/other.js:20:1)'].join('\n');
    render(<StackTrace stack={stack} />);
    fireEvent.click(screen.getByText('Stack'));
    expect(screen.getAllByText('/app/index.js')).toBeTruthy();
    expect(screen.getByText(/:10:5\)/)).toBeTruthy();
    expect(screen.getByText(/:20:1\)/)).toBeTruthy();
  });
});
