<template>
  <div ref="minimapRef" class="mini-map" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const minimapRef = ref<HTMLElement | null>(null)

defineExpose({
  minimapRef,
})
</script>

<style scoped>
.mini-map {
  position: absolute;
  right: 12px;
  bottom: 52px;
  width: 200px;
  height: 150px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  z-index: 10;
}
</style>
