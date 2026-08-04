import type { FormError } from '@nuxt/ui'
import { computed } from 'vue'
import type { QuestionnaireError, QuestionnaireState } from '~/models'
import { ERROR_MESSAGE } from '~/models'

export function useValidateQuestions(state: QuestionnaireState) {
	const errorStatuses = computed<QuestionnaireError>(() => {
		return {
			name: !state.name.trim(),
			q1: !state.q1,
			q2: state.q2.length === 0,
		}
	})

	const errors = computed<FormError<string>[]>(() => {
		const questionErrors = Object.keys(state)
			.filter(q => errorStatuses.value[q as keyof QuestionnaireError])

		return questionErrors.map(question => ({
			name: question as keyof QuestionnaireState,
			message: ERROR_MESSAGE[question as keyof QuestionnaireError].message,
		}))
	})

  return {
		errors
  }
}
