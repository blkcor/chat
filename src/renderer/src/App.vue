<script setup lang="ts">
import SideBar from './components/SideBar.vue'
import Header from './components/Header.vue'

// Mock data for conversations
const conversations = [
  { id: 1, title: 'Conversation 1', selectedModel: 'Model A', createdAt: '2023-01-01', updatedAt: '2023-01-02', providerId: 1 },
  { id: 2, title: 'Conversation 2', selectedModel: 'Model B', createdAt: '2023-01-03', updatedAt: '2023-01-04', providerId: 2 }
]

// 主题管理现在由 Header 组件处理，这里只需要初始化
const checkSystemPreference = () => {
  const savedTheme = localStorage.getItem('theme-preference')
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
}

// 在挂载时检测主题偏好
checkSystemPreference()
</script>

<template>
  <div class="flex flex-col h-screen w-screen bg-primary text-primary">
    <Header />
    <main class="flex flex-grow overflow-hidden">
      <SideBar :conversations="conversations" />
      <section class="flex-grow flex flex-col relative">
        <router-view />
      </section>
    </main>
  </div>
</template>

<style scoped>
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
