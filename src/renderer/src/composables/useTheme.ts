import { ref, onMounted } from 'vue'

interface ThemeOptions {
  /**
   * 是否在组件挂载时自动初始化主题（从localStorage或系统偏好中）
   * @default true
   */
  initOnMounted?: boolean
}

/**
 * 主题管理组合式函数
 * 提供暗黑模式状态管理和切换功能
 */
export const useTheme = (options: ThemeOptions = { initOnMounted: true }) => {
  // 初始状态从系统偏好获取
  const isDarkMode = ref<boolean>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  /**
   * 从本地存储和系统偏好中初始化主题设置
   */
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme-preference')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
      document.documentElement.classList.toggle('dark', isDarkMode.value)
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    }
  }

  /**
   * 切换暗黑模式
   * @param event 鼠标事件，用于获取动画起始点
   */
  const toggleDarkMode = (event: MouseEvent) => {
    const shouldBeDark = !isDarkMode.value

    // 保存用户偏好到本地存储
    localStorage.setItem('theme-preference', shouldBeDark ? 'dark' : 'light')

    // 更新DOM类
    document.documentElement.classList.toggle('dark', shouldBeDark)

    // 检查浏览器是否支持 View Transitions API
    // @ts-ignore - View Transitions API 可能在 TypeScript 类型定义中不存在
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

    try {
      // 创建过渡动画，在回调中切换主题
      // @ts-ignore - View Transitions API 可能在 TypeScript 类型定义中不存在
      const transition = document.startViewTransition(() => {
        isDarkMode.value = shouldBeDark
      })

      // 动画准备就绪后，添加自定义动画
      transition.ready
        .then(() => {
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
        .catch((error) => {
          console.error('动画过渡出错:', error)
          // 确保即使动画失败，主题状态也会更新
          isDarkMode.value = shouldBeDark
        })
    } catch (error) {
      console.error('View Transitions API 错误:', error)
      // 如果 API 调用失败，确保主题状态仍然更新
      isDarkMode.value = shouldBeDark
    }
  }

  /**
   * 设置主题模式（不带动画效果）
   * @param dark 是否为暗黑模式
   */
  const setDarkMode = (dark: boolean) => {
    isDarkMode.value = dark
    localStorage.setItem('theme-preference', dark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', dark)
  }

  // 如果设置了自动初始化，则在组件挂载时初始化主题
  if (options.initOnMounted) {
    onMounted(() => {
      initTheme()
    })
  }

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    initTheme
  }
}
