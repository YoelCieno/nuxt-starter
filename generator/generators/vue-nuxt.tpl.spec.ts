// @vitest-environment node
import { describe, it, expect, afterAll, afterEach, beforeEach, vi } from 'vitest'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { generate, getArgs } from './vue-nuxt.tpl'
import type { GeneratorContext } from '../models'

const tmpDirs: string[] = []

afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
})

function createMockContext(
  overrides: Partial<GeneratorContext> = {},
): GeneratorContext {
  const tmpDir = mkdtempSync(join(tmpdir(), 'gen-test-'))
  tmpDirs.push(tmpDir)
  const logger = {
    notice: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  }
  return {
    kind: 'component',
    name: 'my-button',
    pascalName: 'MyButton',
    camelName: 'myButton',
    kebabName: 'my-button',
    withNuxtUi: true,
    needsProps: true,
    cwd: tmpDir,
    argv: [],
    pinion: {
      cwd: tmpDir,
      force: true,
      logger,
      prompt: (async () => ({})),
      trace: [],
      exec: async () => 0,
    },
    ...overrides,
  } as GeneratorContext
}

function renderTraceFiles(
  ctx: GeneratorContext,
): string[] {
  return ctx.pinion.trace
    .filter((t) => t.name === 'renderTemplate')
    .map((t) => (t.info as { fileName: string }).fileName)
}

describe('generate — component kind from argv', () => {
  it('skips kind/name prompts, renders artifact + spec, and verifies', async () => {
    const ctx = createMockContext({ argv: ['component', 'my-button'] })
    const result = await generate(ctx)

    expect(existsSync(join(result.cwd, 'app', 'components', 'MyButton.vue'))).toBe(true)
    expect(existsSync(join(result.cwd, 'app', 'components', 'MyButton.spec.ts'))).toBe(true)

    const files = renderTraceFiles(result)
    expect(files.some((f) => f.endsWith('app/components/MyButton.vue'))).toBe(true)
    expect(files.some((f) => f.endsWith('app/components/MyButton.spec.ts'))).toBe(true)

    // No prompts at all — argv supplied kind + name
    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)

    // verifyScaffold logged a success notice
    expect(result.pinion.logger.notice).toHaveBeenCalled()
  })
})

describe('generate — other kinds from argv', () => {
  it('renders composable artifact + spec without any prompts', async () => {
    const ctx = createMockContext({ argv: ['composable', 'my-counter'] })
    const result = await generate(ctx)

    expect(existsSync(join(result.cwd, 'app', 'composables', 'myCounter.ts'))).toBe(true)
    expect(existsSync(join(result.cwd, 'app', 'composables', 'myCounter.spec.ts'))).toBe(true)
    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)
  })

  it('renders page artifact + spec without any prompts', async () => {
    const ctx = createMockContext({ argv: ['page', 'about'] })
    const result = await generate(ctx)

    expect(existsSync(join(result.cwd, 'app', 'pages', 'about.vue'))).toBe(true)
    expect(existsSync(join(result.cwd, 'app', 'pages', 'about.spec.ts'))).toBe(true)
    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)
  })

  it('renders util artifact + spec without any prompts', async () => {
    const ctx = createMockContext({ argv: ['util', 'format-price'] })
    const result = await generate(ctx)

    expect(existsSync(join(result.cwd, 'app', 'utils', 'format-price.ts'))).toBe(true)
    expect(existsSync(join(result.cwd, 'app', 'utils', 'format-price.spec.ts'))).toBe(true)
    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)
  })
})

