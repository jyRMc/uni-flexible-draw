<template>
  <div class="shape-category">
    <div class="shape-category-header" @click="toggle">
      <ChevronRight class="shape-category-arrow" :class="{ expanded: isExpanded }" :size="14" />
      <span class="shape-category-name">{{ library.name }}</span>
      <span class="shape-category-count">{{ library.items.length }}</span>
    </div>
    <div v-show="isExpanded" class="shape-category-items">
      <div
        v-for="item in library.items"
        :key="item.id"
        class="shape-category-item"
        :title="item.name"
        draggable="true"
        @dragstart="(e: DragEvent) => onDragStart(item, e)"
        @click="onSelect(item)"
      >
        <component :is="getShapeIcon(item.shape)" class="shape-icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
import type { MaterialLibrary, MaterialItem } from '@uni-draw/shared'
import { ChevronRight } from 'lucide-vue-next'
import {
  // Basic
  SquareOutline, ReaderOutline, EllipseOutline, DiamondOutline, TriangleOutline,
  PlayForwardOutline, FunnelOutline, AppsOutline, ShieldOutline, StopOutline,
  StarOutline, AddOutline, ServerOutline, CloudOutline, DocumentOutline,
  TextOutline, ImageOutline,
  // Flowchart
  PlayCircleOutline, HelpCircleOutline, SwapHorizontalOutline, DocumentTextOutline,
  FileTrayStackedOutline, CodeSlashOutline, RadioButtonOffOutline, GitMergeOutline,
  SaveOutline,
  // Edge
  RemoveOutline, EllipsisHorizontalOutline, ArrowForwardOutline,
  AnalyticsOutline, ReturnDownForwardOutline,
  // UML
  ReorderFourOutline, CodeOutline, ApertureOutline, ListOutline, CubeOutline,
  GiftOutline, ChatboxOutline, PersonOutline, HardwareChipOutline,
  DesktopOutline, PeopleOutline, LayersOutline, GitNetworkOutline, AttachOutline,
  // ER
  DocumentLockOutline, LinkOutline, FingerPrintOutline, PricetagOutline,
  KeyOutline, FlashOutline, ShareSocialOutline, ArrowDownCircleOutline,
  // State
  ScanOutline, RadioButtonOnOutline, CheckmarkCircleOutline, TimeOutline,
  ReloadOutline, AddCircleOutline, GitBranchOutline, LogInOutline, LogOutOutline,
  CloseCircleOutline, SendOutline, NotificationsOutline,
  // DFD
  SettingsOutline, ArchiveOutline, ExpandOutline, BuildOutline,
  // Swimlane
  FilmOutline, GridOutline, CutOutline,
  // Sequence
  PulseOutline, BarChartOutline, RepeatOutline, OptionsOutline, AlertOutline,
} from '@vicons/ionicons5'

export interface ShapeCategoryProps {
  library: MaterialLibrary
  collapsible?: boolean
}

const props = withDefaults(defineProps<ShapeCategoryProps>(), {
  collapsible: true,
})

const emit = defineEmits<{
  (e: 'dragstart', item: MaterialItem, event: DragEvent): void
  (e: 'select', item: MaterialItem): void
}>()

const isExpanded = ref(true)

function toggle() {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value
  }
}

function onDragStart(item: MaterialItem, event: DragEvent) {
  event.dataTransfer?.setData('application/json', JSON.stringify(item))
  emit('dragstart', item, event)
}

function onSelect(item: MaterialItem) {
  emit('select', item)
}

