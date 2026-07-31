import type { PinionContext } from '@featherscloud/pinion'

export const TEMPL_TYPES = ['component', 'composable', 'page', 'util'] as const

export type GeneratorType = (typeof TEMPL_TYPES)[number]

export interface GeneratorContext extends PinionContext {
  type: GeneratorType
  name: string
  pascalName: string
  camelName: string
  kebabName: string
  description?: string
  withNuxtUi?: boolean
  needsProps?: boolean
}
