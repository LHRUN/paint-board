import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import zh from './zh.json'

const lang =
  localStorage.getItem('local') ||
  (['en', 'en-US', 'en-us'].includes(navigator.language) ? 'en' : 'zh')

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en
    },
    zh: {
      translation: zh
    }
  },
  lng: 'en'
})

export default i18n
