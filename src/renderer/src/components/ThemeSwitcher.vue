<template>
  <div class="flex items-center gap-2 text-nowrap">
    <button class="flex items-center justify-between px-3 py-2 w-full" @click="toggleTheme">
      <span :class="[isDarkTheme ? 'icon-[basil--sun-outline]' : 'icon-[tabler--moon]', 'w-5 h-5 cursor-pointer']" />
    </button>

    <button @click="toggleAdvancedOptions" ref="toggleButton"
      class="text-[0.75rem] text-secondary hover:text-[var(--text-accent)] focus:outline-none cursor-pointer">
      {{ showAdvancedOptions ? '隐藏高级选项' : '高级选项' }}
    </button>

    <div v-if="showAdvancedOptions" ref="advancePanel"
      class="mt-1 z-10 absolute top-[var(--header-height)] right-0 bg-primary border-[1px] border-solid border-[var(--border-color)] rounded-md shadow-[0 4px 24px rgba(0,0,0,0.12)] p-1"
      @click.stop>
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="isHighContrast" class="w-4 h-4 accent-primary" />
          <span>高对比度模式</span>
        </label>

        <div class="theme-colors mt-2">
          <span class="text-[0.75rem] text-secondary">主题色</span>
          <div class="flex gap-2 mt-1">
            <div v-for="color in themeColors" :key="color.name"
              class="transition-all duration-200 shadow-[0 2px 4px rgba(0,0,0,0.1)] hover:scale-[1.2] hover:shadow-[0 4px 8px rgba(0,0,0,0.2)] rounded-full w-6 h-6 cursor-pointer border-2"
              :class="{ 'scale-[1.1] shadow-[0 0 2px var(--bg-primary), 0 0 0 4px var(--color-primary)]': isActiveColor(color.value), 'border-theme': !isActiveColor(color.value) }"
              :style="{ backgroundColor: color.value }" :title="color.name" @click="setCustomColor(color)">
              <div v-if="isActiveColor(color.value)" class="flex items-center justify-center h-full">
                <div class="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, useTemplateRef } from 'vue';

const props = defineProps<{
  isDarkTheme: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isDarkTheme', value: boolean): void;
  (e: 'click', event: MouseEvent): void;
}>();

const showAdvancedOptions = ref(false);
const advancePanelRef = useTemplateRef("advancePanel");
const toggleButtonRef = useTemplateRef("toggleButton");

// 点击外部关闭高级设置
function handleClickOutside(e: MouseEvent) {
  if (showAdvancedOptions.value && advancePanelRef.value && !advancePanelRef.value.contains(e.target as Node) && toggleButtonRef.value && !toggleButtonRef.value.contains(e.target as Node)) {
    showAdvancedOptions.value = false;
  }
}

function toggleAdvancedOptions() {
  showAdvancedOptions.value = !showAdvancedOptions.value;
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
const isHighContrast = ref(false);

const themeColors = [
  { name: '温和蓝', value: '#4f7fde' },
  { name: '薰衣紫', value: '#8b5cf6' },
  { name: '翠绿色', value: '#10b981' },
  { name: '珊瑚红', value: '#f43f5e' },
  { name: '琥珀橙', value: '#f59e0b' },
  { name: '青色', value: '#06b6d4' },
  { name: '玫瑰色', value: '#ec4899' }
];

const toggleTheme = (event: MouseEvent) => {
  emit('click', event);
};

// 保存当前选择的颜色
const currentColor = ref('#4f7fde'); // 默认温和蓝色

const setCustomColor = (color: { name: string; value: string }) => {
  // 更新当前选择的颜色
  currentColor.value = color.value;

  // 设置自定义主题色
  document.documentElement.style.setProperty('--color-primary', color.value);

  // 根据所选颜色自动生成不同色调
  const lighterColor = adjustColor(color.value, 15); // 调亮15%
  const darkerColor = adjustColor(color.value, -15); // 调暗15%

  document.documentElement.style.setProperty('--color-primary-hover', lighterColor);
  document.documentElement.style.setProperty('--color-primary-active', darkerColor);

  // 同步更新相关颜色
  if (props.isDarkTheme) {
    document.documentElement.style.setProperty('--text-accent', lighterColor);
  } else {
    document.documentElement.style.setProperty('--text-accent', color.value);
  }

  // 保存颜色偏好到本地存储
  localStorage.setItem('theme-color-preference', color.value);
};

// 检查是否是当前活动的颜色
const isActiveColor = (colorValue: string): boolean => {
  return currentColor.value === colorValue;
};

// 辅助函数：调整颜色亮度
function adjustColor(hex: string, percent: number): string {
  // 将十六进制颜色转换为RGB
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  // 调整亮度
  r = Math.min(255, Math.max(0, r + Math.round(percent / 100 * 255)));
  g = Math.min(255, Math.max(0, g + Math.round(percent / 100 * 255)));
  b = Math.min(255, Math.max(0, b + Math.round(percent / 100 * 255)));

  // 转回十六进制
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 监听高对比度模式
watch(isHighContrast, (newValue) => {
  document.documentElement.classList.toggle('high-contrast', newValue);
});

// 页面加载时恢复保存的主题色
const loadSavedThemeColor = () => {
  const savedColor = localStorage.getItem('theme-color-preference');
  if (savedColor) {
    const matchedColor = themeColors.find(color => color.value === savedColor);
    if (matchedColor) {
      currentColor.value = matchedColor.value;
      setCustomColor(matchedColor);
    } else {
      // 如果保存的颜色不在预定义颜色中，创建一个新的颜色对象
      const customColor = { name: '自定义', value: savedColor };
      setCustomColor(customColor);
    }
  }
};

// 在组件挂载时加载保存的主题色
loadSavedThemeColor();
</script>
