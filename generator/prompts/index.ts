import type { Question } from 'inquirer'

export const componentPrompts: Question[] = [
  {
    type: 'confirm',
    name: 'withNuxtUi',
    message: 'Use Nuxt UI components?',
    default: true,
  },
  {
    type: 'confirm',
    name: 'needsProps',
    message: 'Include typed props and emits?',
    default: true,
  },
]
