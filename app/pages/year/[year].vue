<template>
  <div>
    <UiSurface>
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 class="font-display text-xl font-semibold text-ink-deep sm:text-[1.65rem]">
          {{ year }} — Yearly summary
        </h1>
        <div class="inline-flex overflow-hidden rounded-control bg-paper-tint shadow-inset ring-1 ring-black/10">
          <NuxtLink
            class="inline-flex min-h-control min-w-[4.5rem] items-center justify-center gap-1.5 border-r border-[var(--line)] px-3.5 text-[0.8125rem] font-semibold text-ink no-underline hover:bg-paper"
            :to="`/year/${year - 1}`"
          >
            <span class="text-[0.7rem] opacity-55" aria-hidden="true">‹</span>
            Prev
          </NuxtLink>
          <NuxtLink
            class="inline-flex min-h-control min-w-[4.5rem] items-center justify-center gap-1.5 px-3.5 text-[0.8125rem] font-semibold text-ink no-underline hover:bg-paper"
            :to="`/year/${year + 1}`"
          >
            Next
            <span class="text-[0.7rem] opacity-55" aria-hidden="true">›</span>
          </NuxtLink>
        </div>
      </div>

      <div v-if="summary" class="grid gap-3 sm:grid-cols-3">
        <UiMetric label="Year income" tone="income">
          {{ formatCents(summary.yearTotals.incomeCents) }}
        </UiMetric>
        <UiMetric label="Year expenses" tone="expense">
          {{ formatCents(summary.yearTotals.expenseCents) }}
        </UiMetric>
        <UiMetric
          label="Net"
          :tone="summary.yearTotals.netCents >= 0 ? 'income' : 'expense'"
        >
          {{ formatCents(summary.yearTotals.netCents) }}
        </UiMetric>
      </div>
    </UiSurface>

    <UiSurface v-if="summary">
      <h2 class="font-display mb-4 text-[1.05rem] font-semibold text-ink-deep">
        Monthly summary
      </h2>
      <div class="table-scroll">
        <table class="data">
          <thead>
            <tr>
              <th>Month</th>
              <th class="text-right">
                Income
              </th>
              <th class="text-right">
                Expenses
              </th>
              <th class="text-right">
                Net
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in summary.byMonth" :key="index">
              <td>
                <NuxtLink
                  class="text-link underline underline-offset-2"
                  :to="`/month/${year}/${index + 1}`"
                >
                  {{ monthName(index) }}
                </NuxtLink>
              </td>
              <td class="text-right tabular-nums money-income">
                {{ formatCents(row.incomeCents) }}
              </td>
              <td class="text-right tabular-nums money-expense">
                {{ formatCents(row.expenseCents) }}
              </td>
              <td
                class="text-right tabular-nums"
                :class="row.netCents >= 0 ? 'money-income' : 'money-expense'"
              >
                {{ formatCents(row.netCents) }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td class="text-right tabular-nums money-income">
                {{ formatCents(summary.yearTotals.incomeCents) }}
              </td>
              <td class="text-right tabular-nums money-expense">
                {{ formatCents(summary.yearTotals.expenseCents) }}
              </td>
              <td
                class="text-right tabular-nums"
                :class="summary.yearTotals.netCents >= 0 ? 'money-income' : 'money-expense'"
              >
                {{ formatCents(summary.yearTotals.netCents) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </UiSurface>

    <UiSurface v-if="summary">
      <h2 class="font-display mb-4 text-[1.05rem] font-semibold text-ink-deep">
        Income detail
      </h2>
      <PivotTable :block="summary.income" type="income" />
    </UiSurface>

    <UiSurface v-if="summary">
      <h2 class="font-display mb-4 text-[1.05rem] font-semibold text-ink-deep">
        Expense detail
      </h2>
      <PivotTable :block="summary.expense" type="expense" />
    </UiSurface>
  </div>
</template>

<script setup lang="ts">
import type { PivotBlock } from '#shared/types'

const route = useRoute()
const year = computed(() => Number(route.params.year))

interface YearSummary {
  byMonth: { incomeCents: number, expenseCents: number, netCents: number }[]
  yearTotals: { incomeCents: number, expenseCents: number, netCents: number }
  income: PivotBlock
  expense: PivotBlock
}

const summary = ref<YearSummary | null>(null)

async function load() {
  summary.value = await $fetch<YearSummary>('/api/summary/yearly', { query: { year: year.value } })
}

watch(year, load, { immediate: true })

function monthName(index: number) {
  return new Date(2000, index, 1).toLocaleString(undefined, { month: 'long' })
}
</script>
