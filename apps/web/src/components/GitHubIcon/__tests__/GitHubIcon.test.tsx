import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { GitHubIcon } from '../GitHubIcon';

const renderMark = (className?: string) => render(<GitHubIcon className={className} />).container.querySelector('svg')!;

describe('GitHubIcon', () => {
  afterEach(cleanup);

  it('should be hidden from assistive technology, since the link text beside it already names the destination', () => {
    expect(renderMark().getAttribute('aria-hidden')).toBe('true');
  });

  it('should fill with the current text colour, so it matches the link it sits in', () => {
    expect(renderMark().getAttribute('fill')).toBe('currentColor');
  });

  it("should keep the octicon's own 16px viewBox, so the path is not cropped", () => {
    expect(renderMark().getAttribute('viewBox')).toBe('0 0 16 16');
  });

  it('should apply the caller class name, so the call site controls its size', () => {
    expect(renderMark('h-4 w-4').getAttribute('class')).toBe('h-4 w-4');
  });
});
