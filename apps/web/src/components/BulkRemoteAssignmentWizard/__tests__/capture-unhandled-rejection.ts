/**
 * The wizard steps fire their async handlers (`run` in SourceStep, `resolve` in MapStep) with `void`,
 * so an error they rethrow surfaces only as an unhandled rejection.
 */
export const captureUnhandledRejection = async (act: () => void) => {
  const listeners = process.listeners('unhandledRejection');
  process.removeAllListeners('unhandledRejection');
  try {
    const rejection = new Promise<unknown>((resolve) => process.once('unhandledRejection', resolve));
    act();
    return await rejection;
  } finally {
    process.removeAllListeners('unhandledRejection');
    listeners.forEach((listener) => process.on('unhandledRejection', listener));
  }
};
