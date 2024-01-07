import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import zh from './zh.json'
import useBoardStore from '@/store/board'

const lang = useBoardStore.getState().language

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
