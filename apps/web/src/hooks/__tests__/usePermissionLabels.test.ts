import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { $AppAction, $AppSubjectName } from '@opendatacapture/schemas/core';
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { usePermissionLabels } from '../usePermissionLabels';

import '@/services/i18n';

describe('usePermissionLabels', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should name every action and resource, so none reaches the screen as its stored value', () => {
    const { result } = renderHook(() => usePermissionLabels());
    expect(Object.keys(result.current.actionLabels).toSorted()).toEqual($AppAction.options.toSorted());
    expect(Object.keys(result.current.subjectLabels).toSorted()).toEqual($AppSubjectName.options.toSorted());
    expect(result.current.subjectLabels.InstrumentRecord).toBe('Instrument Record');
  });

  // The per-user grants and the rules of a permission set are both drawn from this map, so the same
  // resource cannot be called one thing on a user's page and another in the set it holds.
  it('should follow the interface language', () => {
    i18n.changeLanguage('fr');
    const { result } = renderHook(() => usePermissionLabels());
    expect(result.current.actionLabels.read).toBe('Lire');
    expect(result.current.columnLabels.subject).toBe('Ressource');
  });
});
