import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import Index from './index.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Index page', () => {
  it('renders link text', async () => {
    const wrapper = await mountSuspended(Index)
    expect(wrapper.text()).toContain('Start Questionnaire')
  })

  it('is accessible', async () => {
    const wrapper = await mountSuspended(Index, {
      attachTo: document.body,
    })
    expect(await axe(wrapper.element, { runOnly: ['wcag2a', 'wcag2aa'] })).toHaveNoViolations()
  })
})
