<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import ConversationList from './components/ConversationList.vue'

// Mock data for conversations
const conversations = [
  { id: 1, title: 'Conversation 1', selectedModel: 'Model A', createdAt: '2023-01-01', updatedAt: '2023-01-02', providerId: 1 },
  { id: 2, title: 'Conversation 2', selectedModel: 'Model B', createdAt: '2023-01-03', updatedAt: '2023-01-04', providerId: 2 }
]

const isDarkMode = ref(false)

const toggleDarkMode = (event: MouseEvent) => {
  // Check for View Transitions API support
  if (!document.startViewTransition) {
    isDarkMode.value = !isDarkMode.value
    return
  }

  // 获取鼠标点击时的位置
  const x = event.clientX
  const y = event.clientY

  // 计算从点击位置到屏幕最远角的半径
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transition = document.startViewTransition(() => {
    isDarkMode.value = !isDarkMode.value
  })

  transition.ready.then(() => {
    const clipPath = [
      // 初始状态：半径为0的圆
      `circle(0px at ${x}px ${y}px)`,
      // 结束状态：覆盖全屏幕的圆
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]
    document.documentElement.animate(
      {
        clipPath: isDarkMode.value ? clipPath : [...clipPath].reverse()
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: isDarkMode.value
          ? '::view-transition-new(root)'
          : '::view-transition-old(root)'
      }
    )
  })
}

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDarkMode.value)
})
</script>

<template>
  <div class="flex flex-col h-screen w-screen bg-[var(--bg-color)] text-[var(--font-color)]">
    <header
      class="px-4 py-3 border-b border-[var(--border-color)] flex items-center gap-6 bg-[var(--bg-color-secondary)] h-[var(--header-height)] flex-shrink-0"
    >
      <a href="#" class="no-underline text-[var(--font-color-secondary)] font-medium">Link 1</a>
      <a href="#" class="no-underline text-[var(--font-color-secondary)] font-medium">Link 2</a>
      <a href="#" class="no-underline text-[var(--font-color-secondary)] font-medium">Link 3</a>
    </header>
    <main class="flex flex-grow overflow-hidden">
      <aside
        class="w-[var(--sidebar-width)] flex-shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-color-tertiary)] flex flex-col justify-between"
      >
        <div class="p-4 overflow-y-auto">
          <ConversationList :items="conversations" />
        </div>
        <footer class="p-4 border-t border-[var(--border-color)]">
          <button
            @click="toggleDarkMode"
            class="w-full p-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-color-secondary)] text-[var(--font-color)] cursor-pointer transition-colors hover:bg-[var(--item-hover-bg)]"
          >
            {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
          </button>
        </footer>
      </aside>
      <section
        class="flex-grow p-6 overflow-y-auto flex flex-col items-center justify-center text-center text-[var(--font-color-secondary)]"
      >
        <h1>Chat Area</h1>
        <p>Select a conversation to start chatting.</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
</style>
