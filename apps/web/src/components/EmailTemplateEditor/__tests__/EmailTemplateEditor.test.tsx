import React from 'react';

import type { MailTemplate } from '@opendatacapture/schemas/mail';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EmailTemplateEditor } from '../EmailTemplateEditor';

import '@/services/i18n';

const template: MailTemplate = {
  body: { en: 'Hello world', es: 'Hola mundo' },
  subject: { en: 'Welcome', es: 'Bienvenido' }
};

const renderEditor = (props: Partial<React.ComponentProps<typeof EmailTemplateEditor>> = {}) => {
  const onChange = vi.fn();
  const result = render(<EmailTemplateEditor idPrefix="invite" template={template} onChange={onChange} {...props} />);
  return { ...result, onChange };
};

const subjectInput = () => screen.getByTestId<HTMLInputElement>('invite-subject');
const bodyInput = () => screen.getByTestId<HTMLTextAreaElement>('invite-body');

const chooseLanguage = (label: string) => {
  fireEvent.keyDown(screen.getByTestId('invite-language'), { key: 'Enter' });
  fireEvent.click(screen.getByRole('option', { name: label }));
};

const blurBodyWithSelection = (start: number, end: number) => {
  bodyInput().setSelectionRange(start, end);
  fireEvent.blur(bodyInput());
};

afterEach(cleanup);

describe('EmailTemplateEditor', () => {
  it('should open on the interface language', () => {
    renderEditor();
    expect(subjectInput().value).toBe('Welcome');
    expect(bodyInput().value).toBe('Hello world');
  });

  it('should show the subject and body of the language the user switches to', () => {
    renderEditor();
    chooseLanguage('Spanish');
    expect(subjectInput().value).toBe('Bienvenido');
    expect(bodyInput().value).toBe('Hola mundo');
  });

  it('should show empty fields for a language not written yet', () => {
    renderEditor();
    chooseLanguage('French');
    expect(subjectInput().value).toBe('');
    expect(bodyInput().value).toBe('');
  });

  it('should write a subject edit into the selected language only', () => {
    const { onChange } = renderEditor();
    chooseLanguage('Spanish');
    fireEvent.change(subjectInput(), { target: { value: 'Hola' } });
    expect(onChange).toHaveBeenCalledWith({ ...template, subject: { en: 'Welcome', es: 'Hola' } });
  });

  it('should write a body edit into the selected language only', () => {
    const { onChange } = renderEditor();
    fireEvent.change(bodyInput(), { target: { value: 'Goodbye' } });
    expect(onChange).toHaveBeenCalledWith({ ...template, body: { en: 'Goodbye', es: 'Hola mundo' } });
  });

  it('should append a placeholder after a space when the body has never been focused', () => {
    const { onChange } = renderEditor({ variables: ['name'] });
    fireEvent.click(screen.getByTestId('invite-insert-name'));
    expect(onChange).toHaveBeenCalledWith({ ...template, body: { en: 'Hello world {{name}}', es: 'Hola mundo' } });
  });

  it('should insert a placeholder alone into an empty body', () => {
    const { onChange } = renderEditor({ variables: ['name'] });
    chooseLanguage('French');
    fireEvent.click(screen.getByTestId('invite-insert-name'));
    expect(onChange).toHaveBeenCalledWith({ ...template, body: { ...template.body, fr: '{{name}}' } });
  });

  it('should replace the text selected when the body lost focus with the placeholder', () => {
    const { onChange } = renderEditor({ variables: ['name'] });
    blurBodyWithSelection(6, 11);
    fireEvent.click(screen.getByTestId('invite-insert-name'));
    expect(onChange).toHaveBeenCalledWith({ ...template, body: { en: 'Hello {{name}}', es: 'Hola mundo' } });
  });

  it('should place a second placeholder after the first, so consecutive inserts keep their order', () => {
    const { onChange, rerender } = renderEditor({ variables: ['first', 'last'] });
    blurBodyWithSelection(6, 6);
    fireEvent.click(screen.getByTestId('invite-insert-first'));
    const afterFirst: MailTemplate = { ...template, body: { en: 'Hello {{first}}world', es: 'Hola mundo' } };
    expect(onChange).toHaveBeenLastCalledWith(afterFirst);
    rerender(
      <EmailTemplateEditor idPrefix="invite" template={afterFirst} variables={['first', 'last']} onChange={onChange} />
    );
    fireEvent.click(screen.getByTestId('invite-insert-last'));
    expect(onChange).toHaveBeenLastCalledWith({
      ...template,
      body: { en: 'Hello {{first}}{{last}}world', es: 'Hola mundo' }
    });
  });

  it('should render each placeholder button verbatim, since the tag syntax is not translated', () => {
    renderEditor({ variables: ['name'] });
    expect(screen.getByTestId('invite-insert-name').textContent).toBe('{{name}}');
  });

  it('should offer no insert buttons when there are no variables', () => {
    renderEditor();
    expect(screen.queryByText('Insert:')).toBeNull();
  });

  it('should lock the fields and hide the insert buttons without a change handler, so a template can be shown read-only', () => {
    renderEditor({ onChange: undefined, variables: ['name'] });
    expect(subjectInput().readOnly).toBe(true);
    expect(bodyInput().readOnly).toBe(true);
    expect(screen.queryByTestId('invite-insert-name')).toBeNull();
  });

  it('should show a validation message only when one is given', () => {
    const { rerender } = renderEditor({ error: 'Subject is required' });
    expect(screen.getByTestId('invite-error').textContent).toBe('Subject is required');
    rerender(<EmailTemplateEditor idPrefix="invite" template={template} onChange={vi.fn()} />);
    expect(screen.queryByTestId('invite-error')).toBeNull();
  });

  it('should namespace the control ids by prefix, so two editors can share a page', () => {
    renderEditor({ idPrefix: 'reminder' });
    expect(screen.getByLabelText('Subject').id).toBe('reminder-subject');
    expect(screen.getByLabelText('Body').id).toBe('reminder-body');
  });
});
