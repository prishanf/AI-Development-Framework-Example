<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-[0.95rem] w-[0.95rem]" aria-hidden="true">
    <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
    <path d="M3 5h18v3H3V5Z" />
    <template v-if="archived">
      <path d="M10 13h4" />
    </template>
    <template v-else>
      <path d="M9 12.5 12 15.5 15 12.5" />
      <path d="M12 10v5.5" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ archived: boolean }>()
</script>
