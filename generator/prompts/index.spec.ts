// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { componentPrompts } from './index'
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
