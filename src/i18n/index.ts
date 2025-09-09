import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入语言资源
import en from './locales/en.json';
import zh from './locales/zh.json';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'zh', // 默认语言为中文
    fallbackLng: 'zh',
    
    interpolation: {
      escapeValue: false // React 已经默认进行了转义
    }
  });

export default i18n;