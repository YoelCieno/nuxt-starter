// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { kindPrompt, namePrompt, componentPrompts } from './index'
import type { Question } from 'inquirer'

interface TestPrompt {
  type: string
  name: string
  message: string
  default?: unknown
  choices?: Array<{ name: string; value: string }>
  validate?: (input: string) => boolean | string
}

function findPrompt(
  prompts: Question[],
  name: string,
): TestPrompt {
  const found = prompts.find((q) => q.name === name)
  if (!found) throw new Error(`Prompt "${name}" not found`)
  return found as TestPrompt
}

describe('kindPrompt', () => {
  it('is a list prompt named kind', () => {
    expect(kindPrompt.name).toBe('kind')
    expect(kindPrompt.type).toBe('list')
  })

  it('has exactly 4 choices for component, composable, page, util', () => {
    const choices = (kindPrompt as TestPrompt).choices ?? []
    expect(choices).toHaveLength(4)
    expect(choices.map((c) => c.value)).toEqual([
      'component',
      'composable',
      'page',
      'util',
    ])
  })
})

describe('namePrompt', () => {
  it('is an input prompt named name', () => {
    expect(namePrompt.name).toBe('name')
    expect(namePrompt.type).toBe('input')
  })

  it('validates against /^[A-Za-z][A-Za-z0-9-]*$/', () => {
    const validate = (namePrompt as TestPrompt).validate!
    expect(validate('valid-name')).toBe(true)
    expect(validate('MyButton')).toBe(true)
    expect(validate('my-component-2')).toBe(true)
    expect(validate('123abc')).not.toBe(true)
    expect(validate('-dash')).not.toBe(true)
    expect(validate('with space')).not.toBe(true)
    expect(validate('my_name')).not.toBe(true)
    expect(validate('')).not.toBe(true)
  })
})

describe('componentPrompts', () => {
  it('exports an array of prompts', () => {
    expect(Array.isArray(componentPrompts)).toBe(true)
    expect(componentPrompts).toHaveLength(2)
  })

  it('has withNuxtUi confirm defaulting to true', () => {
    const p = findPrompt(componentPrompts, 'withNuxtUi')
    expect(p.type).toBe('confirm')
    expect(p.default).toBe(true)
  })

  it('has needsProps confirm defaulting to true', () => {
    const p = findPrompt(componentPrompts, 'needsProps')
    expect(p.type).toBe('confirm')
    expect(p.default).toBe(true)
  })
})
