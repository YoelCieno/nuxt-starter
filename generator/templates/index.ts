import type { GeneratorContext } from '../models'

export const componentTemplate = (ctx: GeneratorContext): string => {
  const { pascalName, kebabName, withNuxtUi, needsProps } = ctx

  const propsBlock = needsProps
    ? `const props = defineProps<{
  label?: string
}>()

const emit = defineEmits<{
  click: []
}>()
`
    : ''

  const clickHandler = needsProps ? ` @click="emit('click')"` : ''

  const trigger = withNuxtUi
    ? `    <UButton type="button" aria-label="${pascalName}"${clickHandler}>
      <slot />
    </UButton>`
    : `    <button type="button" aria-label="${pascalName}">
      <slot />
    </button>`

  const label = needsProps ? `\n      {{ props.label }}` : ''

  return `<script setup lang="ts">
${propsBlock}</script>

<template>
  <div class="c-${kebabName}" role="group" aria-label="${pascalName}"${clickHandler}>
${trigger}${label}
  </div>
</template>

<style scoped>
.c-${kebabName} {
  display: inline-block;
}

.c-${kebabName}__trigger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
`
}

export const componentSpecTemplate = (ctx: GeneratorContext): string => {
  const { pascalName } = ctx

  return `import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { axe } from 'vitest-axe'
import ${pascalName} from './${pascalName}.vue'

// Target file: app/components/${pascalName}.spec.ts

afterEach(() => {
  document.body.innerHTML = ''
})

describe('${pascalName}', () => {
  it('renders', () => {
    const wrapper = mount(${pascalName}, {
      attachTo: document.body,
    })
    expect(wrapper.exists()).toBe(true)
    wrapper.unmount()
  })

  it('emits click', async () => {
    const wrapper = mount(${pascalName}, {
      attachTo: document.body,
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    wrapper.unmount()
  })

  it('is accessible', async () => {
    const wrapper = mount(${pascalName}, {
      attachTo: document.body,
    })
    expect(await axe(wrapper.element, { runOnly: ['wcag2a', 'wcag2aa'] })).toHaveNoViolations()
    wrapper.unmount()
  })
})
`
}

export const composableTemplate = (ctx: GeneratorContext): string => {
  const { pascalName } = ctx

  return `import { ref, computed } from 'vue'

export function use${pascalName}(initial = 0) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return {
    count,
    double,
    increment,
  }
}
`
}

export const composableSpecTemplate = (ctx: GeneratorContext): string => {
  const { pascalName, camelName } = ctx

  return `import { describe, it, expect } from 'vitest'
import { use${pascalName} } from './${camelName}'

describe('use${pascalName}', () => {
  it('initializes count with the given value', () => {
    const { count } = use${pascalName}(3)
    expect(count.value).toBe(3)
  })

  it('computes the double of the count', () => {
    const { double } = use${pascalName}(2)
    expect(double.value).toBe(4)
  })

  it('increments the count', () => {
    const { count, increment } = use${pascalName}()
    increment()
    expect(count.value).toBe(1)
  })
})
`
}

export const pageTemplate = (ctx: GeneratorContext): string => {
  const { pascalName } = ctx

  return `<script setup lang="ts">
useHead({
  title: '${pascalName}',
})
</script>

<template>
  <main>
    <h1>${pascalName}</h1>
  </main>
</template>
`
}

export const pageSpecTemplate = (ctx: GeneratorContext): string => {
  const { pascalName, kebabName } = ctx

  return `import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import ${pascalName} from './${kebabName}.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('${pascalName} page', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(${pascalName})
    expect(wrapper.text()).toContain('${pascalName}')
  })

  it('is accessible', async () => {
    const wrapper = await mountSuspended(${pascalName}, {
      attachTo: document.body,
    })
    expect(await axe(wrapper.element, { runOnly: ['wcag2a', 'wcag2aa'] })).toHaveNoViolations()
  })
})
`
}

export const layoutTemplate = (ctx: GeneratorContext): string => {
  const { kebabName } = ctx

  return `<template>
  <div class="l-${kebabName}">
    <slot />
  </div>
</template>
`
}

export const layoutSpecTemplate = (ctx: GeneratorContext): string => {
  const { kebabName, pascalName } = ctx

  return `import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import { h } from 'vue'
import ${pascalName} from './${kebabName}.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('${pascalName} layout', () => {
  it('renders slot content in a non-main wrapper', async () => {
    const wrapper = await mountSuspended(${pascalName}, {
      slots: { default: () => h('p', 'slot content') },
    })
    expect(wrapper.find('div.l-${kebabName}').element.tagName).toBe('DIV')
    expect(wrapper.text()).toContain('slot content')
  })

  it('is accessible', async () => {
    const wrapper = await mountSuspended(${pascalName}, {
      attachTo: document.body,
      slots: { default: () => h('main', { id: 'page-main' }, 'page content') },
    })
    expect(await axe(wrapper.element, { runOnly: ['wcag2a', 'wcag2aa'] })).toHaveNoViolations()
  })
})
`
}

export const utilTemplate = (ctx: GeneratorContext): string => {
  const { camelName } = ctx

  return `export const ${camelName} = (value: string): string => {
  return value.trim()
}
`
}

export const utilSpecTemplate = (ctx: GeneratorContext): string => {
  const { camelName, kebabName } = ctx

  return `import { describe, it, expect } from 'vitest'
import { ${camelName} } from './${kebabName}'

describe('${camelName}', () => {
  it('trims surrounding whitespace', () => {
    expect(${camelName}('  hello  ')).toBe('hello')
  })

  it('returns already-trimmed input unchanged', () => {
    expect(${camelName}('hello')).toBe('hello')
  })
})
`
}
