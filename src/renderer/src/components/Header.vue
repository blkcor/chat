<template>
  <header
    class="px-4 py-3 border-b border-theme flex items-center justify-between bg-secondary h-[var(--header-height)] flex-shrink-0">
    <div class="flex items-center gap-6">
      <!-- 使用 Logo 文字替代纯文本链接，突出主题色 -->
      <a href="#" class="text-lg font-bold accent-hover transition-colors">
        <span class="text-accent">ChatApp</span>
      </a>
      <div class="flex items-center gap-6">
        <a href="#" class="nav-link flex items-center gap-1 accent-hover" :class="{ 'active-link': true }">
          <span class="icon-[hugeicons--chat-bot] w-5 h-5"></span>
          <span>聊天</span>
        </a>
        <a href="#" class="nav-link flex items-center gap-1 accent-hover">
          <span class="icon-[flowbite--life-saver-solid] w-5 h-5 "></span>
          <span>收藏</span>
        </a>
        <a href="#" class="nav-link flex items-center gap-1 accent-hover">
          <span class="icon-[lets-icons--setting-line] w-5 h-5"></span>
          <span>设置</span>
        </a>
      </div>
    </div>

    <div class="flex items-center">
      <ThemeSwitcher :isDarkTheme="isDarkMode" @update:isDarkTheme="isDarkMode = $event" @click="toggleDarkMode" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ThemeSwitcher from './ThemeSwitcher.vue';

const isDarkMode = ref<boolean>(false)

// 检测系统主题偏好和保存用户主题偏好
const checkSystemPreference = () => {
  const savedTheme = localStorage.getItem('theme-preference')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
  }
}

// 初始化主题
checkSystemPreference()

const toggleDarkMode = (event: MouseEvent) => {
  const shouldBeDark = !isDarkMode.value

  // 保存用户偏好到本地存储
  localStorage.setItem('theme-preference', shouldBeDark ? 'dark' : 'light')

  // 更新DOM类
  document.documentElement.classList.toggle('dark', shouldBeDark)

  // Check for View Transitions API support
  if (!document.startViewTransition) {
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
    isDarkMode.value = shouldBeDark
  })

  // 动画准备就绪后，添加自定义动画
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
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
</script>

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
</style>
