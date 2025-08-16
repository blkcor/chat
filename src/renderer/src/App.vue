<script setup lang="ts">
import SideBar from './components/SideBar.vue'
import Header from './components/Header.vue'
import { useTheme } from './composables/useTheme'

// Mock data for conversations
const conversations = [
  {
    id: 'adadsadasda',
    title: 'Conversation 1',
    selectedModel: 'Model A',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
    providerId: 'dasdasdasd'
  },
  {
    id: 'dasdasdas',
    title: 'Conversation 2',
    selectedModel: 'Model B',
    createdAt: '2023-01-03',
    updatedAt: '2023-01-04',
    providerId: 'dasdasdasda'
  }
]

// 使用主题组合式函数，自动初始化主题
const { isDarkMode, toggleDarkMode } = useTheme()
</script>

<template>
  <div class="flex flex-col h-screen w-screen bg-primary text-primary">
    <Header :isDarkMode="isDarkMode" :toggleDarkMode="toggleDarkMode" />
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
