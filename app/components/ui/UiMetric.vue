<template>
  <div class="rounded-control bg-paper-tint px-3 py-3 shadow-inset">
    <span class="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-muted">
      {{ label }}
    </span>
    <span
      class="font-display text-lg font-semibold tabular-nums"
      :class="toneClass"
    >
      <slot />
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  tone?: 'default' | 'income' | 'expense'
}>()

const toneClass = computed(() => {
  if (props.tone === 'income') return 'money-income'
  if (props.tone === 'expense') return 'money-expense'
  return 'text-ink-deep'
})
</script>
