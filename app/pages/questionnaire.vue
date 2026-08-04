<script setup lang="ts">
import type { QuestionnaireState } from '~/models'
useHead({ title: 'Questionnaire' })

const contactOptions = ['Email', 'Phone', 'Mail']
const interestOptions = ['Newsletter', 'Product updates', 'Events']

const state = reactive<QuestionnaireState>({
  name: '',
  q1: '',
	q2: [],
})

const { errors } = useValidateQuestions(state)

function onSubmit() {
	navigateTo({
		path: '/questionnaire-result',
		query: {
			name: state.name, q1: state.q1, q2: state.q2
		}
	})
}
</script>

<template>
	<main>
	  <h1>Questionnaire</h1>
	  <UForm
			:state
			:validate="() => errors"
			class="space-y-6"
			@submit="onSubmit">
	    <UFormField label="Your name" name="name" required>
	      <UInput
					v-model="state.name"
					autocomplete="name"
				/>
	    </UFormField>

	    <UFormField name="q1">
	      <URadioGroup
					v-model="state.q1"
					:highlight="true"
					legend="Preferred contact method"
					:items="contactOptions"
				/>
	    </UFormField>

	    <UFormField name="q2">
	      <UCheckboxGroup
					v-model="state.q2"
					:highlight="true"
					legend="What interests you?"
					:items="interestOptions"
				/>
	    </UFormField>

	    <UButton type="submit">Submit</UButton>
	  </UForm>
	</main>
</template>
