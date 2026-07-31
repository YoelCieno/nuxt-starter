import type { Question } from 'inquirer'
import { TEMPL_TYPES } from '../models'

const KIND_CHOICES = TEMPL_TYPES.map((value) => ({
  name: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}))

export const kindPrompt: Question = {
  type: 'list',
  name: 'kind',
  message: 'What do you want to generate?',
  choices: KIND_CHOICES,
}

export const namePrompt: Question = {
  type: 'input',
  name: 'name',
  message: 'Name (kebab-case or PascalCase, e.g. my-button or MyButton):',
  validate: (input: string) =>
    /^[A-Za-z][A-Za-z0-9-]*$/.test(input) ||
    'Use only letters, digits and hyphens (must start with a letter)',
}

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
