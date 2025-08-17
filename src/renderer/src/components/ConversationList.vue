<template>
  <div>
    <ul class="list-none p-0 m-0 flex flex-col gap-2">
      <li v-for="item in items" :key="item.id" class="list-item" :class="{ selected: active === item.id }">
        <router-link :to="`/conversation/${item.id}`">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[0.65rem] text-muted">
              {{ formatDate(item.updatedAt) }}
            </span>
            <span class="text-[0.65rem] py-0.5 px-1 rounded-sm"
              :class="active === item.id ? 'accent-bg' : 'bg-secondary text-muted'">
              {{ item.selectedModel }}
            </span>
          </div>

          <h3 class="text-[0.9rem] font-medium mx-0 mt-1 mb-0.5"
            :class="active === item.id ? 'text-accent' : 'text-primary'">
            {{ item.title }}
          </h3>

          <div class="flex items-center mt-1">
            <div class="w-2 h-2 rounded-full mr-1.5 transition-colors"
              :class="active === item.id ? 'bg-primary' : 'bg-muted'" :style="active === item.id
                ? { backgroundColor: 'var(--color-primary)' }
                : { backgroundColor: 'var(--text-muted)' }
                "></div>
            <p class="text-[0.75rem] m-0 truncate" :class="active === item.id ? 'text-accent' : 'text-secondary'">
              Last update {{ getTimeAgo(item.updatedAt) }}
            </p>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Conversation } from '../types/conversation'
import { smartFormatTime, getTimeAgo } from '../utils/dateUtils'

defineProps<{
  items: Conversation[]
  active: string | undefined
}>()

// 使用智能格式化时间
const formatDate = smartFormatTime
</script>

<style scoped>
.list-item {
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

/* 可以在这里添加组件特定的样式覆盖 */
</style>
