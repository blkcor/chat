import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Tab } from '@renderer/constants/tab'

export const useAppStore = defineStore('app', () => {
  // 状态
  const currentTab = ref<Tab>(Tab.HOME)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Actions
  const setCurrentTab = (tab: Tab) => {
    currentTab.value = tab
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    currentTab,
    isLoading,
    error,

    // Actions
    setCurrentTab,
    setLoading,
    setError,
    clearError
  }
})
