<template>
  <header class="mb-7 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p class="font-display text-3xl font-semibold tracking-tight text-ink-deep sm:text-[2.25rem]">
        Income &amp; Expense Tracker
      </p>
      <p class="mt-1.5 text-sm text-muted">
        Personal monthly ledger
      </p>
    </div>
    <nav class="flex flex-wrap items-center gap-3 text-sm font-medium">
      <NuxtLink
        class="text-ink underline-offset-4 hover:underline"
        :to="`/month/${currentYear}/${currentMonth}`"
      >
        This month
      </NuxtLink>
      <NuxtLink
        class="text-ink underline-offset-4 hover:underline"
        :to="`/year/${currentYear}`"
      >
        This year
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
</script>
