import { inject, type InjectionKey } from 'vue'
import type { UniDrawLocale } from './types'
import zhCN from './zh-CN'

/**
 * Locale injection key.
 * Usage: app.provide(LOCALE_KEY, enUS)
 */
export const LOCALE_KEY: InjectionKey<UniDrawLocale> = Symbol('uni-draw-locale')

/**
 * Returns the active locale.
 * Falls back to zh-CN when no locale is provided via the injection chain.
 */
export function useLocale(): UniDrawLocale {
  return inject(LOCALE_KEY, zhCN)
}
