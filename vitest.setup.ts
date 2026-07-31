import { expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'
// Type augmentation for `toHaveNoViolations` on `expect` (JS side is empty —
// runtime registration must come from `expect.extend(matchers)` below).
import 'vitest-axe/extend-expect'

expect.extend(matchers)
