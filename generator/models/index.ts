import type { PinionContext } from '@featherscloud/pinion'

export const TEMPL_KIND = ['component', 'composable', 'layout', 'page', 'util'] as const

export type GeneratorType = (typeof TEMPL_KIND)[number]

export interface GeneratorContext extends PinionContext {
  kind: GeneratorType
  name: string
  pascalName: string
  camelName: string
  kebabName: string
  description?: string
  withNuxtUi?: boolean
  needsProps?: boolean
}
