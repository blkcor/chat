<template>
  <div class="theme-switch">
    <button
      class="btn-secondary flex items-center justify-between px-3 py-2 w-full"
      @click="toggleTheme"
    >
      <span>{{ isDarkTheme ? '切换为浅色模式' : '切换为深色模式' }}</span>
      <span class="theme-icon">{{ isDarkTheme ? '🌞' : '🌙' }}</span>
    </button>

    <div class="theme-options mt-4" v-if="showAdvancedOptions">
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="isHighContrast"
            class="theme-checkbox"
          />
          <span>高对比度模式</span>
        </label>

        <div class="theme-colors mt-2">
          <span class="text-[0.75rem] text-secondary">主题色</span>
          <div class="flex gap-2 mt-1">
            <div
              v-for="color in themeColors"
              :key="color.name"
              class="color-option rounded-full w-5 h-5 cursor-pointer border border-theme"
              :style="{ backgroundColor: color.value }"
              :title="color.name"
              @click="setCustomColor(color)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <button
      @click="showAdvancedOptions = !showAdvancedOptions"
      class="text-[0.75rem] text-[var(--text-secondary)] mt-2 hover:text-[var(--text-accent)] focus:outline-none"
    >
      {{ showAdvancedOptions ? '隐藏高级选项' : '显示高级选项' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isDarkTheme: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isDarkTheme', value: boolean): void;
  (e: 'click', event: MouseEvent): void;
}>();

const showAdvancedOptions = ref(false);
const isHighContrast = ref(false);

const themeColors = [
  { name: '蓝色', value: '#1967d2' },
  { name: '紫色', value: '#8e24aa' },
  { name: '绿色', value: '#0f9d58' },
  { name: '红色', value: '#d93025' },
  { name: '橙色', value: '#e37400' }
];

const toggleTheme = (event: MouseEvent) => {
  emit('click', event);
};

const setCustomColor = (color: { name: string; value: string }) => {
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
</script>

<style scoped>
.theme-switcher {
  width: 100%;
}

.theme-icon {
  font-size: 1rem;
  margin-left: 0.5rem;
}

.theme-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-primary);
}

.color-option {
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.2);
}
</style>
