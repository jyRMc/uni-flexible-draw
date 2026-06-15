const PRESETS = [
  '#ff4d4f',
  '#ff7875',
  '#ff9c6e',
  '#ffc069',
  '#ffd666',
  '#fff566',
  '#d3f261',
  '#95de64',
  '#52c41a',
  '#13c2c2',
  '#1677ff',
  '#2f54eb',
  '#722ed1',
  '#eb2f96',
  '#f5222d',
  '#fa8c16',
  '#fff1f0',
  '#fff7e6',
  '#fffbe6',
  '#f6ffed',
  '#e6fffb',
  '#e6f4ff',
  '#f0f5ff',
  '#f9f0ff',
  '#ffa39e',
  '#ffbb96',
  '#ffd591',
  '#ffe58f',
  '#fffb8f',
  '#eaff8f',
  '#b7eb8f',
  '#87e8de',
  '#69b1ff',
  '#85a5ff',
  '#b37feb',
  '#ff85c2',
  '#ff9c6e',
  '#ffd666',
  '#b7eb8f',
  '#87e8de',
  '#cf1322',
  '#d46b08',
  '#ad6800',
  '#5c8a00',
  '#006d75',
  '#0958d9',
  '#531dab',
  '#c41d7f',
]

const STYLE_ID = 'uni-draw-native-color-picker-style'
const POPUP_WIDTH = 296
const POPUP_GUTTER = 12

export interface NativeColorPickerOptions {
  value?: string
  onChange?: (value: string) => void
}

export interface NativeColorPickerInstance {
  root: HTMLElement
  setValue: (value: string) => void
  getValue: () => string
  destroy: () => void
}

interface HsvaColor {
  h: number
  s: number
  v: number
  a: number
}

interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

function ensureStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID))
    return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
.ndcp-root {
  position: relative;
  display: inline-flex;
}

