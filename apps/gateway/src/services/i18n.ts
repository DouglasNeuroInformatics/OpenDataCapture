import { i18n } from '@douglasneuroinformatics/libui/i18n';

// `defaultLanguage` is deliberately left unset. It is what `t()` falls back to when a string has no
// entry in the resolved language, so pointing it at the patient's language would make every string
// missing a translation render as nothing. The session's language is set with `changeLanguage`.
i18n.init({
  translations: {}
});

export { i18n };
