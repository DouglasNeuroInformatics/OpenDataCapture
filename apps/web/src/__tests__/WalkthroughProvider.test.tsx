import type { ReactNode } from 'react';

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WalkthroughProvider } from '@/providers/WalkthroughProvider';

import '@/services/i18n';

// Test scaffolding rather than copy, so it is not translated -- `jsx-no-literals` still applies here.
const CHILD_TEXT = 'Page Content';

const STEP_COUNT_WITHOUT_GATEWAY = 16;

type Rect = { bottom: number; left: number; right: number; top: number };

const mocks = vi.hoisted(() => ({
  config: {
    dev: { disableTutorial: false },
    setup: { isGatewayEnabled: false }
  },
  isDesktop: true,
  navigate: vi.fn(),
  store: {
    endSession: vi.fn(),
    isDisclaimerAccepted: true,
    isWalkthroughComplete: false,
    isWalkthroughOpen: true,
    setIsWalkthroughComplete: vi.fn(),
    setIsWalkthroughOpen: vi.fn(),
    startSession: vi.fn()
  }
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => mocks.navigate
}));
vi.mock('@/config', () => ({ config: mocks.config }));
vi.mock('@/hooks/useIsDesktop', () => ({ useIsDesktop: () => mocks.isDesktop }));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));
// happy-dom has no layout or animation, so the popover exposes the position it is animated to instead.
vi.mock('motion/react', async () => {
  const { forwardRef } = await import('react');
  type MotionDivProps = { animate?: { x?: number; y?: number }; children: ReactNode; className?: string };
  return {
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: {
      div: forwardRef<HTMLDivElement, MotionDivProps>(function MotionDiv({ animate, children, className }, ref) {
        return (
          <div className={className} data-x={animate?.x} data-y={animate?.y} ref={ref}>
            {children}
          </div>
        );
      })
    }
  };
});

const renderProvider = () =>
  render(
    <WalkthroughProvider>
      <p>{CHILD_TEXT}</p>
    </WalkthroughProvider>
  );

const addTarget = (html: string, rect: Rect = { bottom: 0, left: 0, right: 0, top: 0 }) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const target = container.firstElementChild!;
  const measure = vi
    .spyOn(target, 'getBoundingClientRect')
    .mockReturnValue(
      DOMRect.fromRect({ height: rect.bottom - rect.top, width: rect.right - rect.left, x: rect.left, y: rect.top })
    );
  document.body.append(target);
  return { measure, target };
};

const stubPopoverSize = (width: number, height: number) => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height);
};

const clickNext = (times = 1) => {
  for (let i = 0; i < times; i++) {
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  }
};

const popoverPosition = (title: string) => {
  const popover = screen.getByText(title).closest('[data-x]')!;
  return { x: Number(popover.getAttribute('data-x')), y: Number(popover.getAttribute('data-y')) };
};

const closeButton = () => document.querySelector('.lucide-x')!.closest('button')!;

