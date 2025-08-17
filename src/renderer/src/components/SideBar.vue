<template>
  <aside class="sidebar">
    <!-- 标题区域 -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">对话历史</h2>
    </div>

    <!-- 对话列表区域 -->
    <div class="sidebar-content">
      <ConversationList :items="conversations" :active="conversationId" />
    </div>

    <!-- 底部新对话按钮 -->
    <div class="sidebar-footer">
      <button class="new-chat-btn" @click="createNewChat">
        <span class="icon-[ri--add-line] w-5 h-5"></span>
        <span>新对话</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Conversation } from '@renderer/types/conversation';
import ConversationList from './ConversationList.vue';
import { useRoute, useRouter } from 'vue-router'
import { watch, ref } from 'vue';
import { Tab } from '@renderer/constants/tab';

const route = useRoute()
const router = useRouter()
const conversationId = ref<string>()

watch(() => route.fullPath, (newPath) => {
  if (newPath.includes(Tab.CONVERSATION)) {
    const id = newPath.split('/').pop() || ''
    if (id) {
      conversationId.value = id
    }
  } else {
    conversationId.value = undefined
  }
})

const createNewChat = () => {
  router.push('/')
}

defineProps<{
  conversations: Conversation[]
}>()
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 标题区域 */
.sidebar-header {
  padding: 1.5rem 1.25rem 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* 对话列表区域 */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1.25rem;
  min-height: 0;
  /* 重要：确保flex子项可以收缩 */
}

/* 底部按钮区域 */
.sidebar-footer {
  padding: 1rem 1.25rem 1.5rem 1.25rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-primary);
  flex-shrink: 0;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1.5px solid var(--border-color);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.new-chat-btn::before {
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
}

.new-chat-btn:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 127, 222, 0.15);
}

.new-chat-btn:hover::before {
  opacity: 0.1;
}

.new-chat-btn:hover {
  color: var(--color-primary);
}

.new-chat-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 6px rgba(79, 127, 222, 0.2);
}

.new-chat-btn span {
  position: relative;
  z-index: 1;
}

/* 自定义滚动条 */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
  margin: 0.5rem 0;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
  transition: all var(--transition-normal);
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 240px;
  }

  .sidebar-header,
  .sidebar-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .sidebar-content {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .new-chat-btn {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
