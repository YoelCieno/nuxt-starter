// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { caseTransform } from './cases'
import type { GeneratorContext } from '../models'

function ctx(overrides: Partial<GeneratorContext> = {}): GeneratorContext {
  return {
    type: 'component',
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
  }
}

describe('caseTransform', () => {
  it('sets pascalName, camelName, kebabName from kebab-case name', async () => {
    const result = await caseTransform()(ctx({ name: 'my-button' }))
    expect(result.pascalName).toBe('MyButton')
    expect(result.camelName).toBe('myButton')
    expect(result.kebabName).toBe('my-button')
  })

  it('accepts PascalCase name and derives kebab/camel forms', async () => {
    const result = await caseTransform()(ctx({ name: 'MyButton' }))
    expect(result.pascalName).toBe('MyButton')
    expect(result.camelName).toBe('myButton')
    expect(result.kebabName).toBe('my-button')
  })

  it('handles single-word kebab name', async () => {
    const result = await caseTransform()(ctx({ name: 'hello' }))
    expect(result.pascalName).toBe('Hello')
    expect(result.camelName).toBe('hello')
    expect(result.kebabName).toBe('hello')
  })

  it('handles multi-hyphen kebab names', async () => {
    const result = await caseTransform()(ctx({ name: 'my-long-button-name' }))
    expect(result.pascalName).toBe('MyLongButtonName')
    expect(result.camelName).toBe('myLongButtonName')
    expect(result.kebabName).toBe('my-long-button-name')
  })

  it('handles single uppercase letter prefix', async () => {
    const result = await caseTransform()(ctx({ name: 'AComponent' }))
    expect(result.pascalName).toBe('AComponent')
    expect(result.camelName).toBe('aComponent')
    expect(result.kebabName).toBe('a-component')
  })
})
