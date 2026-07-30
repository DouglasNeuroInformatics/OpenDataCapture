/**
 * A page that renders an instrument holds two instances of this module: the copy the host
 * application bundles, and the copy served from `/runtime/v1` that an instrument imports. Elements
 * cross freely between them, because React tags them with a registered symbol, but hooks do not —
 * a hook only works through the instance whose dispatcher owns the render. A form instrument
 * renders inside the host application's tree, so the served copy defers to the host's React.
 *
 * The host registers the wrapped package rather than this wrapper, because that is the instance its
 * `react-dom` is bound to — `runtime/v1/test/vendor-pairing.test.ts` is what holds those two to the
 * same physical directory. An interactive instrument renders in an iframe of its own, where nothing
 * is registered and the served copy is the only React on the page.
 */
import * as bundled from 'react';

function resolveImplementation() {
  if (typeof __ODC_RUNTIME_BUILD__ === 'undefined') {
    globalThis.__ODC_HOST_REACT = bundled;
    return bundled;
  }
  const host = globalThis.__ODC_HOST_REACT;
  if (!host) {
    return bundled;
  }
  if (host.version.split('.')[0] !== bundled.version.split('.')[0]) {
    throw new Error(
      `Cannot import '/runtime/v1/react@19.x': the application rendering this instrument uses React ${host.version}, which is incompatible with React ${bundled.version}`
    );
  }
  return host;
}

const react = resolveImplementation();

export default react.default;

export const Children = react.Children;
export const Component = react.Component;
export const Fragment = react.Fragment;
export const Profiler = react.Profiler;
export const PureComponent = react.PureComponent;
export const StrictMode = react.StrictMode;
export const Suspense = react.Suspense;
export const __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE =
  react.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
export const __COMPILER_RUNTIME = react.__COMPILER_RUNTIME;
export const act = react.act;
export const cache = react.cache;
export const captureOwnerStack = react.captureOwnerStack;
export const cloneElement = react.cloneElement;
export const createContext = react.createContext;
export const createElement = react.createElement;
export const createRef = react.createRef;
export const forwardRef = react.forwardRef;
export const isValidElement = react.isValidElement;
export const lazy = react.lazy;
export const memo = react.memo;
export const startTransition = react.startTransition;
export const unstable_useCacheRefresh = react.unstable_useCacheRefresh;
export const use = react.use;
export const useActionState = react.useActionState;
export const useCallback = react.useCallback;
export const useContext = react.useContext;
export const useDebugValue = react.useDebugValue;
export const useDeferredValue = react.useDeferredValue;
export const useEffect = react.useEffect;
export const useId = react.useId;
export const useImperativeHandle = react.useImperativeHandle;
export const useInsertionEffect = react.useInsertionEffect;
export const useLayoutEffect = react.useLayoutEffect;
export const useMemo = react.useMemo;
export const useOptimistic = react.useOptimistic;
export const useReducer = react.useReducer;
export const useRef = react.useRef;
export const useState = react.useState;
export const useSyncExternalStore = react.useSyncExternalStore;
export const useTransition = react.useTransition;
export const version = react.version;