beforeEach(() => {
  mocks.config.dev.disableTutorial = false;
  mocks.config.setup.isGatewayEnabled = false;
  mocks.isDesktop = true;
  mocks.store.isDisclaimerAccepted = true;
  mocks.store.isWalkthroughComplete = false;
  mocks.store.isWalkthroughOpen = true;
  vi.stubEnv('DEV', false);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('WalkthroughProvider', () => {
  it('should render its children', () => {
    renderProvider();
    expect(screen.getByText(CHILD_TEXT)).toBeTruthy();
  });

  it('should open the walkthrough once the disclaimer is accepted, ignoring the disable flag outside development', () => {
    mocks.config.dev.disableTutorial = true;
    mocks.store.isWalkthroughOpen = false;
    renderProvider();
    expect(mocks.store.setIsWalkthroughOpen).toHaveBeenCalledWith(true);
  });

  it('should open the walkthrough in development when the tutorial is not disabled', () => {
    vi.stubEnv('DEV', true);
    mocks.store.isWalkthroughOpen = false;
    renderProvider();
    expect(mocks.store.setIsWalkthroughOpen).toHaveBeenCalledWith(true);
  });

  it('should not open the walkthrough in development when the tutorial is disabled', () => {
    vi.stubEnv('DEV', true);
    mocks.config.dev.disableTutorial = true;
    mocks.store.isWalkthroughOpen = false;
    renderProvider();
    expect(mocks.store.setIsWalkthroughOpen).not.toHaveBeenCalledWith(true);
  });

  it('should not open the walkthrough before the disclaimer is accepted, so the two never overlap', () => {
    mocks.store.isDisclaimerAccepted = false;
    mocks.store.isWalkthroughOpen = false;
    renderProvider();
    expect(mocks.store.setIsWalkthroughOpen).not.toHaveBeenCalled();
  });

  it('should not open the walkthrough once the user has completed it', () => {
    mocks.store.isWalkthroughComplete = true;
    mocks.store.isWalkthroughOpen = false;
    renderProvider();
    expect(mocks.store.setIsWalkthroughOpen).not.toHaveBeenCalled();
  });

  it('should not show the walkthrough while it is closed', () => {
    mocks.store.isWalkthroughOpen = false;
    renderProvider();
    expect(screen.queryByText('Welcome to Open Data Capture 👋')).toBeNull();
  });

  it('should not show the walkthrough on a small screen, whose layout it does not fit', () => {
    mocks.isDesktop = false;
    renderProvider();
    expect(screen.getByText(CHILD_TEXT)).toBeTruthy();
    expect(screen.queryByText('Welcome to Open Data Capture 👋')).toBeNull();
  });
});

describe('Walkthrough', () => {
  it('should start on the welcome step', () => {
    renderProvider();
    expect(screen.getByText('Welcome to Open Data Capture 👋')).toBeTruthy();
  });

  it("should navigate to the step's page when the user is elsewhere", () => {
    renderProvider();
    expect(mocks.navigate).toHaveBeenCalledWith({ state: undefined, to: '/dashboard' });
  });

  it("should not navigate when the user is already on the step's page", () => {
    window.history.replaceState(null, '', '/dashboard');
    renderProvider();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('should pass the example session values to the start session page, so the form shows a filled-in example', () => {
    renderProvider();
    clickNext(6);
    expect(screen.getByText('Start Session')).toBeTruthy();
    expect(mocks.navigate).toHaveBeenLastCalledWith({
      state: {
        initialValues: { sessionType: 'IN_PERSON', subjectId: '123', subjectIdentificationMethod: 'CUSTOM_ID' }
      },
      to: '/session/start-session'
    });
  });

  it('should spotlight the element the step describes', async () => {
    const { target } = addTarget('<div id="sidebar-branding-container"></div>');
    renderProvider();
    await waitFor(() => expect(target.getAttribute('data-spotlight')).toBe('true'));
  });

  it('should remove the spotlight from the previous element when moving to the next step', async () => {
    const { target } = addTarget('<div id="sidebar-branding-container"></div>');
    renderProvider();
    await waitFor(() => expect(target.getAttribute('data-spotlight')).toBe('true'));
    clickNext();
    expect(target.getAttribute('data-spotlight')).toBe('false');
  });

  it('should log the selector of a target that is missing from the page', async () => {
    renderProvider();
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith('Failed to find element with query: #sidebar-branding-container')
    );
  });

  it('should place a bottom-left popover below the left edge of its target', async () => {
    addTarget('<div id="sidebar-branding-container"></div>', { bottom: 80, left: 100, right: 300, top: 50 });
    renderProvider();
    await waitFor(() => expect(popoverPosition('Welcome to Open Data Capture 👋')).toEqual({ x: 100, y: 100 }));
  });

  it('should align a bottom-right popover with the right edge of its target', async () => {
    stubPopoverSize(120, 60);
    addTarget('<div data-spotlight-type="export-data-dropdown"></div>', { bottom: 80, left: 100, right: 300, top: 50 });
    renderProvider();
    clickNext(5);
    await waitFor(() => expect(popoverPosition('Bulk Data Export')).toEqual({ x: 180, y: 100 }));
  });

  it('should center a bottom-center popover under its target', async () => {
    stubPopoverSize(120, 60);
    addTarget('<a data-nav-url="/datahub/123/table"></a>', { bottom: 80, left: 100, right: 300, top: 50 });
    renderProvider();
    clickNext(13);
    await waitFor(() => expect(popoverPosition('Table')).toEqual({ x: 140, y: 100 }));
  });

  it('should place a top-left popover above its target', async () => {
    stubPopoverSize(120, 60);
    addTarget('<div data-field-group="sessionType"></div>', { bottom: 230, left: 100, right: 300, top: 200 });
    renderProvider();
    clickNext(9);
    await waitFor(() => expect(popoverPosition('Type of Assessment')).toEqual({ x: 100, y: 120 }));
  });

  it('should measure its target without failing when the walkthrough closes before the measurement runs', async () => {
    const { measure } = addTarget('<div id="sidebar-branding-container"></div>');
    const { unmount } = renderProvider();
    unmount();
    await waitFor(() => expect(measure).toHaveBeenCalled());
  });

  it('should start an example session before showing the session in progress', async () => {
    const { target } = addTarget('<div id="current-session-card"></div>');
    renderProvider();
    clickNext(10);
    expect(screen.getByText('Session in Progress')).toBeTruthy();
    expect(mocks.store.startSession).toHaveBeenCalledWith(expect.objectContaining({ id: '123', subjectId: '123' }));
    await waitFor(() => expect(target.getAttribute('data-spotlight')).toBe('true'));
  });

  it('should not offer to go back from the first step', () => {
    renderProvider();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
  });

  it('should return to the previous step when the user goes back', () => {
    renderProvider();
    clickNext();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Welcome to Open Data Capture 👋')).toBeTruthy();
  });

  it('should end the example session and close when the user dismisses the walkthrough', () => {
    renderProvider();
    fireEvent.click(closeButton());
    expect(mocks.store.endSession).toHaveBeenCalledOnce();
    expect(mocks.store.setIsWalkthroughOpen).toHaveBeenCalledWith(false);
    expect(mocks.store.setIsWalkthroughComplete).not.toHaveBeenCalled();
  });

  it('should restart from the first step after being dismissed', () => {
    renderProvider();
    clickNext(2);
    fireEvent.click(closeButton());
    expect(screen.getByText('Welcome to Open Data Capture 👋')).toBeTruthy();
  });

  it('should mark the walkthrough complete and close when the user asks not to see it again', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: "Don't show again" }));
    expect(mocks.store.setIsWalkthroughComplete).toHaveBeenCalledWith(true);
    expect(mocks.store.setIsWalkthroughOpen).toHaveBeenCalledWith(false);
  });

  it('should end on the graph step when the gateway is disabled', () => {
    renderProvider();
    clickNext(STEP_COUNT_WITHOUT_GATEWAY - 1);
    expect(screen.getByText('Graph')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy();
  });

  it('should add an assignments step at the end when the gateway is enabled', () => {
    mocks.config.setup.isGatewayEnabled = true;
    renderProvider();
    clickNext(STEP_COUNT_WITHOUT_GATEWAY);
    expect(screen.getByText('Assignments')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy();
  });

  it('should hide the option not to show again on the last step, where done already completes it', () => {
    renderProvider();
    clickNext(STEP_COUNT_WITHOUT_GATEWAY - 1);
    expect(screen.queryByRole('button', { name: "Don't show again" })).toBeNull();
  });

  it('should mark the walkthrough complete and close when the user finishes the last step', () => {
    renderProvider();
    clickNext(STEP_COUNT_WITHOUT_GATEWAY - 1);
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(mocks.store.setIsWalkthroughComplete).toHaveBeenCalledWith(true);
    expect(mocks.store.endSession).toHaveBeenCalledOnce();
    expect(mocks.store.setIsWalkthroughOpen).toHaveBeenCalledWith(false);
  });

  it('should close when the window is resized, since the spotlight positions would be stale', () => {
    renderProvider();
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(mocks.store.setIsWalkthroughOpen).toHaveBeenCalledWith(false);
  });
});
