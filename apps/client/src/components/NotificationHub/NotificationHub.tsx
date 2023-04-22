import React, { MouseEvent, useMemo } from 'react';

import { animated, useTransition } from '@react-spring/web';
import { useTranslation } from 'react-i18next';
import { HiX } from 'react-icons/hi';

import { NotificationIcon } from './NotificationIcon';

import { type Notification as NotificationInterface, useNotificationsStore } from '@/stores/notifications-store';

type RefMap = WeakMap<NotificationInterface, HTMLDivElement>;
type CancelMap = WeakMap<NotificationInterface, () => void>;

export interface NotificationHubProps {
  config?: {
    tension: number;
    friction: number;
    precision: number;
  };
  timeout?: number;
}

export const NotificationHub = ({
  config = { tension: 125, friction: 20, precision: 0.1 },
  timeout = 5000
}: NotificationHubProps) => {
  const { t } = useTranslation('common');
  const { notifications, dismiss } = useNotificationsStore();

  const refMap = useMemo<RefMap>(() => new WeakMap(), []);
  const cancelMap = useMemo<CancelMap>(() => new WeakMap(), []);

  const transitions = useTransition(notifications, {
    from: { opacity: 0, height: 0, progress: '0%' },
    keys: (item) => item.id,
    enter: (item) => async (next, cancel) => {
      cancelMap.set(item, cancel);
      await next({ opacity: 1, height: refMap.get(item)!.offsetHeight });
      await next({ progress: '100%' });
    },
    leave: [{ opacity: 0 }, { height: 0 }],
    onRest: (result, ctrl, item) => {
      dismiss(item.id);
    },
    config: (item, index, phase) => (key) => phase === 'enter' && key === 'progress' ? { duration: timeout } : config
  });

  return (
    <div className="fixed bottom-0 z-50 w-full">
      {transitions(({ progress, ...style }, item) => (
        <animated.div
          className="relative m-2 max-w-sm rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
          style={style}
        >
          <div ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
            <div className="p-4">
              <div className="mb-2 flex items-center">
                <NotificationIcon type={item.type} />
                <h5 className="ml-3 flex-grow font-medium text-slate-900">
                  {item.title ?? t(`notifications.types.${item.type}`)}
                </h5>
                <button
                  className="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={(event: MouseEvent) => {
                    event.stopPropagation();
                    const cancel = cancelMap.get(item);
                    if (cancel && progress.get() !== '100%') {
                      cancel();
                    }
                  }}
                >
                  <span className="sr-only">Close</span>
                  <HiX aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
              <p className="my-2 text-slate-600">{item.message}</p>
            </div>
            <animated.div className="h-1 bg-slate-500" style={{ width: progress }} />
          </div>
        </animated.div>
      ))}
    </div>
  );
};
