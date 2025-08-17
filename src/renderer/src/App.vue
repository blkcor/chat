<script setup lang="ts">
import SideBar from './components/SideBar.vue'
import Header from './components/Header.vue'
import { useTheme } from './composables/useTheme'
import { onMounted, ref } from 'vue'
import { db, initProvider } from './stores/db'
import { Conversation } from './types/conversation'

// 使用主题组合式函数，自动初始化主题
const { isDarkMode, toggleDarkMode } = useTheme()
const conversations = ref<Conversation[]>([])

onMounted(async () => {
  // 初始化providers
  await initProvider()
  // 获取conversationList
  const conversationList = await db.conversations.toArray()
  conversations.value = conversationList
})
</script>

<template>
  <div class="app-container">
    <Header :isDarkMode="isDarkMode" :toggleDarkMode="toggleDarkMode" class="app-header" />
    <main class="app-main">
      <SideBar :conversations="conversations" />
      <section class="app-content">
        <router-view />
      </section>
    </main>
  </div>
</template>

<style scoped>
/* 应用布局样式 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.app-header {
  flex-shrink: 0;
  /* 防止Header被挤压 */
  height: var(--header-height);
  /* 确保固定高度 */
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  /* 重要：允许flex子项正确收缩 */
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  /* 重要：允许flex子项正确收缩 */
}

/* SVG 图标样式 */
svg {
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: all var(--transition-normal);
}

a:hover svg,
button:hover svg {
  stroke: var(--color-primary);
}

.active-link svg {
  stroke: var(--color-primary);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}
</style>
