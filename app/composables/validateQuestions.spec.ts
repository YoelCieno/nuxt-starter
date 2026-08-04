import { describe, it, expect } from 'vitest'
import { reactive } from 'vue'
import { useValidateQuestions } from './validateQuestions'

describe('useValidateQuestions', () => {
  it('flags all fields when empty', () => {
    const state = reactive({ name: '', q1: '', q2: [] })
    const { errors } = useValidateQuestions(state)
    expect(errors.value).toHaveLength(3)
    expect(errors.value.map(e => e.name)).toEqual(['name', 'q1', 'q2'])
  })

  it('clears the name error when filled', () => {
    const state = reactive({ name: '', q1: 'Email', q2: ['Newsletter'] })
    const { errors } = useValidateQuestions(state)
    state.name = 'Alice'
    expect(errors.value.map(e => e.name)).toEqual([])
  })

  it('flags q1 when unset', () => {
    const state = reactive({ name: 'Alice', q1: '', q2: ['Newsletter'] })
    const { errors } = useValidateQuestions(state)
    expect(errors.value.map(e => e.name)).toEqual(['q1'])
  })

  it('flags q2 when empty array', () => {
    const state = reactive({ name: 'Alice', q1: 'Email', q2: [] })
    const { errors } = useValidateQuestions(state)
    expect(errors.value.map(e => e.name)).toEqual(['q2'])
  })
})
