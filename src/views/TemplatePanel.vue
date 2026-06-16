<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SCENARIO_TEMPLATES, type ScenarioTemplate } from '../mocks/templates'
import type { TemplateItem } from '../shared'
import { useLocale } from '../locale'

const props = defineProps<{
  visible: boolean
  templates?: TemplateItem[]
}>()

const emit = defineEmits<{
  (e: 'apply', tpl: ScenarioTemplate): void
  (e: 'close'): void
}>()

const t = useLocale()
const templates = computed(() =>
  props.templates && props.templates.length > 0
    ? (props.templates as unknown as ScenarioTemplate[])
    : SCENARIO_TEMPLATES,
)
const gridRef = ref<HTMLElement | null>(null)
const visibleIds = ref(new Set<string>())
let observer: IntersectionObserver | null = null
const pendingEls = new Map<HTMLElement, string>()

watch(gridRef, (el) => {
  if (el) {
    observer = new IntersectionObserver(
      (entries) => {
        const next = new Set(visibleIds.value)
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset.tplId
            if (id) {
              next.add(id)
              observer?.unobserve(entry.target)
            }
          }
        })
        visibleIds.value = next
      },
      { root: el, rootMargin: '120px', threshold: 0 },
    )
    pendingEls.forEach((id, cardEl) => {
      cardEl.dataset.tplId = id
      observer!.observe(cardEl)
    })
    pendingEls.clear()
  }
  else {
    observer?.disconnect()
    observer = null
  }
}, { flush: 'post' })

function registerCard(el: unknown, id: string) {
  if (!(el instanceof HTMLElement))
    return
  if (visibleIds.value.has(id))
    return
  el.dataset.tplId = id
  if (observer)
    observer.observe(el)
  else pendingEls.set(el, id)
}

function apply(tpl: ScenarioTemplate) {
  emit('apply', tpl)
  emit('close')
}

function getMiniDiagramLarge(id: string): string {
  const base = miniDiagrams[id]
  if (!base)
    return ''
  return base.replace(/style="[^"]*"/g, 'style="width:100%;height:100%"')
}

