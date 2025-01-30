import { get } from 'lodash-es';

import type { Language } from './types/core.js';

function InitializedOnly<T extends Translator, TArgs extends any[], TReturn>(
  target: (this: T, ...args: TArgs) => TReturn,
  context: ClassGetterDecoratorContext<T> | ClassMethodDecoratorContext<T> | ClassSetterDecoratorContext<T>
) {
  const name = context.name.toString();
  function replacementMethod(this: T, ...args: TArgs): TReturn {
    if (!this.isInitialized) {
      throw new Error(`Cannot access ${context.kind} '${name}' of Translator before initialization in browser`);
    }
    return target.call(this, ...args);
  }
  return replacementMethod;
}

/** @public */
export type TranslationKey<T extends { [key: string]: unknown }, Key = keyof T> = Key extends string
  ? T[Key] extends { [key: string]: unknown }
    ? T[Key] extends { [K in Language]: string }
      ? Key
      : `${Key}.${TranslationKey<T[Key]>}`
    : `${Key}`
  : never;

/** @public */
export type LanguageChangeHandler = (this: void, language: Language) => void;

/** @public */
export class Translator<T extends { [key: string]: unknown } = { [key: string]: unknown }> {
  isInitialized: boolean;
  private currentDocumentLanguage: Language | null;
  private fallbackLanguage: Language;
  private handleLanguageChange: LanguageChangeHandler | null;
  private translations: T;

  constructor(options: { fallbackLanguage?: Language; translations: T }) {
    this.isInitialized = false;
    this.currentDocumentLanguage = null;
    this.fallbackLanguage = options.fallbackLanguage ?? 'en';
    this.handleLanguageChange = null;
    this.translations = options.translations;
  }

  @InitializedOnly
  set onLanguageChange(handler: LanguageChangeHandler) {
    this.handleLanguageChange = handler;
  }

  @InitializedOnly
  get resolvedLanguage() {
    return this.currentDocumentLanguage ?? this.fallbackLanguage;
  }

  @InitializedOnly
  changeLanguage(language: Language) {
    window.top!.document.dispatchEvent(new CustomEvent('changeLanguage', { detail: language }));
  }

  init(options?: { onLanguageChange?: LanguageChangeHandler | null }) {
    if (typeof window === 'undefined') {
      throw new Error('Cannot initialize Translator outside of browser');
    } else if (!window.frameElement) {
      throw new Error('Cannot initialize Translator in context where window.frameElement is null');
    }

    this.isInitialized = true;
    this.currentDocumentLanguage = this.extractLanguageProperty(window.frameElement);

    if (options?.onLanguageChange) {
      this.onLanguageChange = options.onLanguageChange;
    }

    const languageAttributeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'lang') {
          this.currentDocumentLanguage = this.extractLanguageProperty(mutation.target as Element);
          this.handleLanguageChange?.(this.resolvedLanguage);
        }
      });
    });

    languageAttributeObserver.observe(window.frameElement, { attributes: true });
  }

  @InitializedOnly
  t(key: TranslationKey<T>) {
    const value = get(this.translations, key) as { [key: string]: string } | string | undefined;
    if (typeof value === 'string') {
      return value;
    }
    return value?.[this.resolvedLanguage] ?? value?.[this.fallbackLanguage] ?? key;
  }

  @InitializedOnly
  private extractLanguageProperty(element: Element) {
    const lang = element.getAttribute('lang');
    if (lang === 'en' || lang === 'fr') {
      return lang;
    }
    console.error(`Unexpected value for 'lang' attribute: '${lang}'`);
    return null;
  }
}
