<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="classes"
    :title="title"
    :aria-label="ariaLabel || title"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'secondary' | 'primary' | 'quiet' | 'icon'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  danger?: boolean
  title?: string
  ariaLabel?: string
}>(), {
  variant: 'secondary',
  type: 'button',
  disabled: false,
  danger: false,
  title: undefined,
  ariaLabel: undefined
})

const base = 'inline-flex items-center justify-center gap-1.5 rounded-control text-[0.8125rem] font-semibold leading-none tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus/55 disabled:cursor-not-allowed disabled:opacity-45'

const classes = computed(() => {
  if (props.variant === 'primary') {
    return [
      base,
      'min-h-control px-[0.95rem] bg-ink text-white shadow-[rgba(255,255,255,0.14)_0_1px_0_inset,rgba(19,19,22,0.28)_0_1px_3px_-1px] hover:bg-ink-deep'
    ]
  }
  if (props.variant === 'quiet') {
    return [
      base,
      'min-h-control px-2.5 bg-transparent text-muted font-medium shadow-none hover:bg-paper-tint hover:text-ink'
    ]
  }
  if (props.variant === 'icon') {
    return [
      base,
      'h-[1.5rem] w-[1.5rem] shrink-0 p-0 bg-paper text-muted shadow-ring hover:bg-paper-tint hover:text-ink',
      props.danger ? 'hover:bg-expense/10 hover:text-expense' : ''
    ]
  }
  return [
    base,
    'min-h-control px-[0.95rem] bg-paper text-ink shadow-ring hover:bg-paper-tint'
  ]
})
</script>
