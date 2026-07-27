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
      <p v-if="notice" class="mb-3 text-sm text-expense">
        {{ notice }}
      </p>
      <p v-if="!transactions?.length" class="m-0 text-sm italic text-muted">
        No transactions recorded for this month yet.
      </p>
      <div v-else class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Month</th>
              <th>Type</th>
              <th>Category / Item</th>
              <th class="text-right">
                Amount
              </th>
              <th>Note</th>
              <th class="col-actions" />
            </tr>
          </thead>
          <tbody>
            <template v-for="group in groupedTransactions" :key="`cat-${group.categoryId}`">
              <tr class="bg-paper-tint">
                <td colspan="6" class="font-display text-[0.8125rem] font-semibold text-ink-deep">
                  {{ group.categoryName }}
                  <span class="ml-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted">
                    {{ group.type }}
                  </span>
                </td>
              </tr>
              <template v-for="itemGroup in group.items" :key="`item-${itemGroup.itemId}`">
                <tr>
                  <td colspan="6" class="pl-6 text-[0.75rem] font-semibold text-muted">
                    {{ itemGroup.itemName }}
                  </td>
                </tr>
                <tr v-for="t in itemGroup.transactions" :key="t.id">
                  <template v-if="editingId === t.id && editDraft">
                    <td>
                      <input v-model="editDraft.month" type="month" aria-label="Edit month">
                    </td>
                    <td>
                      <select v-model="editDraft.type" aria-label="Edit type" @change="onEditTypeChange">
                        <option value="income">
                          Income
                        </option>
                        <option value="expense">
                          Expense
                        </option>
                      </select>
                    </td>
                    <td>
                      <div class="flex flex-col gap-1.5">
                        <select v-model="editDraft.categoryId" aria-label="Edit category" @change="onEditCategoryChange">
                          <option
                            v-for="c in categoriesFor(editDraft.type)"
                            :key="c.id"
                            :value="String(c.id)"
                          >
                            {{ c.name }}
                          </option>
                        </select>
                        <select v-model="editDraft.itemId" aria-label="Edit item">
                          <option
                            v-for="i in itemsFor(editDraft.categoryId)"
                            :key="i.id"
                            :value="String(i.id)"
                          >
                            {{ i.name }}
                          </option>
                        </select>
                      </div>
                    </td>
                    <td class="text-right">
                      <input
                        v-model="editDraft.amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        class="amount w-[5.5rem]"
                        aria-label="Edit amount"
                      >
                    </td>
                    <td>
                      <input v-model="editDraft.note" type="text" aria-label="Edit note">
                    </td>
                    <td class="col-actions">
                      <div class="flex items-center gap-1">
                        <UiButton variant="primary" title="Save transaction" @click="saveEdit(t.id)">
                          Save
                        </UiButton>
                        <UiButton variant="quiet" title="Cancel edit" @click="cancelEdit">
                          Cancel
                        </UiButton>
                      </div>
                    </td>
                  </template>
                  <template v-else>
                    <td>{{ t.month }}</td>
                    <td>{{ t.type }}</td>
                    <td class="pl-6 text-sm">
                      {{ itemName(t.itemId) }}
                    </td>
                    <td
                      class="text-right tabular-nums"
                      :class="t.type === 'income' ? 'money-income' : 'money-expense'"
                    >
                      {{ formatCents(t.amountCents) }}
                    </td>
                    <td>{{ t.note }}</td>
                    <td class="col-actions">
                      <div class="flex items-center gap-1">
                        <UiButton variant="quiet" title="Edit transaction" @click="startEdit(t)">
                          Edit
                        </UiButton>
                        <UiButton
                          variant="icon"
                          danger
                          title="Delete transaction"
                          @click="remove(t.id)"
                        >
                          <TrashIcon />
                        </UiButton>
                      </div>
                    </td>
                  </template>
                </tr>
              </template>
            </template>
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
interface EditDraft {
  type: 'income' | 'expense'
  categoryId: string
  itemId: string
  amount: string
  month: string
  note: string
}

