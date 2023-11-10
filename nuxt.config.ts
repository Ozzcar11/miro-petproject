// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path'

export default defineNuxtConfig({
   ssr: false,
   alias: {
      '@': resolve(__dirname, '/')
   },
}
)