const miniDiagrams: Record<string, string> = {
  'login-flowchart': `
    <svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg" style="width:60px;height:90px">
      <rect x="20" y="2"  width="40" height="14" rx="7"  fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="20" y="22" width="40" height="14"          fill="#fff"    stroke="#1890ff" stroke-width="1"/>
      <polygon points="40,42 60,52 40,62 20,52"           fill="#fffbe6" stroke="#faad14" stroke-width="1"/>
      <rect x="20" y="72" width="40" height="14"          fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="20" y="96" width="40" height="14" rx="7"  fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <line x1="40" y1="16" x2="40" y2="22" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="36" x2="40" y2="42" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="62" x2="40" y2="72" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="86" x2="40" y2="96" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'ecommerce-er': `
    <svg viewBox="0 0 90 80" xmlns="http://www.w3.org/2000/svg" style="width:68px;height:60px">
      <rect x="2"  y="24" width="22" height="32" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <polygon points="36,40 46,32 56,40 46,48" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="60" y="8"  width="22" height="28" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="60" y="44" width="22" height="28" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <line x1="24" y1="40" x2="36" y2="40" stroke="#aaa" stroke-width="1"/>
      <line x1="56" y1="36" x2="60" y2="22" stroke="#aaa" stroke-width="1"/>
      <line x1="56" y1="44" x2="60" y2="58" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'microservice-arch': `
    <svg viewBox="0 0 90 80" xmlns="http://www.w3.org/2000/svg" style="width:68px;height:60px">
      <rect x="2"  y="28" width="18" height="14" rx="4" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="28" y="28" width="20" height="14" rx="2" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="56" y="10" width="18" height="10" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="56" y="25" width="18" height="10" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="56" y="40" width="18" height="10" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="56" y="55" width="18" height="10" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <line x1="20" y1="35" x2="28" y2="35" stroke="#aaa" stroke-width="1"/>
      <line x1="48" y1="35" x2="56" y2="15" stroke="#aaa" stroke-width="1"/>
      <line x1="48" y1="35" x2="56" y2="30" stroke="#aaa" stroke-width="1"/>
      <line x1="48" y1="35" x2="56" y2="45" stroke="#aaa" stroke-width="1"/>
      <line x1="48" y1="35" x2="56" y2="60" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'org-chart': `
    <svg viewBox="0 0 90 80" xmlns="http://www.w3.org/2000/svg" style="width:68px;height:60px">
      <rect x="30" y="2"  width="24" height="14" rx="7" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="4"  y="26" width="20" height="12" rx="4" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="28" y="26" width="20" height="12" rx="4" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="54" y="26" width="20" height="12" rx="4" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="4"  y="54" width="16" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="24" y="54" width="16" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="44" y="54" width="16" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="64" y="54" width="16" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="16" x2="14" y2="26" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="16" x2="38" y2="26" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="16" x2="64" y2="26" stroke="#aaa" stroke-width="1"/>
      <line x1="14" y1="38" x2="12" y2="54" stroke="#aaa" stroke-width="1"/>
      <line x1="38" y1="38" x2="32" y2="54" stroke="#aaa" stroke-width="1"/>
      <line x1="64" y1="38" x2="52" y2="54" stroke="#aaa" stroke-width="1"/>
      <line x1="64" y1="38" x2="72" y2="54" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'order-state-machine': `
    <svg viewBox="0 0 90 70" xmlns="http://www.w3.org/2000/svg" style="width:68px;height:52px">
      <circle cx="8"  cy="20" r="6"  fill="var(--primary)"/>
      <rect x="18"  y="13" width="16" height="14" rx="4" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="38"  y="13" width="16" height="14" rx="4" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="58"  y="13" width="16" height="14" rx="4" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <circle cx="82" cy="20" r="5"  fill="none" stroke="var(--primary)" stroke-width="1.5"/>
      <circle cx="82" cy="20" r="3"  fill="var(--primary)"/>
      <rect x="30"  y="38" width="16" height="12" rx="4" fill="#fff1f0" stroke="#f5222d" stroke-width="1"/>
      <rect x="52"  y="38" width="16" height="12" rx="4" fill="#fff2e8" stroke="#fa541c" stroke-width="1"/>
      <line x1="14" y1="20" x2="18" y2="20" stroke="#aaa" stroke-width="1"/>
      <line x1="34" y1="20" x2="38" y2="20" stroke="#aaa" stroke-width="1"/>
      <line x1="54" y1="20" x2="58" y2="20" stroke="#aaa" stroke-width="1"/>
      <line x1="74" y1="20" x2="77" y2="20" stroke="#aaa" stroke-width="1"/>
      <line x1="34" y1="27" x2="38" y2="38" stroke="#aaa" stroke-width="1"/>
      <line x1="46" y1="44" x2="52" y2="44" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'register-flowchart': `
    <svg viewBox="0 0 80 130" xmlns="http://www.w3.org/2000/svg" style="width:55px;height:90px">
      <rect x="20" y="2"  width="40" height="13" rx="6" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="20" y="22" width="40" height="13"        fill="#fff"    stroke="#1890ff" stroke-width="1"/>
      <polygon points="40,42 58,51 40,60 22,51"          fill="#fffbe6" stroke="#faad14" stroke-width="1"/>
      <rect x="20" y="68" width="40" height="13"        fill="#fff"    stroke="#1890ff" stroke-width="1"/>
      <polygon points="40,88 58,97 40,106 22,97"         fill="#fffbe6" stroke="#faad14" stroke-width="1"/>
      <rect x="20" y="114" width="40" height="13" rx="6" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <line x1="40" y1="15" x2="40" y2="22" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="35" x2="40" y2="42" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="60" x2="40" y2="68" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="81" x2="40" y2="88" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="106" x2="40" y2="114" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'approval-flowchart': `
    <svg viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg" style="width:58px;height:80px">
      <rect x="20" y="2"  width="40" height="13" rx="6" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="20" y="22" width="40" height="13"        fill="#fff"    stroke="#1890ff" stroke-width="1"/>
      <polygon points="40,42 58,51 40,60 22,51"          fill="#fffbe6" stroke="#faad14" stroke-width="1"/>
      <rect x="20" y="68" width="40" height="13"        fill="#fff"    stroke="#722ed1" stroke-width="1"/>
      <polygon points="40,88 58,97 40,106 22,97"         fill="#fffbe6" stroke="#faad14" stroke-width="1"/>
      <rect x="68" y="44" width="30" height="13"        fill="#fff1f0" stroke="#f5222d" stroke-width="1"/>
      <line x1="40" y1="15" x2="40" y2="22" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="35" x2="40" y2="42" stroke="#aaa" stroke-width="1"/>
      <line x1="58" y1="51" x2="68" y2="51" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="60" x2="40" y2="68" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="81" x2="40" y2="88" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'frontend-arch': `
    <svg viewBox="0 0 90 80" xmlns="http://www.w3.org/2000/svg" style="width:68px;height:60px">
      <rect x="28" y="2"  width="28" height="14" rx="4" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="28" y="24" width="28" height="14" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="2"  y="48" width="18" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="24" y="48" width="18" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="46" y="48" width="18" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="68" y="48" width="18" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="46" y="66" width="22" height="10" rx="2" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <line x1="42" y1="16" x2="42" y2="24" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="38" x2="11"  y2="48" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="38" x2="33"  y2="48" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="38" x2="55"  y2="48" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="38" x2="77"  y2="48" stroke="#aaa" stroke-width="1"/>
      <line x1="55" y1="58" x2="57"  y2="66" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'cicd-pipeline': `
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" style="width:76px;height:46px">
      <rect x="2"  y="22" width="16" height="12" rx="2" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="26" y="22" width="16" height="12" rx="2" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="50" y="6"  width="14" height="10" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="50" y="22" width="14" height="10" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="50" y="38" width="14" height="10" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="72" y="22" width="14" height="12" rx="2" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="88" y="22" width="10" height="12" rx="2" fill="#fff1f0" stroke="#f5222d" stroke-width="1"/>
      <line x1="18" y1="28" x2="26" y2="28" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="28" x2="50" y2="11" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="28" x2="50" y2="27" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="28" x2="50" y2="43" stroke="#aaa" stroke-width="1"/>
      <line x1="64" y1="27" x2="72" y2="27" stroke="#aaa" stroke-width="1"/>
      <line x1="86" y1="28" x2="88" y2="28" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'blog-er': `
    <svg viewBox="0 0 90 80" xmlns="http://www.w3.org/2000/svg" style="width:68px;height:60px">
      <rect x="2"  y="24" width="22" height="28" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="34" y="14" width="22" height="32" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="66" y="24" width="22" height="28" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="34" y="58" width="22" height="20" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <polygon points="28,38 34,32 34,44"          fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <polygon points="62,38 56,32 56,44"          fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <polygon points="45,50 39,46 51,46"          fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <line x1="24" y1="38" x2="28" y2="38" stroke="#aaa" stroke-width="1"/>
      <line x1="62" y1="38" x2="66" y2="38" stroke="#aaa" stroke-width="1"/>
      <line x1="45" y1="46" x2="45" y2="50" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'rbac-model': `
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" style="width:76px;height:46px">
      <rect x="2"  y="20" width="18" height="18" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="30" y="20" width="18" height="18" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="58" y="20" width="18" height="18" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="58" y="46" width="18" height="12" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <polygon points="24,29 30,26 30,32"          fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <polygon points="52,29 58,26 58,32"          fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <line x1="20" y1="29" x2="24" y2="29" stroke="#aaa" stroke-width="1"/>
      <line x1="48" y1="29" x2="52" y2="29" stroke="#aaa" stroke-width="1"/>
      <line x1="67" y1="38" x2="67" y2="46" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'project-team': `
    <svg viewBox="0 0 90 70" xmlns="http://www.w3.org/2000/svg" style="width:68px;height:52px">
      <rect x="30" y="2"  width="24" height="12" rx="6" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="4"  y="24" width="20" height="12" rx="4" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="30" y="24" width="20" height="12" rx="4" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="58" y="24" width="20" height="12" rx="4" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="2"  y="50" width="14" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="22" y="50" width="14" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="42" y="50" width="14" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="62" y="50" width="14" height="10" rx="2" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="14" x2="14" y2="24" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="14" x2="40" y2="24" stroke="#aaa" stroke-width="1"/>
      <line x1="42" y1="14" x2="68" y2="24" stroke="#aaa" stroke-width="1"/>
      <line x1="14" y1="36" x2="9"  y2="50" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="36" x2="29" y2="50" stroke="#aaa" stroke-width="1"/>
      <line x1="40" y1="36" x2="49" y2="50" stroke="#aaa" stroke-width="1"/>
      <line x1="68" y1="36" x2="69" y2="50" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'user-account-state': `
    <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" style="width:76px;height:46px">
      <circle cx="6"  cy="20" r="5"  fill="var(--primary)"/>
      <rect x="14" y="13" width="16" height="13" rx="4" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="36" y="13" width="16" height="13" rx="4" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="58" y="13" width="16" height="13" rx="4" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="80" y="13" width="16" height="13" rx="4" fill="#fff" stroke="#aaa" stroke-width="1"/>
      <rect x="36" y="36" width="16" height="12" rx="4" fill="#fff1f0" stroke="#f5222d" stroke-width="1"/>
      <line x1="11" y1="20" x2="14" y2="20" stroke="#aaa" stroke-width="1"/>
      <line x1="30" y1="20" x2="36" y2="20" stroke="#aaa" stroke-width="1"/>
      <line x1="52" y1="20" x2="58" y2="20" stroke="#aaa" stroke-width="1"/>
      <line x1="74" y1="20" x2="80" y2="20" stroke="#aaa" stroke-width="1"/>
      <line x1="44" y1="26" x2="44" y2="36" stroke="#aaa" stroke-width="1"/>
    </svg>`,
  'mind-map': `
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" style="width:76px;height:60px">
      <circle cx="50" cy="40" r="12" fill="#f9f0ff" stroke="#722ed1" stroke-width="1.5"/>
      <rect x="2"  y="4"  width="22" height="12" rx="6" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="76" y="4"  width="22" height="12" rx="6" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="2"  y="64" width="22" height="12" rx="6" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="76" y="64" width="22" height="12" rx="6" fill="#fff1f0" stroke="#f5222d" stroke-width="1"/>
      <line x1="38" y1="32" x2="24" y2="10" stroke="#bbb" stroke-width="1"/>
      <line x1="62" y1="32" x2="76" y2="10" stroke="#bbb" stroke-width="1"/>
      <line x1="38" y1="48" x2="24" y2="70" stroke="#bbb" stroke-width="1"/>
      <line x1="62" y1="48" x2="76" y2="70" stroke="#bbb" stroke-width="1"/>
      <rect x="2"  y="20" width="14" height="8" rx="2" fill="#fff" stroke="#fa8c16" stroke-width="0.8"/>
      <rect x="84" y="20" width="14" height="8" rx="2" fill="#fff" stroke="#1890ff" stroke-width="0.8"/>
      <rect x="2"  y="52" width="14" height="8" rx="2" fill="#fff" stroke="#52c41a" stroke-width="0.8"/>
      <rect x="84" y="52" width="14" height="8" rx="2" fill="#fff" stroke="#f5222d" stroke-width="0.8"/>
    </svg>`,
  'agent-flow': `
    <svg viewBox="0 0 110 70" xmlns="http://www.w3.org/2000/svg" style="width:82px;height:52px">
      <rect x="2"  y="28" width="18" height="14" rx="7" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="28" y="24" width="22" height="22" rx="6" fill="#f9f0ff" stroke="#722ed1" stroke-width="1.5"/>
      <rect x="62" y="8"  width="20" height="12" rx="3" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="62" y="29" width="20" height="12" rx="3" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="62" y="50" width="20" height="12" rx="3" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="88" y="24" width="20" height="22" rx="6" fill="#e6fffb" stroke="#13c2c2" stroke-width="1"/>
      <line x1="20" y1="35" x2="28" y2="35" stroke="#bbb" stroke-width="1"/>
      <line x1="50" y1="32" x2="62" y2="14" stroke="#bbb" stroke-width="1"/>
      <line x1="50" y1="35" x2="62" y2="35" stroke="#bbb" stroke-width="1"/>
      <line x1="50" y1="38" x2="62" y2="56" stroke="#bbb" stroke-width="1"/>
      <line x1="82" y1="14" x2="88" y2="30" stroke="#bbb" stroke-width="1"/>
      <line x1="82" y1="35" x2="88" y2="35" stroke="#bbb" stroke-width="1"/>
      <line x1="82" y1="56" x2="88" y2="40" stroke="#bbb" stroke-width="1"/>
    </svg>`,
  'dag-pipeline': `
    <svg viewBox="0 0 110 80" xmlns="http://www.w3.org/2000/svg" style="width:82px;height:60px">
      <rect x="2"  y="8"  width="20" height="14" rx="3" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="2"  y="33" width="20" height="14" rx="3" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="2"  y="58" width="20" height="14" rx="3" fill="#fff7e6" stroke="#fa541c" stroke-width="1"/>
      <rect x="34" y="14" width="20" height="12" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="34" y="54" width="20" height="12" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="64" y="14" width="20" height="14" rx="3" fill="#e6fffb" stroke="#13c2c2" stroke-width="1"/>
      <rect x="64" y="52" width="20" height="14" rx="3" fill="#fff2e8" stroke="#fa541c" stroke-width="1"/>
      <rect x="92" y="6"  width="16" height="10" rx="2" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="92" y="20" width="16" height="10" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="92" y="54" width="16" height="10" rx="2" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <line x1="22" y1="15" x2="34" y2="20" stroke="#bbb" stroke-width="1"/>
      <line x1="22" y1="40" x2="34" y2="20" stroke="#bbb" stroke-width="1"/>
      <line x1="22" y1="65" x2="34" y2="60" stroke="#bbb" stroke-width="1"/>
      <line x1="54" y1="20" x2="64" y2="21" stroke="#bbb" stroke-width="1"/>
      <line x1="54" y1="60" x2="64" y2="59" stroke="#bbb" stroke-width="1"/>
      <line x1="84" y1="21" x2="92" y2="11" stroke="#bbb" stroke-width="1"/>
      <line x1="84" y1="21" x2="92" y2="25" stroke="#bbb" stroke-width="1"/>
      <line x1="84" y1="59" x2="92" y2="59" stroke="#bbb" stroke-width="1"/>
    </svg>`,
  'er-saas': `
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" style="width:76px;height:60px">
      <rect x="2"  y="20" width="26" height="36" fill="#fff2e8" stroke="#fa8c16" stroke-width="1"/>
      <rect x="38" y="4"  width="26" height="36" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="38" y="48" width="26" height="28" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="74" y="20" width="24" height="36" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <polygon points="32,35 38,30 38,40"   fill="#fff2e8" stroke="#fa8c16" stroke-width="0.8"/>
      <polygon points="70,35 64,30 64,40"   fill="#f9f0ff" stroke="#722ed1" stroke-width="0.8"/>
      <polygon points="51,44 45,40 57,40"   fill="#f6ffed" stroke="#52c41a" stroke-width="0.8"/>
      <line x1="28" y1="35" x2="32" y2="35" stroke="#bbb" stroke-width="1"/>
      <line x1="64" y1="35" x2="70" y2="35" stroke="#bbb" stroke-width="1"/>
      <line x1="51" y1="40" x2="51" y2="44" stroke="#bbb" stroke-width="1"/>
    </svg>`,
  'bpmn-order': `
    <svg viewBox="0 0 120 54" xmlns="http://www.w3.org/2000/svg" style="width:90px;height:40px">
      <circle cx="7"   cy="27" r="6"  fill="#f6ffed" stroke="#52c41a" stroke-width="1.5"/>
      <rect x="17"  y="18" width="20" height="18" rx="2" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <polygon points="50,18 66,18 66,36 50,36 42,27" fill="#fffbe6" stroke="#faad14" stroke-width="1"/>
      <rect x="72"  y="10" width="18" height="14" rx="2" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="72"  y="30" width="18" height="14" rx="2" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="96"  y="18" width="18" height="18" rx="2" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <circle cx="118" cy="27" r="5"  fill="none" stroke="#f5222d" stroke-width="1.5"/>
      <circle cx="118" cy="27" r="2.5" fill="#f5222d"/>
      <line x1="13"  y1="27" x2="17"  y2="27" stroke="#bbb" stroke-width="1"/>
      <line x1="37"  y1="27" x2="42"  y2="27" stroke="#bbb" stroke-width="1"/>
      <line x1="66"  y1="23" x2="72"  y2="17" stroke="#bbb" stroke-width="1"/>
      <line x1="66"  y1="31" x2="72"  y2="37" stroke="#bbb" stroke-width="1"/>
      <line x1="90"  y1="17" x2="96"  y2="23" stroke="#bbb" stroke-width="1"/>
      <line x1="90"  y1="37" x2="96"  y2="31" stroke="#bbb" stroke-width="1"/>
      <line x1="114" y1="27" x2="113" y2="27" stroke="#bbb" stroke-width="1"/>
    </svg>`,
  'org-rd': `
    <svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" style="width:76px;height:52px">
      <rect x="32" y="2"  width="30" height="14" rx="7" fill="#f9f0ff" stroke="#722ed1" stroke-width="1"/>
      <rect x="2"  y="26" width="16" height="12" rx="4" fill="#e6f7ff" stroke="#1890ff" stroke-width="1"/>
      <rect x="22" y="26" width="16" height="12" rx="4" fill="#f6ffed" stroke="#52c41a" stroke-width="1"/>
      <rect x="42" y="26" width="16" height="12" rx="4" fill="#fff7e6" stroke="#fa8c16" stroke-width="1"/>
      <rect x="62" y="26" width="16" height="12" rx="4" fill="#fff1f0" stroke="#f5222d" stroke-width="1"/>
      <rect x="82" y="26" width="16" height="12" rx="4" fill="#e6fffb" stroke="#13c2c2" stroke-width="1"/>
      <rect x="2"  y="52" width="14" height="10" rx="2" fill="#fff" stroke="#1890ff" stroke-width="0.8"/>
      <rect x="18" y="52" width="14" height="10" rx="2" fill="#fff" stroke="#1890ff" stroke-width="0.8"/>
      <rect x="22" y="52" width="14" height="10" rx="2" fill="#fff" stroke="#52c41a" stroke-width="0.8"/>
      <rect x="38" y="52" width="14" height="10" rx="2" fill="#fff" stroke="#52c41a" stroke-width="0.8"/>
      <line x1="47" y1="16" x2="10"  y2="26" stroke="#bbb" stroke-width="1"/>
      <line x1="47" y1="16" x2="30"  y2="26" stroke="#bbb" stroke-width="1"/>
      <line x1="47" y1="16" x2="50"  y2="26" stroke="#bbb" stroke-width="1"/>
      <line x1="47" y1="16" x2="70"  y2="26" stroke="#bbb" stroke-width="1"/>
      <line x1="47" y1="16" x2="90"  y2="26" stroke="#bbb" stroke-width="1"/>
      <line x1="10" y1="38" x2="9"   y2="52" stroke="#bbb" stroke-width="1"/>
      <line x1="10" y1="38" x2="25"  y2="52" stroke="#bbb" stroke-width="1"/>
      <line x1="30" y1="38" x2="29"  y2="52" stroke="#bbb" stroke-width="1"/>
      <line x1="30" y1="38" x2="45"  y2="52" stroke="#bbb" stroke-width="1"/>
    </svg>`,
  'fishbone': `
    <svg viewBox="0 0 110 70" xmlns="http://www.w3.org/2000/svg" style="width:82px;height:52px">
      <line x1="10"  y1="35" x2="96"  y2="35" stroke="#888" stroke-width="1.5"/>
      <rect x="88"   y="26" width="20" height="18" rx="2" fill="#fff1f0" stroke="#f5222d" stroke-width="1"/>
      <line x1="26"  y1="35" x2="18"  y2="18" stroke="#aaa" stroke-width="1"/>
      <line x1="46"  y1="35" x2="38"  y2="18" stroke="#aaa" stroke-width="1"/>
      <line x1="68"  y1="35" x2="60"  y2="18" stroke="#aaa" stroke-width="1"/>
      <line x1="26"  y1="35" x2="18"  y2="52" stroke="#aaa" stroke-width="1"/>
      <line x1="46"  y1="35" x2="38"  y2="52" stroke="#aaa" stroke-width="1"/>
      <line x1="68"  y1="35" x2="60"  y2="52" stroke="#aaa" stroke-width="1"/>
      <rect x="10"   y="10" width="16" height="9" rx="2" fill="#f9f0ff" stroke="#722ed1" stroke-width="0.8"/>
      <rect x="30"   y="10" width="16" height="9" rx="2" fill="#e6f7ff" stroke="#1890ff" stroke-width="0.8"/>
      <rect x="52"   y="10" width="16" height="9" rx="2" fill="#fff7e6" stroke="#fa8c16" stroke-width="0.8"/>
      <rect x="10"   y="51" width="16" height="9" rx="2" fill="#f6ffed" stroke="#52c41a" stroke-width="0.8"/>
      <rect x="30"   y="51" width="16" height="9" rx="2" fill="#fff2e8" stroke="#fa541c" stroke-width="0.8"/>
      <rect x="52"   y="51" width="16" height="9" rx="2" fill="#fffbe6" stroke="#faad14" stroke-width="0.8"/>
    </svg>`,
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="tpl-overlay" @click.self="$emit('close')">
        <div class="tpl-modal">
          <!-- Modal header -->
          <div class="tpl-header">
            <span class="tpl-title">{{ t.templatePanel.title }}</span>
            <span class="tpl-hint">{{ t.templatePanel.hint }}</span>
            <button class="tpl-close" @click="$emit('close')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            </button>
          </div>

          <!-- Template grid -->
          <div ref="gridRef" class="tpl-grid">
            <div
              v-for="tpl in templates"
              :key="tpl.id"
              :ref="(el) => registerCard(el, tpl.id)"
              class="tpl-card"
            >
              <!-- Diagram preview -->
              <div class="tpl-preview">
                <div class="tpl-diagram" v-html="visibleIds.has(tpl.id) ? getMiniDiagramLarge(tpl.id) : ''" />
              </div>
              <!-- Hover bar slides up from card bottom -->
              <div class="tpl-hover-layer">
                <button class="btn-use" @click="apply(tpl)">
                  {{ t.templatePanel.use }}
                </button>
              </div>
              <!-- Card info -->
              <div class="tpl-info">
                <div class="tpl-name">
                  {{ tpl.name }}
                </div>
                <div class="tpl-desc">
                  {{ tpl.description || t.templatePanel.defaultDescription }}
                </div>
                <div class="tpl-tags">
                  <span v-for="tag in tpl.tags" :key="tag" class="tpl-tag">{{ tag }}</span>
                </div>
                <div class="tpl-stats">
                  <span>{{ tpl.data.nodes.length }} {{ t.templatePanel.nodes }}</span>
                  <span class="dot">·</span>
                  <span>{{ tpl.data.edges.length }} {{ t.templatePanel.edges }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Overlay ── */
.tpl-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

/* ── Modal shell ── */
.tpl-modal {
  background: #fff;
  border-radius: 14px;
  width: min(860px, 100%);
  height: min(600px, calc(100vh - 40px));
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* ── Header ── */
.tpl-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.tpl-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.tpl-hint {
  flex: 1;
  font-size: 12px;
  color: #bbb;
}

.tpl-close {
  border: none;
  background: none;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition:
    color 0.15s,
    background 0.15s;
}
.tpl-close:hover {
  color: #333;
  background: #f5f5f5;
}
/* ── Grid ── */
.tpl-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: min-content;
  align-content: start;
  gap: 16px;
  padding: 20px;
  overflow-y: auto;
}

/* ── Card ── */
.tpl-card {
  position: relative;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  transition:
    border-color 0.18s,
    box-shadow 0.18s,
    transform 0.18s;
  cursor: pointer;
}
.tpl-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 16px rgba(113, 1 102, 40, 0.18);
  transform: translateY(-2px);
}

/* ── Card preview area ── */
.tpl-preview {
  height: 120px;
  background: #f5f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

tpl-diagram {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}
.tpl-diagram :deep(svg) {
  max-width: 85%;
  max-height: 85%;
}
.tpl-card:hover .tpl-diagram {
  transform: scale(1.05) translateY(-4px);
}
/* ── Hover bar that slides up from card bottom ── */
.tpl-hover-layer {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  border-radius: 0 0 7px 7px;
  background: rgba(20, 20, 30, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  transform: translateY(calc(100% + 4px));
  transition: transform 0.26s cubic-bezier(0.34, 1.15, 0.64, 1);
}
.tpl-card:hover .tpl-hover-layer {
  transform: translateY(0);
}
.btn-use {
  padding: 7px 22px;
  border-radius: 20px;
  border: none;
  background: var(--primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(113, 1 102, 40, 0.4);
  transition:
    background 0.15s,
    transform 0.12s;
}
.btn-use:hover {
  background: #3d6fd6;
  transform: scale(1.05);
}
/* ── Card info ── */
.tpl-info {
  padding: 10px 12px 12px;
}

.tpl-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tpl-desc {
  font-size: 11px;
  color: #888;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.tpl-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-bottom: 6px;
}

.tpl-tag {
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
  color: var(--primary);
  background: #e8f0fe;
  border: 1px solid #c5d5fb;
}

.tpl-stats {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #bbb;
}
.dot {
  color: #e0e0e0;
}
/* ── Transition ── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}
.modal-fade-enter-active .tpl-modal,
.modal-fade-leave-active .tpl-modal {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .tpl-modal,
.modal-fade-leave-to .tpl-modal {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>
