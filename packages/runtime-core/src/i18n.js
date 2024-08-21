import { get } from 'lodash-es';

export function createI18Next({ fallbackLanguage = 'en', translations } = {}) {
  let resolvedLanguage;
  let handleLanguageChange = null;

  const documentElement = window.top.document.documentElement;
  const extractLanguageProperty = (element) => {
    if (element.lang === 'en' || element.lang === 'fr') {
      return element.lang;
    }
    console.error(`Unexpected value for HTMLElement 'lang' attribute: '${element.lang}'`);
    return fallbackLanguage;
  };

  const languageAttributeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'lang') {
        resolvedLanguage = extractLanguageProperty(mutation.target);
        handleLanguageChange?.(resolvedLanguage);
        handleLanguageChange?.(resolvedLanguage);
      }
    });
  });

  resolvedLanguage = extractLanguageProperty(documentElement);
  languageAttributeObserver.observe(documentElement, { attributes: true });

  return {
    changeLanguage: (language) => {
      window.top.document.dispatchEvent(new CustomEvent('changeLanguage', { detail: language }));
    },
    set onLanguageChange(handler) {
      handleLanguageChange = handler;
    },
    get resolvedLanguage() {
      return resolvedLanguage;
    },
    t: (key) => {
      const value = get(translations, key);
      if (typeof value === 'string') {
        return value;
      }
      return value[resolvedLanguage] ?? value[fallbackLanguage] ?? key;
    }
  };
}
