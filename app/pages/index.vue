<script setup lang="ts">
const now = new Date()
await navigateTo(`/month/${now.getFullYear()}/${now.getMonth() + 1}`, { replace: true })
</script>

<template>
  <div />
</template>
