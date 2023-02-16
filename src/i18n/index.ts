import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import zh from './zh.json'
import { BOARD_LOCAL_KEY, storage } from '@/utils/storage'

const lang =
  storage.get(BOARD_LOCAL_KEY) ||
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
  lng: lang
})

export default i18n
