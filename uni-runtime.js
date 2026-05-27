import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/components/UniDraw/UniDraw.vue");import { defineComponent as _defineComponent } from "/node_modules/.vite/deps/vue.js?v=16422863";
import { ref, computed, watch, provide, onMounted, nextTick } from "/node_modules/.vite/deps/vue.js?v=16422863";
import { LOCALE_KEY } from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/locale/index.ts";
import zhCN from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/locale/zh-CN.ts";
import { registerAllShapes } from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/shapes/register.ts";
import { getAllLibraries } from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/materials/index.ts";
import FlexibleDraw from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/components/FlexibleDraw/FlexibleDraw.vue";
import ShapePanel from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/components/ShapePanel/ShapePanel.vue";
import Toolbar from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/components/Toolbar/Toolbar.vue";
import QuickActionBar from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/components/QuickActionBar/QuickActionBar.vue";
import TemplatePanel from "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/components/TemplatePanel/TemplatePanel.vue";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "UniDraw",
  props: {
    modelValue: { type: Object, required: false },
    assets: { type: Array, required: false },
    templates: { type: Array, required: false },
    grid: { type: Boolean, required: false, default: true },
    snapline: { type: Boolean, required: false, default: true },
    readonly: { type: Boolean, required: false, default: false },
    showHeader: { type: Boolean, required: false },
    showShapePanel: { type: Boolean, required: false },
    showAssetsPanel: { type: Boolean, required: false },
    showTemplates: { type: Boolean, required: false },
    showToolbar: { type: Boolean, required: false },
    showMinimap: { type: Boolean, required: false },
    showAiPanel: { type: Boolean, required: false },
    locale: { type: Object, required: false },
    theme: { type: Object, required: false }
  },
  emits: ["update:modelValue", "ready", "selection:change", "ai:generate"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    provide(LOCALE_KEY, props.locale ?? zhCN);
    const cssVars = computed(() => {
      const t = props.theme;
      if (!t) return {};
      const map = {
        "--uni-draw-primary": t.primaryColor ?? "",
        "--uni-draw-primary-bg": t.primaryBg ?? "",
        "--uni-draw-primary-bg-light": t.primaryBgLight ?? "",
        "--uni-draw-canvas-bg": t.canvasBg ?? "",
        "--uni-draw-panel-bg": t.panelBg ?? "",
        "--uni-draw-panel-bg-alt": t.panelBgAlt ?? "",
        "--uni-draw-panel-border": t.borderColor ?? "",
        "--uni-draw-text": t.textColor ?? "",
        "--uni-draw-text-secondary": t.textSecondary ?? "",
        "--uni-draw-text-muted": t.textMuted ?? "",
        "--uni-draw-hover-bg": t.hoverBg ?? "",
        "--uni-draw-shadow-sm": t.shadowSm ?? "",
        "--uni-draw-shadow-md": t.shadowMd ?? "",
        "--uni-draw-radius-sm": t.radiusSm ?? "",
        "--uni-draw-radius-md": t.radiusMd ?? "",
        "--uni-draw-radius-lg": t.radiusLg ?? "",
        "--uni-draw-panel-width": t.panelWidth ?? ""
      };
      return Object.fromEntries(Object.entries(map).filter(([, v]) => v !== ""));
    });
    const graphData = ref(
      props.modelValue ?? {
        canvas: { backgroundColor: "#ffffff", grid: { size: 10, visible: true, type: "dot" }, zoom: 1 },
        nodes: [],
        edges: []
      }
    );
    watch(() => props.modelValue, (val) => {
      if (val) graphData.value = val;
    });
    watch(graphData, (val) => {
      emit("update:modelValue", val);
    }, { deep: true });
    const canvasRef = ref(null);
    const libraries = ref(getAllLibraries());
    const leftTab = ref("shapes");
    const templateOpen = ref(false);
    const sketchMode = ref(false);
    const drawMode = ref(false);
    const elementSketchIds = ref(/* @__PURE__ */ new Set());
    const selectedNode = ref(null);
    const selectedEdge = ref(null);
    const qabClosed = ref(false);
    const aiPanelVisible = ref(false);
    const aiMessages = ref([]);
    const aiLoading = ref(false);
    const aiInput = ref("");
    const followUpQuestions = ref([]);
    const aiMessagesRef = ref(null);
    const jsonModalOpen = ref(false);
    const jsonPreviewText = ref("");
    const copyDone = ref(false);
    onMounted(() => {
      registerAllShapes();
      emit("ready");
    });
    function onShapeAdd(item) {
      canvasRef.value?.createNodeFromMaterial(item, { x: 200, y: 200 });
    }
    function onShapeDragStart(item, event) {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("application/json", JSON.stringify(item));
    }
    function onAssetAdd(asset) {
      canvasRef.value?.createNodeFromMaterial({
        id: `asset-${asset.id}`,
        name: asset.name,
        shape: asset.type === "svg" ? "basic-svg" : "basic-image",
        defaultSize: { width: 80, height: 80 },
        defaultLabel: asset.name,
        defaultStyle: asset.type === "svg" ? { svgContent: asset.content } : { image: asset.content }
      }, { x: 200, y: 200 });
    }
    function onAssetDragStart(event, asset) {
      const item = {
        id: `asset-${asset.id}`,
        name: asset.name,
        shape: asset.type === "svg" ? "basic-svg" : "basic-image",
        defaultSize: { width: 80, height: 80 },
        defaultLabel: asset.name,
        defaultStyle: asset.type === "svg" ? { svgContent: asset.content } : { image: asset.content }
      };
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("application/json", JSON.stringify(item));
    }
    function onExternalDrop(event) {
      const data = event.dataTransfer?.getData("application/json");
      if (!data) return;
      try {
        const item = JSON.parse(data);
        const pos = canvasRef.value?.screenToCanvas(event.clientX, event.clientY) ?? { x: event.clientX, y: event.clientY };
        canvasRef.value?.createNodeFromMaterial(item, pos);
      } catch {
      }
    }
    function onTemplateApply(tpl) {
      canvasRef.value?.setData(tpl.data);
      templateOpen.value = false;
    }
    function onSelectionChange(nodes, edges = []) {
      selectedNode.value = nodes.length > 0 ? nodes[0] : null;
      selectedEdge.value = edges.length > 0 ? edges[0] : null;
      if (nodes.length > 0 || edges.length > 0) qabClosed.value = false;
      emit("selection:change", nodes, edges);
    }
    watch(() => canvasRef.value?.selectedNodeData, (data) => {
      if (data) selectedNode.value = { ...data };
    }, { deep: true });
    watch(() => canvasRef.value?.selectedEdgeData, (data) => {
      selectedEdge.value = data ? { ...data } : null;
      if (data) qabClosed.value = false;
    }, { deep: true });
    watch(() => canvasRef.value?.sketchMode, (val) => {
      if (val !== void 0) sketchMode.value = val;
    });
    watch(() => canvasRef.value?.sketchElementIds, (ids) => {
      if (ids) elementSketchIds.value = ids;
    }, { deep: true });
    function onUpdateStyle(id, style) {
      canvasRef.value?.updateNodeStyle(id, style);
    }
    function onUpdateEdgeStyle(id, style) {
      canvasRef.value?.updateEdgeStyle(id, style);
    }
    function onChangeEdgeType(id, lineType) {
      canvasRef.value?.changeEdgeType(id, lineType);
    }
    function onResizeNode(id, w, h) {
      canvasRef.value?.resizeNode(id, w, h);
    }
    function onToggleSketch() {
      canvasRef.value?.toggleSketchMode();
    }
    function onToggleElementSketch(id) {
      canvasRef.value?.toggleElementSketch(id);
    }
    function onToolbarAction(action) {
      const c = canvasRef.value;
      if (!c) return;
      switch (action) {
        case "undo":
          c.undo();
          break;
        case "redo":
          c.redo();
          break;
        case "togglePan":
          c.togglePanMode();
          break;
        case "zoomIn":
          c.zoomIn();
          break;
        case "zoomOut":
          c.zoomOut();
          break;
        case "zoomToFit":
          c.zoomToFit();
          break;
        case "toggleSketch":
          c.toggleSketchMode();
          break;
        case "toggleDraw":
          drawMode.value = c.toggleDrawMode();
          break;
        case "clearCanvas":
          c.clearCanvas();
          break;
        case "selectAll":
          c.selectAll();
          break;
        case "export:json":
          onExportJSON();
          break;
        case "export:png":
          onExportPNG();
          break;
        default:
          if (action.startsWith("align:")) c.alignNodes(action.slice(6));
      }
    }
    async function onExportPNG() {
      const url = await canvasRef.value?.toPNG();
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${graphData.value.meta?.title ?? "diagram"}.png`;
      a.click();
    }
    function onExportJSON() {
      const raw = canvasRef.value?.toJSON() ?? "{}";
      try {
        jsonPreviewText.value = JSON.stringify(JSON.parse(raw), null, 2);
      } catch {
        jsonPreviewText.value = raw;
      }
      copyDone.value = false;
      jsonModalOpen.value = true;
    }
    async function copyJson() {
      await navigator.clipboard.writeText(jsonPreviewText.value);
      copyDone.value = true;
      setTimeout(() => {
        copyDone.value = false;
      }, 2e3);
    }
    function downloadJson() {
      const blob = new Blob([jsonPreviewText.value], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${graphData.value.meta?.title ?? "diagram"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    function onAiSend(prompt) {
      const p = prompt.trim();
      if (!p || aiLoading.value) return;
      aiInput.value = "";
      aiMessages.value.push({ role: "user", content: p });
      aiLoading.value = true;
      followUpQuestions.value = [];
      nextTick(() => scrollAiToBottom());
      emit("ai:generate", p, graphData.value);
    }
    function clearAiChat() {
      aiMessages.value = [];
      followUpQuestions.value = [];
      aiLoading.value = false;
    }
    function scrollAiToBottom() {
      if (aiMessagesRef.value) {
        aiMessagesRef.value.scrollTop = aiMessagesRef.value.scrollHeight;
      }
    }
    __expose({
      getData: () => canvasRef.value?.getData?.() ?? graphData.value,
      setData: (data) => canvasRef.value?.setData(data),
      clear: () => canvasRef.value?.clearCanvas(),
      exportPNG: () => canvasRef.value?.toPNG(),
      exportJSON: () => canvasRef.value?.toJSON() ?? "{}",
      exportSVG: () => canvasRef.value?.toSVG?.(),
      undo: () => canvasRef.value?.undo(),
      redo: () => canvasRef.value?.redo(),
      zoomIn: () => canvasRef.value?.zoomIn(),
      zoomOut: () => canvasRef.value?.zoomOut(),
      zoomFit: () => canvasRef.value?.zoomToFit(),
      selectAll: () => canvasRef.value?.selectAll(),
      deleteSelection: () => canvasRef.value?.deleteSelected?.(),
      applyAiResult(data, message, followUp) {
        if (data) canvasRef.value?.setData(data);
        if (message) {
          aiMessages.value.push({ role: "assistant", content: message });
          nextTick(() => scrollAiToBottom());
        }
        if (followUp?.length) followUpQuestions.value = followUp;
        aiLoading.value = false;
      }
    });
    const __returned__ = { props, emit, cssVars, graphData, canvasRef, libraries, leftTab, templateOpen, sketchMode, drawMode, elementSketchIds, selectedNode, selectedEdge, qabClosed, aiPanelVisible, aiMessages, aiLoading, aiInput, followUpQuestions, aiMessagesRef, jsonModalOpen, jsonPreviewText, copyDone, onShapeAdd, onShapeDragStart, onAssetAdd, onAssetDragStart, onExternalDrop, onTemplateApply, onSelectionChange, onUpdateStyle, onUpdateEdgeStyle, onChangeEdgeType, onResizeNode, onToggleSketch, onToggleElementSketch, onToolbarAction, onExportPNG, onExportJSON, copyJson, downloadJson, onAiSend, clearAiChat, scrollAiToBottom, FlexibleDraw, ShapePanel, Toolbar, QuickActionBar, TemplatePanel };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { createCommentVNode as _createCommentVNode, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, normalizeClass as _normalizeClass, vShow as _vShow, createVNode as _createVNode, withDirectives as _withDirectives, renderList as _renderList, Fragment as _Fragment, withModifiers as _withModifiers, createBlock as _createBlock, vModelText as _vModelText, withKeys as _withKeys, Teleport as _Teleport, normalizeStyle as _normalizeStyle, createStaticVNode as _createStaticVNode } from "/node_modules/.vite/deps/vue.js?v=16422863";
const _hoisted_1 = {
  key: 0,
  class: "ud-header"
};
const _hoisted_2 = { class: "ud-header-left" };
const _hoisted_3 = { class: "ud-title" };
const _hoisted_4 = { class: "ud-header-right" };
const _hoisted_5 = { class: "ud-zoom-badge" };
const _hoisted_6 = { class: "ud-body" };
const _hoisted_7 = {
  key: 0,
  class: "ud-left-panel"
};
const _hoisted_8 = { class: "ud-panel-tabs" };
const _hoisted_9 = {
  key: 0,
  class: "ud-assets-grid"
};
const _hoisted_10 = ["title", "onClick", "onDragstart"];
const _hoisted_11 = ["innerHTML"];
const _hoisted_12 = ["src", "alt"];
const _hoisted_13 = { class: "ud-asset-label" };
const _hoisted_14 = {
  key: 0,
  class: "ud-assets-empty"
};
const _hoisted_15 = { class: "ud-canvas-area" };
const _hoisted_16 = {
  key: 1,
  class: "ud-ai-panel"
};
const _hoisted_17 = { class: "ud-ai-header" };
const _hoisted_18 = { class: "ud-ai-header-actions" };
const _hoisted_19 = {
  ref: "aiMessagesRef",
  class: "ud-ai-messages"
};
const _hoisted_20 = { class: "ud-ai-msg-content" };
const _hoisted_21 = {
  key: 0,
  class: "ud-ai-msg assistant"
};
const _hoisted_22 = {
  key: 0,
  class: "ud-ai-followup"
};
const _hoisted_23 = ["onClick"];
const _hoisted_24 = { class: "ud-ai-input-area" };
const _hoisted_25 = { class: "ud-ai-input-row" };
const _hoisted_26 = ["disabled"];
const _hoisted_27 = { class: "ud-modal" };
const _hoisted_28 = { class: "ud-modal-header" };
const _hoisted_29 = { class: "ud-modal-actions" };
const _hoisted_30 = ["title"];
const _hoisted_31 = { class: "ud-modal-body" };
const _hoisted_32 = { class: "ud-json-pre" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "div",
    {
      class: "uni-draw",
      style: _normalizeStyle($setup.cssVars)
    },
    [
      _createCommentVNode(" 鈹€鈹€ Header 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ "),
      $props.showHeader !== false ? (_openBlock(), _createElementBlock("header", _hoisted_1, [
        _createElementVNode("div", _hoisted_2, [
          _cache[14] || (_cache[14] = _createStaticVNode('<div class="ud-logo" data-v-1b51f58a><svg width="22" height="22" viewBox="0 0 24 24" fill="none" data-v-1b51f58a><rect width="24" height="24" rx="6" fill="var(--uni-draw-primary)" data-v-1b51f58a></rect><path d="M7 8h10M7 12h10M7 16h6" stroke="#fff" stroke-width="2" stroke-linecap="round" data-v-1b51f58a></path></svg><span class="ud-brand" data-v-1b51f58a>UniDraw</span></div><span class="ud-divider" data-v-1b51f58a>|</span>', 2)),
          _createElementVNode(
            "span",
            _hoisted_3,
            _toDisplayString($setup.graphData.meta?.title || "UniDraw"),
            1
            /* TEXT */
          )
        ]),
        _createElementVNode("div", _hoisted_4, [
          _createElementVNode(
            "span",
            _hoisted_5,
            _toDisplayString(Math.round(($setup.canvasRef?.zoom ?? 1) * 100)) + "%",
            1
            /* TEXT */
          ),
          $props.showAiPanel !== false ? (_openBlock(), _createElementBlock("button", {
            key: 0,
            class: "ud-btn ud-btn-primary",
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.aiPanelVisible = !$setup.aiPanelVisible)
          }, [..._cache[15] || (_cache[15] = [
            _createElementVNode(
              "svg",
              {
                width: "13",
                height: "13",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2"
              },
              [
                _createElementVNode("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" })
              ],
              -1
              /* CACHED */
            ),
            _createTextVNode(
              " AI 缁樺浘 ",
              -1
              /* CACHED */
            )
          ])])) : _createCommentVNode("v-if", true),
          _createElementVNode("button", {
            class: "ud-btn",
            onClick: $setup.onExportPNG
          }, "瀵煎嚭 PNG"),
          _createElementVNode("button", {
            class: "ud-btn",
            onClick: $setup.onExportJSON
          }, "瀵煎嚭 JSON")
        ])
      ])) : _createCommentVNode("v-if", true),
      _createCommentVNode(" 鈹€鈹€ Body 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€ "),
      _createElementVNode("div", _hoisted_6, [
        _createCommentVNode(" Left panel "),
        $props.showShapePanel !== false ? (_openBlock(), _createElementBlock("aside", _hoisted_7, [
          _createElementVNode("div", _hoisted_8, [
            _createElementVNode(
              "button",
              {
                class: _normalizeClass(["ud-tab", { active: $setup.leftTab === "shapes" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.leftTab = "shapes")
              },
              "鍥惧舰",
              2
              /* CLASS */
            ),
            $props.assets && $props.assets.length > 0 && $props.showAssetsPanel !== false ? (_openBlock(), _createElementBlock(
              "button",
              {
                key: 0,
                class: _normalizeClass(["ud-tab", { active: $setup.leftTab === "assets" }]),
                onClick: _cache[2] || (_cache[2] = ($event) => $setup.leftTab = "assets")
              },
              "绱犳潗",
              2
              /* CLASS */
            )) : _createCommentVNode("v-if", true),
            $props.showTemplates !== false ? (_openBlock(), _createElementBlock("button", {
              key: 1,
              class: "ud-tab ud-tab-text",
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.templateOpen = true)
            }, "妯℃澘")) : _createCommentVNode("v-if", true)
          ]),
          _createCommentVNode(" Shapes "),
          _withDirectives(_createVNode($setup["ShapePanel"], {
            libraries: $setup.libraries,
            onSelect: $setup.onShapeAdd,
            onDragstart: $setup.onShapeDragStart
          }, null, 8, ["libraries"]), [
            [_vShow, $setup.leftTab === "shapes"]
          ]),
          _createCommentVNode(" External assets "),
          $setup.leftTab === "assets" ? (_openBlock(), _createElementBlock("div", _hoisted_9, [
            (_openBlock(true), _createElementBlock(
              _Fragment,
              null,
              _renderList($props.assets, (asset) => {
                return _openBlock(), _createElementBlock("div", {
                  key: asset.id,
                  class: "ud-asset-cell",
                  title: asset.name,
                  draggable: "true",
                  onClick: ($event) => $setup.onAssetAdd(asset),
                  onDragstart: ($event) => $setup.onAssetDragStart($event, asset)
                }, [
                  _createCommentVNode(" eslint-disable-next-line vue/no-v-html "),
                  asset.type === "svg" ? (_openBlock(), _createElementBlock("div", {
                    key: 0,
                    class: "ud-asset-icon",
                    innerHTML: asset.content
                  }, null, 8, _hoisted_11)) : (_openBlock(), _createElementBlock("img", {
                    key: 1,
                    class: "ud-asset-icon",
                    src: asset.content,
                    alt: asset.name
                  }, null, 8, _hoisted_12)),
                  _createElementVNode(
                    "span",
                    _hoisted_13,
                    _toDisplayString(asset.name),
                    1
                    /* TEXT */
                  )
                ], 40, _hoisted_10);
              }),
              128
              /* KEYED_FRAGMENT */
            )),
            !$props.assets || $props.assets.length === 0 ? (_openBlock(), _createElementBlock("div", _hoisted_14, "鏆傛棤绱犳潗")) : _createCommentVNode("v-if", true)
          ])) : _createCommentVNode("v-if", true)
        ])) : _createCommentVNode("v-if", true),
        _createCommentVNode(" Template modal "),
        _createVNode($setup["TemplatePanel"], {
          visible: $setup.templateOpen,
          templates: $props.templates,
          onApply: $setup.onTemplateApply,
          onClose: _cache[4] || (_cache[4] = ($event) => $setup.templateOpen = false)
        }, null, 8, ["visible", "templates"]),
        _createCommentVNode(" Canvas area "),
        _createElementVNode("main", _hoisted_15, [
          _createVNode($setup["FlexibleDraw"], {
            ref: "canvasRef",
            modelValue: $setup.graphData,
            "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.graphData = $event),
            class: "ud-canvas",
            grid: $props.grid !== false,
            snapline: $props.snapline !== false,
            readonly: $props.readonly,
            "onSelection:change": $setup.onSelectionChange,
            onDragover: _cache[6] || (_cache[6] = _withModifiers(() => {
            }, ["prevent"])),
            onDrop: _withModifiers($setup.onExternalDrop, ["prevent"])
          }, null, 8, ["modelValue", "grid", "snapline", "readonly"]),
          _createCommentVNode(" Quick action bar "),
          ($setup.selectedNode || $setup.selectedEdge) && !$setup.qabClosed ? (_openBlock(), _createBlock($setup["QuickActionBar"], {
            key: 0,
            "selected-node": $setup.selectedNode,
            "selected-edge": $setup.selectedEdge,
            "sketch-mode": $setup.sketchMode,
            "element-sketch-ids": $setup.elementSketchIds,
            onUpdateStyle: $setup.onUpdateStyle,
            onUpdateEdgeStyle: $setup.onUpdateEdgeStyle,
            onChangeEdgeType: $setup.onChangeEdgeType,
            onResize: $setup.onResizeNode,
            onClose: _cache[7] || (_cache[7] = ($event) => $setup.qabClosed = true),
            onToggleSketch: $setup.onToggleSketch,
            onToggleElementSketch: $setup.onToggleElementSketch
          }, null, 8, ["selected-node", "selected-edge", "sketch-mode", "element-sketch-ids"])) : _createCommentVNode("v-if", true),
          _createCommentVNode(" Toolbar "),
          $props.showToolbar !== false ? (_openBlock(), _createBlock($setup["Toolbar"], {
            key: 1,
            zoom: $setup.canvasRef?.zoom ?? 1,
            "can-undo": $setup.canvasRef?.canUndo ?? false,
            "can-redo": $setup.canvasRef?.canRedo ?? false,
            "pan-mode": $setup.canvasRef?.panMode ?? false,
            "sketch-mode": $setup.sketchMode,
            "draw-mode": $setup.drawMode,
            "selection-count": $setup.canvasRef?.selectionCount ?? 0,
            onAction: $setup.onToolbarAction
          }, null, 8, ["zoom", "can-undo", "can-redo", "pan-mode", "sketch-mode", "draw-mode", "selection-count"])) : _createCommentVNode("v-if", true)
        ]),
        _createCommentVNode(" AI Panel "),
        $props.showAiPanel !== false && $setup.aiPanelVisible ? (_openBlock(), _createElementBlock("aside", _hoisted_16, [
          _createElementVNode("div", _hoisted_17, [
            _cache[18] || (_cache[18] = _createElementVNode(
              "span",
              { class: "ud-ai-title" },
              "AI 缁樺浘",
              -1
              /* CACHED */
            )),
            _createElementVNode("div", _hoisted_18, [
              _createElementVNode("button", {
                class: "ud-ai-icon-btn",
                title: "鏂板缓瀵硅瘽",
                onClick: $setup.clearAiChat
              }, [..._cache[16] || (_cache[16] = [
                _createElementVNode(
                  "svg",
                  {
                    width: "14",
                    height: "14",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2"
                  },
                  [
                    _createElementVNode("line", {
                      x1: "12",
                      y1: "5",
                      x2: "12",
                      y2: "19"
                    }),
                    _createElementVNode("line", {
                      x1: "5",
                      y1: "12",
                      x2: "19",
                      y2: "12"
                    })
                  ],
                  -1
                  /* CACHED */
                )
              ])]),
              _createElementVNode("button", {
                class: "ud-ai-icon-btn",
                title: "鍏抽棴",
                onClick: _cache[8] || (_cache[8] = ($event) => $setup.aiPanelVisible = false)
              }, [..._cache[17] || (_cache[17] = [
                _createElementVNode(
                  "svg",
                  {
                    width: "14",
                    height: "14",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2"
                  },
                  [
                    _createElementVNode("line", {
                      x1: "18",
                      y1: "6",
                      x2: "6",
                      y2: "18"
                    }),
                    _createElementVNode("line", {
                      x1: "6",
                      y1: "6",
                      x2: "18",
                      y2: "18"
                    })
                  ],
                  -1
                  /* CACHED */
                )
              ])])
            ])
          ]),
          _createCommentVNode(" Messages "),
          _createElementVNode(
            "div",
            _hoisted_19,
            [
              (_openBlock(true), _createElementBlock(
                _Fragment,
                null,
                _renderList($setup.aiMessages, (msg, i) => {
                  return _openBlock(), _createElementBlock(
                    "div",
                    {
                      key: i,
                      class: _normalizeClass(["ud-ai-msg", msg.role])
                    },
                    [
                      _createElementVNode(
                        "div",
                        _hoisted_20,
                        _toDisplayString(msg.content),
                        1
                        /* TEXT */
                      )
                    ],
                    2
                    /* CLASS */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $setup.aiLoading ? (_openBlock(), _createElementBlock("div", _hoisted_21, [..._cache[19] || (_cache[19] = [
                _createElementVNode(
                  "div",
                  { class: "ud-ai-msg-content ud-ai-typing" },
                  [
                    _createElementVNode("span", { class: "dot" }),
                    _createElementVNode("span", { class: "dot" }),
                    _createElementVNode("span", { class: "dot" })
                  ],
                  -1
                  /* CACHED */
                )
              ])])) : _createCommentVNode("v-if", true)
            ],
            512
            /* NEED_PATCH */
          ),
          _createCommentVNode(" Follow-up chips "),
          $setup.followUpQuestions.length > 0 && !$setup.aiLoading ? (_openBlock(), _createElementBlock("div", _hoisted_22, [
            (_openBlock(true), _createElementBlock(
              _Fragment,
              null,
              _renderList($setup.followUpQuestions, (q) => {
                return _openBlock(), _createElementBlock("button", {
                  key: q,
                  class: "ud-ai-chip",
                  onClick: ($event) => $setup.onAiSend(q)
                }, _toDisplayString(q), 9, _hoisted_23);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : _createCommentVNode("v-if", true),
          _createCommentVNode(" Input "),
          _createElementVNode("div", _hoisted_24, [
            _createElementVNode("div", _hoisted_25, [
              _withDirectives(_createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $setup.aiInput = $event),
                  class: "ud-ai-input",
                  placeholder: "鎻忚堪浣犳兂缁樺埗鐨勫浘琛?..",
                  onKeyup: _cache[10] || (_cache[10] = _withKeys(($event) => $setup.onAiSend($setup.aiInput), ["enter"]))
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [_vModelText, $setup.aiInput]
              ]),
              _createElementVNode("button", {
                class: "ud-ai-send",
                disabled: $setup.aiLoading || !$setup.aiInput.trim(),
                onClick: _cache[11] || (_cache[11] = ($event) => $setup.onAiSend($setup.aiInput))
              }, [..._cache[20] || (_cache[20] = [
                _createElementVNode(
                  "svg",
                  {
                    width: "15",
                    height: "15",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2"
                  },
                  [
                    _createElementVNode("line", {
                      x1: "22",
                      y1: "2",
                      x2: "11",
                      y2: "13"
                    }),
                    _createElementVNode("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })
                  ],
                  -1
                  /* CACHED */
                )
              ])], 8, _hoisted_26)
            ])
          ])
        ])) : _createCommentVNode("v-if", true)
      ]),
      _createCommentVNode(" JSON preview modal "),
      (_openBlock(), _createBlock(_Teleport, { to: "body" }, [
        $setup.jsonModalOpen ? (_openBlock(), _createElementBlock("div", {
          key: 0,
          class: "ud-modal-backdrop",
          onClick: _cache[13] || (_cache[13] = _withModifiers(($event) => $setup.jsonModalOpen = false, ["self"]))
        }, [
          _createElementVNode("div", _hoisted_27, [
            _createElementVNode("div", _hoisted_28, [
              _cache[23] || (_cache[23] = _createElementVNode(
                "span",
                null,
                "JSON 棰勮",
                -1
                /* CACHED */
              )),
              _createElementVNode("div", _hoisted_29, [
                _createElementVNode("button", {
                  class: "ud-icon-btn",
                  title: $setup.copyDone ? "宸插鍒? : "澶嶅埗",
                  onClick: $setup.copyJson
                }, [..._cache[21] || (_cache[21] = [
                  _createElementVNode(
                    "svg",
                    {
                      width: "14",
                      height: "14",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2"
                    },
                    [
                      _createElementVNode("rect", {
                        x: "9",
                        y: "9",
                        width: "13",
                        height: "13",
                        rx: "2"
                      }),
                      _createElementVNode("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
                    ],
                    -1
                    /* CACHED */
                  )
                ])], 8, _hoisted_30),
                _createElementVNode("button", {
                  class: "ud-icon-btn",
                  title: "涓嬭浇",
                  onClick: $setup.downloadJson
                }, [..._cache[22] || (_cache[22] = [
                  _createElementVNode(
                    "svg",
                    {
                      width: "14",
                      height: "14",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      "stroke-width": "2"
                    },
                    [
                      _createElementVNode("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                      _createElementVNode("polyline", { points: "7 10 12 15 17 10" }),
                      _createElementVNode("line", {
                        x1: "12",
                        y1: "15",
                        x2: "12",
                        y2: "3"
                      })
                    ],
                    -1
                    /* CACHED */
                  )
                ])]),
                _createElementVNode("button", {
                  class: "ud-icon-btn",
                  onClick: _cache[12] || (_cache[12] = ($event) => $setup.jsonModalOpen = false)
                }, "鉁?)
              ])
            ]),
            _createElementVNode("div", _hoisted_31, [
              _createElementVNode(
                "pre",
                _hoisted_32,
                _toDisplayString($setup.jsonPreviewText),
                1
                /* TEXT */
              )
            ])
          ])
        ])) : _createCommentVNode("v-if", true)
      ]))
    ],
    4
    /* STYLE */
  );
}
import "/@fs/D:/SoftwareProjects/uni-flexible-draw/lib/components/UniDraw/UniDraw.vue?vue&type=style&index=0&scoped=1b51f58a&lang.css";
_sfc_main.__hmrId = "1b51f58a";
typeof __VUE_HMR_RUNTIME__ !== "undefined" && __VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main);
import.meta.hot.on("file-changed", ({ file }) => {
  __VUE_HMR_RUNTIME__.CHANGED_FILE = file;
});
import.meta.hot.accept((mod) => {
  if (!mod) return;
  const { default: updated, _rerender_only } = mod;
  if (_rerender_only) {
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render);
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated);
  }
});
import _export_sfc from "/@id/__x00__plugin-vue:export-helper";
export default /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1b51f58a"], ["__file", "D:/SoftwareProjects/uni-flexible-draw/lib/components/UniDraw/UniDraw.vue"]]);

//# sourceMappingURL=data:application/json;base64,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QUFBLHNCQUFZLE1BQUs7QUFBQSxzQkFBTyxRQUFPO0FBQUEsc0JBQWUsZ0JBQWE7QUFBQTs7c0JBQzdGLG9CQUFrRDtBQUFBLHdCQUE1QyxHQUFFO0FBQUEsd0JBQUksR0FBRTtBQUFBLHdCQUFJLE9BQU07QUFBQSx3QkFBSyxRQUFPO0FBQUEsd0JBQUssSUFBRztBQUFBO3NCQUFNLG9CQUFvRSxVQUE5RCxHQUFFLDBEQUF5RDtBQUFBOzs7OztnQkFHdkgsb0JBSVM7QUFBQSxrQkFKRCxPQUFNO0FBQUEsa0JBQWMsT0FBTTtBQUFBLGtCQUFNLFNBQU87QUFBQTtrQkFDN0M7QUFBQSxvQkFFTTtBQUFBO0FBQUEsc0JBRkQsT0FBTTtBQUFBLHNCQUFLLFFBQU87QUFBQSxzQkFBSyxTQUFRO0FBQUEsc0JBQVksTUFBSztBQUFBLHNCQUFPLFFBQU87QUFBQSxzQkFBZSxnQkFBYTtBQUFBOztzQkFDN0Ysb0JBQXNELFVBQWhELEdBQUUsNENBQTJDO0FBQUEsc0JBQUcsb0JBQXNDLGNBQTVCLFFBQU8sbUJBQWtCO0FBQUEsc0JBQUcsb0JBQXVDO0FBQUEsd0JBQWpDLElBQUc7QUFBQSx3QkFBSyxJQUFHO0FBQUEsd0JBQUssSUFBRztBQUFBLHdCQUFLLElBQUc7QUFBQTs7Ozs7O2dCQUdqSSxvQkFBcUU7QUFBQSxrQkFBN0QsT0FBTTtBQUFBLGtCQUFlLFNBQUssd0NBQUUsdUJBQWE7QUFBQSxtQkFBVSxHQUFDO0FBQUE7O1lBR2hFLG9CQUVNLE9BRk4sYUFFTTtBQUFBLGNBREo7QUFBQSxnQkFBb0Q7QUFBQSxnQkFBcEQ7QUFBQSxnQkFBb0QsaUJBQXhCLHNCQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUEiLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIlVuaURyYXcudnVlIl0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cbiAgPGRpdiBjbGFzcz1cInVuaS1kcmF3XCIgOnN0eWxlPVwiY3NzVmFyc1wiPlxuICAgIDwhLS0g4pSA4pSAIEhlYWRlciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAgLS0+XG4gICAgPGhlYWRlciB2LWlmPVwic2hvd0hlYWRlciAhPT0gZmFsc2VcIiBjbGFzcz1cInVkLWhlYWRlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cInVkLWhlYWRlci1sZWZ0XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ1ZC1sb2dvXCI+XG4gICAgICAgICAgPHN2ZyB3aWR0aD1cIjIyXCIgaGVpZ2h0PVwiMjJcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIj5cbiAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiIHJ4PVwiNlwiIGZpbGw9XCJ2YXIoLS11bmktZHJhdy1wcmltYXJ5KVwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTcgOGgxME03IDEyaDEwTTcgMTZoNlwiIHN0cm9rZT1cIiNmZmZcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1ZC1icmFuZFwiPlVuaURyYXc8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8c3BhbiBjbGFzcz1cInVkLWRpdmlkZXJcIj58PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInVkLXRpdGxlXCI+e3sgZ3JhcGhEYXRhLm1ldGE/LnRpdGxlIHx8ICdVbmlEcmF3JyB9fTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInVkLWhlYWRlci1yaWdodFwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInVkLXpvb20tYmFkZ2VcIj57eyBNYXRoLnJvdW5kKChjYW52YXNSZWY/Lnpvb20gPz8gMSkgKiAxMDApIH19JTwvc3Bhbj5cbiAgICAgICAgPGJ1dHRvbiB2LWlmPVwic2hvd0FpUGFuZWwgIT09IGZhbHNlXCIgY2xhc3M9XCJ1ZC1idG4gdWQtYnRuLXByaW1hcnlcIiBAY2xpY2s9XCJhaVBhbmVsVmlzaWJsZSA9ICFhaVBhbmVsVmlzaWJsZVwiPlxuICAgICAgICAgIDxzdmcgd2lkdGg9XCIxM1wiIGhlaWdodD1cIjEzXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMlwiPlxuICAgICAgICAgICAgPHBvbHlnb24gcG9pbnRzPVwiMTMgMiAzIDE0IDEyIDE0IDExIDIyIDIxIDEwIDEyIDEwIDEzIDJcIiAvPlxuICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgIEFJIOe7mOWbvlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInVkLWJ0blwiIEBjbGljaz1cIm9uRXhwb3J0UE5HXCI+5a+85Ye6IFBORzwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwidWQtYnRuXCIgQGNsaWNrPVwib25FeHBvcnRKU09OXCI+5a+85Ye6IEpTT048L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvaGVhZGVyPlxuXG4gICAgPCEtLSDilIDilIAgQm9keSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAgLS0+XG4gICAgPGRpdiBjbGFzcz1cInVkLWJvZHlcIj5cblxuICAgICAgPCEtLSBMZWZ0IHBhbmVsIC0tPlxuICAgICAgPGFzaWRlIHYtaWY9XCJzaG93U2hhcGVQYW5lbCAhPT0gZmFsc2VcIiBjbGFzcz1cInVkLWxlZnQtcGFuZWxcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cInVkLXBhbmVsLXRhYnNcIj5cbiAgICAgICAgICA8YnV0dG9uIDpjbGFzcz1cIlsndWQtdGFiJywgeyBhY3RpdmU6IGxlZnRUYWIgPT09ICdzaGFwZXMnIH1dXCIgQGNsaWNrPVwibGVmdFRhYiA9ICdzaGFwZXMnXCI+5Zu+5b2iPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdi1pZj1cImFzc2V0cyAmJiBhc3NldHMubGVuZ3RoID4gMCAmJiBzaG93QXNzZXRzUGFuZWwgIT09IGZhbHNlXCJcbiAgICAgICAgICAgIDpjbGFzcz1cIlsndWQtdGFiJywgeyBhY3RpdmU6IGxlZnRUYWIgPT09ICdhc3NldHMnIH1dXCJcbiAgICAgICAgICAgIEBjbGljaz1cImxlZnRUYWIgPSAnYXNzZXRzJ1wiXG4gICAgICAgICAgPue0oOadkDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHYtaWY9XCJzaG93VGVtcGxhdGVzICE9PSBmYWxzZVwiXG4gICAgICAgICAgICBjbGFzcz1cInVkLXRhYiB1ZC10YWItdGV4dFwiXG4gICAgICAgICAgICBAY2xpY2s9XCJ0ZW1wbGF0ZU9wZW4gPSB0cnVlXCJcbiAgICAgICAgICA+5qih5p2/PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDwhLS0gU2hhcGVzIC0tPlxuICAgICAgICA8U2hhcGVQYW5lbFxuICAgICAgICAgIHYtc2hvdz1cImxlZnRUYWIgPT09ICdzaGFwZXMnXCJcbiAgICAgICAgICA6bGlicmFyaWVzPVwibGlicmFyaWVzXCJcbiAgICAgICAgICBAc2VsZWN0PVwib25TaGFwZUFkZFwiXG4gICAgICAgICAgQGRyYWdzdGFydD1cIm9uU2hhcGVEcmFnU3RhcnRcIlxuICAgICAgICAvPlxuXG4gICAgICAgIDwhLS0gRXh0ZXJuYWwgYXNzZXRzIC0tPlxuICAgICAgICA8ZGl2IHYtaWY9XCJsZWZ0VGFiID09PSAnYXNzZXRzJ1wiIGNsYXNzPVwidWQtYXNzZXRzLWdyaWRcIj5cbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICB2LWZvcj1cImFzc2V0IGluIGFzc2V0c1wiXG4gICAgICAgICAgICA6a2V5PVwiYXNzZXQuaWRcIlxuICAgICAgICAgICAgY2xhc3M9XCJ1ZC1hc3NldC1jZWxsXCJcbiAgICAgICAgICAgIDp0aXRsZT1cImFzc2V0Lm5hbWVcIlxuICAgICAgICAgICAgZHJhZ2dhYmxlPVwidHJ1ZVwiXG4gICAgICAgICAgICBAY2xpY2s9XCJvbkFzc2V0QWRkKGFzc2V0KVwiXG4gICAgICAgICAgICBAZHJhZ3N0YXJ0PVwib25Bc3NldERyYWdTdGFydCgkZXZlbnQsIGFzc2V0KVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPCEtLSBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdnVlL25vLXYtaHRtbCAtLT5cbiAgICAgICAgICAgIDxkaXYgdi1pZj1cImFzc2V0LnR5cGUgPT09ICdzdmcnXCIgY2xhc3M9XCJ1ZC1hc3NldC1pY29uXCIgdi1odG1sPVwiYXNzZXQuY29udGVudFwiIC8+XG4gICAgICAgICAgICA8aW1nIHYtZWxzZSBjbGFzcz1cInVkLWFzc2V0LWljb25cIiA6c3JjPVwiYXNzZXQuY29udGVudFwiIDphbHQ9XCJhc3NldC5uYW1lXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidWQtYXNzZXQtbGFiZWxcIj57eyBhc3NldC5uYW1lIH19PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgdi1pZj1cIiFhc3NldHMgfHwgYXNzZXRzLmxlbmd0aCA9PT0gMFwiIGNsYXNzPVwidWQtYXNzZXRzLWVtcHR5XCI+5pqC5peg57Sg5p2QPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hc2lkZT5cblxuICAgICAgPCEtLSBUZW1wbGF0ZSBtb2RhbCAtLT5cbiAgICAgIDxUZW1wbGF0ZVBhbmVsXG4gICAgICAgIDp2aXNpYmxlPVwidGVtcGxhdGVPcGVuXCJcbiAgICAgICAgOnRlbXBsYXRlcz1cInRlbXBsYXRlc1wiXG4gICAgICAgIEBhcHBseT1cIm9uVGVtcGxhdGVBcHBseVwiXG4gICAgICAgIEBjbG9zZT1cInRlbXBsYXRlT3BlbiA9IGZhbHNlXCJcbiAgICAgIC8+XG5cbiAgICAgIDwhLS0gQ2FudmFzIGFyZWEgLS0+XG4gICAgICA8bWFpbiBjbGFzcz1cInVkLWNhbnZhcy1hcmVhXCI+XG4gICAgICAgIDxGbGV4aWJsZURyYXdcbiAgICAgICAgICByZWY9XCJjYW52YXNSZWZcIlxuICAgICAgICAgIHYtbW9kZWw9XCJncmFwaERhdGFcIlxuICAgICAgICAgIGNsYXNzPVwidWQtY2FudmFzXCJcbiAgICAgICAgICA6Z3JpZD1cImdyaWQgIT09IGZhbHNlXCJcbiAgICAgICAgICA6c25hcGxpbmU9XCJzbmFwbGluZSAhPT0gZmFsc2VcIlxuICAgICAgICAgIDpyZWFkb25seT1cInJlYWRvbmx5XCJcbiAgICAgICAgICBAc2VsZWN0aW9uOmNoYW5nZT1cIm9uU2VsZWN0aW9uQ2hhbmdlXCJcbiAgICAgICAgICBAZHJhZ292ZXIucHJldmVudFxuICAgICAgICAgIEBkcm9wLnByZXZlbnQ9XCJvbkV4dGVybmFsRHJvcFwiXG4gICAgICAgIC8+XG5cbiAgICAgICAgPCEtLSBRdWljayBhY3Rpb24gYmFyIC0tPlxuICAgICAgICA8UXVpY2tBY3Rpb25CYXJcbiAgICAgICAgICB2LWlmPVwiKHNlbGVjdGVkTm9kZSB8fCBzZWxlY3RlZEVkZ2UpICYmICFxYWJDbG9zZWRcIlxuICAgICAgICAgIDpzZWxlY3RlZC1ub2RlPVwic2VsZWN0ZWROb2RlXCJcbiAgICAgICAgICA6c2VsZWN0ZWQtZWRnZT1cInNlbGVjdGVkRWRnZVwiXG4gICAgICAgICAgOnNrZXRjaC1tb2RlPVwic2tldGNoTW9kZVwiXG4gICAgICAgICAgOmVsZW1lbnQtc2tldGNoLWlkcz1cImVsZW1lbnRTa2V0Y2hJZHNcIlxuICAgICAgICAgIEB1cGRhdGUtc3R5bGU9XCJvblVwZGF0ZVN0eWxlXCJcbiAgICAgICAgICBAdXBkYXRlLWVkZ2Utc3R5bGU9XCJvblVwZGF0ZUVkZ2VTdHlsZVwiXG4gICAgICAgICAgQGNoYW5nZS1lZGdlLXR5cGU9XCJvbkNoYW5nZUVkZ2VUeXBlXCJcbiAgICAgICAgICBAcmVzaXplPVwib25SZXNpemVOb2RlXCJcbiAgICAgICAgICBAY2xvc2U9XCJxYWJDbG9zZWQgPSB0cnVlXCJcbiAgICAgICAgICBAdG9nZ2xlLXNrZXRjaD1cIm9uVG9nZ2xlU2tldGNoXCJcbiAgICAgICAgICBAdG9nZ2xlLWVsZW1lbnQtc2tldGNoPVwib25Ub2dnbGVFbGVtZW50U2tldGNoXCJcbiAgICAgICAgLz5cblxuICAgICAgICA8IS0tIFRvb2xiYXIgLS0+XG4gICAgICAgIDxUb29sYmFyXG4gICAgICAgICAgdi1pZj1cInNob3dUb29sYmFyICE9PSBmYWxzZVwiXG4gICAgICAgICAgOnpvb209XCJjYW52YXNSZWY/Lnpvb20gPz8gMVwiXG4gICAgICAgICAgOmNhbi11bmRvPVwiY2FudmFzUmVmPy5jYW5VbmRvID8/IGZhbHNlXCJcbiAgICAgICAgICA6Y2FuLXJlZG89XCJjYW52YXNSZWY/LmNhblJlZG8gPz8gZmFsc2VcIlxuICAgICAgICAgIDpwYW4tbW9kZT1cImNhbnZhc1JlZj8ucGFuTW9kZSA/PyBmYWxzZVwiXG4gICAgICAgICAgOnNrZXRjaC1tb2RlPVwic2tldGNoTW9kZVwiXG4gICAgICAgICAgOmRyYXctbW9kZT1cImRyYXdNb2RlXCJcbiAgICAgICAgICA6c2VsZWN0aW9uLWNvdW50PVwiY2FudmFzUmVmPy5zZWxlY3Rpb25Db3VudCA/PyAwXCJcbiAgICAgICAgICBAYWN0aW9uPVwib25Ub29sYmFyQWN0aW9uXCJcbiAgICAgICAgLz5cbiAgICAgIDwvbWFpbj5cblxuICAgICAgPCEtLSBBSSBQYW5lbCAtLT5cbiAgICAgIDxhc2lkZSB2LWlmPVwic2hvd0FpUGFuZWwgIT09IGZhbHNlICYmIGFpUGFuZWxWaXNpYmxlXCIgY2xhc3M9XCJ1ZC1haS1wYW5lbFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwidWQtYWktaGVhZGVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1ZC1haS10aXRsZVwiPkFJIOe7mOWbvjwvc3Bhbj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidWQtYWktaGVhZGVyLWFjdGlvbnNcIj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ1ZC1haS1pY29uLWJ0blwiIHRpdGxlPVwi5paw5bu65a+56K+dXCIgQGNsaWNrPVwiY2xlYXJBaUNoYXRcIj5cbiAgICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCI+XG4gICAgICAgICAgICAgICAgPGxpbmUgeDE9XCIxMlwiIHkxPVwiNVwiIHgyPVwiMTJcIiB5Mj1cIjE5XCIgLz48bGluZSB4MT1cIjVcIiB5MT1cIjEyXCIgeDI9XCIxOVwiIHkyPVwiMTJcIiAvPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInVkLWFpLWljb24tYnRuXCIgdGl0bGU9XCLlhbPpl61cIiBAY2xpY2s9XCJhaVBhbmVsVmlzaWJsZSA9IGZhbHNlXCI+XG4gICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMlwiPlxuICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiMThcIiB5MT1cIjZcIiB4Mj1cIjZcIiB5Mj1cIjE4XCIgLz48bGluZSB4MT1cIjZcIiB5MT1cIjZcIiB4Mj1cIjE4XCIgeTI9XCIxOFwiIC8+XG4gICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8IS0tIE1lc3NhZ2VzIC0tPlxuICAgICAgICA8ZGl2IHJlZj1cImFpTWVzc2FnZXNSZWZcIiBjbGFzcz1cInVkLWFpLW1lc3NhZ2VzXCI+XG4gICAgICAgICAgPGRpdiB2LWZvcj1cIihtc2csIGkpIGluIGFpTWVzc2FnZXNcIiA6a2V5PVwiaVwiIDpjbGFzcz1cIlsndWQtYWktbXNnJywgbXNnLnJvbGVdXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidWQtYWktbXNnLWNvbnRlbnRcIj57eyBtc2cuY29udGVudCB9fTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgdi1pZj1cImFpTG9hZGluZ1wiIGNsYXNzPVwidWQtYWktbXNnIGFzc2lzdGFudFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVkLWFpLW1zZy1jb250ZW50IHVkLWFpLXR5cGluZ1wiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImRvdFwiIC8+PHNwYW4gY2xhc3M9XCJkb3RcIiAvPjxzcGFuIGNsYXNzPVwiZG90XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPCEtLSBGb2xsb3ctdXAgY2hpcHMgLS0+XG4gICAgICAgIDxkaXYgdi1pZj1cImZvbGxvd1VwUXVlc3Rpb25zLmxlbmd0aCA+IDAgJiYgIWFpTG9hZGluZ1wiIGNsYXNzPVwidWQtYWktZm9sbG93dXBcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB2LWZvcj1cInEgaW4gZm9sbG93VXBRdWVzdGlvbnNcIlxuICAgICAgICAgICAgOmtleT1cInFcIlxuICAgICAgICAgICAgY2xhc3M9XCJ1ZC1haS1jaGlwXCJcbiAgICAgICAgICAgIEBjbGljaz1cIm9uQWlTZW5kKHEpXCJcbiAgICAgICAgICA+e3sgcSB9fTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPCEtLSBJbnB1dCAtLT5cbiAgICAgICAgPGRpdiBjbGFzcz1cInVkLWFpLWlucHV0LWFyZWFcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidWQtYWktaW5wdXQtcm93XCI+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdi1tb2RlbD1cImFpSW5wdXRcIlxuICAgICAgICAgICAgICBjbGFzcz1cInVkLWFpLWlucHV0XCJcbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCLmj4/ov7DkvaDmg7Pnu5jliLbnmoTlm77ooaguLi5cIlxuICAgICAgICAgICAgICBAa2V5dXAuZW50ZXI9XCJvbkFpU2VuZChhaUlucHV0KVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBjbGFzcz1cInVkLWFpLXNlbmRcIlxuICAgICAgICAgICAgICA6ZGlzYWJsZWQ9XCJhaUxvYWRpbmcgfHwgIWFpSW5wdXQudHJpbSgpXCJcbiAgICAgICAgICAgICAgQGNsaWNrPVwib25BaVNlbmQoYWlJbnB1dClcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTVcIiBoZWlnaHQ9XCIxNVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjJcIj5cbiAgICAgICAgICAgICAgICA8bGluZSB4MT1cIjIyXCIgeTE9XCIyXCIgeDI9XCIxMVwiIHkyPVwiMTNcIiAvPjxwb2x5Z29uIHBvaW50cz1cIjIyIDIgMTUgMjIgMTEgMTMgMiA5IDIyIDJcIiAvPlxuICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXNpZGU+XG4gICAgPC9kaXY+XG5cbiAgICA8IS0tIEpTT04gcHJldmlldyBtb2RhbCAtLT5cbiAgICA8VGVsZXBvcnQgdG89XCJib2R5XCI+XG4gICAgICA8ZGl2IHYtaWY9XCJqc29uTW9kYWxPcGVuXCIgY2xhc3M9XCJ1ZC1tb2RhbC1iYWNrZHJvcFwiIEBjbGljay5zZWxmPVwianNvbk1vZGFsT3BlbiA9IGZhbHNlXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ1ZC1tb2RhbFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1ZC1tb2RhbC1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzcGFuPkpTT04g6aKE6KeIPC9zcGFuPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVkLW1vZGFsLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInVkLWljb24tYnRuXCIgOnRpdGxlPVwiY29weURvbmUgPyAn5bey5aSN5Yi2JyA6ICflpI3liLYnXCIgQGNsaWNrPVwiY29weUpzb25cIj5cbiAgICAgICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjJcIj5cbiAgICAgICAgICAgICAgICAgIDxyZWN0IHg9XCI5XCIgeT1cIjlcIiB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiByeD1cIjJcIiAvPjxwYXRoIGQ9XCJNNSAxNUg0YTIgMiAwIDAgMS0yLTJWNGEyIDIgMCAwIDEgMi0yaDlhMiAyIDAgMCAxIDIgMnYxXCIgLz5cbiAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ1ZC1pY29uLWJ0blwiIHRpdGxlPVwi5LiL6L29XCIgQGNsaWNrPVwiZG93bmxvYWRKc29uXCI+XG4gICAgICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCI+XG4gICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTIxIDE1djRhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ2LTRcIiAvPjxwb2x5bGluZSBwb2ludHM9XCI3IDEwIDEyIDE1IDE3IDEwXCIgLz48bGluZSB4MT1cIjEyXCIgeTE9XCIxNVwiIHgyPVwiMTJcIiB5Mj1cIjNcIiAvPlxuICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInVkLWljb24tYnRuXCIgQGNsaWNrPVwianNvbk1vZGFsT3BlbiA9IGZhbHNlXCI+4pyVPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidWQtbW9kYWwtYm9keVwiPlxuICAgICAgICAgICAgPHByZSBjbGFzcz1cInVkLWpzb24tcHJlXCI+e3sganNvblByZXZpZXdUZXh0IH19PC9wcmU+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9UZWxlcG9ydD5cbiAgPC9kaXY+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0IHNldHVwIGxhbmc9XCJ0c1wiPlxuaW1wb3J0IHsgcmVmLCBjb21wdXRlZCwgd2F0Y2gsIHByb3ZpZGUsIG9uTW91bnRlZCwgbmV4dFRpY2sgfSBmcm9tICd2dWUnXG5pbXBvcnQgdHlwZSB7IEdyYXBoRGF0YSwgTm9kZURhdGEsIEFzc2V0SXRlbSwgVGVtcGxhdGVJdGVtLCBVbmlEcmF3VGhlbWUsIEFpTWVzc2FnZSB9IGZyb20gJ0B1bmktZHJhdy9zaGFyZWQnXG5pbXBvcnQgeyBMT0NBTEVfS0VZIH0gZnJvbSAnLi4vLi4vbG9jYWxlJ1xuaW1wb3J0IHpoQ04gZnJvbSAnLi4vLi4vbG9jYWxlL3poLUNOJ1xuaW1wb3J0IHR5cGUgeyBVbmlEcmF3TG9jYWxlIH0gZnJvbSAnLi4vLi4vbG9jYWxlJ1xuaW1wb3J0IHsgcmVnaXN0ZXJBbGxTaGFwZXMgfSBmcm9tICcuLi8uLi9zaGFwZXMvcmVnaXN0ZXInXG5pbXBvcnQgeyBnZXRBbGxMaWJyYXJpZXMgfSBmcm9tICcuLi8uLi9tYXRlcmlhbHMnXG5pbXBvcnQgRmxleGlibGVEcmF3IGZyb20gJy4uL0ZsZXhpYmxlRHJhdy9GbGV4aWJsZURyYXcudnVlJ1xuaW1wb3J0IFNoYXBlUGFuZWwgZnJvbSAnLi4vU2hhcGVQYW5lbC9TaGFwZVBhbmVsLnZ1ZSdcbmltcG9ydCBUb29sYmFyIGZyb20gJy4uL1Rvb2xiYXIvVG9vbGJhci52dWUnXG5pbXBvcnQgUXVpY2tBY3Rpb25CYXIgZnJvbSAnLi4vUXVpY2tBY3Rpb25CYXIvUXVpY2tBY3Rpb25CYXIudnVlJ1xuaW1wb3J0IFRlbXBsYXRlUGFuZWwgZnJvbSAnLi4vVGVtcGxhdGVQYW5lbC9UZW1wbGF0ZVBhbmVsLnZ1ZSdcbmltcG9ydCB0eXBlIHsgTWF0ZXJpYWxJdGVtIH0gZnJvbSAnQHVuaS1kcmF3L3NoYXJlZCdcblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBQcm9wc1xuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmV4cG9ydCBpbnRlcmZhY2UgVW5pRHJhd1Byb3BzIHtcbiAgbW9kZWxWYWx1ZT86IEdyYXBoRGF0YVxuICBhc3NldHM/OiBBc3NldEl0ZW1bXVxuICB0ZW1wbGF0ZXM/OiBUZW1wbGF0ZUl0ZW1bXVxuICBncmlkPzogYm9vbGVhblxuICBzbmFwbGluZT86IGJvb2xlYW5cbiAgcmVhZG9ubHk/OiBib29sZWFuXG4gIHNob3dIZWFkZXI/OiBib29sZWFuXG4gIHNob3dTaGFwZVBhbmVsPzogYm9vbGVhblxuICBzaG93QXNzZXRzUGFuZWw/OiBib29sZWFuXG4gIHNob3dUZW1wbGF0ZXM/OiBib29sZWFuXG4gIHNob3dUb29sYmFyPzogYm9vbGVhblxuICBzaG93TWluaW1hcD86IGJvb2xlYW5cbiAgc2hvd0FpUGFuZWw/OiBib29sZWFuXG4gIGxvY2FsZT86IFVuaURyYXdMb2NhbGVcbiAgdGhlbWU/OiBVbmlEcmF3VGhlbWVcbn1cblxuY29uc3QgcHJvcHMgPSB3aXRoRGVmYXVsdHMoZGVmaW5lUHJvcHM8VW5pRHJhd1Byb3BzPigpLCB7XG4gIGdyaWQ6IHRydWUsXG4gIHNuYXBsaW5lOiB0cnVlLFxuICByZWFkb25seTogZmFsc2UsXG59KVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIEVtaXRzXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QgZW1pdCA9IGRlZmluZUVtaXRzPHtcbiAgKGU6ICd1cGRhdGU6bW9kZWxWYWx1ZScsIGRhdGE6IEdyYXBoRGF0YSk6IHZvaWRcbiAgKGU6ICdyZWFkeScpOiB2b2lkXG4gIChlOiAnc2VsZWN0aW9uOmNoYW5nZScsIG5vZGVzOiBOb2RlRGF0YVtdLCBlZGdlczogdW5rbm93bltdKTogdm9pZFxuICAoZTogJ2FpOmdlbmVyYXRlJywgcHJvbXB0OiBzdHJpbmcsIGNvbnRleHQ6IEdyYXBoRGF0YSk6IHZvaWRcbn0+KClcblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBMb2NhbGVcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5wcm92aWRlKExPQ0FMRV9LRVksIHByb3BzLmxvY2FsZSA/PyB6aENOKVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIFRoZW1lIOKGkiBDU1MgdmFyc1xuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmNvbnN0IGNzc1ZhcnMgPSBjb21wdXRlZCgoKSA9PiB7XG4gIGNvbnN0IHQgPSBwcm9wcy50aGVtZVxuICBpZiAoIXQpIHJldHVybiB7fVxuICBjb25zdCBtYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgJy0tdW5pLWRyYXctcHJpbWFyeSc6ICAgICAgICAgIHQucHJpbWFyeUNvbG9yID8/ICcnLFxuICAgICctLXVuaS1kcmF3LXByaW1hcnktYmcnOiAgICAgICB0LnByaW1hcnlCZyA/PyAnJyxcbiAgICAnLS11bmktZHJhdy1wcmltYXJ5LWJnLWxpZ2h0JzogdC5wcmltYXJ5QmdMaWdodCA/PyAnJyxcbiAgICAnLS11bmktZHJhdy1jYW52YXMtYmcnOiAgICAgICAgdC5jYW52YXNCZyA/PyAnJyxcbiAgICAnLS11bmktZHJhdy1wYW5lbC1iZyc6ICAgICAgICAgdC5wYW5lbEJnID8/ICcnLFxuICAgICctLXVuaS1kcmF3LXBhbmVsLWJnLWFsdCc6ICAgICB0LnBhbmVsQmdBbHQgPz8gJycsXG4gICAgJy0tdW5pLWRyYXctcGFuZWwtYm9yZGVyJzogICAgIHQuYm9yZGVyQ29sb3IgPz8gJycsXG4gICAgJy0tdW5pLWRyYXctdGV4dCc6ICAgICAgICAgICAgIHQudGV4dENvbG9yID8/ICcnLFxuICAgICctLXVuaS1kcmF3LXRleHQtc2Vjb25kYXJ5JzogICB0LnRleHRTZWNvbmRhcnkgPz8gJycsXG4gICAgJy0tdW5pLWRyYXctdGV4dC1tdXRlZCc6ICAgICAgIHQudGV4dE11dGVkID8/ICcnLFxuICAgICctLXVuaS1kcmF3LWhvdmVyLWJnJzogICAgICAgICB0LmhvdmVyQmcgPz8gJycsXG4gICAgJy0tdW5pLWRyYXctc2hhZG93LXNtJzogICAgICAgIHQuc2hhZG93U20gPz8gJycsXG4gICAgJy0tdW5pLWRyYXctc2hhZG93LW1kJzogICAgICAgIHQuc2hhZG93TWQgPz8gJycsXG4gICAgJy0tdW5pLWRyYXctcmFkaXVzLXNtJzogICAgICAgIHQucmFkaXVzU20gPz8gJycsXG4gICAgJy0tdW5pLWRyYXctcmFkaXVzLW1kJzogICAgICAgIHQucmFkaXVzTWQgPz8gJycsXG4gICAgJy0tdW5pLWRyYXctcmFkaXVzLWxnJzogICAgICAgIHQucmFkaXVzTGcgPz8gJycsXG4gICAgJy0tdW5pLWRyYXctcGFuZWwtd2lkdGgnOiAgICAgIHQucGFuZWxXaWR0aCA/PyAnJyxcbiAgfVxuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKG1hcCkuZmlsdGVyKChbLCB2XSkgPT4gdiAhPT0gJycpKVxufSlcblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBHcmFwaCBkYXRhICh2LW1vZGVsIHBhc3N0aHJvdWdoIHdpdGggaW50ZXJuYWwgZGVmYXVsdClcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5jb25zdCBncmFwaERhdGEgPSByZWY8R3JhcGhEYXRhPihcbiAgcHJvcHMubW9kZWxWYWx1ZSA/PyB7XG4gICAgY2FudmFzOiB7IGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLCBncmlkOiB7IHNpemU6IDEwLCB2aXNpYmxlOiB0cnVlLCB0eXBlOiAnZG90JyB9LCB6b29tOiAxIH0sXG4gICAgbm9kZXM6IFtdLFxuICAgIGVkZ2VzOiBbXSxcbiAgfSxcbilcblxud2F0Y2goKCkgPT4gcHJvcHMubW9kZWxWYWx1ZSwgKHZhbCkgPT4ge1xuICBpZiAodmFsKSBncmFwaERhdGEudmFsdWUgPSB2YWxcbn0pXG5cbndhdGNoKGdyYXBoRGF0YSwgKHZhbCkgPT4ge1xuICBlbWl0KCd1cGRhdGU6bW9kZWxWYWx1ZScsIHZhbClcbn0sIHsgZGVlcDogdHJ1ZSB9KVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIENhbnZhcyByZWYgKyBzdWItc3RhdGVcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5jb25zdCBjYW52YXNSZWYgPSByZWY8SW5zdGFuY2VUeXBlPHR5cGVvZiBGbGV4aWJsZURyYXc+IHwgbnVsbD4obnVsbClcbmNvbnN0IGxpYnJhcmllcyA9IHJlZihnZXRBbGxMaWJyYXJpZXMoKSlcbmNvbnN0IGxlZnRUYWIgPSByZWY8J3NoYXBlcycgfCAnYXNzZXRzJz4oJ3NoYXBlcycpXG5jb25zdCB0ZW1wbGF0ZU9wZW4gPSByZWYoZmFsc2UpXG5jb25zdCBza2V0Y2hNb2RlID0gcmVmKGZhbHNlKVxuY29uc3QgZHJhd01vZGUgPSByZWYoZmFsc2UpXG5jb25zdCBlbGVtZW50U2tldGNoSWRzID0gcmVmKG5ldyBTZXQ8c3RyaW5nPigpKVxuY29uc3Qgc2VsZWN0ZWROb2RlID0gcmVmPE5vZGVEYXRhIHwgbnVsbD4obnVsbClcbmNvbnN0IHNlbGVjdGVkRWRnZSA9IHJlZjx7IGlkOiBzdHJpbmc7IHN0cm9rZTogc3RyaW5nOyBzdHJva2VXaWR0aDogbnVtYmVyOyBzdHJva2VEYXNoYXJyYXk6IHN0cmluZzsgbGluZVR5cGU6IHN0cmluZzsgbGFiZWw/OiBzdHJpbmc7IHNvdXJjZU1hcmtlcj86IHN0cmluZzsgdGFyZ2V0TWFya2VyPzogc3RyaW5nIH0gfCBudWxsPihudWxsKVxuY29uc3QgcWFiQ2xvc2VkID0gcmVmKGZhbHNlKVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIEFJIHN0YXRlXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QgYWlQYW5lbFZpc2libGUgPSByZWYoZmFsc2UpXG5jb25zdCBhaU1lc3NhZ2VzID0gcmVmPEFpTWVzc2FnZVtdPihbXSlcbmNvbnN0IGFpTG9hZGluZyA9IHJlZihmYWxzZSlcbmNvbnN0IGFpSW5wdXQgPSByZWYoJycpXG5jb25zdCBmb2xsb3dVcFF1ZXN0aW9ucyA9IHJlZjxzdHJpbmdbXT4oW10pXG5jb25zdCBhaU1lc3NhZ2VzUmVmID0gcmVmPEhUTUxFbGVtZW50IHwgbnVsbD4obnVsbClcblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBKU09OIG1vZGFsXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QganNvbk1vZGFsT3BlbiA9IHJlZihmYWxzZSlcbmNvbnN0IGpzb25QcmV2aWV3VGV4dCA9IHJlZignJylcbmNvbnN0IGNvcHlEb25lID0gcmVmKGZhbHNlKVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIExpZmVjeWNsZVxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbm9uTW91bnRlZCgoKSA9PiB7XG4gIHJlZ2lzdGVyQWxsU2hhcGVzKClcbiAgZW1pdCgncmVhZHknKVxufSlcblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBTaGFwZSAvIGFzc2V0IGhhbmRsZXJzXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gb25TaGFwZUFkZChpdGVtOiBNYXRlcmlhbEl0ZW0pIHtcbiAgY2FudmFzUmVmLnZhbHVlPy5jcmVhdGVOb2RlRnJvbU1hdGVyaWFsKGl0ZW0sIHsgeDogMjAwLCB5OiAyMDAgfSlcbn1cblxuZnVuY3Rpb24gb25TaGFwZURyYWdTdGFydChpdGVtOiBNYXRlcmlhbEl0ZW0sIGV2ZW50OiBEcmFnRXZlbnQpIHtcbiAgZXZlbnQuZGF0YVRyYW5zZmVyIS5lZmZlY3RBbGxvd2VkID0gJ2NvcHknXG4gIGV2ZW50LmRhdGFUcmFuc2ZlciEuc2V0RGF0YSgnYXBwbGljYXRpb24vanNvbicsIEpTT04uc3RyaW5naWZ5KGl0ZW0pKVxufVxuXG5mdW5jdGlvbiBvbkFzc2V0QWRkKGFzc2V0OiBBc3NldEl0ZW0pIHtcbiAgY2FudmFzUmVmLnZhbHVlPy5jcmVhdGVOb2RlRnJvbU1hdGVyaWFsKHtcbiAgICBpZDogYGFzc2V0LSR7YXNzZXQuaWR9YCxcbiAgICBuYW1lOiBhc3NldC5uYW1lLFxuICAgIHNoYXBlOiBhc3NldC50eXBlID09PSAnc3ZnJyA/ICdiYXNpYy1zdmcnIDogJ2Jhc2ljLWltYWdlJyxcbiAgICBkZWZhdWx0U2l6ZTogeyB3aWR0aDogODAsIGhlaWdodDogODAgfSxcbiAgICBkZWZhdWx0TGFiZWw6IGFzc2V0Lm5hbWUsXG4gICAgZGVmYXVsdFN0eWxlOiBhc3NldC50eXBlID09PSAnc3ZnJyA/IHsgc3ZnQ29udGVudDogYXNzZXQuY29udGVudCB9IDogeyBpbWFnZTogYXNzZXQuY29udGVudCB9LFxuICB9LCB7IHg6IDIwMCwgeTogMjAwIH0pXG59XG5cbmZ1bmN0aW9uIG9uQXNzZXREcmFnU3RhcnQoZXZlbnQ6IERyYWdFdmVudCwgYXNzZXQ6IEFzc2V0SXRlbSkge1xuICBjb25zdCBpdGVtOiBNYXRlcmlhbEl0ZW0gPSB7XG4gICAgaWQ6IGBhc3NldC0ke2Fzc2V0LmlkfWAsXG4gICAgbmFtZTogYXNzZXQubmFtZSxcbiAgICBzaGFwZTogYXNzZXQudHlwZSA9PT0gJ3N2ZycgPyAnYmFzaWMtc3ZnJyA6ICdiYXNpYy1pbWFnZScsXG4gICAgZGVmYXVsdFNpemU6IHsgd2lkdGg6IDgwLCBoZWlnaHQ6IDgwIH0sXG4gICAgZGVmYXVsdExhYmVsOiBhc3NldC5uYW1lLFxuICAgIGRlZmF1bHRTdHlsZTogYXNzZXQudHlwZSA9PT0gJ3N2ZycgPyB7IHN2Z0NvbnRlbnQ6IGFzc2V0LmNvbnRlbnQgfSA6IHsgaW1hZ2U6IGFzc2V0LmNvbnRlbnQgfSxcbiAgfVxuICBldmVudC5kYXRhVHJhbnNmZXIhLmVmZmVjdEFsbG93ZWQgPSAnY29weSdcbiAgZXZlbnQuZGF0YVRyYW5zZmVyIS5zZXREYXRhKCdhcHBsaWNhdGlvbi9qc29uJywgSlNPTi5zdHJpbmdpZnkoaXRlbSkpXG59XG5cbmZ1bmN0aW9uIG9uRXh0ZXJuYWxEcm9wKGV2ZW50OiBEcmFnRXZlbnQpIHtcbiAgY29uc3QgZGF0YSA9IGV2ZW50LmRhdGFUcmFuc2Zlcj8uZ2V0RGF0YSgnYXBwbGljYXRpb24vanNvbicpXG4gIGlmICghZGF0YSkgcmV0dXJuXG4gIHRyeSB7XG4gICAgY29uc3QgaXRlbTogTWF0ZXJpYWxJdGVtID0gSlNPTi5wYXJzZShkYXRhKVxuICAgIGNvbnN0IHBvcyA9IGNhbnZhc1JlZi52YWx1ZT8uc2NyZWVuVG9DYW52YXMoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSkgPz8geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH1cbiAgICBjYW52YXNSZWYudmFsdWU/LmNyZWF0ZU5vZGVGcm9tTWF0ZXJpYWwoaXRlbSwgcG9zKVxuICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbn1cblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBUZW1wbGF0ZSBoYW5kbGVyXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gb25UZW1wbGF0ZUFwcGx5KHRwbDogVGVtcGxhdGVJdGVtKSB7XG4gIGNhbnZhc1JlZi52YWx1ZT8uc2V0RGF0YSh0cGwuZGF0YSlcbiAgdGVtcGxhdGVPcGVuLnZhbHVlID0gZmFsc2Vcbn1cblxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBTZWxlY3Rpb25cbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZnVuY3Rpb24gb25TZWxlY3Rpb25DaGFuZ2Uobm9kZXM6IE5vZGVEYXRhW10sIGVkZ2VzOiBhbnlbXSA9IFtdKSB7XG4gIHNlbGVjdGVkTm9kZS52YWx1ZSA9IG5vZGVzLmxlbmd0aCA+IDAgPyBub2Rlc1swXSA6IG51bGxcbiAgc2VsZWN0ZWRFZGdlLnZhbHVlID0gZWRnZXMubGVuZ3RoID4gMCA/IGVkZ2VzWzBdIDogbnVsbFxuICBpZiAobm9kZXMubGVuZ3RoID4gMCB8fCBlZGdlcy5sZW5ndGggPiAwKSBxYWJDbG9zZWQudmFsdWUgPSBmYWxzZVxuICBlbWl0KCdzZWxlY3Rpb246Y2hhbmdlJywgbm9kZXMsIGVkZ2VzKVxufVxuXG53YXRjaCgoKSA9PiBjYW52YXNSZWYudmFsdWU/LnNlbGVjdGVkTm9kZURhdGEsIChkYXRhKSA9PiB7XG4gIGlmIChkYXRhKSBzZWxlY3RlZE5vZGUudmFsdWUgPSB7IC4uLmRhdGEgfVxufSwgeyBkZWVwOiB0cnVlIH0pXG5cbndhdGNoKCgpID0+IGNhbnZhc1JlZi52YWx1ZT8uc2VsZWN0ZWRFZGdlRGF0YSwgKGRhdGEpID0+IHtcbiAgc2VsZWN0ZWRFZGdlLnZhbHVlID0gZGF0YSA/IHsgLi4uZGF0YSB9IDogbnVsbFxuICBpZiAoZGF0YSkgcWFiQ2xvc2VkLnZhbHVlID0gZmFsc2Vcbn0sIHsgZGVlcDogdHJ1ZSB9KVxuXG53YXRjaCgoKSA9PiBjYW52YXNSZWYudmFsdWU/LnNrZXRjaE1vZGUsICh2YWwpID0+IHtcbiAgaWYgKHZhbCAhPT0gdW5kZWZpbmVkKSBza2V0Y2hNb2RlLnZhbHVlID0gdmFsXG59KVxuXG53YXRjaCgoKSA9PiBjYW52YXNSZWYudmFsdWU/LnNrZXRjaEVsZW1lbnRJZHMsIChpZHMpID0+IHtcbiAgaWYgKGlkcykgZWxlbWVudFNrZXRjaElkcy52YWx1ZSA9IGlkc1xufSwgeyBkZWVwOiB0cnVlIH0pXG5cbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuLy8gU3R5bGUgLyBlZGdlIHVwZGF0ZXNcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBvblVwZGF0ZVN0eWxlKGlkOiBzdHJpbmcsIHN0eWxlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuICBjYW52YXNSZWYudmFsdWU/LnVwZGF0ZU5vZGVTdHlsZShpZCwgc3R5bGUpXG59XG5mdW5jdGlvbiBvblVwZGF0ZUVkZ2VTdHlsZShpZDogc3RyaW5nLCBzdHlsZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIHtcbiAgY2FudmFzUmVmLnZhbHVlPy51cGRhdGVFZGdlU3R5bGUoaWQsIHN0eWxlKVxufVxuZnVuY3Rpb24gb25DaGFuZ2VFZGdlVHlwZShpZDogc3RyaW5nLCBsaW5lVHlwZTogc3RyaW5nKSB7XG4gIGNhbnZhc1JlZi52YWx1ZT8uY2hhbmdlRWRnZVR5cGUoaWQsIGxpbmVUeXBlKVxufVxuZnVuY3Rpb24gb25SZXNpemVOb2RlKGlkOiBzdHJpbmcsIHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG4gIGNhbnZhc1JlZi52YWx1ZT8ucmVzaXplTm9kZShpZCwgdywgaClcbn1cbmZ1bmN0aW9uIG9uVG9nZ2xlU2tldGNoKCkge1xuICBjYW52YXNSZWYudmFsdWU/LnRvZ2dsZVNrZXRjaE1vZGUoKVxufVxuZnVuY3Rpb24gb25Ub2dnbGVFbGVtZW50U2tldGNoKGlkOiBzdHJpbmcpIHtcbiAgY2FudmFzUmVmLnZhbHVlPy50b2dnbGVFbGVtZW50U2tldGNoKGlkKVxufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIFRvb2xiYXJcbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG5mdW5jdGlvbiBvblRvb2xiYXJBY3Rpb24oYWN0aW9uOiBzdHJpbmcpIHtcbiAgY29uc3QgYyA9IGNhbnZhc1JlZi52YWx1ZVxuICBpZiAoIWMpIHJldHVyblxuICBzd2l0Y2ggKGFjdGlvbikge1xuICAgIGNhc2UgJ3VuZG8nOiBjLnVuZG8oKTsgYnJlYWtcbiAgICBjYXNlICdyZWRvJzogYy5yZWRvKCk7IGJyZWFrXG4gICAgY2FzZSAndG9nZ2xlUGFuJzogYy50b2dnbGVQYW5Nb2RlKCk7IGJyZWFrXG4gICAgY2FzZSAnem9vbUluJzogYy56b29tSW4oKTsgYnJlYWtcbiAgICBjYXNlICd6b29tT3V0JzogYy56b29tT3V0KCk7IGJyZWFrXG4gICAgY2FzZSAnem9vbVRvRml0JzogYy56b29tVG9GaXQoKTsgYnJlYWtcbiAgICBjYXNlICd0b2dnbGVTa2V0Y2gnOiBjLnRvZ2dsZVNrZXRjaE1vZGUoKTsgYnJlYWtcbiAgICBjYXNlICd0b2dnbGVEcmF3JzogZHJhd01vZGUudmFsdWUgPSBjLnRvZ2dsZURyYXdNb2RlKCk7IGJyZWFrXG4gICAgY2FzZSAnY2xlYXJDYW52YXMnOiBjLmNsZWFyQ2FudmFzKCk7IGJyZWFrXG4gICAgY2FzZSAnc2VsZWN0QWxsJzogYy5zZWxlY3RBbGwoKTsgYnJlYWtcbiAgICBjYXNlICdleHBvcnQ6anNvbic6IG9uRXhwb3J0SlNPTigpOyBicmVha1xuICAgIGNhc2UgJ2V4cG9ydDpwbmcnOiBvbkV4cG9ydFBORygpOyBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoYWN0aW9uLnN0YXJ0c1dpdGgoJ2FsaWduOicpKSBjLmFsaWduTm9kZXMoYWN0aW9uLnNsaWNlKDYpKVxuICB9XG59XG5cbi8vIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuLy8gRXhwb3J0XG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuYXN5bmMgZnVuY3Rpb24gb25FeHBvcnRQTkcoKSB7XG4gIGNvbnN0IHVybCA9IGF3YWl0IGNhbnZhc1JlZi52YWx1ZT8udG9QTkcoKVxuICBpZiAoIXVybCkgcmV0dXJuXG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgYS5ocmVmID0gdXJsXG4gIGEuZG93bmxvYWQgPSBgJHtncmFwaERhdGEudmFsdWUubWV0YT8udGl0bGUgPz8gJ2RpYWdyYW0nfS5wbmdgXG4gIGEuY2xpY2soKVxufVxuXG5mdW5jdGlvbiBvbkV4cG9ydEpTT04oKSB7XG4gIGNvbnN0IHJhdyA9IGNhbnZhc1JlZi52YWx1ZT8udG9KU09OKCkgPz8gJ3t9J1xuICB0cnkgeyBqc29uUHJldmlld1RleHQudmFsdWUgPSBKU09OLnN0cmluZ2lmeShKU09OLnBhcnNlKHJhdyksIG51bGwsIDIpIH1cbiAgY2F0Y2ggeyBqc29uUHJldmlld1RleHQudmFsdWUgPSByYXcgfVxuICBjb3B5RG9uZS52YWx1ZSA9IGZhbHNlXG4gIGpzb25Nb2RhbE9wZW4udmFsdWUgPSB0cnVlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlKc29uKCkge1xuICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChqc29uUHJldmlld1RleHQudmFsdWUpXG4gIGNvcHlEb25lLnZhbHVlID0gdHJ1ZVxuICBzZXRUaW1lb3V0KCgpID0+IHsgY29weURvbmUudmFsdWUgPSBmYWxzZSB9LCAyMDAwKVxufVxuXG5mdW5jdGlvbiBkb3dubG9hZEpzb24oKSB7XG4gIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbanNvblByZXZpZXdUZXh0LnZhbHVlXSwgeyB0eXBlOiAnYXBwbGljYXRpb24vanNvbicgfSlcbiAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gIGEuaHJlZiA9IHVybFxuICBhLmRvd25sb2FkID0gYCR7Z3JhcGhEYXRhLnZhbHVlLm1ldGE/LnRpdGxlID8/ICdkaWFncmFtJ30uanNvbmBcbiAgYS5jbGljaygpXG4gIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKVxufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIEFJIOKAlCBldmVudC1kcml2ZW4sIG5vIGludGVybmFsIEFJIGxvZ2ljXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuZnVuY3Rpb24gb25BaVNlbmQocHJvbXB0OiBzdHJpbmcpIHtcbiAgY29uc3QgcCA9IHByb21wdC50cmltKClcbiAgaWYgKCFwIHx8IGFpTG9hZGluZy52YWx1ZSkgcmV0dXJuXG4gIGFpSW5wdXQudmFsdWUgPSAnJ1xuICBhaU1lc3NhZ2VzLnZhbHVlLnB1c2goeyByb2xlOiAndXNlcicsIGNvbnRlbnQ6IHAgfSlcbiAgYWlMb2FkaW5nLnZhbHVlID0gdHJ1ZVxuICBmb2xsb3dVcFF1ZXN0aW9ucy52YWx1ZSA9IFtdXG4gIG5leHRUaWNrKCgpID0+IHNjcm9sbEFpVG9Cb3R0b20oKSlcbiAgZW1pdCgnYWk6Z2VuZXJhdGUnLCBwLCBncmFwaERhdGEudmFsdWUpXG59XG5cbmZ1bmN0aW9uIGNsZWFyQWlDaGF0KCkge1xuICBhaU1lc3NhZ2VzLnZhbHVlID0gW11cbiAgZm9sbG93VXBRdWVzdGlvbnMudmFsdWUgPSBbXVxuICBhaUxvYWRpbmcudmFsdWUgPSBmYWxzZVxufVxuXG5mdW5jdGlvbiBzY3JvbGxBaVRvQm90dG9tKCkge1xuICBpZiAoYWlNZXNzYWdlc1JlZi52YWx1ZSkge1xuICAgIGFpTWVzc2FnZXNSZWYudmFsdWUuc2Nyb2xsVG9wID0gYWlNZXNzYWdlc1JlZi52YWx1ZS5zY3JvbGxIZWlnaHRcbiAgfVxufVxuXG4vLyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbi8vIEV4cG9zZVxuLy8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5cbmRlZmluZUV4cG9zZSh7XG4gIGdldERhdGE6ICgpID0+IGNhbnZhc1JlZi52YWx1ZT8uZ2V0RGF0YT8uKCkgPz8gZ3JhcGhEYXRhLnZhbHVlLFxuICBzZXREYXRhOiAoZGF0YTogR3JhcGhEYXRhKSA9PiBjYW52YXNSZWYudmFsdWU/LnNldERhdGEoZGF0YSksXG4gIGNsZWFyOiAoKSA9PiBjYW52YXNSZWYudmFsdWU/LmNsZWFyQ2FudmFzKCksXG4gIGV4cG9ydFBORzogKCkgPT4gY2FudmFzUmVmLnZhbHVlPy50b1BORygpLFxuICBleHBvcnRKU09OOiAoKSA9PiBjYW52YXNSZWYudmFsdWU/LnRvSlNPTigpID8/ICd7fScsXG4gIGV4cG9ydFNWRzogKCkgPT4gY2FudmFzUmVmLnZhbHVlPy50b1NWRz8uKCksXG4gIHVuZG86ICgpID0+IGNhbnZhc1JlZi52YWx1ZT8udW5kbygpLFxuICByZWRvOiAoKSA9PiBjYW52YXNSZWYudmFsdWU/LnJlZG8oKSxcbiAgem9vbUluOiAoKSA9PiBjYW52YXNSZWYudmFsdWU/Lnpvb21JbigpLFxuICB6b29tT3V0OiAoKSA9PiBjYW52YXNSZWYudmFsdWU/Lnpvb21PdXQoKSxcbiAgem9vbUZpdDogKCkgPT4gY2FudmFzUmVmLnZhbHVlPy56b29tVG9GaXQoKSxcbiAgc2VsZWN0QWxsOiAoKSA9PiBjYW52YXNSZWYudmFsdWU/LnNlbGVjdEFsbCgpLFxuICBkZWxldGVTZWxlY3Rpb246ICgpID0+IGNhbnZhc1JlZi52YWx1ZT8uZGVsZXRlU2VsZWN0ZWQ/LigpLFxuICBhcHBseUFpUmVzdWx0KGRhdGE/OiBHcmFwaERhdGEsIG1lc3NhZ2U/OiBzdHJpbmcsIGZvbGxvd1VwPzogc3RyaW5nW10pIHtcbiAgICBpZiAoZGF0YSkgY2FudmFzUmVmLnZhbHVlPy5zZXREYXRhKGRhdGEpXG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIGFpTWVzc2FnZXMudmFsdWUucHVzaCh7IHJvbGU6ICdhc3Npc3RhbnQnLCBjb250ZW50OiBtZXNzYWdlIH0pXG4gICAgICBuZXh0VGljaygoKSA9PiBzY3JvbGxBaVRvQm90dG9tKCkpXG4gICAgfVxuICAgIGlmIChmb2xsb3dVcD8ubGVuZ3RoKSBmb2xsb3dVcFF1ZXN0aW9ucy52YWx1ZSA9IGZvbGxvd1VwXG4gICAgYWlMb2FkaW5nLnZhbHVlID0gZmFsc2VcbiAgfSxcbn0pXG48L3NjcmlwdD5cblxuPHN0eWxlIHNjb3BlZD5cbi8qIOKUgOKUgCBSb290IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgCAqL1xuLnVuaS1kcmF3IHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgc2Fucy1zZXJpZjtcbiAgY29sb3I6IHZhcigtLXVuaS1kcmF3LXRleHQsICMxYTFhMWEpO1xufVxuXG4vKiDilIDilIAgSGVhZGVyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgCAqL1xuLnVkLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgaGVpZ2h0OiA0OHB4O1xuICBwYWRkaW5nOiAwIDE2cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLXVuaS1kcmF3LXBhbmVsLWJnLCAjZmZmKTtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXVuaS1kcmF3LXBhbmVsLWJvcmRlciwgI2UwZTBlMCk7XG4gIGZsZXgtc2hyaW5rOiAwO1xuICBnYXA6IDEycHg7XG4gIHVzZXItc2VsZWN0OiBub25lO1xufVxuXG4udWQtaGVhZGVyLWxlZnQgeyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDhweDsgfVxuLnVkLWhlYWRlci1yaWdodCB7IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogNnB4OyB9XG5cbi51ZC1sb2dvIHsgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA2cHg7IH1cbi51ZC1icmFuZCB7IGZvbnQtc2l6ZTogMTVweDsgZm9udC13ZWlnaHQ6IDcwMDsgY29sb3I6IHZhcigtLXVuaS1kcmF3LXByaW1hcnksICM3MTY2RjApOyB9XG4udWQtZGl2aWRlciB7IGNvbG9yOiAjZDlkOWQ5OyBmb250LXNpemU6IDE4cHg7IH1cbi51ZC10aXRsZSAgeyBmb250LXNpemU6IDE0cHg7IGZvbnQtd2VpZ2h0OiA1MDA7IGNvbG9yOiB2YXIoLS11bmktZHJhdy10ZXh0LCAjMWExYTFhKTsgbWF4LXdpZHRoOiAyMDBweDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7IHdoaXRlLXNwYWNlOiBub3dyYXA7IH1cblxuLnVkLXpvb20tYmFkZ2Uge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgaGVpZ2h0OiAzMHB4OyBwYWRkaW5nOiAwIDhweDtcbiAgYmFja2dyb3VuZDogdmFyKC0tdW5pLWRyYXctcGFuZWwtYmctYWx0LCAjZjVmNWY1KTsgYm9yZGVyLXJhZGl1czogdmFyKC0tdW5pLWRyYXctcmFkaXVzLXNtLCA0cHgpO1xuICBmb250LXNpemU6IDEycHg7IGNvbG9yOiB2YXIoLS11bmktZHJhdy10ZXh0LXNlY29uZGFyeSwgIzY2Nik7IGZvbnQtd2VpZ2h0OiA1MDA7IG1pbi13aWR0aDogNDJweDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi51ZC1idG4ge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiA0cHg7IGhlaWdodDogMzBweDsgcGFkZGluZzogMCAxMHB4O1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS11bmktZHJhdy1wYW5lbC1ib3JkZXIsICNlMGUwZTApOyBib3JkZXItcmFkaXVzOiB2YXIoLS11bmktZHJhdy1yYWRpdXMtc20sIDRweCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLXVuaS1kcmF3LXBhbmVsLWJnLCAjZmZmKTsgY3Vyc29yOiBwb2ludGVyOyBmb250LXNpemU6IDEycHg7XG4gIGNvbG9yOiB2YXIoLS11bmktZHJhdy10ZXh0LXNlY29uZGFyeSwgIzY2Nik7IHRyYW5zaXRpb246IGFsbCAuMTVzOyB3aGl0ZS1zcGFjZTogbm93cmFwO1xufVxuLnVkLWJ0bjpob3ZlciB7IGJvcmRlci1jb2xvcjogdmFyKC0tdW5pLWRyYXctcHJpbWFyeSwgIzcxNjZGMCk7IGNvbG9yOiB2YXIoLS11bmktZHJhdy1wcmltYXJ5LCAjNzE2NkYwKTsgfVxuLnVkLWJ0bi1wcmltYXJ5IHtcbiAgYmFja2dyb3VuZDogdmFyKC0tdW5pLWRyYXctcHJpbWFyeSwgIzcxNjZGMCk7IGJvcmRlci1jb2xvcjogdmFyKC0tdW5pLWRyYXctcHJpbWFyeSwgIzcxNjZGMCk7XG4gIGNvbG9yOiAjZmZmOyBmb250LXdlaWdodDogNTAwO1xufVxuLnVkLWJ0bi1wcmltYXJ5OmhvdmVyIHtcbiAgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLXVuaS1kcmF3LXByaW1hcnksICM3MTY2RjApIDg1JSwgIzAwMCk7XG4gIGJvcmRlci1jb2xvcjogY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLXVuaS1kcmF3LXByaW1hcnksICM3MTY2RjApIDg1JSwgIzAwMCk7XG4gIGNvbG9yOiAjZmZmO1xufVxuXG4vKiDilIDilIAgQm9keSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAgKi9cbi51ZC1ib2R5IHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleDogMTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgbWluLWhlaWdodDogMDtcbn1cblxuLyog4pSA4pSAIExlZnQgcGFuZWwg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAICovXG4udWQtbGVmdC1wYW5lbCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIHdpZHRoOiB2YXIoLS11bmktZHJhdy1wYW5lbC13aWR0aCwgMjIwcHgpO1xuICBmbGV4LXNocmluazogMDtcbiAgYmFja2dyb3VuZDogdmFyKC0tdW5pLWRyYXctcGFuZWwtYmctYWx0LCAjZjVmNWY1KTtcbiAgYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgdmFyKC0tdW5pLWRyYXctcGFuZWwtYm9yZGVyLCAjZTBlMGUwKTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbn1cblxuLnVkLXBhbmVsLXRhYnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tdW5pLWRyYXctcGFuZWwtYm9yZGVyLCAjZTBlMGUwKTtcbiAgZmxleC1zaHJpbms6IDA7XG59XG5cbi51ZC10YWIge1xuICBmbGV4OiAxO1xuICBwYWRkaW5nOiA4cHggMDtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBmb250LXdlaWdodDogNTAwO1xuICBjb2xvcjogdmFyKC0tdW5pLWRyYXctdGV4dC1tdXRlZCwgIzk5OSk7XG4gIGJhY2tncm91bmQ6IG5vbmU7XG4gIGJvcmRlcjogbm9uZTtcbiAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IGFsbCAuMTVzO1xufVxuLnVkLXRhYjpob3ZlciB7IGNvbG9yOiB2YXIoLS11bmktZHJhdy1wcmltYXJ5LCAjNzE2NkYwKTsgfVxuLnVkLXRhYi5hY3RpdmUge1xuICBjb2xvcjogdmFyKC0tdW5pLWRyYXctcHJpbWFyeSwgIzcxNjZGMCk7XG4gIGJvcmRlci1ib3R0b20tY29sb3I6IHZhcigtLXVuaS1kcmF3LXByaW1hcnksICM3MTY2RjApO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS11bmktZHJhdy1wcmltYXJ5LWJnLWxpZ2h0LCAjZjRmM2ZlKTtcbn1cbi51ZC10YWItdGV4dCB7IGJvcmRlcjogbm9uZTsgZmxleDogbm9uZTsgcGFkZGluZzogOHB4IDEwcHg7IH1cblxuLyog4pSA4pSAIEFzc2V0cyBncmlkIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgCAqL1xuLnVkLWFzc2V0cy1ncmlkIHtcbiAgZmxleDogMTtcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTtcbiAgZ2FwOiA4cHg7XG4gIHBhZGRpbmc6IDEwcHg7XG4gIGFsaWduLWNvbnRlbnQ6IHN0YXJ0O1xufVxuXG4udWQtYXNzZXQtY2VsbCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogNHB4O1xuICBwYWRkaW5nOiA4cHggNHB4O1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS11bmktZHJhdy1yYWRpdXMtc20sIDRweCk7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAuMTVzO1xufVxuLnVkLWFzc2V0LWNlbGw6aG92ZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS11bmktZHJhdy1ob3Zlci1iZywgI2YwZjBmMCk7IH1cblxuLnVkLWFzc2V0LWljb24geyB3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyBvYmplY3QtZml0OiBjb250YWluOyB9XG4udWQtYXNzZXQtaWNvbiBzdmcgeyB3aWR0aDogMzJweDsgaGVpZ2h0OiAzMnB4OyB9XG4udWQtYXNzZXQtbGFiZWwgeyBmb250LXNpemU6IDEwcHg7IGNvbG9yOiB2YXIoLS11bmktZHJhdy10ZXh0LXNlY29uZGFyeSwgIzY2Nik7IHRleHQtYWxpZ246IGNlbnRlcjsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7IHdoaXRlLXNwYWNlOiBub3dyYXA7IG1heC13aWR0aDogNTZweDsgfVxuXG4udWQtYXNzZXRzLWVtcHR5IHtcbiAgZ3JpZC1jb2x1bW46IDEgLyAtMTtcbiAgcGFkZGluZzogMzJweCAxNnB4O1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGNvbG9yOiB2YXIoLS11bmktZHJhdy10ZXh0LW11dGVkLCAjOTk5KTtcbiAgZm9udC1zaXplOiAxM3B4O1xufVxuXG4vKiDilIDilIAgQ2FudmFzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgCAqL1xuLnVkLWNhbnZhcy1hcmVhIHtcbiAgZmxleDogMTtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBtaW4td2lkdGg6IDA7XG59XG5cbi51ZC1jYW52YXMgeyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlOyB9XG5cbi8qIOKUgOKUgCBBSSBwYW5lbCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAgKi9cbi51ZC1haS1wYW5lbCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIHdpZHRoOiAzMjBweDtcbiAgZmxleC1zaHJpbms6IDA7XG4gIGJhY2tncm91bmQ6IHZhcigtLXVuaS1kcmF3LXBhbmVsLWJnLCAjZmZmKTtcbiAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCB2YXIoLS11bmktZHJhdy1wYW5lbC1ib3JkZXIsICNlMGUwZTApO1xufVxuXG4udWQtYWktaGVhZGVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBoZWlnaHQ6IDQ0cHg7XG4gIHBhZGRpbmc6IDAgMTRweDtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXVuaS1kcmF3LXBhbmVsLWJvcmRlciwgI2UwZTBlMCk7XG4gIGZsZXgtc2hyaW5rOiAwO1xufVxuLnVkLWFpLXRpdGxlIHsgZm9udC1zaXplOiAxM3B4OyBmb250LXdlaWdodDogNjAwOyBjb2xvcjogdmFyKC0tdW5pLWRyYXctdGV4dCwgIzFhMWExYSk7IH1cbi51ZC1haS1oZWFkZXItYWN0aW9ucyB7IGRpc3BsYXk6IGZsZXg7IGdhcDogNHB4OyB9XG4udWQtYWktaWNvbi1idG4ge1xuICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgd2lkdGg6IDI4cHg7IGhlaWdodDogMjhweDsgYm9yZGVyOiBub25lOyBib3JkZXItcmFkaXVzOiB2YXIoLS11bmktZHJhdy1yYWRpdXMtc20sIDRweCk7XG4gIGJhY2tncm91bmQ6IG5vbmU7IGN1cnNvcjogcG9pbnRlcjsgY29sb3I6IHZhcigtLXVuaS1kcmF3LXRleHQtbXV0ZWQsICM5OTkpOyB0cmFuc2l0aW9uOiBhbGwgLjE1cztcbn1cbi51ZC1haS1pY29uLWJ0bjpob3ZlciB7IGJhY2tncm91bmQ6IHZhcigtLXVuaS1kcmF3LWhvdmVyLWJnLCAjZjBmMGYwKTsgY29sb3I6IHZhcigtLXVuaS1kcmF3LXRleHQsICMxYTFhMWEpOyB9XG5cbi51ZC1haS1tZXNzYWdlcyB7XG4gIGZsZXg6IDE7XG4gIG92ZXJmbG93LXk6IGF1dG87XG4gIHBhZGRpbmc6IDEycHggMTRweDtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiAxMHB4O1xufVxuXG4udWQtYWktbXNnLWNvbnRlbnQge1xuICBwYWRkaW5nOiA5cHggMTJweDtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tdW5pLWRyYXctcmFkaXVzLW1kLCA4cHgpO1xuICBmb250LXNpemU6IDEzcHg7XG4gIGxpbmUtaGVpZ2h0OiAxLjY7XG4gIHdvcmQtYnJlYWs6IGJyZWFrLXdvcmQ7XG4gIHdoaXRlLXNwYWNlOiBwcmUtd3JhcDtcbn1cbi51ZC1haS1tc2cudXNlciAudWQtYWktbXNnLWNvbnRlbnQge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS11bmktZHJhdy1wcmltYXJ5LWJnLCAjZWFlOGZkKTtcbiAgY29sb3I6IHZhcigtLXVuaS1kcmF3LXByaW1hcnksICM3MTY2RjApO1xuICBtYXJnaW4tbGVmdDogMjRweDtcbiAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IHZhcigtLXVuaS1kcmF3LXJhZGl1cy1zbSwgNHB4KTtcbn1cbi51ZC1haS1tc2cuYXNzaXN0YW50IC51ZC1haS1tc2ctY29udGVudCB7XG4gIGJhY2tncm91bmQ6IHZhcigtLXVuaS1kcmF3LXBhbmVsLWJnLWFsdCwgI2Y1ZjVmNSk7XG4gIGNvbG9yOiB2YXIoLS11bmktZHJhdy10ZXh0LCAjMWExYTFhKTtcbiAgbWFyZ2luLXJpZ2h0OiAyNHB4O1xuICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiB2YXIoLS11bmktZHJhdy1yYWRpdXMtc20sIDRweCk7XG59XG5cbi51ZC1haS10eXBpbmcgeyBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDRweDsgcGFkZGluZzogNHB4IDA7IH1cbi51ZC1haS10eXBpbmcgLmRvdCB7IHdpZHRoOiA2cHg7IGhlaWdodDogNnB4OyBib3JkZXItcmFkaXVzOiA1MCU7IGJhY2tncm91bmQ6ICNjY2M7IGFuaW1hdGlvbjogdWQtdHlwaW5nIDEuNHMgaW5maW5pdGU7IH1cbi51ZC1haS10eXBpbmcgLmRvdDpudGgtY2hpbGQoMikgeyBhbmltYXRpb24tZGVsYXk6IC4yczsgfVxuLnVkLWFpLXR5cGluZyAuZG90Om50aC1jaGlsZCgzKSB7IGFuaW1hdGlvbi1kZWxheTogLjRzOyB9XG5Aa2V5ZnJhbWVzIHVkLXR5cGluZyB7XG4gIDAlLCA2MCUsIDEwMCUgeyBvcGFjaXR5OiAuMzsgdHJhbnNmb3JtOiBzY2FsZSguOCk7IH1cbiAgMzAlIHsgb3BhY2l0eTogMTsgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfVxufVxuXG4udWQtYWktZm9sbG93dXAge1xuICBwYWRkaW5nOiA4cHggMTRweDtcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXVuaS1kcmF3LXBhbmVsLWJvcmRlciwgI2UwZTBlMCk7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogNnB4O1xuICBmbGV4LXNocmluazogMDtcbn1cbi51ZC1haS1jaGlwIHtcbiAgcGFkZGluZzogNnB4IDEwcHg7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXVuaS1kcmF3LXBhbmVsLWJvcmRlciwgI2UwZTBlMCk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXVuaS1kcmF3LXJhZGl1cy1zbSwgNHB4KTtcbiAgYmFja2dyb3VuZDogdmFyKC0tdW5pLWRyYXctcGFuZWwtYmcsICNmZmYpO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgY29sb3I6IHZhcigtLXVuaS1kcmF3LXRleHQtc2Vjb25kYXJ5LCAjNjY2KTtcbiAgdGV4dC1hbGlnbjogbGVmdDtcbiAgdHJhbnNpdGlvbjogYWxsIC4xNXM7XG59XG4udWQtYWktY2hpcDpob3ZlciB7IGJvcmRlci1jb2xvcjogdmFyKC0tdW5pLWRyYXctcHJpbWFyeSwgIzcxNjZGMCk7IGNvbG9yOiB2YXIoLS11bmktZHJhdy1wcmltYXJ5LCAjNzE2NkYwKTsgfVxuXG4udWQtYWktaW5wdXQtYXJlYSB7XG4gIHBhZGRpbmc6IDEwcHggMTRweDtcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXVuaS1kcmF3LXBhbmVsLWJvcmRlciwgI2UwZTBlMCk7XG4gIGZsZXgtc2hyaW5rOiAwO1xufVxuLnVkLWFpLWlucHV0LXJvdyB7IGRpc3BsYXk6IGZsZXg7IGdhcDogNnB4OyBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4udWQtYWktaW5wdXQge1xuICBmbGV4OiAxO1xuICBwYWRkaW5nOiA4cHggMTBweDtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tdW5pLWRyYXctcGFuZWwtYm9yZGVyLCAjZTBlMGUwKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tdW5pLWRyYXctcmFkaXVzLXNtLCA0cHgpO1xuICBmb250LXNpemU6IDEzcHg7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGJhY2tncm91bmQ6IHZhcigtLXVuaS1kcmF3LXBhbmVsLWJnLWFsdCwgI2Y1ZjVmNSk7XG4gIGNvbG9yOiB2YXIoLS11bmktZHJhdy10ZXh0LCAjMWExYTFhKTtcbiAgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIC4xNXM7XG59XG4udWQtYWktaW5wdXQ6Zm9jdXMgeyBib3JkZXItY29sb3I6IHZhcigtLXVuaS1kcmF3LXByaW1hcnksICM3MTY2RjApOyBiYWNrZ3JvdW5kOiB2YXIoLS11bmktZHJhdy1wYW5lbC1iZywgI2ZmZik7IH1cbi51ZC1haS1zZW5kIHtcbiAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHdpZHRoOiAzNHB4OyBoZWlnaHQ6IDM0cHg7IGJvcmRlcjogbm9uZTsgYm9yZGVyLXJhZGl1czogdmFyKC0tdW5pLWRyYXctcmFkaXVzLXNtLCA0cHgpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS11bmktZHJhdy1wcmltYXJ5LCAjNzE2NkYwKTsgY29sb3I6ICNmZmY7IGN1cnNvcjogcG9pbnRlcjsgdHJhbnNpdGlvbjogYmFja2dyb3VuZCAuMTVzOyBmbGV4LXNocmluazogMDtcbn1cbi51ZC1haS1zZW5kOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHsgYmFja2dyb3VuZDogY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLXVuaS1kcmF3LXByaW1hcnksICM3MTY2RjApIDg1JSwgIzAwMCk7IH1cbi51ZC1haS1zZW5kOmRpc2FibGVkIHsgb3BhY2l0eTogLjQ1OyBjdXJzb3I6IG5vdC1hbGxvd2VkOyB9XG5cbi8qIOKUgOKUgCBKU09OIG1vZGFsIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgCAqL1xuLnVkLW1vZGFsLWJhY2tkcm9wIHtcbiAgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwuNCk7XG4gIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOyB6LWluZGV4OiAxMDAwO1xufVxuLnVkLW1vZGFsIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tdW5pLWRyYXctcGFuZWwtYmcsICNmZmYpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS11bmktZHJhdy1yYWRpdXMtbWQsIDhweCk7XG4gIGJveC1zaGFkb3c6IHZhcigtLXVuaS1kcmF3LXNoYWRvdy1tZCwgMCA0cHggMTJweCByZ2JhKDAsMCwwLC4xMikpO1xuICB3aWR0aDogNjIwcHg7IG1heC13aWR0aDogOTB2dzsgbWF4LWhlaWdodDogODB2aDtcbiAgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgb3ZlcmZsb3c6IGhpZGRlbjtcbn1cbi51ZC1tb2RhbC1oZWFkZXIge1xuICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIHBhZGRpbmc6IDEycHggMTZweDsgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLXVuaS1kcmF3LXBhbmVsLWJvcmRlciwgI2UwZTBlMCk7XG4gIGZvbnQtc2l6ZTogMTRweDsgZm9udC13ZWlnaHQ6IDYwMDsgZmxleC1zaHJpbms6IDA7XG59XG4udWQtbW9kYWwtYWN0aW9ucyB7IGRpc3BsYXk6IGZsZXg7IGdhcDogNHB4OyB9XG4udWQtaWNvbi1idG4ge1xuICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgd2lkdGg6IDI4cHg7IGhlaWdodDogMjhweDsgYm9yZGVyOiBub25lOyBib3JkZXItcmFkaXVzOiB2YXIoLS11bmktZHJhdy1yYWRpdXMtc20sIDRweCk7XG4gIGJhY2tncm91bmQ6IG5vbmU7IGN1cnNvcjogcG9pbnRlcjsgY29sb3I6IHZhcigtLXVuaS1kcmF3LXRleHQtbXV0ZWQsICM5OTkpOyB0cmFuc2l0aW9uOiBhbGwgLjE1czsgZm9udC1zaXplOiAxNHB4O1xufVxuLnVkLWljb24tYnRuOmhvdmVyIHsgYmFja2dyb3VuZDogdmFyKC0tdW5pLWRyYXctaG92ZXItYmcsICNmMGYwZjApOyBjb2xvcjogdmFyKC0tdW5pLWRyYXctdGV4dCwgIzFhMWExYSk7IH1cbi51ZC1tb2RhbC1ib2R5IHsgZmxleDogMTsgb3ZlcmZsb3c6IGF1dG87IHBhZGRpbmc6IDE2cHg7IH1cbi51ZC1qc29uLXByZSB7XG4gIG1hcmdpbjogMDsgZm9udC1zaXplOiAxMnB4OyBsaW5lLWhlaWdodDogMS42OyB3aGl0ZS1zcGFjZTogcHJlLXdyYXA7IHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcbiAgY29sb3I6IHZhcigtLXVuaS1kcmF3LXRleHQsICMxYTFhMWEpOyBmb250LWZhbWlseTogJ0NvbnNvbGFzJywgJ01vbmFjbycsIG1vbm9zcGFjZTtcbn1cbjwvc3R5bGU+XG4iXSwiZmlsZSI6IkQ6L1NvZnR3YXJlUHJvamVjdHMvdW5pLWZsZXhpYmxlLWRyYXcvbGliL2NvbXBvbmVudHMvVW5pRHJhdy9VbmlEcmF3LnZ1ZSJ9
