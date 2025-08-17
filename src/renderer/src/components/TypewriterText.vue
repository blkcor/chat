<template>
  <span class="typewriter-text" v-html="formattedText"></span>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted } from 'vue'

const props = defineProps<{
  text: string
  speed?: number // 打字速度，毫秒
  isComplete?: boolean // 是否已经完成流式传输
}>()

const emit = defineEmits<{
  'typing-complete': []
}>()

const displayedLength = ref(0)
let animationId: number | null = null
let lastUpdateTime = 0
let hasEmittedComplete = false

const formattedText = computed(() => {
  const text = props.text.slice(0, displayedLength.value)
  // 保持换行符
  return text.replace(/\n/g, '<br>')
})

const animate = (currentTime: number) => {
  if (currentTime - lastUpdateTime >= (props.speed || 30)) {
    if (displayedLength.value < props.text.length) {
      displayedLength.value++
      lastUpdateTime = currentTime
    } else if (props.isComplete && !hasEmittedComplete) {
      // 打字完成且流式传输也完成了
      hasEmittedComplete = true
      emit('typing-complete')
      return
    }
  }

  if (displayedLength.value < props.text.length || !props.isComplete) {
    animationId = requestAnimationFrame(animate)
  }
}

const startAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  lastUpdateTime = 0
  hasEmittedComplete = false
  animationId = requestAnimationFrame(animate)
}

// 监听文本变化
watch(() => props.text, (newText, oldText) => {
  if (newText.length > displayedLength.value) {
    // 文本增加了，继续动画
    startAnimation()
  } else if (newText !== oldText && newText.length < (oldText?.length || 0)) {
    // 文本减少了，重置
    displayedLength.value = 0
    startAnimation()
  }
}, { immediate: true })

// 监听完成状态
watch(() => props.isComplete, (isComplete) => {
  if (isComplete && displayedLength.value >= props.text.length && !hasEmittedComplete) {
    hasEmittedComplete = true
    emit('typing-complete')
  } else if (isComplete && displayedLength.value < props.text.length) {
    // 如果还没打完但已经完成传输，继续打字直到完成
    startAnimation()
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped>
.typewriter-text {
  display: inline;
}
</style>
