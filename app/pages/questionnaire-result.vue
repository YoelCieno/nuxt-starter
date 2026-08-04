<script setup lang="ts">
useHead({ title: 'Response received' })

const route = useRoute()
const headingRef = ref<HTMLHeadingElement>()

const interests = toArray(route.query.q2)

onMounted(() => {
  headingRef.value?.focus()
})
</script>

<template>
  <main>
	  <h1 ref="headingRef" tabindex="-1" class="outline-none">Response received</h1>
	  <p>Thanks, {{ route.query.name }}.</p>
	  <p>Preferred contact method: {{ route.query.q1 }}</p>
	  <p>Interests: {{ interests.join(', ') }}</p>
	  <UButton to="/">Back to home</UButton>
  </main>
</template>
