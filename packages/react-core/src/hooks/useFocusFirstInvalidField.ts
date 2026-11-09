import { useEffect, useRef, useState } from 'react';

// libui wraps every field in `data-field-group` and renders that field's errors inside it as
// `error-message-text`; neither is configurable from `Form`'s props.
const INVALID_FIELD_SELECTOR = '[data-field-group]:has([data-testid="error-message-text"])';

const FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([aria-hidden="true"]):not(:disabled)',
  'textarea:not(:disabled)',
  'button:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * Brings the first field libui's `Form` marked invalid into view and focuses it, once per failed
 * submission. Attach `containerRef` to a div enclosing the form, call `onFailedSubmit` from
 * its `onError` and `onSuccessfulSubmit` from its `onSubmit`.
 */
export const useFocusFirstInvalidField = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failedSubmitCount, setFailedSubmitCount] = useState(0);

  useEffect(() => {
    if (failedSubmitCount === 0) {
      return;
    }
    const firstInvalidField = containerRef.current?.querySelector<HTMLElement>(INVALID_FIELD_SELECTOR);
    if (!firstInvalidField) {
      return;
    }
    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalidField.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus({ preventScroll: true });
  }, [failedSubmitCount]);

  return {
    containerRef,
    failedSubmitCount,
    onFailedSubmit: () => setFailedSubmitCount((count) => count + 1),
    onSuccessfulSubmit: () => setFailedSubmitCount(0)
  };
};
