/** @public */
export type RuntimeNotification = {
  message?: string;
  title?: string;
  type: 'error' | 'info' | 'success' | 'warning';
  variant?: 'critical' | 'standard';
};

/**
 * @public
 * Display a notification in ODC for the user during an interactive instrument.
 * Please note this will not work with forms.
 */
export function addNotification(notification: RuntimeNotification) {
  window.parent.document.dispatchEvent(new CustomEvent('addNotification', { detail: notification }));
}
