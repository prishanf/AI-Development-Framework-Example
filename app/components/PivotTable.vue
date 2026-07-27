<template>
  <div class="table-scroll">
    <table class="data">
      <thead>
        <tr>
          <th />
          <th
            v-for="m in monthHeads"
            :key="m"
            class="text-right"
          >
            {{ m }}
          </th>
          <th class="text-right">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="group in block.groups" :key="group.categoryId">
          <tr>
            <td colspan="14">
              <strong>{{ group.categoryName }}</strong>
            </td>
          </tr>
          <tr
            v-for="item in group.items"
            :key="item.itemId"
            :class="{ 'opacity-55': item.archived }"
          >
            <td class="pl-6">
              {{ item.itemName }}
            </td>
            <td
              v-for="(v, i) in item.months"
              :key="i"
              class="text-right tabular-nums"
              :class="moneyClass"
            >
              {{ formatCents(v) }}
            </td>
            <td class="text-right tabular-nums" :class="moneyClass">
              {{ formatCents(item.total) }}
            </td>
          </tr>
          <tr class="subtotal">
            <td class="pl-4">
              {{ group.categoryName }} subtotal
            </td>
            <td
              v-for="(v, i) in group.subtotalMonths"
              :key="i"
              class="text-right tabular-nums"
              :class="moneyClass"
            >
              {{ formatCents(v) }}
            </td>
            <td class="text-right tabular-nums" :class="moneyClass">
              {{ formatCents(group.subtotal) }}
            </td>
          </tr>
        </template>
        <tr class="type-total">
          <td>{{ type === 'income' ? 'Income' : 'Expense' }} total</td>
          <td
            v-for="(v, i) in block.totals"
            :key="i"
            class="text-right tabular-nums"
            :class="moneyClass"
          >
            {{ formatCents(v) }}
          </td>
          <td class="text-right tabular-nums" :class="moneyClass">
            {{ formatCents(block.total) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { PivotBlock } from '#shared/types'

const props = defineProps<{
  block: PivotBlock
  type: 'income' | 'expense'
}>()

const moneyClass = computed(() =>
  props.type === 'income' ? 'money-income' : 'money-expense'
)

const monthHeads = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString(undefined, { month: 'short' })
)
</script>