const SHAPE_ICONS: Record<string, Component> = {
  // ── Basic ─────────────────────────────────────────────────────────────
  'basic-rect':           SquareOutline,
  'basic-rounded-rect':   ReaderOutline,        // rounded reader/card shape
  'basic-circle':         EllipseOutline,
  'basic-diamond':        DiamondOutline,
  'basic-triangle':       TriangleOutline,
  'basic-parallelogram':  PlayForwardOutline,   // slanted/diagonal
  'basic-trapezoid':      FunnelOutline,        // funnel = trapezoid
  'basic-hexagon':        AppsOutline,          // hex grid arrangement
  'basic-pentagon':       ShieldOutline,        // shield = pentagon
  'basic-octagon':        StopOutline,          // stop sign = octagon
  'basic-star':           StarOutline,
  'basic-cross':          AddOutline,           // plus = cross
  'basic-cylinder':       ServerOutline,        // stacked discs = cylinder
  'basic-cloud':          CloudOutline,
  'basic-document':       DocumentOutline,
  'basic-text':           TextOutline,
  'basic-image':          ImageOutline,
  // ── Flowchart ─────────────────────────────────────────────────────────
  'flowchart-start-end':         PlayCircleOutline,
  'flowchart-process':           SquareOutline,
  'flowchart-decision':          HelpCircleOutline,
  'flowchart-input-output':      SwapHorizontalOutline,
  'flowchart-document':          DocumentTextOutline,
  'flowchart-database':          FileTrayStackedOutline, // stacked trays = DB
  'flowchart-predefined':        CodeSlashOutline,
  'flowchart-connector':         RadioButtonOffOutline,  // small circle
  'flowchart-merge':             GitMergeOutline,
  'flowchart-internal-storage':  SaveOutline,
  // ── Edge / Connector ──────────────────────────────────────────────────
  'edge-line':          RemoveOutline,             // horizontal line
  'edge-dashed':        EllipsisHorizontalOutline, // dots = dashed
  'edge-arrow':         ArrowForwardOutline,
  'edge-double-arrow':  SwapHorizontalOutline,
  'edge-curve':         AnalyticsOutline,          // curved trend line
  'edge-orthogonal':    ReturnDownForwardOutline,  // right-angle turn
  // ── UML ───────────────────────────────────────────────────────────────
  'uml-class':         ReorderFourOutline,   // header + sections
  'uml-interface':     CodeOutline,          // code contract
  'uml-abstract':      ApertureOutline,      // aperture = conceptual
  'uml-enum':          ListOutline,          // enumerated list
  'uml-object':        CubeOutline,          // object instance
  'uml-package':       GiftOutline,          // boxed package
  'uml-note':          ChatboxOutline,
  'uml-actor':         PersonOutline,
  'uml-use-case':      EllipseOutline,       // ellipse = use-case oval
  'uml-component':     HardwareChipOutline,  // chip = component
  'uml-deployment':    DesktopOutline,
  'uml-collaboration': PeopleOutline,
  'uml-composite':     LayersOutline,        // stacked layers = composite
  'uml-node':          GitNetworkOutline,
  'uml-artifact':      AttachOutline,        // attachment = artifact
  // ── ER ────────────────────────────────────────────────────────────────
  'er-entity':                   ListOutline,          // rows = entity
  'er-weak-entity':              DocumentLockOutline,  // locked/weak
  'er-relationship':             LinkOutline,
  'er-identifying-relationship': FingerPrintOutline,   // unique identity
  'er-attribute':                PricetagOutline,      // tag = attribute
  'er-key-attribute':            KeyOutline,
  'er-multivalued':              LayersOutline,        // stacked = multiple values
  'er-derived':                  FlashOutline,         // computed/derived
  'er-associative':              ShareSocialOutline,   // shared connections
  'er-total-participation':      ArrowDownCircleOutline,
  // ── State ─────────────────────────────────────────────────────────────
  'state-simple':           ScanOutline,            // framed box = state
  'state-initial':          RadioButtonOnOutline,   // filled dot = initial
  'state-final':            CheckmarkCircleOutline, // done = final
  'state-shallow-history':  TimeOutline,            // clock = history
  'state-deep-history':     ReloadOutline,          // full reload = deep
  'state-junction':         AddCircleOutline,       // + junction point
  'state-choice':           GitBranchOutline,       // branching choice
  'state-fork':             ShareSocialOutline,     // arrows out = fork
  'state-join':             GitMergeOutline,        // merge = join
  'state-entry-point':      LogInOutline,
  'state-exit-point':       LogOutOutline,
  'state-terminate':        CloseCircleOutline,
  'state-signal-send':      SendOutline,
  'state-signal-receive':   NotificationsOutline,
  // ── DFD ───────────────────────────────────────────────────────────────
  'dfd-process':           SettingsOutline,  // gear = process
  'dfd-data-store':        ArchiveOutline,
  'dfd-external-entity':   ExpandOutline,    // framed/expanded = external
  'dfd-multiple-process':  BuildOutline,     // build tool = multi-process
  // ── Swimlane ──────────────────────────────────────────────────────────
  'swimlane-horizontal': ReorderFourOutline, // horizontal rows
  'swimlane-vertical':   FilmOutline,        // vertical strips = lanes
  'swimlane-pool':       GridOutline,
  'swimlane-phase':      CutOutline,         // cut/divide = phase separator
  // ── Sequence ──────────────────────────────────────────────────────────
  'sequence-actor':              PersonOutline,
  'sequence-lifeline':           PulseOutline,      // lifeline = pulse
  'sequence-activation':         BarChartOutline,   // vertical bar = activation
  'sequence-fragment-alt':       GitBranchOutline,  // alt branches
  'sequence-fragment-opt':       HelpCircleOutline, // optional = question
  'sequence-fragment-loop':      RepeatOutline,
  'sequence-fragment-par':       OptionsOutline,    // parallel tracks
  'sequence-fragment-critical':  AlertOutline,
  'sequence-gateway':            GitNetworkOutline,
}

