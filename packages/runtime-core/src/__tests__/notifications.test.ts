// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest';

import { addNotification } from '../notifications.js';

import type { RuntimeNotification } from '../notifications.js';

describe('addNotification', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should dispatch an addNotification event on the parent document carrying the notification', () => {
    const dispatchEvent = vi.spyOn(window.parent.document, 'dispatchEvent');
    const notification: RuntimeNotification = { message: 'Saved', type: 'success' };
    addNotification(notification);
    const event = dispatchEvent.mock.lastCall?.[0];
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event?.type).toBe('addNotification');
    expect(event instanceof CustomEvent && event.detail).toBe(notification);
  });
});
