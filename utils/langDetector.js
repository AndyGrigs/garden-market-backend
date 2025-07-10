
export const getUserLanguage = (req) => {
  return req.query.lang || 
         req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 
         req.body.language || 
         'ru';
};