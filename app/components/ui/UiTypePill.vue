<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider"
    :class="pillClass"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ type }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  type: 'income' | 'expense'
}>()

const pillClass = computed(() =>
  props.type === 'income'
    ? 'text-income bg-income/10'
    : 'text-expense bg-expense/10'
)
</script>
