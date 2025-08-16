<template>
  <header
    class="px-4 py-3 border-b border-theme flex items-center justify-between bg-secondary h-[var(--header-height)] flex-shrink-0"
  >
    <div class="flex items-center gap-6">
      <!-- 使用 Logo 文字替代纯文本链接，突出主题色 -->
      <a href="#" class="text-lg font-bold accent-hover transition-colors">
        <span class="text-accent">ChatApp</span>
      </a>
      <div class="flex items-center gap-6">
        <router-link
          to="/"
          class="nav-link flex items-center gap-1 accent-hover"
          :class="{ 'active-link': currentTab === Tab.HOME }"
        >
          <span class="icon-[hugeicons--chat-bot] w-5 h-5"></span>
          <span>聊天</span>
        </router-link>
        <!-- <a href="#" class="nav-link flex items-center gap-1 accent-hover">
          <span class="icon-[flowbite--life-saver-solid] w-5 h-5 "></span>
          <span>收藏</span>
        </a> -->
        <router-link
          to="/setting"
          class="nav-link flex items-center gap-1 accent-hover"
          :class="{ 'active-link': currentTab === Tab.SETTING }"
        >
          <span class="icon-[lets-icons--setting-line] w-5 h-5"></span>
          <span>设置</span>
        </router-link>
      </div>
    </div>

    <div class="flex items-center">
      <ThemeSwitcher :isDarkTheme="isDarkMode" @click="toggleDarkMode" />
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
