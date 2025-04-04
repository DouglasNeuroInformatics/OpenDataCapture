import { get } from 'lodash-es';

import type { Language } from './types/core.js';

function InitializedOnly<T extends BaseTranslator, TArgs extends any[], TReturn>(
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
type TranslationKey<T extends { [key: string]: unknown }, Key = keyof T> = Key extends string
  ? T[Key] extends { [key: string]: unknown }
    ? T[Key] extends { [K in Language]: string }
      ? Key
      : `${Key}.${TranslationKey<T[Key]>}`
    : `${Key}`
  : never;

/** @public */
type LanguageChangeHandler = (this: void, language: Language) => void;

/** @public */
type TranslatorOptions<T extends { [key: string]: unknown }> = {
  fallbackLanguage?: Language;
  translations: T;
};

/** @public */
type TranslatorInitOptions = {
  onLanguageChange?: LanguageChangeHandler | null;
};

/** @public */
type TranslatorInstance<T extends { [key: string]: unknown }> = {
  changeLanguage(language: Language): void;
  init(options?: TranslatorInitOptions): void;
  readonly isInitialized: boolean;
  onLanguageChange: LanguageChangeHandler;
  readonly resolvedLanguage: Language;
  t(key: TranslationKey<T>): string;
};

/** @public */
type TranslatorConstructor = new <T extends { [key: string]: unknown }>(
  options: TranslatorOptions<T>
) => TranslatorInstance<T>;

/** @public */
abstract class BaseTranslator<T extends { [key: string]: unknown } = { [key: string]: unknown }> {
  protected currentDocumentLanguage: Language | null;
  protected fallbackLanguage: Language;
  protected handleLanguageChange: LanguageChangeHandler | null;
  protected translations: T;
  #isInitialized: boolean;

  constructor({ fallbackLanguage, translations }: TranslatorOptions<T>) {
    this.currentDocumentLanguage = null;
    this.fallbackLanguage = fallbackLanguage ?? 'en';
    this.handleLanguageChange = null;
    this.#isInitialized = false;
    this.translations = translations;
  }

  get isInitialized() {
    return this.#isInitialized;
  }

  protected set isInitialized(value: boolean) {
    this.#isInitialized = value;
  }

  @InitializedOnly
  set onLanguageChange(handler: LanguageChangeHandler) {
    this.handleLanguageChange = handler;
  }

  @InitializedOnly
  get resolvedLanguage() {
    return this.currentDocumentLanguage ?? this.fallbackLanguage;
  }

  abstract changeLanguage(language: Language): void;

  @InitializedOnly
  protected extractLanguageProperty(element: Element) {
    const lang = element.getAttribute('lang');
    if (lang === 'en' || lang === 'fr') {
      return lang;
    }
    console.error(`Unexpected value for 'lang' attribute: '${lang}'`);
    return null;
  }

  init(options: TranslatorInitOptions, targetElement: Element) {
    this.isInitialized = true;
    this.currentDocumentLanguage = this.extractLanguageProperty(targetElement);

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

    languageAttributeObserver.observe(targetElement, { attributes: true });
  }

  @InitializedOnly
  t(key: TranslationKey<T>) {
    const value = get(this.translations, key) as string | undefined | { [key: string]: string };
    if (typeof value === 'string') {
      return value;
    }
    return value?.[this.resolvedLanguage] ?? value?.[this.fallbackLanguage] ?? key;
  }
}

/** @public */
class SynchronizedTranslator<T extends { [key: string]: unknown }>
  extends BaseTranslator<T>
  implements TranslatorInstance<T>
{
  constructor(options: TranslatorOptions<T>) {
    super(options);
  }

  @InitializedOnly
  changeLanguage(language: Language) {
    window.top!.document.dispatchEvent(new CustomEvent('changeLanguage', { detail: language }));
  }

  override init(options: TranslatorInitOptions = {}) {
    if (typeof window === 'undefined') {
      throw new Error('Cannot initialize SynchronizedTranslator outside of browser');
    } else if (!window.frameElement) {
      throw new Error('Cannot initialize SynchronizedTranslator in context where window.frameElement is null');
    } else if (window.frameElement.getAttribute('name') !== 'interactive-instrument') {
      throw new Error('SynchronizedTranslator must be initialized in InstrumentRenderer');
    }
    return super.init(options, window.frameElement);
  }
}

/** @public */
class StandaloneTranslator<T extends { [key: string]: unknown }>
  extends BaseTranslator<T>
  implements TranslatorInstance<T>
{
  @InitializedOnly
  changeLanguage(language: Language) {
    document.documentElement.setAttribute('lang', language);
  }

  override init(options: TranslatorInitOptions = {}) {
    if (typeof window === 'undefined') {
      throw new Error('Cannot initialize StandaloneTranslator outside of browser');
    }
    return super.init(options, document.documentElement);
  }
}

/** @public */
let Translator: TranslatorConstructor;
if (typeof window === 'undefined' || window.self !== window.top) {
  Translator = SynchronizedTranslator;
} else {
  Translator = StandaloneTranslator;
}

export { BaseTranslator, StandaloneTranslator, SynchronizedTranslator, Translator };
export type {
  LanguageChangeHandler,
  TranslationKey,
  TranslatorConstructor,
  TranslatorInitOptions,
  TranslatorInstance,
  TranslatorOptions
};
