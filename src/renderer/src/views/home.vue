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

const modelValue = ref<string>('')
const providers = ref<Provider[]>([])

const handleStartChat = () => {
  // 校验参数
  console.log('当前选择的模型是:', modelValue.value)
}

onMounted(async () => {
  providers.value = await db.providers.toArray()
})
</script>
