import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function getHref() {
  return window.location.href;
}

export function useLocationHref() {
  return useSyncExternalStore(subscribe, getHref);
}
