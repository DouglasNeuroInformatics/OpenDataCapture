import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE } from '@opendatacapture/schemas/mail';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ViewDefaultTemplateDialog } from '../ViewDefaultTemplateDialog';

import '@/services/i18n';

describe('ViewDefaultTemplateDialog', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing while closed', () => {
    render(<ViewDefaultTemplateDialog open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByText('Built-in default template')).toBeNull();
  });

  it('should show the built-in subject and body when open', () => {
    render(<ViewDefaultTemplateDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByTestId<HTMLInputElement>('template-builtin-subject').value).toBe(
      DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.subject.en
    );
    expect(screen.getByTestId<HTMLTextAreaElement>('template-builtin-body').value).toBe(
      DEFAULT_ASSIGNMENT_EMAIL_TEMPLATE.body.en
    );
  });

  it('should make the built-in subject and body read-only, since the default template cannot be edited', () => {
    render(<ViewDefaultTemplateDialog open onOpenChange={vi.fn()} />);
    expect(screen.getByTestId<HTMLInputElement>('template-builtin-subject').readOnly).toBe(true);
    expect(screen.getByTestId<HTMLTextAreaElement>('template-builtin-body').readOnly).toBe(true);
  });

  it('should request closing when the close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(<ViewDefaultTemplateDialog open onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
