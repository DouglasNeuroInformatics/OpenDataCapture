import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_PANEL_TEXT_COLOR } from '../../constants';
import { TextColorCard } from '../TextColorCard';
import { renderWithBrandingEditor } from './SectionCards.harness';

import '@/services/i18n';

describe('TextColorCard', () => {
  afterEach(cleanup);

  it('should prefill the default light text color when none is saved, so an admin only has to tweak it', async () => {
    await renderWithBrandingEditor((editor) => <TextColorCard editor={editor} />);
    expect(screen.getByLabelText<HTMLInputElement>('Text color').value).toBe(DEFAULT_PANEL_TEXT_COLOR);
  });

  it('should show the saved text color', async () => {
    await renderWithBrandingEditor((editor) => <TextColorCard editor={editor} />, { panelTextColor: '#123456' });
    expect(screen.getByLabelText<HTMLInputElement>('Text color').value).toBe('#123456');
  });

  it('should write a typed color back to the editor form, so the preview and save pick it up', async () => {
    let panelTextColor = '';
    await renderWithBrandingEditor((editor) => {
      panelTextColor = editor.form.panelTextColor;
      return <TextColorCard editor={editor} />;
    });
    fireEvent.change(screen.getByLabelText('Text color'), { target: { value: '#abcdef' } });
    expect(panelTextColor).toBe('#abcdef');
  });
});
