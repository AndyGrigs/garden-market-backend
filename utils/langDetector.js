const supportedLanguages = ["ru", "ro"];

export const getUserLanguage = (req) => {
  const lang =
    req.query.lang ||
    req.body.language ||
    req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
    'ru';
  return supportedLanguages.includes(lang) ? lang : 'ru';
}