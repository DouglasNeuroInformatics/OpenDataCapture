declare class TrustedHTML {
  private constructor();
  private brand: true;
}

export declare interface Config {
  ADD_ATTR?: string[] | undefined;
  ADD_DATA_URI_TAGS?: string[] | undefined;
  ADD_TAGS?: string[] | undefined;
  ADD_URI_SAFE_ATTR?: string[] | undefined;
  ALLOW_ARIA_ATTR?: boolean | undefined;
  ALLOW_DATA_ATTR?: boolean | undefined;
  ALLOW_UNKNOWN_PROTOCOLS?: boolean | undefined;
  ALLOW_SELF_CLOSE_IN_ATTR?: boolean | undefined;
  ALLOWED_ATTR?: string[] | undefined;
  ALLOWED_TAGS?: string[] | undefined;
  ALLOWED_NAMESPACES?: string[] | undefined;
  ALLOWED_URI_REGEXP?: RegExp | undefined;
  FORBID_ATTR?: string[] | undefined;
  FORBID_CONTENTS?: string[] | undefined;
  FORBID_TAGS?: string[] | undefined;
  FORCE_BODY?: boolean | undefined;
  IN_PLACE?: boolean | undefined;
  KEEP_CONTENT?: boolean | undefined;
  NAMESPACE?: string | undefined;
  PARSER_MEDIA_TYPE?: string | undefined;
  RETURN_DOM_FRAGMENT?: boolean | undefined;
  RETURN_DOM_IMPORT?: boolean | undefined;
  RETURN_DOM?: boolean | undefined;
  RETURN_TRUSTED_TYPE?: boolean | undefined;
  SAFE_FOR_TEMPLATES?: boolean | undefined;
  SANITIZE_DOM?: boolean | undefined;
  SANITIZE_NAMED_PROPS?: boolean | undefined;
  USE_PROFILES?:
    | false
    | {
        mathMl?: boolean | undefined;
        svg?: boolean | undefined;
        svgFilters?: boolean | undefined;
        html?: boolean | undefined;
      }
    | undefined;
  WHOLE_DOCUMENT?: boolean | undefined;
  CUSTOM_ELEMENT_HANDLING?: {
    tagNameCheck?: RegExp | ((tagName: string) => boolean) | null | undefined;
    attributeNameCheck?: RegExp | ((lcName: string) => boolean) | null | undefined;
    allowCustomizedBuiltInElements?: boolean | undefined;
  };
}

export declare interface DOMPurifyI {
  sanitize(source: string | Node): string;
  sanitize(source: string | Node, config: Config & { RETURN_TRUSTED_TYPE: true }): TrustedHTML;
  sanitize(
    source: string | Node,
    config: Config & {
      RETURN_DOM_FRAGMENT?: false | undefined;
      RETURN_DOM?: false | undefined;
    }
  ): string;
  sanitize(source: string | Node, config: Config & { RETURN_DOM_FRAGMENT: true }): DocumentFragment;
  sanitize(source: string | Node, config: Config & { RETURN_DOM: true }): HTMLElement;
  sanitize(source: string | Node, config: Config): string | HTMLElement | DocumentFragment;

  addHook(
    hook: 'uponSanitizeElement',
    cb: (currentNode: Element, data: SanitizeElementHookEvent, config: Config) => void
  ): void;
  addHook(
    hook: 'uponSanitizeAttribute',
    cb: (currentNode: Element, data: SanitizeAttributeHookEvent, config: Config) => void
  ): void;
  addHook(hook: HookName, cb: (currentNode: Element, data: HookEvent, config: Config) => void): void;

  setConfig(cfg: Config): void;
  clearConfig(): void;
  isValidAttribute(tag: string, attr: string, value: string): boolean;

  removeHook(entryPoint: HookName): void;
  removeHooks(entryPoint: HookName): void;
  removeAllHooks(): void;

  version: string;
  removed: any[];
  isSupported: boolean;
}

export declare type HookEvent = SanitizeElementHookEvent | SanitizeAttributeHookEvent | null;

export declare type HookName =
  | 'beforeSanitizeElements'
  | 'uponSanitizeElement'
  | 'afterSanitizeElements'
  | 'beforeSanitizeAttributes'
  | 'uponSanitizeAttribute'
  | 'afterSanitizeAttributes'
  | 'beforeSanitizeShadowDOM'
  | 'uponSanitizeShadowNode'
  | 'afterSanitizeShadowDOM';

export declare interface SanitizeAttributeHookEvent {
  attrName: string;
  attrValue: string;
  keepAttr: boolean;
  allowedAttributes: { [key: string]: boolean };
  forceKeepAttr?: boolean | undefined;
}

export declare interface SanitizeElementHookEvent {
  tagName: string;
  allowedTags: { [key: string]: boolean };
}

declare const DOMPurify: DOMPurifyI;

export default DOMPurify;
