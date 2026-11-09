import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { useFocusFirstInvalidField } from '../useFocusFirstInvalidField';

const ERROR_MESSAGE = 'Required';

type Handles = ReturnType<typeof useFocusFirstInvalidField>;

const renderFields = ({ invalid }: { invalid: boolean }) => {
  let handles!: Handles;
  const Fields = () => {
    handles = useFocusFirstInvalidField();
    return (
      <div ref={handles.containerRef}>
        <div data-field-group>
          <input aria-label="Answered" />
        </div>
        <div data-field-group>
          <input aria-label="Unanswered" />
          {invalid && <span data-testid="error-message-text">{ERROR_MESSAGE}</span>}
        </div>
      </div>
    );
  };
  render(<Fields />);
  return () => handles;
};

describe('useFocusFirstInvalidField', () => {
  let scrollIntoView: MockInstance<HTMLElement['scrollIntoView']>;

  beforeEach(() => {
    scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => undefined);
  });

  afterEach(() => {
    scrollIntoView.mockRestore();
    cleanup();
  });

  it('should leave focus alone until a submission fails', () => {
    renderFields({ invalid: true });
    expect(document.activeElement).toBe(document.body);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('should scroll to and focus the first invalid field once a submission fails', () => {
    const handles = renderFields({ invalid: true });
    act(() => handles().onFailedSubmit());
    expect(document.activeElement).toBe(screen.getByLabelText('Unanswered'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it('should do nothing when the failure marked no field invalid', () => {
    const handles = renderFields({ invalid: false });
    act(() => handles().onFailedSubmit());
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('should count failed submissions and clear the count on a successful one', () => {
    const handles = renderFields({ invalid: true });
    act(() => handles().onFailedSubmit());
    expect(handles().failedSubmitCount).toBe(1);
    act(() => handles().onSuccessfulSubmit());
    expect(handles().failedSubmitCount).toBe(0);
  });
});
