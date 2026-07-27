<template>
  <details class="rounded-surface bg-paper p-5 shadow-ring" open>
    <summary class="font-display cursor-pointer text-lg font-semibold text-ink-deep">
      Manage categories &amp; items
    </summary>
    <p class="mt-2 mb-4 text-sm text-muted">
      Add categories, then add items under each category. Archive hides them from new entries without erasing history.
    </p>
    <p v-if="notice" class="mb-3 text-sm text-expense">
      {{ notice }}
    </p>

    <div class="grid gap-4 md:grid-cols-2">
      <section
        v-for="type in (['income', 'expense'] as const)"
        :key="type"
        class="rounded-surface bg-paper-tint p-3.5 shadow-inset"
      >
        <div class="mb-3.5 flex items-center gap-2.5">
          <UiTypePill :type="type" />
          <h3 class="font-display m-0 text-base font-semibold normal-case tracking-tight text-ink-deep">
            {{ type === 'income' ? 'Income' : 'Expense' }}
          </h3>
        </div>

        <div
          v-for="cat in categoriesOfType(type)"
          :key="cat.id"
          class="mb-2.5 rounded-control bg-paper p-3 shadow-ring"
          :class="{ 'opacity-55': cat.archived }"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <strong class="font-display min-w-0 truncate text-[0.95rem]" :class="{ 'line-through': cat.archived }">
              {{ cat.name }}
            </strong>
            <UiButton
              variant="icon"
              :title="cat.archived ? `Unarchive ${cat.name}` : `Archive ${cat.name}`"
              @click="toggleCategory(cat)"
            >
              <ArchiveIcon :archived="cat.archived" />
            </UiButton>
          </div>

          <div class="mb-2 flex flex-col gap-1.5">
            <div
              v-for="item in itemsForCategory(cat.id)"
              :key="item.id"
              class="flex items-center justify-between gap-2 rounded-[7px] bg-paper-tint px-[0.55rem] py-[0.45rem] text-sm"
              :class="{ 'opacity-55': item.archived }"
            >
              <span class="truncate font-medium" :class="{ 'line-through': item.archived }">
                {{ item.name }}
              </span>
              <UiButton
                variant="icon"
                :title="item.archived ? `Unarchive ${item.name}` : `Archive ${item.name}`"
                @click="toggleItem(item)"
              >
                <ArchiveIcon :archived="item.archived" />
              </UiButton>
            </div>
            <p v-if="!itemsForCategory(cat.id).length" class="m-0 px-2.5 py-1.5 text-sm italic text-muted">
              No items yet.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <input
              v-model="newItemName[cat.id]"
              type="text"
              class="min-w-[10rem] flex-1"
              :placeholder="`New item under ${cat.name}`"
              :disabled="cat.archived"
              @keydown.enter.prevent="addItem(cat.id)"
            >
            <UiButton :disabled="cat.archived" @click="addItem(cat.id)">
              Add item
            </UiButton>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-2">
          <input
            v-model="newCategoryName[type]"
            type="text"
            class="min-w-[10rem] flex-1"
            :placeholder="`New ${type} category`"
            @keydown.enter.prevent="addCategory(type)"
          >
          <UiButton @click="addCategory(type)">
            Add category
          </UiButton>
        </div>
      </section>
    </div>
  </details>
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

const props = defineProps<{
  categories: Category[]
  items: Item[]
}>()
const emit = defineEmits<{ changed: [] }>()

const notice = ref('')
const newCategoryName = reactive<Record<'income' | 'expense', string>>({ income: '', expense: '' })
const newItemName = reactive<Record<number, string>>({})

function categoriesOfType(type: 'income' | 'expense') {
  return props.categories.filter(c => c.type === type)
}
function itemsForCategory(categoryId: number) {
  return props.items.filter(i => i.categoryId === categoryId)
}

async function addCategory(type: 'income' | 'expense') {
  notice.value = ''
  const name = newCategoryName[type].trim()
  if (!name) {
    notice.value = 'Category name is required.'
    return
  }
  try {
    await $fetch('/api/categories', { method: 'POST', body: { type, name } })
    newCategoryName[type] = ''
    emit('changed')
  } catch (e: unknown) {
    notice.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Could not add category.'
  }
}

async function addItem(categoryId: number) {
  notice.value = ''
  const name = (newItemName[categoryId] || '').trim()
  if (!name) {
    notice.value = 'Item name is required.'
    return
  }
  try {
    await $fetch('/api/items', { method: 'POST', body: { categoryId, name } })
    newItemName[categoryId] = ''
    emit('changed')
  } catch (e: unknown) {
    notice.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Could not add item.'
  }
}

async function toggleCategory(cat: Category) {
  await $fetch(`/api/categories/${cat.id}`, { method: 'PATCH', body: { archived: !cat.archived } })
  emit('changed')
}

async function toggleItem(item: Item) {
  await $fetch(`/api/items/${item.id}`, { method: 'PATCH', body: { archived: !item.archived } })
  emit('changed')
}
</script>
