import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref<boolean>(false)

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

  // 切换主题
  const toggleDarkMode = (event?: MouseEvent) => {
    // 获取当前isDarkMode的值，以便在动画中使用正确的顺序
    const shouldBeDark = !isDarkMode.value

    // Check for View Transitions API support
    if (!event || !document.startViewTransition) {
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

  // 初始化主题
  const initTheme = () => {
    checkSystemPreference()

    // 监听系统主题变化，但只在用户没有设置偏好时才应用
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // 只有当用户没有明确设置主题偏好时，才跟随系统变化
        if (!localStorage.getItem('theme-preference')) {
          isDarkMode.value = e.matches
        }
      })
    }

    // 当isDarkMode改变时，保存偏好并更新DOM
    watchEffect(() => {
      // 保存用户偏好到本地存储
      localStorage.setItem('theme-preference', isDarkMode.value ? 'dark' : 'light')

      // 更新DOM类
      document.documentElement.classList.toggle('dark', isDarkMode.value)
    })
  }

  return {
    isDarkMode,
    toggleDarkMode,
    initTheme
  }
})
