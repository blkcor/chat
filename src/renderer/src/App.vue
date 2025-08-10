<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import ConversationList from './components/ConversationList.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import ChatMessageCard from './components/ChatMessageCard.vue'
import Header from './components/Header.vue'
import ProviderSelect from './components/ProviderSelect.vue'
import { Provider } from './types/provider'
// Mock data for conversations
const conversations = [
  { id: 1, title: 'Conversation 1', selectedModel: 'Model A', createdAt: '2023-01-01', updatedAt: '2023-01-02', providerId: 1 },
  { id: 2, title: 'Conversation 2', selectedModel: 'Model B', createdAt: '2023-01-03', updatedAt: '2023-01-04', providerId: 2 }
]

const providers: Array<Provider> = [
  {
    id: 1,
    name: "OpenAI",
    title: "你不知道opneai?",
    desc: "OpenAI是一个人工智能研究实验室，致力于推动数字智能的边界。",
    avatar: "https://openai.com/favicon.ico",
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
    models: [
      "GPT5",
      "GPT-4o"
    ]
  }
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
      class="px-4 py-3 border-b border-theme flex items-center justify-between bg-secondary h-[var(--header-height)] flex-shrink-0">
      <div class="flex items-center gap-6">
        <!-- 使用 Logo 文字替代纯文本链接，突出主题色 -->
        <a href="#" class="text-lg font-bold accent-hover transition-colors">
          <span class="text-accent">ChatApp</span>
        </a>

        <Header />
      </div>

      <!-- 右侧 ThemeSwitcher -->
      <div class="flex items-center">
        <ThemeSwitcher :isDarkTheme="isDarkMode" @update:isDarkTheme="isDarkMode = $event" @click="toggleDarkMode" />
      </div>
    </header>
    <main class="flex flex-grow overflow-hidden">
      <aside
        class="w-[var(--sidebar-width)] flex-shrink-0 border-r border-theme bg-tertiary flex flex-col justify-between">
        <div class="p-4 overflow-y-auto">
          <ConversationList :items="conversations" />
        </div>
        <footer class="p-4 border-t border-theme flex items-center justify-between">
          <button class="btn-secondary text-sm px-3 py-1">
            <span class="inline-block w-2 h-2 rounded-full bg-success mr-1"></span>
            在线
          </button>
        </footer>
      </aside>
      <section class="flex-grow flex flex-col relative">
        <div v-if="conversations.length !== 0" class="flex items-center justify-center h-full">
          <div class="card p-6 max-w-md text-center">
            <ProviderSelect :providers="providers" />
          </div>
        </div>

        <!-- TODO: 如果选中了conversation 加载并展示  否则展示模型选择下拉框 下面的内容需要封装组件-->
        <div v-if="false" class="flex flex-col h-full">
          <!-- 标题部分 -->
          <div class="p-4 border-b border-theme bg-secondary">
            <h1 class="text-xl font-medium text-primary">{{ conversations[0].title }}</h1>
          </div>

          <!-- 消息列表部分 - 使用flex-grow使其填充可用空间，底部增加足够的padding防止被输入框遮挡 -->
          <div class="flex-grow overflow-y-auto p-6 pb-32">
            <div class="max-w-3xl mx-auto w-full">
              <div class="chat-messages">
                <ChatMessageCard content="你好，我能帮你什么忙吗？" timestamp="2025-08-09T12:00:00" :is-user-message="false"
                  model="AI助手" />

                <ChatMessageCard content="我想了解一下如何使用暗色模式和浅色模式。" timestamp="2025-08-09T12:01:00"
                  :is-user-message="true" />

                <ChatMessageCard content="您现在正在使用的应用已经支持了暗色和浅色模式切换。您可以通过点击左下角的切换按钮来更改主题。此外，系统还会自动检测您的系统偏好设置，并相应地应用主题。"
                  timestamp="2025-08-09T12:02:00" :is-user-message="false" model="AI助手" />
              </div>
            </div>
          </div>

          <!-- 输入框部分 - 固定在底部 -->
          <div class="chat-input-container">
            <div class="max-w-3xl mx-auto w-full px-6">
              <div class="card p-3 flex items-center shadow-lg message-input-card">
                <input type="text" placeholder="输入消息..."
                  class="flex-grow bg-transparent border-none outline-none text-primary message-input" />
                <button class="btn-primary ml-2 py-1 px-4 flex items-center gap-1">
                  <span>发送</span>
                  <span class="icon-[ri--send-plane-line] w-5 h-5"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-md);
  transition: var(--transition-normal);
}

.nav-link:hover {
  background-color: var(--bg-accent);
  color: var(--color-primary);
}

.nav-link.active-link {
  color: var(--color-primary);
  background-color: var(--bg-accent);
  position: relative;
}

.nav-link.active-link::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-primary);
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

/* 聊天输入框容器样式 */
.chat-input-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  z-index: 10;
}

.message-input-card {
  transition: all var(--transition-normal);
  border-color: var(--border-color);
}

.message-input-card:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary-hover), var(--shadow-lg);
}

.message-input {
  caret-color: var(--color-primary);
  font-size: 0.95rem;
  transition: all var(--transition-normal);
}
</style>
