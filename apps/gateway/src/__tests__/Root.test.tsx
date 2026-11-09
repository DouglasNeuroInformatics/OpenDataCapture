// @vitest-environment happy-dom

import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentRendererProps, InstrumentSubmitHandler } from '@opendatacapture/react-core';
import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { act, cleanup, render, screen } from '@testing-library/react';
import axios from 'axios';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Root } from '../Root';

const renderer = vi.hoisted((): { props?: InstrumentRendererProps } => ({}));

vi.mock('@cap.js/widget', () => ({}));

vi.mock('@opendatacapture/react-core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@opendatacapture/react-core')>()),
  InstrumentRenderer: (props: InstrumentRendererProps) => {
    renderer.props = props;
    return (
      <div data-disable-begin={String(props.disableBegin)} data-testid="instrument-renderer">
        {props.beforeBegin}
      </div>
    );
  }
}));

const formTarget: InstrumentBundleContainer = { bundle: 'export default {}', id: 'instrument-1', kind: 'FORM' };

const seriesTarget: InstrumentBundleContainer = {
  bundle: 'export default {}',
  id: 'series-1',
  items: [formTarget],
  kind: 'SERIES'
};

const formResult: InstrumentSubmitHandler.AnyContext = {
  data: { score: 1 },
  instrumentId: 'instrument-1',
  kind: 'FORM'
};

function seriesResult(complete: boolean): InstrumentSubmitHandler.AnyContext {
  return {
    complete,
    data: { score: 1 },
    index: 0,
    instrumentId: 'instrument-1',
    kind: 'SERIES',
    seriesInstrumentId: 'series-1'
  };
}

function renderAssignment(target: InstrumentBundleContainer = formTarget, redirectUrl?: string) {
  return render(
    <Root
      activeLanguages={['en', 'fr']}
      id="assignment-1"
      kind="assignment"
      language="en"
      redirectUrl={redirectUrl}
      target={target}
      token="assignment-token"
    />
  );
}

const REDIRECT_URL = 'https://example.com/done';

async function solveChallenge() {
  await act(async () => {
    document.querySelector('cap-widget')!.dispatchEvent(new CustomEvent('solve', { detail: { token: 'cap-token' } }));
    await Promise.resolve();
  });
}

async function submit(result: InstrumentSubmitHandler.AnyContext) {
  await act(async () => {
    await renderer.props!.onSubmit(result);
  });
}

function notifications() {
  return useNotificationsStore.getState().notifications;
}

describe('Root', () => {
  let post: MockInstance<typeof axios.post>;
  let patch: MockInstance<typeof axios.patch>;

  beforeEach(() => {
    useNotificationsStore.setState({ notifications: [] });
    post = vi.spyOn(axios, 'post').mockResolvedValue({});
    patch = vi.spyOn(axios, 'patch').mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should reveal the page once mounted on the client, so unstyled server markup is never shown', () => {
    const { container } = render(<Root activeLanguages={['en']} kind="landing" language="en" />);
    expect(container.querySelector<HTMLElement>('.h-screen')?.style.display).toBe('flex');
  });

  it('should render the landing page for a visitor without an assignment', () => {
    render(<Root activeLanguages={['en']} kind="landing" language="en" />);
    expect(screen.getByTestId('gateway-landing')).toBeTruthy();
  });

  it('should keep the instrument locked until the subject solves the verification challenge', () => {
    renderAssignment();
    expect(screen.getByTestId('instrument-renderer').getAttribute('data-disable-begin')).toBe('true');
  });

  it('should exchange a solved challenge for server-side verification of the assignment', async () => {
    renderAssignment();
    await solveChallenge();
    expect(post).toHaveBeenCalledWith('/api/auth/verify', { id: 'assignment-1', token: 'cap-token' });
  });

  it('should unlock the instrument once the server accepts the verification', async () => {
    renderAssignment();
    await solveChallenge();
    expect(screen.getByTestId('instrument-renderer').getAttribute('data-disable-begin')).toBe('false');
  });

  it('should keep the instrument locked and tell the subject to retry when verification fails', async () => {
    post.mockRejectedValue(new Error('Forbidden'));
    renderAssignment();
    await solveChallenge();
    expect(screen.getByTestId('instrument-renderer').getAttribute('data-disable-begin')).toBe('true');
    expect(notifications()).toMatchObject([{ message: 'Verification failed, please try again', type: 'error' }]);
  });

  it('should refuse to submit before the challenge is solved, since the server would reject it', async () => {
    renderAssignment();
    await submit(formResult);
    expect(patch).not.toHaveBeenCalled();
    expect(notifications()).toMatchObject([{ message: 'Please complete the verification challenge', type: 'error' }]);
  });

  it('should submit a scalar result as a complete assignment, authorized by the assignment token', async () => {
    renderAssignment();
    await solveChallenge();
    await submit(formResult);
    expect(patch).toHaveBeenCalledWith(
      '/api/assignments/assignment-1',
      { data: { score: 1 }, kind: 'SCALAR', status: 'COMPLETE' },
      { headers: { Authorization: 'Bearer assignment-token' } }
    );
    expect(notifications()).toMatchObject([{ type: 'success' }]);
  });

  it('should mark a series assignment complete once its last item is submitted', async () => {
    renderAssignment(seriesTarget);
    await solveChallenge();
    await submit(seriesResult(true));
    expect(patch).toHaveBeenCalledWith(
      '/api/assignments/assignment-1',
      { ...seriesResult(true), status: 'COMPLETE' },
      expect.anything()
    );
  });

  it('should leave the status of a series assignment unchanged while items remain', async () => {
    renderAssignment(seriesTarget);
    await solveChallenge();
    await submit(seriesResult(false));
    expect(patch).toHaveBeenCalledWith(
      '/api/assignments/assignment-1',
      { ...seriesResult(false), status: undefined },
      expect.anything()
    );
  });

  it('should report an error instead of submitting a scalar result for a series target', async () => {
    renderAssignment(seriesTarget);
    await solveChallenge();
    await submit(formResult);
    expect(patch).not.toHaveBeenCalled();
    expect(notifications()).toMatchObject([{ message: 'Internal Server Error', type: 'error' }]);
  });

  it('should offer to send the subject on to the redirect URL once the assignment is complete', async () => {
    renderAssignment(formTarget, REDIRECT_URL);
    await solveChallenge();
    await submit(formResult);
    expect(screen.getByTestId('completion-redirect-link').getAttribute('href')).toBe(REDIRECT_URL);
  });

  it('should not send the subject on while items of a series remain', async () => {
    renderAssignment(seriesTarget, REDIRECT_URL);
    await solveChallenge();
    await submit(seriesResult(false));
    expect(screen.queryByTestId('completion-redirect')).toBeNull();
  });

  it('should send the subject on once the last item of a series is submitted', async () => {
    renderAssignment(seriesTarget, REDIRECT_URL);
    await solveChallenge();
    await submit(seriesResult(true));
    expect(screen.getByTestId('completion-redirect')).toBeTruthy();
  });

  it('should leave the subject on the completion screen when the assignment has no redirect URL', async () => {
    renderAssignment(formTarget);
    await solveChallenge();
    await submit(formResult);
    expect(screen.queryByTestId('completion-redirect')).toBeNull();
  });

  it('should not send the subject on when the gateway did not record the submission', async () => {
    patch.mockRejectedValue(new Error('Network Error'));
    renderAssignment(formTarget, REDIRECT_URL);
    await solveChallenge();
    await expect(submit(formResult)).rejects.toThrow('Network Error');
    expect(screen.queryByTestId('completion-redirect')).toBeNull();
  });
});
