import en from './locales/en.json' assert { type: "json" };
import ru from './locales/ru.json' assert { type: "json" };
import ro from './locales/ro.json' assert { type: "json" };

const locales = { en, ru, ro };

export function t(lang = 'en', key, params = {}) {
  const keys = key.split('.');
  let result = locales[lang] || locales.en;
  for (let k of keys) {
    result = result?.[k];
    if (!result) break;
  }
  if (!result) return key;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(new RegExp(`{{${k}}}`, 'g'), v),
    result
  );
}