const categories = ref<Category[] | null>(null)
const items = ref<Item[] | null>(null)
const transactions = ref<Transaction[] | null>(null)
const summary = ref<MonthlySummary | null>(null)
const editingId = ref<number | null>(null)
const editDraft = ref<EditDraft | null>(null)
const notice = ref('')

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

watch([year, month], () => {
  cancelEdit()
  load()
}, { immediate: true })

function itemMeta(itemId: number) {
  return items.value?.find(i => i.id === itemId)
}
function categoryMeta(categoryId: number) {
  return categories.value?.find(c => c.id === categoryId)
}
function itemName(itemId: number) {
  return itemMeta(itemId)?.name ?? `#${itemId}`
}

const groupedTransactions = computed(() => {
  const list = transactions.value ?? []
  const byCategory = new Map<number, {
    categoryId: number
    categoryName: string
    type: 'income' | 'expense'
    items: Map<number, { itemId: number, itemName: string, transactions: Transaction[] }>
  }>()

  for (const t of list) {
    const item = itemMeta(t.itemId)
    const categoryId = item?.categoryId ?? -1
    const category = categoryId > 0 ? categoryMeta(categoryId) : undefined
    if (!byCategory.has(categoryId)) {
      byCategory.set(categoryId, {
        categoryId,
        categoryName: category?.name ?? 'Unknown category',
        type: t.type,
        items: new Map()
      })
    }
    const catGroup = byCategory.get(categoryId)!
    if (!catGroup.items.has(t.itemId)) {
      catGroup.items.set(t.itemId, {
        itemId: t.itemId,
        itemName: item?.name ?? `#${t.itemId}`,
        transactions: []
      })
    }
    catGroup.items.get(t.itemId)!.transactions.push(t)
  }

  return [...byCategory.values()]
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName) || a.type.localeCompare(b.type))
    .map(group => ({
      ...group,
      items: [...group.items.values()]
        .sort((a, b) => a.itemName.localeCompare(b.itemName))
        .map(itemGroup => ({
          ...itemGroup,
          transactions: [...itemGroup.transactions].sort((a, b) => a.id - b.id)
        }))
    }))
})

function categoriesFor(type: 'income' | 'expense') {
  return (categories.value ?? []).filter(c => c.type === type && !c.archived)
}
function itemsFor(categoryId: string) {
  const id = Number(categoryId)
  return (items.value ?? []).filter(i => i.categoryId === id && !i.archived)
}

function startEdit(t: Transaction) {
  notice.value = ''
  const item = itemMeta(t.itemId)
  editingId.value = t.id
  editDraft.value = {
    type: t.type,
    categoryId: String(item?.categoryId ?? ''),
    itemId: String(t.itemId),
    amount: (t.amountCents / 100).toFixed(2),
    month: t.month,
    note: t.note ?? ''
  }
}
function cancelEdit() {
  editingId.value = null
  editDraft.value = null
}
function onEditTypeChange() {
  if (!editDraft.value) return
  const first = categoriesFor(editDraft.value.type)[0]
  editDraft.value.categoryId = first ? String(first.id) : ''
  onEditCategoryChange()
}
function onEditCategoryChange() {
  if (!editDraft.value) return
  const first = itemsFor(editDraft.value.categoryId)[0]
  editDraft.value.itemId = first ? String(first.id) : ''
}

async function saveEdit(id: number) {
  if (!editDraft.value) return
  notice.value = ''
  const amount = Number(editDraft.value.amount)
  if (!editDraft.value.itemId || Number.isNaN(amount) || amount <= 0) {
    notice.value = 'Item and positive amount are both required.'
    return
  }
  try {
    await $fetch(`/api/transactions/${id}`, {
      method: 'PATCH',
      body: {
        itemId: Number(editDraft.value.itemId),
        type: editDraft.value.type,
        amountCents: Math.round(amount * 100),
        month: editDraft.value.month,
        note: editDraft.value.note.trim() || null
      }
    })
    cancelEdit()
    await refreshAll()
  } catch (e: unknown) {
    notice.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Could not save transaction.'
  }
}
</script>
