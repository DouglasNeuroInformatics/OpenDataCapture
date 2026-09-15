import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InstrumentIcon } from '../InstrumentIcon';

describe('InstrumentIcon', () => {
  afterEach(cleanup);

  it.each(['FILE', 'FORM', 'INTERACTIVE', 'SERIES', null] as const)(
    'should render an icon for kind %s without error',
    (kind) => {
      const { container } = render(<InstrumentIcon kind={kind} />);
      expect(container.querySelector('svg')).toBeTruthy();
    }
  );

  it('should log an error and render nothing for an unhandled kind', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = render(<InstrumentIcon kind={'UNKNOWN' as any} />);
    expect(container.querySelector('svg')).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unhandled instrument kind'));
    errorSpy.mockRestore();
  });
});
