<template>
  <div class="flex  items-center justify-center h-full gap-2">
    <ProviderSelect v-model="modelValue" :providers="providers" />
    <button @click="handleStartChat" class="btn-primary  cursor-pointer">开始对话吧!</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Provider } from '../types/provider';

const modelValue = ref<string>('')

// 暂时hardcode一下 应该从api拉
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

const handleStartChat = () => {
  // 校验参数
  console.log("当前选择的模型是:", modelValue.value)
}


</script>
