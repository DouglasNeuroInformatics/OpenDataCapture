import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DESTINATION_TEXT, renderWithBrandingEditor } from '../sections/__tests__/SectionCards.harness';
import { UnsavedChangesDialog } from '../UnsavedChangesDialog';

import type { BrandingEditor } from '../hooks';

import '@/services/i18n';

async function renderDialog() {
  let latestEditor: BrandingEditor | undefined;
  const { router } = await renderWithBrandingEditor((editor) => {
    latestEditor = editor;
    return <UnsavedChangesDialog blocker={editor.blocker} />;
  });
  return {
    editLoginPage: () => act(() => latestEditor!.update('panelTextColor', '#000000')),
    navigateAway: () => act(() => router.history.push('/elsewhere'))
  };
}

async function renderBlockedDialog() {
  const { editLoginPage, navigateAway } = await renderDialog();
  editLoginPage();
  navigateAway();
  await screen.findByRole('dialog');
}

describe('UnsavedChangesDialog', () => {
  afterEach(cleanup);

  it('should stay closed while nothing is blocked', async () => {
    await renderDialog();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should let navigation through without asking when there are no unsaved changes', async () => {
    const { navigateAway } = await renderDialog();
    navigateAway();
    expect(await screen.findByText(DESTINATION_TEXT)).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should ask for confirmation when navigating away with unsaved changes', async () => {
    await renderBlockedDialog();
    expect(screen.getByText('Unsaved Changes')).toBeTruthy();
  });

  it('should focus "No" when it opens, so pressing Enter keeps the user on the page', async () => {
    await renderBlockedDialog();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'No' }));
  });

  it('should complete the navigation when the user confirms with "Yes"', async () => {
    await renderBlockedDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(await screen.findByText(DESTINATION_TEXT)).toBeTruthy();
  });

  it('should cancel the navigation and close when the user answers "No"', async () => {
    await renderBlockedDialog();
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    await act(() => Promise.resolve());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText(DESTINATION_TEXT)).toBeNull();
  });

  it('should cancel the navigation when the dialog is dismissed with Escape', async () => {
    await renderBlockedDialog();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await act(() => Promise.resolve());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText(DESTINATION_TEXT)).toBeNull();
  });
});
