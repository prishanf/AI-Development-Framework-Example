<template>
  <div>
    <div style="display:flex; align-items:center; justify-content: space-between;">
      <h2>{{ year }} — Yearly summary</h2>
      <div>
        <NuxtLink :to="`/year/${year - 1}`">&larr; {{ year - 1 }}</NuxtLink>
        &nbsp;|&nbsp;
        <NuxtLink :to="`/year/${year + 1}`">{{ year + 1 }} &rarr;</NuxtLink>
      </div>
    </div>

    <div v-if="summary" class="totals">
      <span>Year income: {{ formatCents(summary.yearTotals.incomeCents) }}</span>
      <span>Year expenses: {{ formatCents(summary.yearTotals.expenseCents) }}</span>
      <span>Year net: {{ formatCents(summary.yearTotals.netCents) }}</span>
    </div>

    <table v-if="summary">
      <thead>
        <tr>
          <th>Month</th>
          <th>Income</th>
          <th>Expenses</th>
          <th>Net</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(m, i) in summary.months" :key="i">
          <td>
            <NuxtLink :to="`/month/${year}/${i + 1}`">{{ monthName(i) }}</NuxtLink>
          </td>
          <td>{{ formatCents(m.incomeCents) }}</td>
          <td>{{ formatCents(m.expenseCents) }}</td>
          <td>{{ formatCents(m.netCents) }}</td>
        </tr>
        <tr style="font-weight:700;">
          <td>Total</td>
          <td>{{ formatCents(summary.yearTotals.incomeCents) }}</td>
          <td>{{ formatCents(summary.yearTotals.expenseCents) }}</td>
          <td>{{ formatCents(summary.yearTotals.netCents) }}</td>
        </tr>
      </tbody>
    </table>

    <h3>By category</h3>
    <table v-if="summary && categories">
      <thead>
        <tr>
          <th>Category</th>
          <th>Income</th>
          <th>Expenses</th>
          <th>Net</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in categories" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ formatCents(summary.byCategory[c.id]?.incomeCents ?? 0) }}</td>
          <td>{{ formatCents(summary.byCategory[c.id]?.expenseCents ?? 0) }}</td>
          <td>{{ formatCents(summary.byCategory[c.id]?.netCents ?? 0) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const year = computed(() => Number(route.params.year))

interface Category {
  id: number
  type: 'income' | 'expense'
  name: string
  archived: boolean
}
interface MonthTotals { incomeCents: number, expenseCents: number, netCents: number }
interface YearlySummary {
  months: MonthTotals[]
  yearTotals: MonthTotals
  byCategory: Record<string, MonthTotals>
}

const categories = ref<Category[] | null>(null)
const summary = ref<YearlySummary | null>(null)

async function load() {
  const [c, s] = await Promise.all([
    $fetch<Category[]>('/api/categories'),
    $fetch<YearlySummary>('/api/summary/yearly', { query: { year: year.value } })
  ])
  categories.value = c
  summary.value = s
}

watch(year, load, { immediate: true })

function monthName(index: number) {
  return new Date(2000, index, 1).toLocaleString(undefined, { month: 'long' })
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}
</script>
