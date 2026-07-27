<script setup lang="ts">
const now = new Date()
await navigateTo(`/month/${now.getFullYear()}/${now.getMonth() + 1}`)
</script>

<template>
  <p class="text-muted">
    Redirecting…
  </p>
</template>
