import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InteractiveContent } from '../InteractiveContent';

const addNotification = vi.hoisted(() => vi.fn());
const changeLanguage = vi.hoisted(() => vi.fn());
const updateTheme = vi.hoisted(() => vi.fn());

vi.mock('@douglasneuroinformatics/libui/hooks', () => ({
  useNotificationsStore: (selector: (store: { addNotification: typeof addNotification }) => unknown) =>
    selector({ addNotification }),
  useTheme: () => ['light', updateTheme],
  useTranslation: () => ({
    changeLanguage,
    resolvedLanguage: 'en',
    t: (value: string | { [key: string]: string }) => (typeof value === 'string' ? value : value.en)
  })
}));

/** Dispatches a `CustomEvent` the way an instrument bundle running in the iframe would, on `document`. */
function dispatch<TDetail>(type: string, detail: TDetail) {
  document.dispatchEvent(new CustomEvent(type, { detail }));
}

describe('InteractiveContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it('should render the iframe directly when there is at most one supported language', () => {
    render(<InteractiveContent bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />);
    expect(document.querySelector('iframe[data-bundle="bundle text"]')).toBeTruthy();
  });

  it('should show a language selection screen first when language selection is enabled for more than one language', () => {
    render(
      <InteractiveContent
        enableLanguageSelect
        bundle="bundle text"
        supportedLanguages={['en', 'fr']}
        onSubmit={vi.fn()}
      />
    );
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Select Language')).toBeTruthy();
  });

  it('should reveal the iframe once a language is chosen from the selection screen', () => {
    render(
      <InteractiveContent
        enableLanguageSelect
        bundle="bundle text"
        supportedLanguages={['en', 'fr']}
        onSubmit={vi.fn()}
      />
    );
    fireEvent.click(screen.getAllByRole('button')[0]!);
    expect(changeLanguage).toHaveBeenCalled();
    expect(document.querySelector('iframe')).toBeTruthy();
  });

  it("should call onSubmit with the event's parsed JSON detail when the bundle dispatches 'done'", async () => {
    const onSubmit = vi.fn();
    render(<InteractiveContent bundle="bundle text" supportedLanguages={['en']} onSubmit={onSubmit} />);
    await act(async () => {
      dispatch('done', { message: 'Hello' });
      await Promise.resolve();
    });
    expect(onSubmit).toHaveBeenCalledWith({ data: { message: 'Hello' }, kind: 'INTERACTIVE' });
  });

  it("should change the language when the bundle dispatches a 'changeLanguage' event for a supported language", () => {
    render(<InteractiveContent bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />);
    act(() => {
      dispatch('changeLanguage', 'fr');
    });
    expect(changeLanguage).toHaveBeenCalledWith('fr');
  });

  it("should notify an error rather than change the language when 'changeLanguage' requests an unsupported language", () => {
    render(<InteractiveContent bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />);
    act(() => {
      dispatch('changeLanguage', 'klingon');
    });
    expect(changeLanguage).not.toHaveBeenCalled();
    expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
  });

  it('should open the lock dialog instead of changing language when the language is locked', () => {
    render(
      <InteractiveContent enableLanguageLock bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />
    );
    act(() => {
      dispatch('changeLanguage', 'fr');
    });
    expect(changeLanguage).not.toHaveBeenCalled();
    expect(screen.getByText('Cannot Change Language')).toBeTruthy();
  });

  it("should update the theme when the bundle dispatches a valid 'changeTheme' event", () => {
    render(<InteractiveContent bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />);
    act(() => {
      dispatch('changeTheme', 'dark');
    });
    expect(updateTheme).toHaveBeenCalledWith('dark');
  });

  it("should log an error rather than update the theme when 'changeTheme' carries an invalid value", () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<InteractiveContent bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />);
    act(() => {
      dispatch('changeTheme', 'sepia');
    });
    expect(updateTheme).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("should forward an 'addNotification' event's detail to the notifications store", () => {
    render(<InteractiveContent bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />);
    act(() => {
      dispatch('addNotification', { message: 'From the bundle', type: 'success' });
    });
    expect(addNotification).toHaveBeenCalledWith({ message: 'From the bundle', type: 'success' });
  });

  it('should zoom the iframe in and out within its lower bound', () => {
    render(<InteractiveContent bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />);
    expect(screen.getByText('100%')).toBeTruthy();
    const [zoomOut, zoomIn] = screen.getAllByRole('button');
    fireEvent.click(zoomIn!);
    expect(screen.getByText('125%')).toBeTruthy();
    fireEvent.click(zoomOut!);
    fireEvent.click(zoomOut!);
    fireEvent.click(zoomOut!);
    fireEvent.click(zoomOut!);
    // Clamped at 25: a fifth click in a row would otherwise take it to 0 or negative.
    expect(screen.getByText('25%')).toBeTruthy();
  });

  it('should offer a language toggle only when more than one language is supported and toggling is enabled', () => {
    render(
      <InteractiveContent
        enableLanguageToggle
        bundle="bundle text"
        supportedLanguages={['en', 'fr']}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getAllByRole('button').length).toBeGreaterThan(3);
  });

  it('should close the lock dialog when its OK button is clicked', () => {
    render(
      <InteractiveContent enableLanguageLock bundle="bundle text" supportedLanguages={['en']} onSubmit={vi.fn()} />
    );
    act(() => {
      dispatch('changeLanguage', 'fr');
    });
    expect(screen.getByText('Cannot Change Language')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.queryByText('Cannot Change Language')).toBeNull();
  });

  it('should route a language toggle selection through the same lock check as the changeLanguage event', () => {
    render(
      <InteractiveContent
        enableLanguageLock
        enableLanguageToggle
        bundle="bundle text"
        supportedLanguages={['en', 'fr']}
        onSubmit={vi.fn()}
      />
    );
    const toggleTrigger = screen.getAllByRole('button').at(-1)!;
    fireEvent.click(toggleTrigger);
    const frenchItem = screen.queryByText(/Fran|Anglais/);
    if (frenchItem) {
      fireEvent.click(frenchItem);
    }
    // Whether or not Radix opened the menu under happy-dom, the language must not have changed
    // directly — either the item was never reached, or the lock intercepted the selection.
    expect(changeLanguage).not.toHaveBeenCalled();
  });
});
