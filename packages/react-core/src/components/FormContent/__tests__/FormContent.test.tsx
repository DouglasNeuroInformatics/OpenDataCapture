import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { AnyUnilingualFormInstrument } from '@opendatacapture/runtime-core';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v3';

import { FormContent } from '../FormContent';

import type { FormContentProps } from '../FormContent';

const instrument: AnyUnilingualFormInstrument = {
  __runtimeVersion: 1,
  clientDetails: { title: 'Stub Form (Client Title)' },
  content: { favoriteNumber: { kind: 'number', label: 'Favorite Number', variant: 'input' } },
  details: {
    description: 'A form under test',
    instructions: ['Please complete all questions'],
    license: 'Apache-2.0',
    title: 'Stub Form'
  },
  internal: { edition: 1, name: 'STUB_FORM' },
  kind: 'FORM',
  language: 'en',
  measures: null,
  tags: [],
  validationSchema: z.object({ favoriteNumber: z.number() })
};

const renderFormContent = (props: Partial<FormContentProps> = {}) => {
  const onSubmit = vi.fn();
  render(<FormContent instrument={instrument} onSubmit={onSubmit} {...props} />);
  return onSubmit;
};

const getInfoButton = () => screen.getByRole('heading').parentElement!.querySelector('button')!;

describe('FormContent', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    i18n.changeLanguage('en');
  });

  it('should title the form with the client-facing title when the instrument has one', () => {
    renderFormContent();
    expect(screen.getByRole('heading').textContent).toBe('Stub Form (Client Title)');
  });

  it('should fall back to the instrument title when the client details have none', () => {
    renderFormContent({ instrument: { ...instrument, clientDetails: { instructions: ['Answer honestly'] } } });
    expect(screen.getByRole('heading').textContent).toBe('Stub Form');
  });

  it('should show the instrument instructions in the info dialog', async () => {
    renderFormContent();
    fireEvent.click(getInfoButton());
    await waitFor(() => {
      expect(screen.getByText('Please complete all questions')).toBeTruthy();
    });
  });

  it('should prefer the client-facing instructions in the info dialog', async () => {
    renderFormContent({
      instrument: { ...instrument, clientDetails: { instructions: ['Answer honestly', 'Be brief'] } }
    });
    fireEvent.click(getInfoButton());
    await waitFor(() => {
      expect(screen.getByText('Answer honestly, Be brief')).toBeTruthy();
    });
  });

  it('should disable the info button when there are no instructions to show', () => {
    renderFormContent({ instrument: { ...instrument, details: { ...instrument.details, instructions: [] } } });
    expect(getInfoButton().disabled).toBe(true);
  });

  it('should label the submit button in the active language when the host supplies a label', () => {
    i18n.changeLanguage('fr');
    renderFormContent({ submitButtonLabel: { en: 'Next', es: 'Siguiente', fr: 'Suivant' } });
    expect(screen.getByRole('button', { name: 'Submit' }).textContent).toBe('Suivant');
  });

  it('should offer a reset button when the instrument declares one', () => {
    renderFormContent({ instrument: { ...instrument, resetButton: true } });
    expect(screen.getByRole('button', { name: 'Reset' })).toBeTruthy();
  });

  it('should submit the validated answers tagged as form data', async () => {
    const onSubmit = renderFormContent();
    fireEvent.change(screen.getByLabelText('Favorite Number'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ data: { favoriteNumber: 7 }, kind: 'FORM' });
    });
  });
});
