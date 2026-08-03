import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { prompt, renderTemplate, toFile, when } from '@featherscloud/pinion'
import { caseTransform } from '../utils'
import { componentPrompts } from '../prompts'
import type { GeneratorContext, GeneratorType } from '../models'
import { TEMPL_KIND } from '../models'
import { ARTIFACT_PARTS, SPEC_PARTS, ARTIFACT_TEMPLATES, SPEC_TEMPLATES, COMPONENT_FLAGS } from '../constants'

const artifactTarget = (ctx: GeneratorContext): Promise<string> => {
	return toFile(...ARTIFACT_PARTS[ctx.kind](ctx))(ctx)
}
const specTarget = (ctx: GeneratorContext): Promise<string> => {
	return toFile(...SPEC_PARTS[ctx.kind](ctx))(ctx)
}

const artifactParts = (ctx: GeneratorContext): string[] => ARTIFACT_PARTS[ctx.kind](ctx)
const specParts = (ctx: GeneratorContext): string[] => SPEC_PARTS[ctx.kind](ctx)
const artifactTemplate = (ctx: GeneratorContext): string => ARTIFACT_TEMPLATES[ctx.kind](ctx)
const specTemplate = (ctx: GeneratorContext): string => SPEC_TEMPLATES[ctx.kind](ctx)

const isTemplKind = (value: string | undefined): value is GeneratorType => {
	return typeof value === 'string' && TEMPL_KIND.some((kind) => kind === value)
}

const getKind = (kind: string | undefined): GeneratorType => {
	if (!isTemplKind(kind)) {
		throw new Error(`Unknown template kind: ${kind ?? 'missing'}`)
	}
	return kind
}

const getName = (name: string | undefined): string => {
	if (!name) {
		throw new Error(`Unknown template name: ${name ?? 'missing'}`)
	}
	return name
}

const getComponentFlags = (ctx: GeneratorContext, flags: string[]): GeneratorContext => {
	return flags.reduce((acc, flag) => {
		return COMPONENT_FLAGS[flag] ? { ...acc, ...COMPONENT_FLAGS[flag] } : acc
	}, ctx)
}

const getNonInteractiveDefaults = (ctx: GeneratorContext): GeneratorContext => {
	return process.stdin.isTTY ? ctx : {
    ...ctx,
    withNuxtUi: ctx.withNuxtUi ?? true,
    needsProps: ctx.needsProps ?? true,
  }
}

export const getArgs = (ctx: GeneratorContext): GeneratorContext => {
  const [kind, name, ...flags] = ctx.argv
  const base = { ...ctx, kind: getKind(kind), name: getName(name) }
  if (kind !== 'component') return base

	const withFlags = getComponentFlags(base, flags)
	return getNonInteractiveDefaults(withFlags)
}

const hasComponentPrompt = (ctx: GeneratorContext): boolean => {
	return ctx.kind === 'component' &&
	  ctx.withNuxtUi === undefined &&
	  ctx.needsProps === undefined &&
	  !!process.stdin.isTTY
}

export const renderSourceFiles = (ctx: GeneratorContext): Promise<GeneratorContext> => {
	return Promise.resolve(ctx).then(renderTemplate(artifactTemplate, artifactTarget))
}

export const renderSpecFiles = (ctx: GeneratorContext): Promise<GeneratorContext> => {
	return Promise.resolve(ctx).then(renderTemplate(specTemplate, specTarget))
}

const getMissingScaffoldFiles = (ctx: GeneratorContext): string[] => {
  const artifact = join(ctx.cwd, ...artifactParts(ctx))
  const spec = join(ctx.cwd, ...specParts(ctx))
  return [artifact, spec].filter((file) => !existsSync(file))
}

export const verifyScaffold = (ctx: GeneratorContext): GeneratorContext => {
  const missing = getMissingScaffoldFiles(ctx)
  if (missing.length === 0) {
    ctx.pinion.logger.notice(`✅ ${ctx.kind} "${ctx.name}" created successfully`)
  } else {
    ctx.pinion.logger.warn(`⚠️  ${missing.length} file(s) missing — check generator output`)
  }
  return ctx
}

export const generate = (ctx: GeneratorContext) => Promise.resolve(ctx)
  .then(getArgs)
  .then(caseTransform<GeneratorContext>())
  .then(when(hasComponentPrompt, prompt(componentPrompts)))
  .then(renderSourceFiles)
  .then(renderSpecFiles)
  .then(verifyScaffold)
