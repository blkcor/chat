<script setup lang="ts">
import SideBar from './components/SideBar.vue'
import Header from './components/Header.vue'
import { onMounted } from 'vue'
import { initProvider } from './stores/db'
import { useThemeStore, useConversationStore } from './stores'

// 使用 Pinia stores
const themeStore = useThemeStore()
const conversationStore = useConversationStore()

onMounted(async () => {
  // 初始化主题
  themeStore.initTheme()

  // 初始化providers
  await initProvider()

  // 加载对话列表
  await conversationStore.loadConversations()
})
</script>

<template>
  <div class="app-container">
    <Header class="app-header" />
    <main class="app-main">
      <SideBar />
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
