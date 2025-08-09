<script setup lang="ts">

const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-red-200">Hello Electron</h1>
    <button @click="ipcHandle">Send IPC</button>
  </div>
</template>

