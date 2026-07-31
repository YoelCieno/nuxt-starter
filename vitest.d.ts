// Type augmentation so `nuxt typecheck` sees `toHaveNoViolations`
// on `expect()` results from the explicit `vitest` module import
// (vitest-axe/extend-expect only augments the global Vi.Assertion,
// which does not apply to `import { expect } from 'vitest'`).
// Return type is truthful: NoViolationsMatcherResult (message/pass/actual).
import type { AxeMatchers } from 'vitest-axe/matchers'

// Suppressed: module augmentation REQUIRES `interface` + empty body (interface
// merging, cannot use type alias) and the generic `T = any` must mirror
// vitest's own `Assertion<T = any>` for the augmentation to merge correctly.
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers {}
}
