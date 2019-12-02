const env = process.env;
const language = env.LANG || env.LANGUAGE || env.LC_ALL || env.LC_MESSAGES;
const langTexts = require('../languages');

let lang = 'pt_br';

setLang(language);

function setLang(language) {
    const systemLang = String(language).toLowerCase();
    lang = systemLang.indexOf('pt_br') > -1 ? 'pt_br' : 'en_us';
}

function translate(key) {
    const currentLang = langTexts[lang];
    if (currentLang[key]) {
        return currentLang[key];
    }
    return key;
}

module.exports = translate;