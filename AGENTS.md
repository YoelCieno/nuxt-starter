# AGENTS.md

Nuxt 4 SSR single-app starter with a self-hosting Pinion code generator. README.md is scaffold boilerplate — config/scripts are source of truth.

## Commands (bun only)
- Install: `bun install`. Gotcha: `bun add <pkg>` runs the `postinstall` (nuxt prepare) hook per transaction and can fail midway — add with `--ignore-scripts`, then run `bun run postinstall` once.
- Dev/build: `bun run dev`, `bun run build`, `bun run generate:static` (= `nuxt generate`). Never `bun run generate` for static — that name is taken.
- `bun run generate <kind> <Name> [flags]` = Pinion code generator (NOT nuxt generate; collision is why static is renamed `generate:static`).
- Verify in order, all must pass: `bun run lint` → `bun run typecheck` → `bun run test` (or `bun run coverage` for the ≥80% line gate).

## Architecture
- `app/` = Nuxt SSR app: `components/`, `composables/`, `utils/` stay EMPTY by design; `pages/` intentionally has a single `index.vue` landing page (with colocated `index.spec.ts`). Generated artifacts AND their colocated specs land in these dirs.
- `generator/` = self-hosting Pinion code generator (tooling, NOT app runtime), mirrors `@forma-initiale/packages/generator` layout: `generators/vue-nuxt.tpl.ts` (entry), `constants/` (ARTIFACT_PARTS/SPEC_PARTS/ARTIFACT_TEMPLATES/SPEC_TEMPLATES/COMPONENT_FLAGS), `utils/` (cases, error-utils, safe-json-parse), `models/` (index — TEMPL_KIND + GeneratorType + GeneratorContext), `prompts/`, `templates/` (index + spec), `index.ts` (public entry). Unit specs live next to sources, tagged `// @vitest-environment node`.
- `vitest.setup.ts` (root) = vitest setup: registers vitest-axe `toHaveNoViolations` via `expect.extend(matchers)`. Do NOT rely on `vitest-axe/extend-expect` alone — its `dist/extend-expect.js` is EMPTY (types only).
- `vitest.d.ts` (root) = TYPE augmentation so `nuxt typecheck` sees `toHaveNoViolations` on `expect()` from the explicit `vitest` module import. Required because `vitest-axe/extend-expect` only augments the global `Vi.Assertion`, not the `vitest` module's `Assertion`; root `*.d.ts` files are included in nuxt's generated tsconfig.
- `app/pages/index.vue` exists → no NUXT_E4014 warning on dev boot; if `pages/` is ever emptied, the warning returns (benign).
- Coverage include = `app/**` + `generator/**`, specs excluded (v8, vitest). Gate: ≥80% lines.

## Generator contract (easy to get wrong)
- Kinds → paths: `component` → `app/components/{pascalName}.vue`, `composable` → `app/composables/{camelName}.ts`, `page` → `app/pages/{kebabName}.vue`, `util` → `app/utils/{kebabName}.ts`.
- argv-only flow: `ctx.argv` = `[kind, name, ...flags]`; kind+name REQUIRED positionally (unknown kind / missing name → `getKind`/`getName` throw). No kind/name prompts.
- Component flags: `--with/--no-nuxt-ui`, `--with/--no-props`. Default true/true. Prompts only for component flag confirms, TTY only; non-TTY/piped stdin → flags parsed, prompts SKIPPED (readline throws ERR_USE_AFTER_CLOSE).
- Every generated artifact ALSO writes a colocated spec next to it: `app/components/{pascalName}.spec.ts`, `app/composables/{camelName}.spec.ts`, `app/pages/{kebabName}.spec.ts`, `app/utils/{kebabName}.spec.ts`. Component/page specs mount with `attachTo: document.body` and assert axe `toHaveNoViolations()` (`runOnly` wcag2a/wcag2aa) — the AA a11y gate. Page specs use `mountSuspended`.
- Pinion gotcha: `toFile` handles must be passed DIRECTLY (not wrapped in `(c) => ...`) or Pinion throws `TypeError: "to argument must be of type string"`.
- Smoke-generated artifacts in `app/` (incl. specs) should be REMOVED afterwards — template stays clean (exception: `app/pages/index.vue` + its spec are INTENTIONAL, keep them).

## Pins / do-not-fix
- typescript `~5.9.3`. Do NOT bump to 7.x — breaks @nuxt/eslint peer deps.
- @nuxt/ui 4.10.0 AUTO-registers @nuxt/icon, @nuxt/fonts, @nuxtjs/color-mode. Don't add manually.
- @nuxt/a11y is 1.0.0-alpha.1: `a11y.axe.options: {}` REQUIRED by its type; NO `report` key in this version (no build-time a11y report file — the a11y gate is vitest-axe in specs + @nuxt/a11y runtime scans).
- vitest jsdom MANDATORY (`domEnvironment: 'jsdom'`); happy-dom breaks axe-core (`isConnected`).
- `passWithNoTests: true` intentional — zero spec files must still exit 0.
- eslint.config.mjs = `withNuxt({ ignores: ['coverage/**'] })` — keep `coverage/` ignored.
- `trustedDependencies: ["unrs-resolver"]` set — `bun pm trust unrs-resolver` was the workaround for its blocked postinstall.
