import type {
  CElement,
  Component,
  ComponentState,
  DOMAttributes,
  DOMElement,
  FunctionComponentElement,
  ReactElement,
  ReactInstance,
  ReactNode,
  ReactPortal
} from 'react__18.x';

/**
 * @deprecated See https://react.dev/reference/react-dom/findDOMNode#alternatives
 */
export function findDOMNode(instance: null | ReactInstance | undefined): Element | null | Text;
/**
 * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
 */
export function unmountComponentAtNode(container: DocumentFragment | Element): boolean;

export function createPortal(
  children: ReactNode,
  container: DocumentFragment | Element,
  key?: null | string
): ReactPortal;

export const version: string;
/**
 * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
 */
export const render: Renderer;
/**
 * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
 */
export const hydrate: Renderer;

export function flushSync<R>(fn: () => R): R;

export function unstable_batchedUpdates<A, R>(callback: (a: A) => R, a: A): R;
export function unstable_batchedUpdates<R>(callback: () => R): R;

/**
 * @deprecated
 */
export function unstable_renderSubtreeIntoContainer<T extends Element>(
  parentComponent: Component<any>,
  element: DOMElement<DOMAttributes<T>, T>,
  container: Element,
  callback?: (element: T) => any
): T;
/**
 * @deprecated
 */
export function unstable_renderSubtreeIntoContainer<P, T extends Component<P, ComponentState>>(
  parentComponent: Component<any>,
  element: CElement<P, T>,
  container: Element,
  callback?: (component: T) => any
): T;
/**
 * @deprecated
 */
export function unstable_renderSubtreeIntoContainer<P>(
  parentComponent: Component<any>,
  element: ReactElement<P>,
  container: Element,
  callback?: (component?: Component<P, ComponentState> | Element) => any
): Component<P, ComponentState> | Element | void;

export type Container = Document | DocumentFragment | Element;

export interface Renderer {
  // Deprecated(render): The return value is deprecated.
  // In future releases the render function's return type will be void.

  /**
   * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
   */
  <T extends Element>(element: DOMElement<DOMAttributes<T>, T>, container: Container | null, callback?: () => void): T;

  /**
   * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
   */
  (element: DOMElement<DOMAttributes<any>, any>[], container: Container | null, callback?: () => void): Element;

  /**
   * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
   */
  (
    element: FunctionComponentElement<any> | FunctionComponentElement<any>[],
    container: Container | null,
    callback?: () => void
  ): void;

  /**
   * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
   */
  <P, T extends Component<P, ComponentState>>(
    element: CElement<P, T>,
    container: Container | null,
    callback?: () => void
  ): T;

  /**
   * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
   */
  (
    element: CElement<any, Component<any, ComponentState>>[],
    container: Container | null,
    callback?: () => void
  ): Component<any, ComponentState>;

  /**
   * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
   */
  <P>(
    element: ReactElement<P>,
    container: Container | null,
    callback?: () => void
  ): Component<P, ComponentState> | Element | void;

  /**
   * @deprecated See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
   */
  (
    element: ReactElement[],
    container: Container | null,
    callback?: () => void
  ): Component<any, ComponentState> | Element | void;
}
