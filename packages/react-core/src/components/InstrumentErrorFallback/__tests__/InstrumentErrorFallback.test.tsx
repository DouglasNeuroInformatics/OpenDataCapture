import { InstrumentBundlerError } from '@opendatacapture/instrument-bundler';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { InstrumentErrorFallback } from '../InstrumentErrorFallback';

const context = { files: [], indexFilename: null };

describe('InstrumentErrorFallback', () => {
  afterEach(cleanup);

  it('should render nothing when there is no error', () => {
    const { container } = render(<InstrumentErrorFallback context={context} error={null as any} title="Failed" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the title, description and error message', () => {
    render(
      <InstrumentErrorFallback
        context={context}
        description="Something broke"
        error={new Error('boom')}
        title="Failed"
      />
    );
    expect(screen.getByText('Failed')).toBeTruthy();
    expect(screen.getByText('Something broke')).toBeTruthy();
    expect(screen.getByText('boom')).toBeTruthy();
  });

  it('should render the cause behind a toggle when the error carries one', () => {
    const error = new Error('outer', { cause: new Error('inner cause') });
    render(<InstrumentErrorFallback context={context} error={error} title="Failed" />);
    fireEvent.click(screen.getByText('Cause'));
    expect(screen.getByText('inner cause')).toBeTruthy();
  });

  it('should render the stack trace behind a toggle when the error carries one', () => {
    const error = new Error('boom');
    error.stack = 'Error: boom\n    at foo (/app/index.js:1:1)';
    render(<InstrumentErrorFallback context={context} error={error} title="Failed" />);
    expect(screen.getByText('Stack')).toBeTruthy();
  });

  it('should render the code block for an ESBUILD_FAILURE, using its location', () => {
    const bundlerError = new InstrumentBundlerError('Failed to Compile', {
      cause: { errors: [{ location: { lineText: 'const x = ;' } }] },
      kind: 'ESBUILD_FAILURE'
    });
    render(
      <InstrumentErrorFallback
        context={{ files: [{ content: 'const x = ;', name: 'index.ts' }], indexFilename: 'index.ts' }}
        error={bundlerError}
        title="Failed"
      />
    );
    expect(screen.getByText('const x = ;')).toBeTruthy();
  });
});
