<template>
  <div class="conversation-list">
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon">
        <span class="icon-[ri--chat-3-line] w-8 h-8"></span>
      </div>
      <p class="empty-text">还没有对话记录</p>
      <p class="empty-subtext">开始一个新对话吧</p>
    </div>

    <div v-else class="conversation-items">
      <div v-for="item in items" :key="item.id" class="conversation-item"
        :class="{ 'conversation-item--active': active === item.id }">
        <router-link :to="`/conversation/${item.id}`" class="conversation-link">
          <div class="conversation-header">
            <span class="conversation-time">
              {{ formatDate(item.updatedAt) }}
            </span>
            <span class="conversation-model">
              {{ item.selectedModel }}
            </span>
          </div>

          <h3 class="conversation-title">
            {{ item.title }}
          </h3>

          <div class="conversation-meta">
            <div class="status-indicator"></div>
            <span class="last-update">
              {{ getTimeAgo(item.updatedAt) }}
            </span>
          </div>
        </router-link>
      </div>
    </div>
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
.conversation-list {
  width: 100%;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: var(--bg-secondary);
  color: var(--text-muted);
  border-radius: 50%;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
}

.empty-subtext {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

/* 对话项目 */
.conversation-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.conversation-item {
  border-radius: 0.75rem;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.conversation-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  opacity: 0;
  transition: all var(--transition-normal);
  z-index: 0;
  border-radius: 0.75rem;
}

/* 移除 hover 效果 */

.conversation-item--active::before {
  opacity: 0.08;
}

.conversation-link {
  display: block;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  position: relative;
  z-index: 1;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  transition: all var(--transition-normal);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02);
}

/* 移除 hover 变换效果 */

.conversation-item--active .conversation-link {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, var(--bg-accent) 0%, rgba(79, 127, 222, 0.08) 100%);
  box-shadow:
    0 2px 8px rgba(79, 127, 222, 0.15),
    0 1px 3px rgba(79, 127, 222, 0.1);
}

/* 对话头部 */
.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.conversation-time {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
}

.conversation-model {
  font-size: 0.65rem;
  padding: 0.3rem 0.6rem;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 0.5rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all var(--transition-normal);
}

.conversation-item--active .conversation-model {
  background: var(--color-primary);
  color: var(--text-on-primary);
  border-color: var(--color-primary);
}

/* 对话标题 */
.conversation-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.conversation-item--active .conversation-title {
  color: var(--color-primary);
}

/* 对话元信息 */
.conversation-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--border-color);
  transition: all var(--transition-normal);
  box-shadow: 0 0 0 1px var(--bg-secondary);
}

.conversation-item--active .status-indicator {
  background: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(79, 127, 222, 0.2);
}

.last-update {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.conversation-item--active .last-update {
  color: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .conversation-link {
    padding: 0.75rem;
  }

  .conversation-title {
    font-size: 0.8rem;
  }

  .conversation-time,
  .last-update {
    font-size: 0.65rem;
  }

  .conversation-model {
    font-size: 0.6rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>
