<script setup lang="ts">
import { Provider } from '../types/provider';
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'radix-vue'



defineProps<{ providers: Array<Provider> }>()
</script>

<template>
  <SelectRoot>
    <SelectTrigger
      class="inline-flex min-w-[160px] items-center justify-between rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-grass-200 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-green9 outline-none"
      aria-label="Customise options">
      <SelectValue placeholder="Select a fruit..." />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="min-w-[160px] bg-white rounded shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade z-[100]"
        :side-offset="5">
        <SelectScrollUpButton class="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
        </SelectScrollUpButton>

        <SelectViewport class="p-[5px]">
          <template v-for="provider in providers" :key="provider.id">
            <SelectLabel class="px-[25px] text-xs leading-[25px] flex items-center gap-2">
              <img class="w-3 h-3" :src="provider.avatar" alt="provider img">
              <span class="flex-1">{{ provider.name }}</span>
            </SelectLabel>
            <SelectGroup>
              <SelectItem v-for="(model, index) in provider.models" :key="index"
                class="text-[13px] leading-none text-grass11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-green9 data-[highlighted]:text-green1"
                :value="model">
                <SelectItemIndicator class="absolute left-0 w-[25px] inline-flex items-center justify-center">
                </SelectItemIndicator>
                <SelectItemText>
                  {{ model }}
                </SelectItemText>
              </SelectItem>
            </SelectGroup>
          </template>
          <SelectSeparator class="h-[1px] bg-green6 m-[5px]" />
        </SelectViewport>

        <SelectScrollDownButton class="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
