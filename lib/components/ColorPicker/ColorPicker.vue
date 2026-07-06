<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { type NativeColorPickerInstance, mountNativeColorPicker } from './native'
import { useLocale } from '#/locale';

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const rootRef = ref<HTMLElement | null>(null)
let picker: NativeColorPickerInstance | null = null

const t = useLocale()
onMounted(() => {
  if (!rootRef.value)
    return
  picker = mountNativeColorPicker(rootRef.value, {
    value: props.modelValue,
    onChange: value => emit('update:modelValue', value),
    t
  })
})

watch(() => props.modelValue, (value) => {
  if (!picker)
    return
  if (picker.getValue() === value)
    return
  picker.setValue(value)
})

onUnmounted(() => {
  picker?.destroy()
  picker = null
})
</script>

<template>
  <div ref="rootRef" />
</template>
