<template>
  <div class="h-full">
    <!-- 网格视图 -->
    <VirtualGrid
      v-if="viewMode === 'grid'"
      :apps="apps"
      :search-query="searchQuery"
      :selected-category="selectedCategory"
      @view-detail="$emit('view-detail', $event)"
      @clear-search="$emit('clear-search')"
      @clear-filter="$emit('clear-filter')"
    />

    <!-- 紧凑列表视图 -->
    <CompactListView
      v-else-if="viewMode === 'compact'"
      :apps="apps"
      :search-query="searchQuery"
      :selected-category="selectedCategory"
      @view-detail="$emit('view-detail', $event)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @clear-search="$emit('clear-search')"
      @clear-filter="$emit('clear-filter')"
    />
  </div>
</template>

<script setup>
import VirtualGrid from './VirtualGrid.vue'
import CompactListView from './CompactListView.vue'

const props = defineProps({
  apps: {
    type: Array,
    default: () => []
  },
  searchQuery: {
    type: String,
    default: ''
  },
  selectedCategory: {
    type: String,
    default: ''
  },
  viewMode: {
    type: String,
    default: 'grid'
  },
})

defineEmits(['view-detail', 'edit', 'delete', 'clear-search', 'clear-filter'])
</script>

<style scoped>
.card-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
</style>
