import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { prompt, renderTemplate, toFile, when } from '@featherscloud/pinion'
import { caseTransform } from '../utils/cases'
import { kindPrompt, namePrompt, componentPrompts } from '../prompts'
import type { GeneratorContext, GeneratorType } from '../models'
import { TEMPL_TYPES } from '../models'
import { ARTIFACT_PARTS, SPEC_PARTS, ARTIFACT_TEMPLATES, SPEC_TEMPLATES, COMPONENT_FLAGS } from '../constants'

const artifactTarget = (ctx: GeneratorContext): Promise<string> => {
	return toFile(...ARTIFACT_PARTS[ctx.type](ctx))(ctx)
}

const specTarget = (ctx: GeneratorContext): Promise<string> => {
	return toFile(...SPEC_PARTS[ctx.type](ctx))(ctx)
}

const artifactParts = (ctx: GeneratorContext): string[] => ARTIFACT_PARTS[ctx.type](ctx)

const specParts = (ctx: GeneratorContext): string[] => SPEC_PARTS[ctx.type](ctx)

const artifactTemplate = (ctx: GeneratorContext): string => ARTIFACT_TEMPLATES[ctx.type](ctx)

const specTemplate = (ctx: GeneratorContext): string => SPEC_TEMPLATES[ctx.type](ctx)

const isTemplType = (value: string | undefined): value is GeneratorType => {
	return value !== undefined && TEMPL_TYPES.some((kind) => kind === value)
}

const applyType = (ctx: GeneratorContext, type: string | undefined): void => {
  if (type === undefined) return
  if (!isTemplType(type)) {
    throw new Error(`Unknown template type: ${type}`)
  }
  ctx.type = type
}

const applyName = (ctx: GeneratorContext, name: string | undefined): void => {
  if (name !== undefined) {
    ctx.name = name
  }
}

const applyComponentFlags = (ctx: GeneratorContext, flags: string[]): void => {
  for (const flag of flags) {
    const parsed = COMPONENT_FLAGS[flag]
    if (parsed) {
      Object.assign(ctx, parsed)
    }
  }
}

const applyNonInteractiveDefaults = (ctx: GeneratorContext): void => {
  if (process.stdin.isTTY) return
  if (ctx.withNuxtUi === undefined) ctx.withNuxtUi = true
  if (ctx.needsProps === undefined) ctx.needsProps = true
}

export const readArgs = (ctx: GeneratorContext): GeneratorContext => {
  const [kind, name, ...flags] = ctx.argv
  applyType(ctx, kind)
  applyName(ctx, name)
  if (ctx.type === 'component') {
    applyComponentFlags(ctx, flags)
    applyNonInteractiveDefaults(ctx)
  }
  return ctx
}

const componentPromptsNeeded = (c: GeneratorContext): boolean =>
  c.type === 'component' &&
  c.withNuxtUi === undefined &&
  c.needsProps === undefined &&
  process.stdin.isTTY === true

export const renderSourceFiles = (ctx: GeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(artifactTemplate, artifactTarget))

export const renderSpecFiles = (ctx: GeneratorContext) =>
  Promise.resolve(ctx).then(renderTemplate(specTemplate, specTarget))

export const verifyScaffold = (ctx: GeneratorContext): GeneratorContext => {
  const artifact = join(ctx.cwd, ...artifactParts(ctx))
  const spec = join(ctx.cwd, ...specParts(ctx))
  const missing = [artifact, spec].filter((file) => !existsSync(file))
  if (missing.length === 0) {
    ctx.pinion.logger.notice(`✅ ${ctx.type} "${ctx.name}" created successfully`)
  } else {
    ctx.pinion.logger.warn(`⚠️  ${missing.length} file(s) missing — check generator output`)
  }
  return ctx
}

export const generate = (ctx: GeneratorContext) =>
  Promise.resolve(ctx)
    .then(readArgs)
    .then(when((c: GeneratorContext) => !c.type, prompt([kindPrompt])))
    .then(when((c: GeneratorContext) => !c.name, prompt([namePrompt])))
    .then(caseTransform<GeneratorContext>())
    .then(when(componentPromptsNeeded, prompt(componentPrompts)))
    .then(renderSourceFiles)
    .then(renderSpecFiles)
    .then(verifyScaffold)
