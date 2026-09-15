import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CodeErrorBlock } from '../CodeErrorBlock';

const indexFileContent = [
  'line 1',
  'line 2',
  'line 3',
  'line 4',
  'line 5',
  'line 6',
  'const x = ;',
  'line 8',
  'line 9',
  'line 10',
  'line 11',
  'line 12'
].join('\n');

const context = {
  files: [{ content: indexFileContent, name: 'index.ts' }],
  indexFilename: 'index.ts'
};

describe('CodeErrorBlock', () => {
  afterEach(cleanup);

  it('should render a window of lines around the erroring line, highlighting it', () => {
    const error = {
      cause: {
        errors: [{ location: { lineText: 'const x = ;' } }]
      }
    } as any;
    render(<CodeErrorBlock context={context} error={error} />);
    expect(screen.getByText('const x = ;')).toBeTruthy();
    expect(screen.getByText('line 4')).toBeTruthy();
    expect(screen.queryByText('line 1')).toBeNull();
    expect(screen.queryByText('line 12')).toBeNull();
  });

  it('should render nothing when the esbuild error carries no location', () => {
    const error = { cause: { errors: [{ location: null }] } } as any;
    const { container } = render(<CodeErrorBlock context={context} error={error} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when the index file cannot be found among the inputs', () => {
    const error = { cause: { errors: [{ location: { lineText: 'const x = ;' } }] } } as any;
    const { container } = render(<CodeErrorBlock context={{ files: [], indexFilename: 'missing.ts' }} error={error} />);
    expect(container.firstChild).toBeNull();
  });

  it('should log an error and render nothing when the erroring line cannot be found in the source', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = { cause: { errors: [{ location: { lineText: 'not in the file' } }] } } as any;
    const { container } = render(<CodeErrorBlock context={context} error={error} />);
    expect(container.firstChild).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Could not find index of error'));
    errorSpy.mockRestore();
  });
});
