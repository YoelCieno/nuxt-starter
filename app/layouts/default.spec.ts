import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import { h } from 'vue'
import DefaultLayout from './default.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('DefaultLayout', () => {
  it('renders slot content', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      slots: { default: () => h('p', 'layout slot content') },
    })
    expect(wrapper.text()).toContain('layout slot content')
  })

  it('is accessible', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      attachTo: document.body,
      slots: { default: () => h('div', { id: 'page-main' }, 'content') },
    })
    expect(await axe(wrapper.element, { runOnly: ['wcag2a', 'wcag2aa'] })).toHaveNoViolations()
  })
})
