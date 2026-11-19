import type { ComponentProps } from 'react';

import type { SubjectIdentificationSettings } from '@opendatacapture/schemas/subject-identification';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SubjectIdentificationSettingsForm } from '@/components/SubjectIdentificationSettingsForm';

import { SubjectIdentificationTab } from '../SubjectIdentificationTab';

const SETTINGS: SubjectIdentificationSettings = {
  customFields: {
    fields: [{ label: { en: 'Animal ID' }, pattern: '[0-9]+' }],
    iterations: 600_000,
    label: { en: 'Animal information' },
    salt: 'ab'.repeat(32)
  },
  isCustomFieldsLocked: true
};

const mocks = vi.hoisted(() => ({
  SubjectIdentificationSettingsForm: vi.fn((_: ComponentProps<typeof SubjectIdentificationSettingsForm>) => null)
}));

vi.mock('@/components/SubjectIdentificationSettingsForm', () => ({
  SubjectIdentificationSettingsForm: mocks.SubjectIdentificationSettingsForm
}));
vi.mock('@/hooks/useSubjectIdentificationSettingsQuery', () => ({
  useSubjectIdentificationSettingsQuery: () => ({ data: SETTINGS })
}));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { activeLanguages: ['en', 'fr'] } })
}));

describe('SubjectIdentificationTab', () => {
  afterEach(cleanup);

  it('should hand the stored settings and the active languages to the settings form', () => {
    render(<SubjectIdentificationTab />);
    expect(mocks.SubjectIdentificationSettingsForm.mock.lastCall?.[0]).toEqual({
      activeLanguages: ['en', 'fr'],
      settings: SETTINGS
    });
  });
});
