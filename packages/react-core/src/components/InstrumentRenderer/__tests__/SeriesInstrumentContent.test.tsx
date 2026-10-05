import { i18n } from '@douglasneuroinformatics/libui/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { SeriesInstrumentContent } from '../SeriesInstrumentContent';

const renderContent = () => {
  const openSpy = vi.spyOn(window, 'open');
  const result = render(
    <SeriesInstrumentContent
      status={{ completedInstruments: 1, totalInstruments: 3 }}
      target={{ bundle: '', id: 'target-id' }}
      onSubmit={vi.fn()}
    />
  );
  return { ...result, openSpy };
};

describe('SeriesInstrumentContent', () => {
  beforeAll(() => {
    i18n.init({ translations: {} });
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should report how many of the instruments have been completed', () => {
    renderContent();
    expect(screen.getByText('Instruments Completed: 1/3')).toBeTruthy();
  });

  it('should not open a popup before the subject begins', () => {
    const { openSpy } = renderContent();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('should open a popup window when the subject begins', () => {
    const { openSpy } = renderContent();
    fireEvent.click(screen.getByRole('button', { name: 'Begin' }));
    expect(openSpy).toHaveBeenCalledWith('about:blank', '', 'width=200,height=200');
  });

  it('should disable the begin button once the popup is open, so a second popup cannot be opened', () => {
    renderContent();
    fireEvent.click(screen.getByRole('button', { name: 'Begin' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Begin' }).disabled).toBe(true);
  });

  it('should close the popup window when unmounted', () => {
    const { openSpy, unmount } = renderContent();
    fireEvent.click(screen.getByRole('button', { name: 'Begin' }));
    const popup = openSpy.mock.results[0]?.value as null | Window;
    const closeSpy = vi.spyOn(popup!, 'close');
    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });
});
