  <script setup lang="ts">
  import { ref } from 'vue'
  import {
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectItemIndicator,
    SelectItemText,
    SelectLabel,
    SelectPortal,
    SelectRoot,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectTrigger,
    SelectValue,
    SelectViewport,
    SelectSeparator
  } from 'radix-vue'
  import { Provider } from '../types/provider'

  defineProps<{ providers: Array<Provider> }>()
  const model = defineModel<{ providerId: string; model: string } | null>()
  const isOpenMenu = ref(false)

  const handleValueChange = (value: string) => {
    const [providerId, modelName] = value.split('::')
    model.value = { providerId, model: modelName }
  }
</script>

<template>
  <SelectRoot v-model:open="isOpenMenu" @update:model-value="handleValueChange">
    <!-- 触发器 -->
    <SelectTrigger class="inline-flex min-w-[220px] items-center justify-between rounded-xl px-4 py-2 text-sm
             bg-gradient-to-br from-primary to-secondary border border-border-color
             shadow-sm hover:brightness-105 hover:shadow-md
             transition-all duration-200 cursor-pointer focus:outline-none
             focus:ring-2 focus:ring-color-primary" aria-label="选择模型">
      <SelectValue placeholder="请选择模型..." />
      <span class="icon-[lucide--chevron-down] w-4 h-4 ml-2 text-muted transition-transform duration-200"
        :class="[isOpenMenu ? 'rotate-180' : '']" />
    </SelectTrigger>

    <!-- 下拉菜单 -->
    <SelectPortal>
      <SelectContent side="bottom" position="popper" align="start" :side-offset="6" class="min-w-[220px] rounded-xl shadow-lg border border-border-color
               bg-primary/95 backdrop-blur-sm z-50 animate-in fade-in-0 zoom-in-95 duration-150">

        <SelectScrollUpButton
          class="flex items-center justify-center h-6 text-muted hover:text-primary transition-colors">
          <span class="icon-[lucide--chevron-up] w-4 h-4" />
        </SelectScrollUpButton>

        <SelectViewport class="p-2 max-h-[30vh] overflow-y-auto">
          <template v-for="(provider, pIndex) in providers" :key="provider.id">
            <!-- Provider 头 -->
            <SelectLabel class="px-3 py-1.5 text-xs font-semibold text-muted flex items-center gap-2">
              <img class="w-4 h-4 rounded-full" :src="provider.avatar" />
              {{ provider.title }}
            </SelectLabel>

            <!-- 模型列表 -->
            <SelectGroup>
              <SelectItem v-for="modelName in provider.models" :key="modelName" :value="`${provider.id}::${modelName}`"
                class="relative flex items-center h-9 px-3 rounded-lg cursor-pointer text-sm text-primary
                       outline-none transition-all duration-150
                       data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-accent/20 data-[highlighted]:to-accent/5
                       data-[highlighted]:text-accent hover:shadow-sm  hover:bg-gray-500/50">
                <SelectItemIndicator class="absolute left-0 w-6 flex items-center justify-center text-accent">
                  <span class="icon-[lucide--check] w-4 h-4"></span>
                </SelectItemIndicator>
                <SelectItemText class="pl-5">{{ modelName }}</SelectItemText>
              </SelectItem>
            </SelectGroup>

            <!-- 分隔线 -->
            <SelectSeparator v-if="pIndex < providers.length - 1" class="h-px bg-border-color/30 my-2" />
          </template>
        </SelectViewport>

        <SelectScrollDownButton
          class="flex items-center justify-center h-6 text-muted hover:text-primary transition-colors">
          <span class="icon-[lucide--chevron-down] w-4 h-4"></span>
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
