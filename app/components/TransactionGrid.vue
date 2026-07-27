<template>
  <div>
    <div v-if="errors.length" class="mb-3 text-sm text-expense">
      <div v-for="(err, i) in errors" :key="i">
        {{ err }}
      </div>
    </div>
    <div class="table-scroll">
      <table class="data">
        <thead>
          <tr>
            <th>Month</th>
            <th>Type</th>
            <th>Category</th>
            <th>Item</th>
            <th class="text-right">
              Amount
            </th>
            <th>Note</th>
            <th class="col-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td>
              <input v-model="row.month" type="month" aria-label="Month">
            </td>
            <td>
              <select v-model="row.type" aria-label="Type" @change="onTypeChange(row)">
                <option value="expense">
                  Expense
                </option>
                <option value="income">
                  Income
                </option>
              </select>
            </td>
            <td>
              <select v-model="row.categoryId" aria-label="Category" @change="onCategoryChange(row)">
                <option value="">
                  Select category
                </option>
                <option
                  v-for="c in categoriesFor(row.type)"
                  :key="c.id"
                  :value="String(c.id)"
                >
                  {{ c.name }}
                </option>
              </select>
            </td>
            <td>
              <select
                v-model="row.itemId"
                aria-label="Item"
                :disabled="!row.categoryId"
              >
                <option value="">
                  {{ row.categoryId ? 'Select item' : 'Select category first' }}
                </option>
                <option
                  v-for="i in itemsFor(row.categoryId)"
                  :key="i.id"
                  :value="String(i.id)"
                >
                  {{ i.name }}
                </option>
              </select>
            </td>
            <td class="text-right">
              <input
                v-model="row.amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                class="amount w-[5.5rem]"
                aria-label="Amount"
              >
            </td>
            <td>
              <input v-model="row.note" type="text" placeholder="Note" aria-label="Note">
            </td>
            <td class="col-actions">
              <UiButton
                variant="icon"
                danger
                title="Remove row"
                @click="removeRow(index)"
              >
                <TrashIcon />
              </UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--line)] pt-4">
      <UiButton @click="addRow">
        Add row
      </UiButton>
      <UiButton variant="primary" :disabled="saving" @click="save">
        Save all rows
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
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
interface GridRow {
  month: string
  type: 'income' | 'expense'
  categoryId: string
  itemId: string
  amount: string
  note: string
}

const props = defineProps<{
  categories: Category[]
  items: Item[]
  year: number
  month: number
}>()
const emit = defineEmits<{ saved: [] }>()

function blankRow(): GridRow {
  return {
    month: monthKey(props.year, props.month),
    type: 'expense',
    categoryId: '',
    itemId: '',
    amount: '',
    note: ''
  }
}

const rows = ref<GridRow[]>([blankRow(), blankRow(), blankRow()])
const errors = ref<string[]>([])
const saving = ref(false)

watch(() => [props.year, props.month], () => {
  rows.value = [blankRow(), blankRow(), blankRow()]
  errors.value = []
})

function categoriesFor(type: 'income' | 'expense') {
  return props.categories.filter(c => c.type === type && !c.archived)
}
function itemsFor(categoryId: string) {
  if (!categoryId) return []
  const id = Number(categoryId)
  return props.items.filter(i => i.categoryId === id && !i.archived)
}
function onTypeChange(row: GridRow) {
  row.categoryId = ''
  row.itemId = ''
}
function onCategoryChange(row: GridRow) {
  row.itemId = ''
}
function addRow() {
  rows.value.push(blankRow())
}
function removeRow(index: number) {
  rows.value.splice(index, 1)
  if (!rows.value.length) rows.value = [blankRow()]
}

interface BulkResult {
  results: { index: number, status: 'created' | 'failed', error?: string }[]
}

async function save() {
  errors.value = []
  const payload: {
    itemId: number
    type: 'income' | 'expense'
    amountCents: number
    month: string
    note: string | null
    sourceIndex: number
  }[] = []

  rows.value.forEach((row, index) => {
    const hasItem = Boolean(row.itemId)
    const amount = Number(row.amount)
    const hasAmount = row.amount !== '' && !Number.isNaN(amount) && amount !== 0
    if (!hasItem && !hasAmount) return
    if (!hasItem || !hasAmount || amount < 0) {
      errors.value.push(`Row ${index + 1}: Item and positive amount are both required.`)
      return
    }
    payload.push({
      itemId: Number(row.itemId),
      type: row.type,
      amountCents: Math.round(amount * 100),
      month: row.month,
      note: row.note.trim() || null,
      sourceIndex: index
    })
  })

  if (errors.value.length) return
  if (!payload.length) {
    rows.value = [blankRow(), blankRow(), blankRow()]
    return
  }

  saving.value = true
  try {
    const body = payload.map(({ sourceIndex: _s, ...rest }) => rest)
    const result = await $fetch<BulkResult>('/api/transactions/bulk', {
      method: 'POST',
      body
    })
    const failed = result.results.filter(r => r.status === 'failed')
    if (failed.length) {
      errors.value = failed.map(f => `Row ${payload[f.index]!.sourceIndex + 1}: ${f.error}`)
      const failedSource = new Set(failed.map(f => payload[f.index]!.sourceIndex))
      rows.value = rows.value.filter((_, i) => failedSource.has(i))
      if (!rows.value.length) rows.value = [blankRow()]
    } else {
      rows.value = [blankRow(), blankRow(), blankRow()]
    }
    emit('saved')
  } catch (e: unknown) {
    errors.value = [(e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Save failed.']
  } finally {
    saving.value = false
  }
}
</script>
