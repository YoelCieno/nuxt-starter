import type { GeneratorContext } from '../models'

const isKebabCase = (name: string): boolean => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)

const pascalToKebab = (pascal: string): string =>
  pascal
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')

const kebabToPascal = (kebab: string): string =>
  kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

const kebabToCamel = (kebab: string): string =>
  kebab.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())

/**
 * Pinion-style task: derive PascalCase (pascalName), camelCase (camelName) and
 * kebab-case (kebabName) from the `name` property on the context.
 * Accepts both kebab-case and PascalCase input.
 */
const caseTransform = <C extends GeneratorContext>() => async (ctx: C): Promise<C> => {
  const kebab = isKebabCase(ctx.name) ? ctx.name : pascalToKebab(ctx.name)
  return {
    ...ctx,
    pascalName: kebabToPascal(kebab),
    camelName: kebabToCamel(kebab),
    kebabName: kebab,
  }
}

export { caseTransform }
