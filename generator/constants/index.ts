import {
  componentTemplate,
  componentSpecTemplate,
  composableTemplate,
  composableSpecTemplate,
  pageTemplate,
  pageSpecTemplate,
  utilTemplate,
  utilSpecTemplate,
} from '../templates'
import type { GeneratorContext, GeneratorType } from '../models'

const ARTIFACT_PARTS: Record<GeneratorType, (ctx: GeneratorContext) => string[]> = {
  component: (c) => ['app', 'components', `${c.pascalName}.vue`],
  composable: (c) => ['app', 'composables', `${c.camelName}.ts`],
  page: (c) => ['app', 'pages', `${c.kebabName}.vue`],
  util: (c) => ['app', 'utils', `${c.kebabName}.ts`],
}

const SPEC_PARTS: Record<GeneratorType, (ctx: GeneratorContext) => string[]> = {
  component: (c) => ['app', 'components', `${c.pascalName}.spec.ts`],
  composable: (c) => ['app', 'composables', `${c.camelName}.spec.ts`],
  page: (c) => ['app', 'pages', `${c.kebabName}.spec.ts`],
  util: (c) => ['app', 'utils', `${c.kebabName}.spec.ts`],
}

const ARTIFACT_TEMPLATES: Record<GeneratorType, (ctx: GeneratorContext) => string> = {
  component: componentTemplate,
  composable: composableTemplate,
  page: pageTemplate,
  util: utilTemplate,
}

const SPEC_TEMPLATES: Record<GeneratorType, (ctx: GeneratorContext) => string> = {
  component: componentSpecTemplate,
  composable: composableSpecTemplate,
  page: pageSpecTemplate,
  util: utilSpecTemplate,
}

const COMPONENT_FLAGS: Record<string, Partial<Pick<GeneratorContext, 'withNuxtUi' | 'needsProps'>>> = {
  '--with-nuxt-ui': { withNuxtUi: true },
  '--no-nuxt-ui': { withNuxtUi: false },
  '--with-props': { needsProps: true },
  '--no-props': { needsProps: false },
}

export {
  ARTIFACT_PARTS,
  SPEC_PARTS,
  ARTIFACT_TEMPLATES,
  SPEC_TEMPLATES,
  COMPONENT_FLAGS,
}
