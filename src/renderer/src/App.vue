<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import ConversationList from './components/ConversationList.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import ChatMessageCard from './components/ChatMessageCard.vue'

// Mock data for conversations
const conversations = [
  { id: 1, title: 'Conversation 1', selectedModel: 'Model A', createdAt: '2023-01-01', updatedAt: '2023-01-02', providerId: 1 },
  { id: 2, title: 'Conversation 2', selectedModel: 'Model B', createdAt: '2023-01-03', updatedAt: '2023-01-04', providerId: 2 }
]

const isDarkMode = ref(false)

const toggleDarkMode = (event: MouseEvent) => {
  // 获取当前isDarkMode的值，以便在动画中使用正确的顺序
  const shouldBeDark = !isDarkMode.value

  // Check for View Transitions API support
  if (!document.startViewTransition) {
    // 如果不支持View Transitions API，直接切换主题
    isDarkMode.value = shouldBeDark
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

  // 创建过渡动画，在回调中切换主题
  const transition = document.startViewTransition(() => {
    // 在过渡中更改isDarkMode的值，确保与动画同步
    isDarkMode.value = shouldBeDark
  })

  // 动画准备就绪后，添加自定义动画
  transition.ready.then(() => {
    const clipPath = [
      // 初始状态：半径为0的圆
      `circle(0px at ${x}px ${y}px)`,
      // 结束状态：覆盖全屏幕的圆
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]
    document.documentElement.animate(
      {
        clipPath: shouldBeDark ? clipPath : [...clipPath].reverse()
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: shouldBeDark
          ? '::view-transition-new(root)'
          : '::view-transition-old(root)'
      }
    )
  })
}

// 检测系统主题偏好和保存用户主题偏好
const checkSystemPreference = () => {
  // 首先检查本地存储中是否有用户的主题偏好
  const savedTheme = localStorage.getItem('theme-preference')

  if (savedTheme) {
    // 如果有保存的偏好，使用它
    isDarkMode.value = savedTheme === 'dark'
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // 否则使用系统偏好
    isDarkMode.value = true
  }
}

// 在挂载时检测主题偏好
checkSystemPreference()

// 监听系统主题变化，但只在用户没有设置偏好时才应用
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // 只有当用户没有明确设置主题偏好时，才跟随系统变化
    if (!localStorage.getItem('theme-preference')) {
      isDarkMode.value = e.matches
    }
  })
}

// 当isDarkMode改变时，保存偏好并更新DOM
watchEffect(() => {
  console.log('isDarkMode changed:', isDarkMode.value)

  // 保存用户偏好到本地存储
  localStorage.setItem('theme-preference', isDarkMode.value ? 'dark' : 'light')

  // 更新DOM类
  document.documentElement.classList.toggle('dark', isDarkMode.value)
})
</script>

<template>
  <div class="flex flex-col h-screen w-screen bg-primary text-primary">
    <!-- 调试信息，可以在生产环境中移除 -->
    <div v-if="false" class="fixed top-0 right-0 bg-primary p-2 text-xs border border-theme z-50">
      当前主题: {{ isDarkMode ? '深色' : '浅色' }}
    </div>
    <header
      class="px-4 py-3 border-b border-theme flex items-center gap-6 bg-secondary h-[var(--header-height)] flex-shrink-0"
    >
      <a href="#" class="no-underline text-secondary font-medium hover:text-accent transition-colors">Link 1</a>
      <a href="#" class="no-underline text-secondary font-medium hover:text-accent transition-colors">Link 2</a>
      <a href="#" class="no-underline text-secondary font-medium hover:text-accent transition-colors">Link 3</a>
    </header>
    <main class="flex flex-grow overflow-hidden">
      <aside
        class="w-[var(--sidebar-width)] flex-shrink-0 border-r border-theme bg-tertiary flex flex-col justify-between"
      >
        <div class="p-4 overflow-y-auto">
          <ConversationList :items="conversations" />
        </div>
        <footer class="p-4 border-t border-theme">
          <ThemeSwitcher
            :isDarkTheme="isDarkMode"
            @update:isDarkTheme="isDarkMode = $event"
            @click="toggleDarkMode"
          />
        </footer>
      </aside>
      <section
        class="flex-grow p-6 overflow-y-auto flex flex-col text-secondary"
      >
        <div v-if="conversations.length === 0" class="flex items-center justify-center h-full">
          <div class="card p-6 max-w-md text-center">
            <h1 class="text-primary text-xl font-medium mb-2">开始聊天</h1>
            <p>没有对话记录，请开始新的对话</p>
            <button class="btn-primary mt-4">新建对话</button>
          </div>
        </div>

        <div v-else class="max-w-3xl mx-auto w-full">
          <h1 class="text-xl font-medium mb-4 text-primary">{{ conversations[0].title }}</h1>

          <div class="chat-messages">
            <ChatMessageCard
              content="你好，我能帮你什么忙吗？"
              timestamp="2025-08-09T12:00:00"
              :is-user-message="false"
              model="AI助手"
            />

            <ChatMessageCard
              content="我想了解一下如何使用暗色模式和浅色模式。"
              timestamp="2025-08-09T12:01:00"
              :is-user-message="true"
            />

            <ChatMessageCard
              content="您现在正在使用的应用已经支持了暗色和浅色模式切换。您可以通过点击左下角的切换按钮来更改主题。此外，系统还会自动检测您的系统偏好设置，并相应地应用主题。"
              timestamp="2025-08-09T12:02:00"
              :is-user-message="false"
              model="AI助手"
            />
          </div>

          <div class="chat-input mt-4">
            <div class="card p-3 flex items-center">
              <input
                type="text"
                placeholder="输入消息..."
                class="flex-grow bg-transparent border-none outline-none text-primary"
              />
              <button class="btn-primary ml-2 py-1">发送</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
</style>
