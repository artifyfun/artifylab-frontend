<template>
  <div class="h-full">
    <!-- 网格视图 -->
    <MarketVirtualGrid
      v-if="viewMode === 'grid'"
      :apps="apps"
      :search-query="searchQuery"
      :selected-category="selectedCategory"
      @view-detail="$emit('view-detail', $event)"
      @install="$emit('install', $event)"
      @clear-search="$emit('clear-search')"
      @clear-filter="$emit('clear-filter')"
    />

    <!-- 紧凑列表视图 -->
    <MarketCompactListView
      v-else-if="viewMode === 'compact'"
      :apps="apps"
      :search-query="searchQuery"
      :selected-category="selectedCategory"
      @view-detail="$emit('view-detail', $event)"
      @install="$emit('install', $event)"
      @clear-search="$emit('clear-search')"
      @clear-filter="$emit('clear-filter')"
    />
  </div>
</template>

<script setup>
import MarketVirtualGrid from './MarketVirtualGrid.vue'
import MarketCompactListView from './MarketCompactListView.vue'

defineProps({
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
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-detail', 'install', 'clear-search', 'clear-filter'])
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
