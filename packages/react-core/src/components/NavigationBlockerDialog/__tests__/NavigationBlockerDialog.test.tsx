import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { NavigationBlockerDialog } from '../NavigationBlockerDialog';

describe('NavigationBlockerDialog', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(cleanup);

  it('should render nothing observable when closed', () => {
    render(<NavigationBlockerDialog message="Are you sure?" open={false} />);
    expect(screen.queryByTestId('blocker-dialog')).toBeNull();
  });

  it('should render the message when open', () => {
    render(<NavigationBlockerDialog message="Are you sure?" open={true} />);
    expect(screen.getByTestId('blocker-dialog')).toBeTruthy();
    expect(screen.getByText('Are you sure?')).toBeTruthy();
  });

  it('should call onConfirm when the confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<NavigationBlockerDialog message="Are you sure?" open={true} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Yes'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onCancel when the cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<NavigationBlockerDialog message="Are you sure?" open={true} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('No'));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