function getShapeIcon(shape: string): Component {
  return SHAPE_ICONS[shape] ?? SquareOutline
}

/*
function _getShapeSVG(shape: string): string {
  switch (shape) {
    // ── Basic ───────────────────────────────────────────────────────────
    case 'basic-rect':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="40" height="22" ${ba}/></svg>`
    case 'basic-rounded-rect':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="40" height="22" rx="7" ${ba}/></svg>`
    case 'basic-circle':
      return `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="12" ${ba}/></svg>`
    case 'basic-diamond':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,16 16,30 2,16" ${ba}/></svg>`
    case 'basic-triangle':
      return `<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,26 2,26" ${ba}/></svg>`
    case 'basic-parallelogram':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="8,24 42,24 36,4 2,4" ${ba}/></svg>`
    case 'basic-trapezoid':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="2,24 42,24 36,4 8,4" ${ba}/></svg>`
    case 'basic-hexagon':
      return `<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 28,8 28,20 16,26 4,20 4,8" ${ba}/></svg>`
    case 'basic-pentagon':
      return `<svg viewBox="0 0 32 30" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 29,11 24,27 8,27 3,11" ${ba}/></svg>`
    case 'basic-octagon':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="10,2 22,2 30,10 30,22 22,30 10,30 2,22 2,10" ${ba}/></svg>`
    case 'basic-star':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 19.5,12 30,12 21.5,18.5 24.5,28 16,22 7.5,28 10.5,18.5 2,12 12.5,12" ${ba}/></svg>`
    case 'basic-cross':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 20,2 20,12 30,12 30,20 20,20 20,30 12,30 12,20 2,20 2,12 12,12" ${ba}/></svg>`
    case 'basic-cylinder':
      return `<svg viewBox="0 0 32 34" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="24" height="20" fill="${fill}" stroke="none"/><ellipse cx="16" cy="8" rx="12" ry="4" ${ba}/><ellipse cx="16" cy="28" rx="12" ry="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/><line x1="4" y1="8" x2="4" y2="28" stroke="${stroke}" stroke-width="${sw}"/><line x1="28" y1="8" x2="28" y2="28" stroke="${stroke}" stroke-width="${sw}"/></svg>`
    case 'basic-cloud':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><path d="M10,26 Q4,26 4,20 Q4,14 11,14 Q11,6 18,6 Q22,6 24,10 Q26,6 31,6 Q38,6 38,14 Q42,14 42,20 Q42,26 36,26 Z" ${ba}/></svg>`
    case 'basic-document':
      return `<svg viewBox="0 0 32 34" xmlns="http://www.w3.org/2000/svg"><path d="M3,3 L23,3 L29,9 L29,31 Q16,27 3,31 Z" ${ba}/><polyline points="23,3 23,9 29,9" fill="none" stroke="${stroke}" stroke-width="${sw}"/></svg>`
    case 'basic-text':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="9" x2="40" y2="9" ${ln} stroke-width="3"/><line x1="4" y1="17" x2="28" y2="17" ${ln} opacity="0.5"/><line x1="4" y1="24" x2="22" y2="24" ${ln} opacity="0.35"/></svg>`
    case 'basic-image':
      return `<svg viewBox="0 0 36 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="32" height="26" rx="2" ${ba}/><circle cx="10" cy="10" r="4" fill="${stroke}" opacity="0.4"/><polyline points="2,24 13,14 20,20 27,12 34,22" fill="none" stroke="${stroke}" stroke-width="1.5"/></svg>`

    // ── Flowchart ───────────────────────────────────────────────────────
    case 'flowchart-start-end':
      return `<svg viewBox="0 0 44 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="20" rx="10" ${ba}/></svg>`
    case 'flowchart-process':
      return `<svg viewBox="0 0 40 26" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="22" ${ba}/></svg>`
    case 'flowchart-decision':
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 38,14 20,26 2,14" ${ba}/></svg>`
    case 'flowchart-input-output':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="6,24 42,24 38,4 2,4" ${ba}/></svg>`
    case 'flowchart-document':
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><path d="M2,2 L38,2 L38,22 Q28,28 20,22 Q12,16 2,22 Z" ${ba}/></svg>`
    case 'flowchart-database':
      return `<svg viewBox="0 0 32 34" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="24" height="18" fill="${fill}" stroke="none"/><ellipse cx="16" cy="8" rx="12" ry="4" ${ba}/><ellipse cx="16" cy="26" rx="12" ry="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/><line x1="4" y1="8" x2="4" y2="26" stroke="${stroke}" stroke-width="${sw}"/><line x1="28" y1="8" x2="28" y2="26" stroke="${stroke}" stroke-width="${sw}"/></svg>`
    case 'flowchart-predefined':
      return `<svg viewBox="0 0 40 26" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="22" ${ba}/><line x1="8" y1="2" x2="8" y2="24" stroke="${stroke}" stroke-width="${sw}"/><line x1="32" y1="2" x2="32" y2="24" stroke="${stroke}" stroke-width="${sw}"/></svg>`
    case 'flowchart-connector':
      return `<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="13" r="11" ${ba}/></svg>`
    case 'flowchart-merge':
      return `<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg"><polygon points="16,26 30,2 2,2" ${ba}/></svg>`
    case 'flowchart-internal-storage':
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="24" ${ba}/><line x1="10" y1="2" x2="10" y2="26" stroke="${stroke}" stroke-width="${sw}"/><line x1="2" y1="10" x2="38" y2="10" stroke="${stroke}" stroke-width="${sw}"/></svg>`

    // ── Edge / Connector ────────────────────────────────────────────────
    case 'edge-line':
      return `<svg viewBox="0 0 44 14" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="7" x2="40" y2="7" stroke="${stroke}" stroke-width="2"/></svg>`
    case 'edge-dashed':
      return `<svg viewBox="0 0 44 14" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="7" x2="40" y2="7" stroke="${stroke}" stroke-width="2" stroke-dasharray="5 3"/></svg>`
    case 'edge-arrow':
      return `<svg viewBox="0 0 44 14" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="7" x2="32" y2="7" stroke="${stroke}" stroke-width="2"/><polygon points="32,3 40,7 32,11" fill="${stroke}"/></svg>`
    case 'edge-double-arrow':
      return `<svg viewBox="0 0 44 14" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="7" x2="32" y2="7" stroke="${stroke}" stroke-width="2"/><polygon points="12,3 4,7 12,11" fill="${stroke}"/><polygon points="32,3 40,7 32,11" fill="${stroke}"/></svg>`
    case 'edge-curve':
      return `<svg viewBox="0 0 44 20" xmlns="http://www.w3.org/2000/svg"><path d="M4,16 C14,4 30,4 40,16" fill="none" stroke="${stroke}" stroke-width="2"/></svg>`
    case 'edge-orthogonal':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polyline points="4,24 22,24 22,6 40,6" fill="none" stroke="${stroke}" stroke-width="2"/></svg>`

    // ── UML ────────────────────────────────────────────────────────────
    case 'uml-class':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="32" ${ba}/><line x1="2" y1="12" x2="42" y2="12" stroke="${stroke}" stroke-width="1.5"/><line x1="2" y1="24" x2="42" y2="24" stroke="${stroke}" stroke-width="1.5"/></svg>`
    case 'uml-interface':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="32" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="4 2"/><line x1="2" y1="12" x2="42" y2="12" stroke="${stroke}" stroke-width="1.5"/></svg>`
    case 'uml-actor':
      return `<svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="5" ${ba}/><line x1="12" y1="12" x2="12" y2="26" stroke="${stroke}" stroke-width="2"/><line x1="4" y1="18" x2="20" y2="18" stroke="${stroke}" stroke-width="2"/><line x1="12" y1="26" x2="4" y2="34" stroke="${stroke}" stroke-width="2"/><line x1="12" y1="26" x2="20" y2="34" stroke="${stroke}" stroke-width="2"/></svg>`
    case 'uml-use-case':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="22" cy="14" rx="20" ry="12" ${ba}/></svg>`
    case 'uml-package':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="10" width="40" height="24" ${ba}/><rect x="2" y="4" width="16" height="8" ${ba}/></svg>`
    case 'uml-note':
      return `<svg viewBox="0 0 34 36" xmlns="http://www.w3.org/2000/svg"><path d="M2,2 L24,2 L32,10 L32,34 L2,34 Z" ${ba}/><polyline points="24,2 24,10 32,10" fill="none" stroke="${stroke}" stroke-width="${sw}"/></svg>`

    // ── ER ────────────────────────────────────────────────────────────
    case 'er-entity':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="24" ${ba}/></svg>`
    case 'er-weak-entity':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="24" ${ba}/><rect x="5" y="5" width="34" height="18" fill="none" stroke="${stroke}" stroke-width="1"/></svg>`
    case 'er-relationship':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="22,2 42,14 22,26 2,14" ${ba}/></svg>`
    case 'er-attribute':
      return `<svg viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="14" rx="16" ry="12" ${ba}/></svg>`
    case 'er-key-attribute':
      return `<svg viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="14" rx="16" ry="12" ${ba}/><line x1="4" y1="22" x2="32" y2="22" stroke="${stroke}" stroke-width="1.5"/></svg>`
    case 'er-multivalued':
      return `<svg viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="14" rx="16" ry="12" ${ba}/><ellipse cx="18" cy="14" rx="12" ry="8" fill="none" stroke="${stroke}" stroke-width="1"/></svg>`

    // ── State ─────────────────────────────────────────────────────────
    case 'state-initial':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="${stroke}"/></svg>`
    case 'state-final':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="none" stroke="${stroke}" stroke-width="2"/><circle cx="14" cy="14" r="7" fill="${stroke}"/></svg>`
    case 'state-simple':
      return `<svg viewBox="0 0 44 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="20" rx="8" ${ba}/></svg>`
    case 'state-fork': case 'state-join':
      return `<svg viewBox="0 0 10 30" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="2" width="8" height="26" fill="${stroke}"/></svg>`
    case 'state-choice':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><polygon points="14,2 26,14 14,26 2,14" ${ba}/></svg>`

    // ── DFD ──────────────────────────────────────────────────────────
    case 'dfd-process':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" ${ba}/></svg>`
    case 'dfd-data-store':
      return `<svg viewBox="0 0 44 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="20" fill="${fill}" stroke="none"/><line x1="2" y1="2" x2="42" y2="2" stroke="${stroke}" stroke-width="2"/><line x1="2" y1="22" x2="42" y2="22" stroke="${stroke}" stroke-width="2"/></svg>`
    case 'dfd-external-entity':
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="24" ${ba}/><rect x="5" y="5" width="30" height="18" fill="none" stroke="${stroke}" stroke-width="1"/></svg>`

    // ── Swimlane ──────────────────────────────────────────────────────
    case 'swimlane-horizontal':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" ${ba}/><line x1="2" y1="11" x2="42" y2="11" stroke="${stroke}" stroke-width="1.5"/><line x1="2" y1="20" x2="42" y2="20" stroke="${stroke}" stroke-width="1.5"/></svg>`
    case 'swimlane-vertical':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" ${ba}/><line x1="17" y1="2" x2="17" y2="28" stroke="${stroke}" stroke-width="1.5"/><line x1="30" y1="2" x2="30" y2="28" stroke="${stroke}" stroke-width="1.5"/></svg>`
    case 'swimlane-pool':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" ${ba}/><line x1="2" y1="11" x2="42" y2="11" stroke="${stroke}" stroke-width="2"/></svg>`

    // ── Sequence ─────────────────────────────────────────────────────
    case 'sequence-actor':
      return `<svg viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="5" ${ba}/><line x1="12" y1="12" x2="12" y2="24" stroke="${stroke}" stroke-width="2"/><line x1="4" y1="17" x2="20" y2="17" stroke="${stroke}" stroke-width="2"/><line x1="12" y1="24" x2="4" y2="32" stroke="${stroke}" stroke-width="2"/><line x1="12" y1="24" x2="20" y2="32" stroke="${stroke}" stroke-width="2"/></svg>`
    case 'sequence-lifeline':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="2" width="24" height="12" ${ba}/><line x1="22" y1="14" x2="22" y2="28" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="4 2"/></svg>`

    default: {
      const cat = shape.split('-')[0]
      const [df, ds] = CAT_COLOR[cat] ?? ['rgba(113,102,240,0.13)', '#7166F0']
      return `<svg viewBox="0 0 36 26" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="32" height="22" fill="${df}" stroke="${ds}" stroke-width="2"/></svg>`
    }
  }
}
*/
</script>

<style scoped>
.shape-category {
  user-select: none;
}

.shape-category-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  transition: background 0.15s;
}

.shape-category-header:hover {
  background: #f0f0f0;
}

.shape-category-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
  color: #999;
  flex-shrink: 0;
}

.shape-category-arrow.expanded {
  transform: rotate(90deg);
}

.shape-category-name {
  flex: 1;
  margin-left: 4px;
}

.shape-category-count {
  font-size: 10px;
  color: #bbb;
}

.shape-category-items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 4px 8px 8px 8px;
}

.shape-category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  cursor: pointer;
  border-radius: 6px;
  color: #555;
  transition: all 0.15s;
}

.shape-category-item:hover {
  background: #eef1f8;
  color: var(--uni-draw-primary);
}

.shape-category-item:active {
  background: #dce5f5;
}

.shape-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: #666;
  transition: color 0.15s;
}

.shape-category-item:hover .shape-icon {
  color: var(--uni-draw-primary);
}
</style>
