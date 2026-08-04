<script setup lang="ts">
useHead({
  title: 'Index',
})
</script>

<template>
  <UButton class="index__button" to="/questionnaire">Start Questionnaire</UButton>
</template>

<style scoped>
.index__button {
	margin-top: 2rem;
}
</style>
