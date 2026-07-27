<template>
  <div>
    <div style="display:flex; align-items:center; justify-content: space-between;">
      <h2>{{ monthLabel }}</h2>
      <div>
        <NuxtLink :to="`/month/${prevYear}/${prevMonth}`">&larr; Prev</NuxtLink>
        &nbsp;|&nbsp;
        <NuxtLink :to="`/month/${nextYear}/${nextMonth}`">Next &rarr;</NuxtLink>
        &nbsp;|&nbsp;
        <NuxtLink :to="`/year/${year}`">Year view</NuxtLink>
      </div>
    </div>

    <div v-if="summary" class="totals">
      <span>Income: {{ formatCents(summary.totals.incomeCents) }}</span>
      <span>Expenses: {{ formatCents(summary.totals.expenseCents) }}</span>
      <span>Net: {{ formatCents(summary.totals.netCents) }}</span>
    </div>

    <CategoryManager v-if="categories" :categories="categories" @changed="refreshAll" />

    <h3>Add transactions</h3>
    <TransactionGrid
      v-if="categories"
      :categories="categories"
      :year="year"
      :month="month"
      @saved="refreshAll"
    />

    <h3>Transactions this month</h3>
    <table v-if="transactions && transactions.length">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Note</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in sortedTransactions" :key="t.id">
          <td>{{ t.occurredOn }}</td>
          <td>{{ categoryName(t.categoryId) }}</td>
          <td>{{ t.type }}</td>
          <td>{{ formatCents(t.amountCents) }}</td>
          <td>{{ t.note }}</td>
          <td>
            <button type="button" @click="remove(t.id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>
      No transactions recorded for this month yet.
    </p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const year = computed(() => Number(route.params.year))
const month = computed(() => Number(route.params.month))

interface Category {
  id: number
  type: 'income' | 'expense'
  name: string
  archived: boolean
}
interface Transaction {
  id: number
  categoryId: number
  type: 'income' | 'expense'
  amountCents: number
  occurredOn: string
  note: string | null
}
interface MonthlySummary {
  totals: { incomeCents: number, expenseCents: number, netCents: number }
}

const categories = ref<Category[] | null>(null)
const transactions = ref<Transaction[] | null>(null)
const summary = ref<MonthlySummary | null>(null)

async function load() {
  const [c, t, s] = await Promise.all([
    $fetch<Category[]>('/api/categories'),
    $fetch<Transaction[]>('/api/transactions', { query: { year: year.value, month: month.value } }),
    $fetch<MonthlySummary>('/api/summary/monthly', { query: { year: year.value, month: month.value } })
  ])
  categories.value = c
  transactions.value = t
  summary.value = s
}

async function refreshAll() {
  await load()
}

async function remove(id: number) {
  await $fetch(`/api/transactions/${id}`, { method: 'DELETE' })
  await refreshAll()
}

watch([year, month], load, { immediate: true })

const sortedTransactions = computed(() =>
  [...(transactions.value ?? [])].sort((a, b) => a.occurredOn.localeCompare(b.occurredOn))
)

function categoryName(id: number) {
  return categories.value?.find(c => c.id === id)?.name ?? `#${id}`
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

const monthLabel = computed(() =>
  new Date(year.value, month.value - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })
)

const prevMonth = computed(() => (month.value === 1 ? 12 : month.value - 1))
const prevYear = computed(() => (month.value === 1 ? year.value - 1 : year.value))
const nextMonth = computed(() => (month.value === 12 ? 1 : month.value + 1))
const nextYear = computed(() => (month.value === 12 ? year.value + 1 : year.value))
</script>
