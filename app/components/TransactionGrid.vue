<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Note</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="row.key">
          <td>
            <input v-model="row.occurredOn" type="date">
          </td>
          <td>
            <select v-model="row.type">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </td>
          <td>
            <select v-model.number="row.categoryId">
              <option :value="null" disabled>Select…</option>
              <option
                v-for="c in categoriesOfType(row.type)"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </option>
            </select>
          </td>
          <td>
            <input v-model="row.amount" type="number" step="0.01" min="0" placeholder="0.00">
          </td>
          <td>
            <input v-model="row.note" type="text" placeholder="optional">
          </td>
          <td>
            <button type="button" @click="removeRow(i)">
              Remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-if="rowErrors.length" class="error-text">
      <span v-for="e in rowErrors" :key="e">{{ e }}<br></span>
    </p>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
      <button type="button" @click="addRow">
        + Add row
      </button>
      <button type="button" :disabled="submitting" @click="submit">
        {{ submitting ? 'Saving…' : 'Save all rows' }}
      </button>
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

interface GridRow {
  key: number
  occurredOn: string
  type: 'income' | 'expense'
  categoryId: number | null
  amount: string
  note: string
}

const props = defineProps<{
  categories: Category[]
  year: number
  month: number
}>()

const emit = defineEmits<{ saved: [] }>()

let keySeq = 0
function blankRow(): GridRow {
  keySeq += 1
  const defaultDay = String(Math.min(props.month === 2 ? 28 : 31, new Date().getDate())).padStart(2, '0')
  return {
    key: keySeq,
    occurredOn: `${props.year}-${String(props.month).padStart(2, '0')}-${defaultDay}`,
    type: 'expense',
    categoryId: null,
    amount: '',
    note: ''
  }
}

const rows = ref<GridRow[]>([blankRow(), blankRow(), blankRow()])
const rowErrors = ref<string[]>([])
const submitting = ref(false)

function categoriesOfType(type: 'income' | 'expense') {
  return props.categories.filter(c => c.type === type && !c.archived)
}

function addRow() {
  rows.value.push(blankRow())
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}

async function submit() {
  rowErrors.value = []
  const payload = rows.value
    .map((row, i) => ({ row, i }))
    .filter(({ row }) => row.categoryId !== null && row.amount !== '')
    .map(({ row, i }) => {
      const amountCents = Math.round(Number(row.amount) * 100)
      return {
        i,
        categoryId: row.categoryId,
        type: row.type,
        amountCents,
        occurredOn: row.occurredOn,
        note: row.note || null
      }
    })

  if (payload.length === 0) {
    rowErrors.value = ['No complete rows to save — fill in category and amount.']
    return
  }

  submitting.value = true
  try {
    const response = await $fetch<{ createdCount: number, failedCount: number, results: { index: number, status: string, error?: string }[] }>('/api/transactions/bulk', {
      method: 'POST',
      body: payload.map(p => ({ categoryId: p.categoryId, type: p.type, amountCents: p.amountCents, occurredOn: p.occurredOn, note: p.note }))
    })

    const failed = response.results.filter(r => r.status === 'failed')
    if (failed.length > 0) {
      rowErrors.value = failed.flatMap((f) => {
        const original = payload[f.index]
        return original ? [`Row ${original.i + 1}: ${f.error}`] : []
      })
    }

    const succeededOriginalIndexes = new Set(
      response.results
        .filter(r => r.status === 'created')
        .flatMap(r => (payload[r.index] ? [payload[r.index]!.i] : []))
    )
    rows.value = rows.value.filter((_, i) => !succeededOriginalIndexes.has(i))
    if (rows.value.length === 0) {
      rows.value = [blankRow(), blankRow(), blankRow()]
    }

    if (response.createdCount > 0) {
      emit('saved')
    }
  } finally {
    submitting.value = false
  }
}
</script>
