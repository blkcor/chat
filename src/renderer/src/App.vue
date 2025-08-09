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

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transition = document.startViewTransition(() => {
    isDarkMode.value = !isDarkMode.value
  })

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
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
  <div class="app-container">
    <header class="app-header">
      <a href="#">Link 1</a>
      <a href="#">Link 2</a>
      <a href="#">Link 3</a>
    </header>
    <main class="app-main">
      <aside class="sidebar">
        <div class="sidebar-content">
          <ConversationList :items="conversations" />
        </div>
        <footer class="sidebar-footer">
          <button @click="toggleDarkMode" class="theme-toggle-btn">
            {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
          </button>
        </footer>
      </aside>
      <section class="chat-area">
        <h1>Chat Area</h1>
        <p>Select a conversation to start chatting.</p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
  color: var(--font-color);
}

.app-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--bg-color-secondary);
  height: var(--header-height);
  flex-shrink: 0;
}

.app-header a {
  text-decoration: none;
  color: var(--font-color-secondary);
  font-weight: 500;
}

.app-main {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
  background-color: var(--bg-color-tertiary);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sidebar-content {
  padding: 1rem;
  overflow-y: auto;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.theme-toggle-btn {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--bg-color-secondary);
  color: var(--font-color);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.theme-toggle-btn:hover {
  background-color: var(--item-hover-bg);
}

.chat-area {
  flex-grow: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--font-color-secondary);
}
</style>