import { describe, it, expect, afterEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import QuestionnaireResult from './questionnaire-result.vue'

const { query } = vi.hoisted(() => ({ query: { value: {} } }))
mockNuxtImport('useRoute', () => () => ({ query: query.value }))

afterEach(() => {
  document.body.innerHTML = ''
})

describe('QuestionnaireResult page', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(QuestionnaireResult)
    expect(wrapper.text()).toContain('Response received')
  })

  it('is accessible', async () => {
    const wrapper = await mountSuspended(QuestionnaireResult, {
      attachTo: document.body,
    })
    expect(await axe(wrapper.element, { runOnly: ['wcag2a', 'wcag2aa'] })).toHaveNoViolations()
	})

  it('renders the submitted answers from the query', async () => {
  	query.value = { name: 'Alice', q1: 'Email', q2: ['A', 'B'] }
    const wrapper = await mountSuspended(QuestionnaireResult)
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Email')
  })

  it('moves focus to the heading on mount', async () => {
    query.value = {}
    const wrapper = await mountSuspended(QuestionnaireResult, { attachTo: document.body })
    const heading = wrapper.get('h1')
    expect(document.activeElement).toBe(heading.element)
  })
})
