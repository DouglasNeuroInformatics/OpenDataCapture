import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useCollectionMethodLabels } from '../useCollectionMethodLabels';

import '@/services/i18n';

describe('useCollectionMethodLabels', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should name every session type, so no collection method renders as its stored enum', () => {
    const { result } = renderHook(() => useCollectionMethodLabels());
    expect(result.current).toStrictEqual({
      IN_PERSON: 'In-Person',
      REMOTE: 'Remote',
      RETROSPECTIVE: 'Retrospective'
    });
  });

  // Reuses the copy the session form already shows for the same concept, so a session started as
  // "In-Person" is not later described with a different word in the datahub.
  it('should follow the interface language', () => {
    i18n.changeLanguage('fr');
    const { result } = renderHook(() => useCollectionMethodLabels());
    expect(result.current.REMOTE).toBe('À distance');
  });
});
