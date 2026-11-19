import { useState } from 'react';

import { CUSTOM_FIELDS_MAX_FIELD_COUNT } from '@opendatacapture/schemas/subject-identification';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { CustomFieldDraft, CustomFieldsDraft } from '@/utils/subject-identification-draft';

import { CustomFieldsEditor } from '../CustomFieldsEditor';

import '@/services/i18n';

const field = (name: string): CustomFieldDraft => ({ key: name, label: { en: name }, pattern: '[0-9]+' });

const definition = (...names: string[]): CustomFieldsDraft => ({
  fields: names.map(field),
  label: { en: 'Animal information' }
});

type EditorOptions = {
  isDefinitionStored?: boolean;
  isLocked?: boolean;
  showErrors?: boolean;
};

const renderEditor = (
  initial: CustomFieldsDraft | null,
  { isDefinitionStored = initial !== null, isLocked = false, showErrors = false }: EditorOptions = {}
) => {
  const onChange = vi.fn<(value: CustomFieldsDraft | null) => void>();
  const Harness = () => {
    const [value, setValue] = useState(initial);
    return (
      <CustomFieldsEditor
        activeLanguages={['en']}
        isDefinitionStored={isDefinitionStored}
        isLocked={isLocked}
        showErrors={showErrors}
        title="Custom Identifying Fields"
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    );
  };
  render(<Harness />);
  return onChange;
};

const click = (testId: string) => fireEvent.click(screen.getByTestId(testId));

const fieldLabels = () => {
  return screen.queryAllByTestId<HTMLInputElement>(/^custom-field-\d+-label-en$/).map((input) => input.value);
};

const isDisabled = (testId: string) => screen.getByTestId<HTMLButtonElement>(testId).disabled;

describe('CustomFieldsEditor', () => {
  afterEach(cleanup);

  describe('without a definition', () => {
    it('should say that none is defined', () => {
      renderEditor(null);
      expect(screen.getByTestId('custom-fields-empty').textContent).toBe('No identifying fields are defined.');
    });

    it('should start a definition with one field to fill in', () => {
      renderEditor(null);
      click('custom-fields-define');
      expect(fieldLabels()).toStrictEqual(['']);
    });

    it('should say that a stored definition the admin removed goes when the tab is saved', () => {
      renderEditor(null, { isDefinitionStored: true });
      expect(screen.getByTestId('custom-fields-empty').textContent).toBe(
        'The identifying fields will be removed when you save.'
      );
    });
  });

  describe('while unlocked', () => {
    it('should say the definition is not locked', () => {
      renderEditor(definition('A'));
      expect(screen.getByTestId('custom-fields-lock-status').dataset.locked).toBe('false');
    });

    it('should add a blank field at the end', () => {
      renderEditor(definition('A'));
      click('custom-fields-add-field');
      expect(fieldLabels()).toStrictEqual(['A', '']);
    });

    it('should not add a field beyond the limit', () => {
      renderEditor(definition(...Array.from({ length: CUSTOM_FIELDS_MAX_FIELD_COUNT }, (_, index) => `F${index}`)));
      expect(isDisabled('custom-fields-add-field')).toBe(true);
      expect(screen.getByTestId('custom-fields-full')).toBeTruthy();
    });

    it('should move a field up', () => {
      renderEditor(definition('A', 'B', 'C'));
      click('custom-field-2-move-up');
      expect(fieldLabels()).toStrictEqual(['A', 'C', 'B']);
    });

    it('should move a field down', () => {
      renderEditor(definition('A', 'B', 'C'));
      click('custom-field-0-move-down');
      expect(fieldLabels()).toStrictEqual(['B', 'A', 'C']);
    });

    it('should not move the first field up or the last field down', () => {
      renderEditor(definition('A', 'B'));
      expect(isDisabled('custom-field-0-move-up')).toBe(true);
      expect(isDisabled('custom-field-1-move-down')).toBe(true);
    });

    it('should remove a field', () => {
      renderEditor(definition('A', 'B', 'C'));
      click('custom-field-1-remove');
      expect(fieldLabels()).toStrictEqual(['A', 'C']);
    });

    it('should not remove the only field, since a definition has at least one', () => {
      renderEditor(definition('A'));
      expect(isDisabled('custom-field-0-remove')).toBe(true);
    });

    it('should edit the field whose input changed and leave the others alone', () => {
      renderEditor(definition('A', 'B'));
      fireEvent.change(screen.getByTestId('custom-field-1-label-en'), { target: { value: 'Cage' } });
      expect(fieldLabels()).toStrictEqual(['A', 'Cage']);
    });

    it('should edit the method label', () => {
      const onChange = renderEditor(definition('A'));
      fireEvent.change(screen.getByTestId('custom-fields-label-en'), { target: { value: 'Mouse' } });
      expect(onChange.mock.lastCall?.[0]?.label).toStrictEqual({ en: 'Mouse' });
    });

    it('should remove the whole definition', () => {
      const onChange = renderEditor(definition('A'));
      click('custom-fields-remove');
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('once locked', () => {
    it('should say the definition is locked', () => {
      renderEditor(definition('A'), { isLocked: true });
      expect(screen.getByTestId('custom-fields-lock-status').dataset.locked).toBe('true');
    });

    it('should offer no way to add, move or remove a field, or to remove the definition', () => {
      renderEditor(definition('A', 'B'), { isLocked: true });
      expect(screen.queryByTestId('custom-fields-add-field')).toBeNull();
      expect(screen.queryByTestId('custom-field-0-move-down')).toBeNull();
      expect(screen.queryByTestId('custom-field-0-remove')).toBeNull();
      expect(screen.queryByTestId('custom-fields-remove')).toBeNull();
    });

    it('should still let a field be edited, since no field text is hashed', () => {
      renderEditor(definition('A'), { isLocked: true });
      fireEvent.change(screen.getByTestId('custom-field-0-pattern'), { target: { value: '[A-Z]+' } });
      expect(screen.getByTestId<HTMLInputElement>('custom-field-0-pattern').value).toBe('[A-Z]+');
    });
  });

  describe('errors', () => {
    it('should flag a missing method label once a save is refused', () => {
      renderEditor({ ...definition('A'), label: {} }, { showErrors: true });
      expect(screen.getByTestId('custom-fields-label-error')).toBeTruthy();
    });

    it('should not flag a missing method label before a save is refused', () => {
      renderEditor({ ...definition('A'), label: {} });
      expect(screen.queryByTestId('custom-fields-label-error')).toBeNull();
    });
  });
});
