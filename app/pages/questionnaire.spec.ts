import { describe, it, expect, afterEach, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { axe } from 'vitest-axe'
import Questionnaire from './questionnaire.vue'
import { flushPromises } from '@vue/test-utils'

const { navigateTo } = vi.hoisted(() => ({ navigateTo: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateTo)

afterEach(() => {
  document.body.innerHTML = ''
})

describe('questionnaire page', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(Questionnaire)
    expect(wrapper.text()).toContain('Questionnaire')
  })

  it('is accessible', async () => {
    const wrapper = await mountSuspended(Questionnaire, {
      attachTo: document.body,
    })
    expect(await axe(wrapper.element, { runOnly: ['wcag2a', 'wcag2aa'] })).toHaveNoViolations()
	})

  it('renders the three questions', async () => {
    const wrapper = await mountSuspended(Questionnaire)
    expect(wrapper.text()).toContain('Your name')
    expect(wrapper.text()).toContain('Preferred contact method')
    expect(wrapper.text()).toContain('What interests you?')
  })

  it('shows errors when submitted empty', async () => {
    const wrapper = await mountSuspended(Questionnaire, { attachTo: document.body })
		await wrapper.find('form').trigger('submit')
		await flushPromises()

    expect(wrapper.text()).toContain('Name is required')
    expect(wrapper.text()).toContain('Pick a contact method')
    expect(wrapper.text()).toContain('Select at least one interest')
  })

	it('navigates to result page with answers as query params', async () => {
		const wrapper = await mountSuspended(Questionnaire, { attachTo: document.body })

		await wrapper.get('input[name="name"]').setValue('Alice')

		const radios = wrapper.findAll('[role="radio"]')
		const checkboxes = wrapper.findAll('[role="checkbox"]')

		expect(radios).toHaveLength(3)
		expect(checkboxes).toHaveLength(3)

		await radios[0]!.trigger('click')
		await checkboxes[0]!.trigger('click')

		await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/questionnaire-result',
      query: expect.objectContaining({ name: 'Alice' }),
    })
  })
})
