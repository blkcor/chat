<template>
  <header class="header-container">
    <div class="header-content">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo">
          <div class="logo-icon">
            <span class="icon-[hugeicons--chat-bot] w-6 h-6"></span>
          </div>
          <span class="logo-text">ChatApp</span>
        </div>

        <!-- 导航区域 -->
        <nav class="nav-section">
          <router-link to="/" class="nav-item" :class="{ 'nav-item--active': currentTab === Tab.HOME }">
            <span class="nav-item__icon icon-[hugeicons--chat-bot] w-4 h-4"></span>
            <span class="nav-item__text">聊天</span>
          </router-link>

          <router-link to="/setting" class="nav-item" :class="{ 'nav-item--active': currentTab === Tab.SETTING }">
            <span class="nav-item__icon icon-[lets-icons--setting-line] w-4 h-4"></span>
            <span class="nav-item__text">设置</span>
          </router-link>
        </nav>
      </div>

      <!-- 右侧控制区域 -->
      <div class="controls-section">
        <ThemeSwitcher :isDarkTheme="isDarkMode" @click="toggleDarkMode" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useRoute } from 'vue-router'
import { ref, watch } from 'vue'
import { Tab } from '@renderer/constants/tab'

const currentTab = ref<Tab>(Tab.HOME)

const route = useRoute()
watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath.includes('setting')) {
      currentTab.value = Tab.SETTING
    } else {
      currentTab.value = Tab.HOME
    }
  }
)

defineProps<{
  isDarkMode: boolean
  toggleDarkMode: (event: MouseEvent) => void
}>()
</script>

<style scoped>
/* Header 容器 */
.header-container {
  height: var(--header-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 100;
}

.header-content {
  height: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo 区域 */
.logo-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all var(--transition-normal);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: var(--text-on-primary);
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(79, 127, 222, 0.3);
  transition: all var(--transition-normal);
}

.logo:hover .logo-icon {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(79, 127, 222, 0.4);
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

/* 导航区域 */
.nav-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  opacity: 0;
  transition: all var(--transition-normal);
  z-index: -1;
}

.nav-item:hover {
  color: var(--text-primary);
  transform: translateY(-1px);
}

.nav-item:hover::before {
  opacity: 0.1;
}

.nav-item--active {
  color: var(--color-primary);
  background: var(--bg-accent);
  box-shadow: 0 1px 3px rgba(79, 127, 222, 0.1);
}

.nav-item--active::before {
  opacity: 0.15;
}

.nav-item__icon {
  transition: all var(--transition-normal);
}

.nav-item:hover .nav-item__icon,
.nav-item--active .nav-item__icon {
  transform: scale(1.1);
}

.nav-item__text {
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* 控制区域 */
.controls-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .logo-section {
    gap: 1rem;
  }

  .nav-section {
    gap: 0.25rem;
  }

  .nav-item {
    padding: 0.375rem 0.625rem;
    font-size: 0.8rem;
  }

  .nav-item__text {
    display: none;
  }
}
</style>