.ndcp-trigger {
  position: relative;
  width: 28px;
  height: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: border-color 0.15s;
  background-image:
    linear-gradient(45deg, #f1f1f1 25%, transparent 25%),
    linear-gradient(-45deg, #f1f1f1 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f1f1f1 75%),
    linear-gradient(-45deg, transparent 75%, #f1f1f1 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;
}

.ndcp-trigger:hover {
  border-color: var(--uni-draw-primary);
}

.ndcp-trigger-color {
  position: absolute;
  inset: 2px;
  border-radius: 2px;
}

.ndcp-popup {
  position: fixed;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 10px;
  width: 296px;
  max-width: calc(100vw - 24px);
  box-sizing: border-box;
  user-select: none;
  z-index: 9999;
}

.ndcp-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ndcp-sv-panel {
  position: relative;
  height: 152px;
  border-radius: 8px;
  overflow: hidden;
  cursor: crosshair;
}

.ndcp-sv-layer {
  position: absolute;
  inset: 0;
}

.ndcp-sv-white {
  background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
}

.ndcp-sv-black {
  background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
}

.ndcp-sv-thumb {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
  transform: translate(-50%, -50%);
}

.ndcp-slider-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ndcp-slider-row label {
  width: 28px;
  flex-shrink: 0;
  color: #888;
  font-size: 11px;
}

.ndcp-slider-track {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
}

.ndcp-hue-track {
  background: linear-gradient(90deg, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
}

.ndcp-alpha-track {
  background-image:
    linear-gradient(45deg, #f1f1f1 25%, transparent 25%),
    linear-gradient(-45deg, #f1f1f1 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f1f1f1 75%),
    linear-gradient(-45deg, transparent 75%, #f1f1f1 75%),
    linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, var(--ndcp-alpha-color) 100%);
  background-size: 8px 8px, 8px 8px, 8px 8px, 8px 8px, 100% 100%;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0, 0 0;
}

.ndcp-slider-track input {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 100%;
  margin: 0;
  background: transparent;
  cursor: pointer;
}

.ndcp-slider-track input::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  margin-top: 0;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
  background: transparent;
}

.ndcp-slider-track input::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
  background: transparent;
}

.ndcp-slider-track input::-moz-range-track {
  height: 14px;
  background: transparent;
  border: none;
}

.ndcp-section-title {
  font-size: 11px;
  color: #888;
  margin-bottom: 6px;
}

.ndcp-swatches {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.ndcp-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 3px;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s, border-color 0.1s;
}

.ndcp-swatch:hover {
  transform: scale(1.2);
  border-color: var(--uni-draw-primary);
}

.ndcp-swatch.active {
  border-color: var(--uni-draw-primary);
  outline: 2px solid var(--uni-draw-primary);
  outline-offset: 1px;
}

.ndcp-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 8px 0;
}

.ndcp-field {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 11px;
}

.ndcp-field label {
  color: #888;
  width: 34px;
  flex-shrink: 0;
}

.ndcp-field input[type="text"],
.ndcp-field input:not([type]) {
  flex: 1;
  padding: 3px 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 11px;
  font-family: monospace;
  outline: none;
  min-width: 0;
}

.ndcp-field input[type="text"]:focus,
.ndcp-field input:not([type]):focus {
  border-color: var(--uni-draw-primary);
}

.ndcp-rgba-inputs {
  display: flex;
  gap: 3px;
  flex: 1;
}

.ndcp-rgba-inputs input {
  flex: 1;
  width: 0;
  min-width: 0;
  padding: 3px 4px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
  outline: none;
}

.ndcp-rgba-inputs input:focus {
  border-color: var(--uni-draw-primary);
}

.ndcp-val {
  color: #888;
  font-size: 11px;
  min-width: 30px;
  text-align: right;
}

.ndcp-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.ndcp-preview-swatch {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.ndcp-preview-text {
  font-size: 11px;
  color: #555;
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`
  document.head.appendChild(style)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function hexToRgba(hex: string): RgbaColor | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 8)
    return null
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
    a: clean.length === 8 ? Number.parseInt(clean.slice(6, 8), 16) / 255 : 1,
  }
}

function rgbaToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(v => clamp(v, 0, 255).toString(16).padStart(2, '0')).join('')}`
}

function rgbToHsv(r: number, g: number, b: number): Omit<HsvaColor, 'a'> {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === rn)
      h = 60 * (((gn - bn) / delta) % 6)
    else if (max === gn)
      h = 60 * ((bn - rn) / delta + 2)
    else h = 60 * ((rn - gn) / delta + 4)
  }
  if (h < 0)
    h += 360
  return {
    h,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  }
}

function hsvToRgb(h: number, s: number, v: number): Omit<RgbaColor, 'a'> {
  const sat = clamp(s, 0, 100) / 100
  const val = clamp(v, 0, 100) / 100
  const c = val * sat
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = val - c
  let r1 = 0
  let g1 = 0
  let b1 = 0
  if (h >= 0 && h < 60) {
    r1 = c
    g1 = x
  }
  else if (h < 120) {
    r1 = x
    g1 = c
  }
  else if (h < 180) {
    g1 = c
    b1 = x
  }
  else if (h < 240) {
    g1 = x
    b1 = c
  }
  else if (h < 300) {
    r1 = x
    b1 = c
  }
  else {
    r1 = c
    b1 = x
  }
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

function parseColor(value: string): RgbaColor | null {
  if (!value)
    return null
  const rgbaMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i)
  if (rgbaMatch) {
    return {
      r: Number(rgbaMatch[1]),
      g: Number(rgbaMatch[2]),
      b: Number(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1,
    }
  }
  const hex = value.startsWith('#') ? value : `#${value}`
  return hexToRgba(hex)
}

export function createNativeColorPicker(options: NativeColorPickerOptions = {}): NativeColorPickerInstance {
  ensureStyles()

  let hsva: HsvaColor = { h: 0, s: 0, v: 0, a: 1 }
  let currentValue = '#000000'
  let open = false
  let destroyed = false
  let removeDragListeners: (() => void) | null = null

  const root = document.createElement('div')
  root.className = 'ndcp-root'

  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'ndcp-trigger'
  const triggerColor = document.createElement('span')
  triggerColor.className = 'ndcp-trigger-color'
  trigger.appendChild(triggerColor)
  root.appendChild(trigger)

  const popup = document.createElement('div')
  popup.className = 'ndcp-popup'
  popup.innerHTML = `
    <div class="ndcp-picker">
      <div class="ndcp-sv-panel">
        <div class="ndcp-sv-layer ndcp-sv-white"></div>
        <div class="ndcp-sv-layer ndcp-sv-black"></div>
        <div class="ndcp-sv-thumb"></div>
      </div>
      <div class="ndcp-slider-row">
        <label>色相</label>
        <div class="ndcp-slider-track ndcp-hue-track">
          <input type="range" min="0" max="360" step="1" />
        </div>
      </div>
      <div class="ndcp-slider-row">
        <label>透明</label>
        <div class="ndcp-slider-track ndcp-alpha-track">
          <input type="range" min="0" max="1" step="0.01" />
        </div>
        <span class="ndcp-val"></span>
      </div>
    </div>
    <div class="ndcp-divider"></div>
    <div class="ndcp-section-title">常用颜色</div>
    <div class="ndcp-swatches"></div>
    <div class="ndcp-divider"></div>
    <div class="ndcp-field">
      <label>HEX</label>
      <input class="ndcp-hex" type="text" maxlength="9" spellcheck="false" placeholder="#RRGGBB / #RRGGBBAA" />
    </div>
    <div class="ndcp-field">
      <label>RGBA</label>
      <div class="ndcp-rgba-inputs">
        <input class="ndcp-r" type="number" min="0" max="255" />
        <input class="ndcp-g" type="number" min="0" max="255" />
        <input class="ndcp-b" type="number" min="0" max="255" />
        <input class="ndcp-a" type="number" min="0" max="1" step="0.01" />
      </div>
    </div>
    <div class="ndcp-preview">
      <div class="ndcp-preview-swatch"></div>
      <span class="ndcp-preview-text"></span>
    </div>
  `

  const svPanel = popup.querySelector('.ndcp-sv-panel') as HTMLDivElement
  const svThumb = popup.querySelector('.ndcp-sv-thumb') as HTMLDivElement
  const hueInput = popup.querySelector('.ndcp-hue-track input') as HTMLInputElement
  const alphaTrack = popup.querySelector('.ndcp-alpha-track') as HTMLDivElement
  const alphaInput = popup.querySelector('.ndcp-alpha-track input') as HTMLInputElement
  const alphaValue = popup.querySelector('.ndcp-val') as HTMLSpanElement
  const swatches = popup.querySelector('.ndcp-swatches') as HTMLDivElement
  const hexInput = popup.querySelector('.ndcp-hex') as HTMLInputElement
  const rgbaR = popup.querySelector('.ndcp-r') as HTMLInputElement
  const rgbaG = popup.querySelector('.ndcp-g') as HTMLInputElement
  const rgbaB = popup.querySelector('.ndcp-b') as HTMLInputElement
  const rgbaA = popup.querySelector('.ndcp-a') as HTMLInputElement
  const previewSwatch = popup.querySelector('.ndcp-preview-swatch') as HTMLDivElement
  const previewText = popup.querySelector('.ndcp-preview-text') as HTMLSpanElement

  const swatchButtons = PRESETS.map((color) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'ndcp-swatch'
    button.style.background = color
    button.title = color
    button.addEventListener('click', () => {
      const parsed = hexToRgba(color)
      if (!parsed)
        return
      setFromRgba({ ...parsed, a: hsva.a })
      notifyChange()
    })
    swatches.appendChild(button)
    return { color, button }
  })

  function getCurrentRgb(): Omit<RgbaColor, 'a'> {
    return hsvToRgb(hsva.h, hsva.s, hsva.v)
  }

  function getOutputColor(): string {
    const rgb = getCurrentRgb()
    return hsva.a < 1
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${hsva.a.toFixed(2)})`
      : rgbaToHex(rgb.r, rgb.g, rgb.b)
  }

  function render(): void {
    const rgb = getCurrentRgb()
    const hex = rgbaToHex(rgb.r, rgb.g, rgb.b)
    const output = getOutputColor()
    currentValue = output
    trigger.title = output
    triggerColor.style.background = output
    svPanel.style.background = `hsl(${hsva.h}, 100%, 50%)`
    svThumb.style.left = `${hsva.s}%`
    svThumb.style.top = `${100 - hsva.v}%`
    hueInput.value = String(Math.round(hsva.h))
    alphaInput.value = hsva.a.toFixed(2)
    alphaTrack.style.setProperty('--ndcp-alpha-color', hex)
    alphaValue.textContent = `${Math.round(hsva.a * 100)}%`
    hexInput.value = hsva.a < 1
      ? `${hex}${Math.round(hsva.a * 255).toString(16).padStart(2, '0')}`
      : hex
    rgbaR.value = String(rgb.r)
    rgbaG.value = String(rgb.g)
    rgbaB.value = String(rgb.b)
    rgbaA.value = hsva.a.toFixed(2)
    previewSwatch.style.background = output
    previewText.textContent = output
    for (const item of swatchButtons) {
      item.button.classList.toggle('active', item.color.toLowerCase() === hex.toLowerCase())
    }
    if (open)
      updatePopupPosition()
  }

  function setFromRgba(color: RgbaColor): void {
    const next = {
      r: clamp(Math.round(color.r), 0, 255),
      g: clamp(Math.round(color.g), 0, 255),
      b: clamp(Math.round(color.b), 0, 255),
      a: clamp(Number(color.a), 0, 1),
    }
    const hsv = rgbToHsv(next.r, next.g, next.b)
    hsva = {
      h: hsv.h,
      s: hsv.s,
      v: hsv.v,
      a: next.a,
    }
    render()
  }

  function notifyChange(): void {
    render()
    options.onChange?.(currentValue)
  }

  function applyHex(): void {
    const parsed = parseColor(hexInput.value)
    if (!parsed)
      return
    setFromRgba(parsed)
    notifyChange()
  }

  function applyRgba(): void {
    setFromRgba({
      r: Number(rgbaR.value),
      g: Number(rgbaG.value),
      b: Number(rgbaB.value),
      a: Number(rgbaA.value),
    })
    notifyChange()
  }

  function applyHsva(): void {
    hsva = {
      h: clamp(Number(hueInput.value), 0, 360),
      s: clamp(hsva.s, 0, 100),
      v: clamp(hsva.v, 0, 100),
      a: clamp(Number(alphaInput.value), 0, 1),
    }
    notifyChange()
  }

  function updateSvByEvent(event: MouseEvent): void {
    const rect = svPanel.getBoundingClientRect()
    const x = clamp(event.clientX - rect.left, 0, rect.width)
    const y = clamp(event.clientY - rect.top, 0, rect.height)
    hsva.s = Number(((x / rect.width) * 100).toFixed(2))
    hsva.v = Number((100 - (y / rect.height) * 100).toFixed(2))
    notifyChange()
  }

  function startSvDrag(event: MouseEvent): void {
    updateSvByEvent(event)
    const onMove = (next: MouseEvent) => updateSvByEvent(next)
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      removeDragListeners = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    removeDragListeners = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      removeDragListeners = null
    }
  }

  function updatePopupPosition(): void {
    const rect = root.getBoundingClientRect()
    const width = Math.min(POPUP_WIDTH, Math.max(220, window.innerWidth - POPUP_GUTTER * 2))
    let left = rect.left
    if (left + width > window.innerWidth - POPUP_GUTTER)
      left = window.innerWidth - width - POPUP_GUTTER
    if (left < POPUP_GUTTER)
      left = POPUP_GUTTER
    popup.style.width = `${width}px`
    popup.style.left = `${left}px`
    popup.style.top = `${rect.bottom + 6}px`
  }

  function openPopup(): void {
    if (open || destroyed)
      return
    open = true
    document.body.appendChild(popup)
    updatePopupPosition()
  }

  function closePopup(): void {
    if (!open)
      return
    open = false
    popup.remove()
  }

  function togglePopup(): void {
    if (open)
      closePopup()
    else openPopup()
  }

  function onDocumentMouseDown(event: MouseEvent): void {
    const target = event.target as Node | null
    if (!target)
      return
    if (root.contains(target) || popup.contains(target))
      return
    closePopup()
  }

  function onViewportChange(): void {
    if (open)
      updatePopupPosition()
  }

  trigger.addEventListener('click', togglePopup)
  svPanel.addEventListener('mousedown', startSvDrag)
  hueInput.addEventListener('input', applyHsva)
  alphaInput.addEventListener('input', applyHsva)
  hexInput.addEventListener('change', applyHex)
  rgbaR.addEventListener('input', applyRgba)
  rgbaG.addEventListener('input', applyRgba)
  rgbaB.addEventListener('input', applyRgba)
  rgbaA.addEventListener('input', applyRgba)
  document.addEventListener('mousedown', onDocumentMouseDown)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)

  const initial = parseColor(options.value ?? '#000000') ?? { r: 0, g: 0, b: 0, a: 1 }
  setFromRgba(initial)

  return {
    root,
    setValue(value: string) {
      const parsed = parseColor(value)
      if (!parsed)
        return
      setFromRgba(parsed)
    },
    getValue() {
      return currentValue
    },
    destroy() {
      if (destroyed)
        return
      destroyed = true
      closePopup()
      removeDragListeners?.()
      trigger.removeEventListener('click', togglePopup)
      svPanel.removeEventListener('mousedown', startSvDrag)
      hueInput.removeEventListener('input', applyHsva)
      alphaInput.removeEventListener('input', applyHsva)
      hexInput.removeEventListener('change', applyHex)
      rgbaR.removeEventListener('input', applyRgba)
      rgbaG.removeEventListener('input', applyRgba)
      rgbaB.removeEventListener('input', applyRgba)
      rgbaA.removeEventListener('input', applyRgba)
      document.removeEventListener('mousedown', onDocumentMouseDown)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
      root.remove()
      popup.remove()
    },
  }
}

export function mountNativeColorPicker(container: HTMLElement, options: NativeColorPickerOptions = {}): NativeColorPickerInstance {
  const instance = createNativeColorPicker(options)
  container.appendChild(instance.root)
  return instance
}
