export interface QuestionnaireState {
  name: string
  q1: string
  q2: string[]
}

export type QuestionnaireError = Record<keyof QuestionnaireState, boolean>

export const ERROR_MESSAGE: Record<keyof QuestionnaireState, { message: string }> = {
	name: { message: 'Name is required' },
	q1: { message: 'Pick a contact method' },
	q2: { message: 'Select at least one interest' },
} as const
