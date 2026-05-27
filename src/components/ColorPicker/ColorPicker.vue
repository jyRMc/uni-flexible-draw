<template>
  <div ref="rootRef" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { mountNativeColorPicker, type NativeColorPickerInstance } from './native'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const rootRef = ref<HTMLElement | null>(null)
let picker: NativeColorPickerInstance | null = null

onMounted(() => {
  if (!rootRef.value) return
  picker = mountNativeColorPicker(rootRef.value, {
    value: props.modelValue,
    onChange: (value) => emit('update:modelValue', value),
  })
})

watch(() => props.modelValue, (value) => {
  if (!picker) return
  if (picker.getValue() === value) return
  picker.setValue(value)
})

onUnmounted(() => {
  picker?.destroy()
  picker = null
})
</script>
