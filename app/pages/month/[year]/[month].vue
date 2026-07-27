<template>
  <div>
    <UiSurface>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-display text-xl font-semibold text-ink-deep sm:text-[1.65rem]">
          {{ title }}
        </h1>
        <div class="inline-flex items-center gap-2" role="group" aria-label="Month navigation">
          <div class="inline-flex overflow-hidden rounded-control bg-paper-tint shadow-inset ring-1 ring-black/10">
            <NuxtLink
              class="inline-flex min-h-control min-w-[4.5rem] items-center justify-center gap-1.5 border-r border-[var(--line)] px-3.5 text-[0.8125rem] font-semibold text-ink no-underline hover:bg-paper"
              :to="`/month/${prev.year}/${prev.month}`"
            >
              <span class="text-[0.7rem] opacity-55" aria-hidden="true">‹</span>
              Prev
            </NuxtLink>
            <NuxtLink
              class="inline-flex min-h-control min-w-[4.5rem] items-center justify-center gap-1.5 px-3.5 text-[0.8125rem] font-semibold text-ink no-underline hover:bg-paper"
              :to="`/month/${next.year}/${next.month}`"
            >
              Next
              <span class="text-[0.7rem] opacity-55" aria-hidden="true">›</span>
            </NuxtLink>
          </div>
          <NuxtLink
            class="inline-flex min-h-control items-center px-3 text-[0.8125rem] font-semibold text-muted no-underline hover:rounded-control hover:bg-paper-tint hover:text-ink"
            :to="`/year/${year}`"
          >
            Year
          </NuxtLink>
        </div>
      </div>

      <div v-if="summary" class="grid gap-3 sm:grid-cols-3">
        <UiMetric label="Income" tone="income">
          {{ formatCents(summary.totals.incomeCents) }}
        </UiMetric>
        <UiMetric label="Expenses" tone="expense">
          {{ formatCents(summary.totals.expenseCents) }}
        </UiMetric>
        <UiMetric
          label="Net"
          :tone="summary.totals.netCents >= 0 ? 'income' : 'expense'"
        >
          {{ formatCents(summary.totals.netCents) }}
        </UiMetric>
      </div>
    </UiSurface>

    <CategoryItemManager
      v-if="categories && items"
      class="mb-4"
      :categories="categories"
      :items="items"
      @changed="refreshAll"
    />

    <UiSurface>
      <h2 class="font-display mb-4 text-[1.05rem] font-semibold text-ink-deep">
        Add transactions
      </h2>
      <TransactionGrid
        v-if="categories && items"
        :categories="categories"
        :items="items"
        :year="year"
        :month="month"
        @saved="refreshAll"
      />
    </UiSurface>

    <UiSurface>
      <h2 class="font-display mb-4 text-[1.05rem] font-semibold text-ink-deep">
        Transactions this month
      </h2>
      <p v-if="!transactions?.length" class="m-0 text-sm italic text-muted">
        No transactions recorded for this month yet.
      </p>
      <div v-else class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Month</th>
              <th>Category</th>
              <th>Item</th>
              <th>Type</th>
              <th class="text-right">
                Amount
              </th>
              <th>Note</th>
              <th class="col-actions" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in sortedTransactions" :key="t.id">
              <td>{{ t.month }}</td>
              <td>{{ categoryName(t.itemId) }}</td>
              <td>{{ itemName(t.itemId) }}</td>
              <td>{{ t.type }}</td>
              <td
                class="text-right tabular-nums"
                :class="t.type === 'income' ? 'money-income' : 'money-expense'"
              >
                {{ formatCents(t.amountCents) }}
              </td>
              <td>{{ t.note }}</td>
              <td class="col-actions">
                <UiButton
                  variant="icon"
                  danger
                  title="Delete transaction"
                  @click="remove(t.id)"
                >
                  <TrashIcon />
                </UiButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiSurface>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const year = computed(() => Number(route.params.year))
const month = computed(() => Number(route.params.month))
const title = computed(() => monthLabel(year.value, month.value))
const prev = computed(() => shiftMonth(year.value, month.value, -1))
const next = computed(() => shiftMonth(year.value, month.value, 1))

interface Category {
  id: number
  type: 'income' | 'expense'
  name: string
  archived: boolean
}
interface Item {
  id: number
  categoryId: number
  name: string
  archived: boolean
}
interface Transaction {
  id: number
  itemId: number
  type: 'income' | 'expense'
  amountCents: number
  month: string
  note: string | null
}
interface MonthlySummary {
  totals: { incomeCents: number, expenseCents: number, netCents: number }
}

const categories = ref<Category[] | null>(null)
const items = ref<Item[] | null>(null)
const transactions = ref<Transaction[] | null>(null)
const summary = ref<MonthlySummary | null>(null)

async function load() {
  const [c, i, t, s] = await Promise.all([
    $fetch<Category[]>('/api/categories'),
    $fetch<Item[]>('/api/items'),
    $fetch<Transaction[]>('/api/transactions', { query: { year: year.value, month: month.value } }),
    $fetch<MonthlySummary>('/api/summary/monthly', { query: { year: year.value, month: month.value } })
  ])
  categories.value = c
  items.value = i
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
  [...(transactions.value ?? [])].sort((a, b) => a.id - b.id)
)

function itemName(itemId: number) {
  return items.value?.find(i => i.id === itemId)?.name ?? `#${itemId}`
}
function categoryName(itemId: number) {
  const item = items.value?.find(i => i.id === itemId)
  if (!item) return '—'
  return categories.value?.find(c => c.id === item.categoryId)?.name ?? '—'
}
</script>
