<template>
  <details>
    <summary>Manage categories</summary>
    <div style="display:flex; gap:2rem; margin-top: 0.75rem;">
      <div v-for="type in (['income', 'expense'] as const)" :key="type">
        <h4 style="text-transform: capitalize;">
          {{ type }} categories
        </h4>
        <ul style="list-style:none; padding:0;">
          <li v-for="c in categoriesOfType(type)" :key="c.id" style="margin-bottom:0.25rem;">
            <span :style="{ opacity: c.archived ? 0.5 : 1 }">{{ c.name }}</span>
            <button type="button" style="margin-left:0.5rem;" @click="toggleArchive(c)">
              {{ c.archived ? 'Unarchive' : 'Archive' }}
            </button>
          </li>
        </ul>
        <div style="display:flex; gap:0.5rem;">
          <input v-model="newName[type]" type="text" placeholder="New category name">
          <button type="button" @click="addCategory(type)">
            Add
          </button>
        </div>
      </div>
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

const props = defineProps<{ categories: Category[] }>()
const emit = defineEmits<{ changed: [] }>()

const newName = ref<Record<'income' | 'expense', string>>({ income: '', expense: '' })

function categoriesOfType(type: 'income' | 'expense') {
  return props.categories.filter(c => c.type === type)
}

async function addCategory(type: 'income' | 'expense') {
  const name = newName.value[type].trim()
  if (!name) return
  await $fetch('/api/categories', { method: 'POST', body: { type, name } })
  newName.value[type] = ''
  emit('changed')
}

async function toggleArchive(category: Category) {
  await $fetch(`/api/categories/${category.id}`, { method: 'PATCH', body: { archived: !category.archived } })
  emit('changed')
}
</script>