describe('generate — component argv flags (non-interactive stdin)', () => {
  // Bug contract: `bun run generate component Foo` crashes with
  // ERR_USE_AFTER_CLOSE on piped/CI stdin because componentPrompts fire
  // unconditionally for the component kind even when kind+name came from argv.
  // Flags (`--with-nuxt-ui`/`--no-nuxt-ui`/`--with-props`/`--no-props`) must
  // skip the matching prompt, and in a non-interactive context prompts must be
  // skipped entirely (defaults win) so the chain never touches inquirer.
  const originalIsTTY = Object.getOwnPropertyDescriptor(process.stdin, 'isTTY')

  beforeEach(() => {
    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true })
  })

  afterEach(() => {
    if (originalIsTTY) {
      Object.defineProperty(process.stdin, 'isTTY', originalIsTTY)
    } else {
      Reflect.deleteProperty(process.stdin, 'isTTY')
    }
  })

  it('--no-nuxt-ui --no-props renders the plain button template with zero prompt calls', async () => {
    const ctx = createMockContext({ argv: ['component', 'Foo', '--no-nuxt-ui', '--no-props'] })
    const result = await generate(ctx)

    const artifact = join(result.cwd, 'app', 'components', 'Foo.vue')
    expect(existsSync(artifact)).toBe(true)
    const source = readFileSync(artifact, 'utf8')
    expect(source).toContain('<button type="button" aria-label="Foo">')
    expect(source).not.toContain('<UButton')
    expect(source).not.toContain('defineProps')

    expect(existsSync(join(result.cwd, 'app', 'components', 'Foo.spec.ts'))).toBe(true)

    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)
  })

  it('--with-nuxt-ui renders the UButton template with zero prompt calls', async () => {
    const ctx = createMockContext({ argv: ['component', 'Foo', '--with-nuxt-ui'] })
    const result = await generate(ctx)

    const artifact = join(result.cwd, 'app', 'components', 'Foo.vue')
    expect(existsSync(artifact)).toBe(true)
    const source = readFileSync(artifact, 'utf8')
    expect(source).toContain('<UButton')
    expect(source).toContain('<script setup')
    expect(source).toContain('defineProps')

    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)
  })

  it('skips the component prompts and does not crash when flags are missing', async () => {
    const closeError = new Error('Cannot close a stream that has already been destroyed')
    ;(closeError as NodeJS.ErrnoException).code = 'ERR_USE_AFTER_CLOSE'
    const throwingPrompt = (async () => {
      throw closeError
    })

    const ctx = createMockContext({
      argv: ['component', 'Foo'],
      withNuxtUi: undefined,
      needsProps: undefined,
      pinion: {
        cwd: '/tmp',
        force: true,
        logger: { notice: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() },
        prompt: throwingPrompt as unknown as GeneratorContext['pinion']['prompt'],
        trace: [],
        exec: async () => 0,
      },
    })

    const result = await generate(ctx)

    expect(result.withNuxtUi).toBe(true)
    expect(result.needsProps).toBe(true)
    expect(existsSync(join(result.cwd, 'app', 'components', 'Foo.vue'))).toBe(true)
    expect(existsSync(join(result.cwd, 'app', 'components', 'Foo.spec.ts'))).toBe(true)
    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)
  })

  it('TTY + --no-nuxt-ui does NOT prompt (explicit false = decided)', async () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true })
    const ctx = createMockContext({ argv: ['component', 'Foo', '--no-nuxt-ui'] })
    const result = await generate(ctx)

    expect(result.withNuxtUi).toBe(false)
    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)
  })

  it('TTY + --no-nuxt-ui --no-props does NOT prompt (both explicit = decided)', async () => {
    Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true })
    const ctx = createMockContext({ argv: ['component', 'Foo', '--no-nuxt-ui', '--no-props'] })
    const result = await generate(ctx)

    expect(result.withNuxtUi).toBe(false)
    expect(result.needsProps).toBe(false)
    const promptTraces = result.pinion.trace.filter((t) => t.name === 'prompt')
    expect(promptTraces).toHaveLength(0)
  })
})

describe('getArgs — component flags', () => {
  it('--no-nuxt-ui sets withNuxtUi to false', () => {
    const ctx = getArgs(createMockContext({ argv: ['component', 'Foo', '--no-nuxt-ui'] }))
    expect(ctx.withNuxtUi).toBe(false)
  })

  it('--with-nuxt-ui sets withNuxtUi to true', () => {
    const ctx = getArgs(createMockContext({ argv: ['component', 'Foo', '--with-nuxt-ui'] }))
    expect(ctx.withNuxtUi).toBe(true)
  })

  it('--with-props and --no-props set needsProps accordingly', () => {
    const withProps = getArgs(createMockContext({ argv: ['component', 'Foo', '--with-props'] }))
    expect(withProps.needsProps).toBe(true)
    const noProps = getArgs(createMockContext({ argv: ['component', 'Foo', '--no-props'] }))
    expect(noProps.needsProps).toBe(false)
  })

  it('leaves flags untouched for non-component kinds', () => {
    const ctx = createMockContext({
      kind: 'composable',
      name: 'use-counter',
      withNuxtUi: true,
      needsProps: false,
      argv: ['composable', 'use-counter', '--no-nuxt-ui'],
    })
    expect(getArgs(ctx).withNuxtUi).toBe(true)
    expect(getArgs(ctx).needsProps).toBe(false)
  })
})

describe('generate — argv validation', () => {
  it('rejects an unknown kind from argv', async () => {
    const ctx = createMockContext({ argv: ['wrong-type', 'my-button'] })
    await expect(generate(ctx)).rejects.toThrow('Unknown template kind: wrong-type')
  })

  it('rejects a missing kind from argv', async () => {
    const ctx = createMockContext({ argv: [] })
    await expect(generate(ctx)).rejects.toThrow('Unknown template kind: missing')
  })

  it('rejects a missing name from argv', async () => {
    const ctx = createMockContext({ argv: ['component'] })
    await expect(generate(ctx)).rejects.toThrow('Unknown template name: missing')
  })
})
