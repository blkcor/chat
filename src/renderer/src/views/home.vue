<template>
  <div class="flex items-center justify-center h-full gap-2">
    <ProviderSelect v-model="modelValue" :providers="providers" />
    <button @click="handleStartChat" class="btn-primary cursor-pointer">开始对话吧!</button>
  </div>
</template>

<script setup lang="ts">
import ProviderSelect from '@renderer/components/ProviderSelect.vue'
import { db } from '@renderer/stores/db'
import { Provider } from '@renderer/types/provider'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { generateConversationId } from '@renderer/utils/idUtils'
import { now } from '@renderer/utils/dateUtils'

const router = useRouter()
const modelValue = ref<{
  providerId: string,
  model: string
} | null>(null)
const providers = ref<Provider[]>([])

const handleStartChat = async () => {
  // 校验参数
  if (!modelValue.value) {
    alert('请选择模型')
    return
  }

  // 创建conversation
  const conversationId = generateConversationId()
  const currentTime = now()

  await db.conversations.add({
    id: conversationId,
    title: '新的对话',
    selectedModel: modelValue.value?.model,
    createdAt: currentTime,
    updatedAt: currentTime,
    providerId: modelValue.value?.providerId
  })

  // 跳转到新创建的对话
  router.push(`/conversation/${conversationId}`)
}

onMounted(async () => {
  providers.value = await db.providers.toArray()
})
</script>
