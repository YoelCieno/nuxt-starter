// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  componentTemplate,
  componentSpecTemplate,
  composableTemplate,
  composableSpecTemplate,
  pageTemplate,
  pageSpecTemplate,
  utilTemplate,
  utilSpecTemplate,
} from './index'
import type { GeneratorContext } from '../models'

function ctx(overrides: Partial<GeneratorContext> = {}): GeneratorContext {
  return {
    kind: 'component',
    name: 'my-button',
    pascalName: 'MyButton',
    camelName: 'myButton',
    kebabName: 'my-button',
    withNuxtUi: true,
    needsProps: true,
    cwd: '/tmp',
    argv: [],
    pinion: {} as GeneratorContext['pinion'],
    ...overrides,
  } as GeneratorContext
}

describe('componentTemplate', () => {
  it('produces a script setup SFC with scoped style and BEM class', () => {
    const result = componentTemplate(ctx())
    expect(result).toContain('<script setup lang="ts">')
    expect(result).toContain('<style scoped>')
    expect(result).toContain('c-my-button')
    expect(result).toContain('<slot')
  })

  it('uses UButton when withNuxtUi is true, without an import line', () => {
    const result = componentTemplate(ctx({ withNuxtUi: true }))
    expect(result).toContain('<UButton')
    expect(result).not.toContain('<button')
    expect(result).not.toContain("import UButton from")
  })

  it('uses a plain button with aria-label and focus-visible when withNuxtUi is false', () => {
    const result = componentTemplate(ctx({ withNuxtUi: false }))
    expect(result).not.toContain('<UButton')
    expect(result).toContain('<button type="button" aria-label="MyButton">')
    expect(result).toContain('aria-label')
    expect(result).toContain(':focus-visible')
  })

  it('declares typed defineProps and defineEmits when needsProps is true', () => {
    const result = componentTemplate(ctx({ needsProps: true }))
    expect(result).toContain('defineProps')
    expect(result).toContain('defineEmits')
  })

  it('omits defineProps/defineEmits when needsProps is false', () => {
    const result = componentTemplate(ctx({ needsProps: false }))
    expect(result).not.toContain('defineProps')
    expect(result).not.toContain('defineEmits')
  })

  it('uses the kebab name in the BEM class', () => {
    const result = componentTemplate(ctx({ kebabName: 'product-card' }))
    expect(result).toContain('c-product-card')
  })
})

describe('componentSpecTemplate', () => {
  it('mounts with attachTo document.body and runs axe WCAG checks', () => {
    const result = componentSpecTemplate(ctx())
    expect(result).toContain('attachTo: document.body')
    expect(result).toContain("import { axe } from 'vitest-axe'")
    expect(result).toContain('toHaveNoViolations')
    expect(result).toContain("runOnly: ['wcag2a', 'wcag2aa']")
  })

  it('imports mount from @vue/test-utils and asserts render + emit', () => {
    const result = componentSpecTemplate(ctx())
    expect(result).toContain("import { mount } from '@vue/test-utils'")
    expect(result).toContain('MyButton')
    expect(result).toContain('wrapper.emitted')
    expect(result).toContain('expect')
  })

  it('imports the component via a colocated relative path', () => {
    const result = componentSpecTemplate(ctx({ pascalName: 'ProductCard' }))
    expect(result).toContain("import ProductCard from './ProductCard.vue'")
  })

  it('targets the colocated app/components/{pascalName}.spec.ts file path', () => {
    const result = componentSpecTemplate(ctx({ pascalName: 'ProductCard' }))
    expect(result).toContain('app/components/ProductCard.spec.ts')
  })
})

describe('composableTemplate', () => {
  it('explicitly imports ref and computed from vue', () => {
    const result = composableTemplate(ctx())
    expect(result).toContain("import { ref, computed } from 'vue'")
    expect(result).toContain('ref(')
    expect(result).toContain('computed(')
  })

  it('exports a use{PascalName} composable', () => {
    const result = composableTemplate(ctx({ pascalName: 'MyCounter' }))
    expect(result).toContain('export function useMyCounter')
  })
})

describe('composableSpecTemplate', () => {
  it('imports the composable from the colocated path and makes pure assertions', () => {
    const result = composableSpecTemplate(ctx({ camelName: 'myCounter' }))
    expect(result).toContain("from './myCounter'")
    expect(result).toContain('describe(')
    expect(result).toContain('expect(')
    expect(result.match(/\bit\(/g)).not.toBeNull()
    expect((result.match(/\bit\(/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })
})

describe('pageTemplate', () => {
  it('sets a useHead title, main landmark and h1 with the name', () => {
    const result = pageTemplate(ctx({ pascalName: 'About' }))
    expect(result).toContain('useHead')
    expect(result).toContain("title: 'About'")
    expect(result).toContain('<main>')
    expect(result).toContain('<h1>About</h1>')
  })
})

describe('pageSpecTemplate', () => {
  it('uses mountSuspended from @nuxt/test-utils/runtime and runs axe WCAG checks', () => {
    const result = pageSpecTemplate(ctx({ kebabName: 'about' }))
    expect(result).toContain("import { mountSuspended } from '@nuxt/test-utils/runtime'")
    expect(result).toContain('mountSuspended(')
    expect(result).toContain("import { axe } from 'vitest-axe'")
    expect(result).toContain('toHaveNoViolations')
    expect(result).toContain("runOnly: ['wcag2a', 'wcag2aa']")
    expect(result).toContain("from './about.vue'")
  })
})

describe('utilTemplate', () => {
  it('exports a pure function with no Vue imports', () => {
    const result = utilTemplate(ctx({ camelName: 'formatPrice' }))
    expect(result).toContain('export const formatPrice = (')
    expect(result).not.toContain("from 'vue'")
  })
})

describe('utilSpecTemplate', () => {
  it('imports the util from the colocated path and makes pure assertions', () => {
    const result = utilSpecTemplate(ctx({ kebabName: 'format-price' }))
    expect(result).toContain("from './format-price'")
    expect(result).toContain('describe(')
    expect(result).toContain('expect(')
    expect((result.match(/\bit\(/g) ?? []).length).toBeGreaterThanOrEqual(2)
  })
})
