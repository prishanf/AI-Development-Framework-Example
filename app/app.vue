<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Income &amp; Expense Tracker</h1>
      <nav>
        <NuxtLink :to="`/month/${currentYear}/${currentMonth}`">This month</NuxtLink>
        <NuxtLink :to="`/year/${currentYear}`">This year</NuxtLink>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
</script>

<style>
:root {
  color-scheme: light dark;
  font-family: system-ui, -apple-system, sans-serif;
}
body {
  margin: 0;
  background: #f5f6f8;
}
.app-shell {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}
.app-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.app-header nav a {
  margin-left: 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 0.4rem 0.6rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
input, select {
  padding: 0.25rem 0.4rem;
}
button {
  cursor: pointer;
}
.totals {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  font-weight: 600;
}
.error-text {
  color: #b3261e;
  font-size: 0.85rem;
}
</style>
