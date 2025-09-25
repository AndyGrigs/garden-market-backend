import fs from 'fs';
const ru = JSON.parse(fs.readFileSync('./locales/ru.json', 'utf-8'));
const ro = JSON.parse(fs.readFileSync('./locales/ro.json', 'utf-8'));

const locales = { ru, ro };

export function t(lang = 'ru', key, params = {}) {
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

