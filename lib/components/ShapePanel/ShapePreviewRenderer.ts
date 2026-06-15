/**
 * Shape 预览图 SVG 渲染器
 * 基于 shape 名称生成与实际画布渲染一致的 SVG 预览图
 */

const CAT_COLOR: Record<string, [string, string]> = {
  basic: ['rgba(113,102,240,0.13)', '#7166F0'],
  flowchart: ['rgba(24,144,255,0.13)', '#1890ff'],
  uml: ['rgba(51,51,51,0.08)', '#333333'],
  sequence: ['rgba(113,102,240,0.13)', '#7166F0'],
  er: ['rgba(250,140,22,0.13)', '#fa8c16'],
  dfd: ['rgba(82,196,26,0.13)', '#52c41a'],
  swimlane: ['rgba(153,153,153,0.13)', '#999999'],
  state: ['rgba(24,144,255,0.13)', '#1890ff'],
  edge: ['rgba(113,102,240,0.13)', '#7166F0'],
}

function getColors(shape: string): { fill: string, stroke: string, sw: string } {
  const cat = shape.split('-')[0]
  const [df, ds] = CAT_COLOR[cat] ?? CAT_COLOR.basic!
  return { fill: df, stroke: ds, sw: '2' }
}

function ba(fill: string, stroke: string, sw: string): string {
  return `fill="${fill}" stroke="${stroke}" stroke-width="${sw}"`
}

function ln(stroke: string): string {
  return `stroke="${stroke}" stroke-width="2" stroke-linecap="round"`
}

export function getShapePreviewSVG(shape: string): string {
  const { fill, stroke, sw } = getColors(shape)
  const _ba = ba(fill, stroke, sw)
  const _ln = ln(stroke)

  switch (shape) {
    // ── Basic ───────────────────────────────────────────────────────────
    case 'basic-rect':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="40" height="22" ${_ba}/></svg>`
    case 'basic-rounded-rect':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="40" height="22" rx="7" ${_ba}/></svg>`
    case 'basic-circle':
      return `<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="12" ${_ba}/></svg>`
    case 'basic-diamond':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,16 16,30 2,16" ${_ba}/></svg>`
    case 'basic-triangle':
      return `<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,26 2,26" ${_ba}/></svg>`
    case 'basic-parallelogram':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="8,24 42,24 36,4 2,4" ${_ba}/></svg>`
    case 'basic-trapezoid':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="2,24 42,24 36,4 8,4" ${_ba}/></svg>`
    case 'basic-hexagon':
      return `<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 28,8 28,20 16,26 4,20 4,8" ${_ba}/></svg>`
    case 'basic-pentagon':
      return `<svg viewBox="0 0 32 30" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 29,11 24,27 8,27 3,11" ${_ba}/></svg>`
    case 'basic-octagon':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="10,2 22,2 30,10 30,22 22,30 10,30 2,22 2,10" ${_ba}/></svg>`
    case 'basic-star':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 19.5,12 30,12 21.5,18.5 24.5,28 16,22 7.5,28 10.5,18.5 2,12 12.5,12" ${_ba}/></svg>`
    case 'basic-cross':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="12,2 20,2 20,12 30,12 30,20 20,20 20,30 12,30 12,20 2,20 2,12 12,12" ${_ba}/></svg>`
    case 'basic-cylinder':
      return `<svg viewBox="0 0 32 34" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="24" height="20" fill="${fill}" stroke="none"/><ellipse cx="16" cy="8" rx="12" ry="4" ${_ba}/><ellipse cx="16" cy="28" rx="12" ry="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/><line x1="4" y1="8" x2="4" y2="28" stroke="${stroke}" stroke-width="${sw}"/><line x1="28" y1="8" x2="28" y2="28" stroke="${stroke}" stroke-width="${sw}"/></svg>`
    case 'basic-cloud':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><path d="M10,26 Q4,26 4,20 Q4,14 11,14 Q11,6 18,6 Q22,6 24,10 Q26,6 31,6 Q38,6 38,14 Q42,14 42,20 Q42,26 36,26 Z" ${_ba}/></svg>`
    case 'basic-document':
      return `<svg viewBox="0 0 32 34" xmlns="http://www.w3.org/2000/svg"><path d="M3,3 L23,3 L29,9 L29,31 Q16,27 3,31 Z" ${_ba}/><polyline points="23,3 23,9 29,9" fill="none" stroke="${stroke}" stroke-width="${sw}"/></svg>`
    case 'basic-text':
      return `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="${stroke}"><path d="M692.2597343921661 882.78857421875H331.711297750473v-30.689996480941772a563.3140236139297 563.3140236139297 0 0 1 48.088091611862176-14.83154296875c16.200274229049683-4.278552532196046 33.656305074691765-7.757592201232912 52.39561200141907-10.638445615768433v-630.340576171875h-136.73552870750427l-57.244107127189636 151.53810381889343H211.2339789867401c-2.1675199270248413-14.118209481239319-3.9642512798309326-30.233752727508545-5.419161915779114-48.23148250579833-1.4541864395141602-17.939794063568115-2.6809751987457275-36.30831241607666-3.7933409214019784-55.10410666465761-1.1123657226562498-18.59736442565918-1.9683659076690674-37.078857421875-2.6527315378189087-55.019375681877136C198.6264432668686 171.53063368797297 198.2563788890838 155.35860311985022 198.2563788890838 141.21142578125h627.4886906147003c0 14.147177338600159-0.3997564315795899 30.090361833572388-1.1123657226562498 47.689059376716614-0.7415771484374999 17.655909061431885-1.6547888517379765 35.852792859077454-2.766430377960205 54.56313192844391s-2.139276266098023 37.078857421875-3.251641988754273 55.10410666465761c-1.0841220617294314 17.998453974723816-2.7099430561065674 34.48406159877777-4.9064308404922485 49.28736090660096h-28.408053517341607l-56.75889551639557-151.53810381889343H592.8891206979752V826.6850764751434c18.71033906936645 3.5659432411193848 36.22285723686218 7.07395076751709 52.366644144058235 10.638445615768433 16.229242086410522 3.508731722831726 31.85957372188568 8.415162563323973 47.00469374656678 14.83154296875v30.633509159088135z" p-id="55219"></path></svg>`
    case 'basic-image':
      return `<svg viewBox="0 0 36 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="32" height="26" rx="2" ${_ba}/><circle cx="10" cy="10" r="4" fill="${stroke}" opacity="0.4"/><polyline points="2,24 13,14 20,20 27,12 34,22" fill="none" stroke="${stroke}" stroke-width="1.5"/></svg>`
    case 'basic-svg':
      return `<svg viewBox="0 0 36 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="32" height="26" rx="2" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="3 2"/><text x="18" y="17" text-anchor="middle" fill="${stroke}" font-size="8" font-family="monospace">SVG</text></svg>`
    case 'basic-table':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" ${_ba}/><line x1="2" y1="10" x2="42" y2="10" stroke="${stroke}" stroke-width="1.5"/><line x1="2" y1="18" x2="42" y2="18" stroke="${stroke}" stroke-width="1.5"/><line x1="15" y1="2" x2="15" y2="28" stroke="${stroke}" stroke-width="1.5"/><line x1="29" y1="2" x2="29" y2="28" stroke="${stroke}" stroke-width="1.5"/></svg>`
    case 'basic-group':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="rgba(0,0,0,0.02)" stroke="#d9d9d9" stroke-width="1" stroke-dasharray="4 4"/></svg>`

    // ── Flowchart ───────────────────────────────────────────────────────
    case 'flowchart-start-end':
      return `<svg viewBox="0 0 44 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="20" rx="10" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'flowchart-process':
      return `<svg viewBox="0 0 40 26" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="22" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'flowchart-decision':
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><polygon points="20,2 38,14 20,26 2,14" fill="#fff7e6" stroke="#fa8c16" stroke-width="2"/></svg>`
    case 'flowchart-input-output':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="6,24 42,24 38,4 2,4" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'flowchart-document':
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><path d="M2,2 L38,2 L38,22 Q28,28 20,22 Q12,16 2,22 Z" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'flowchart-database':
      return `<svg viewBox="0 0 32 34" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="24" height="18" fill="#e6f7ff" stroke="none"/><ellipse cx="16" cy="8" rx="12" ry="4" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/><ellipse cx="16" cy="26" rx="12" ry="4" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/><line x1="4" y1="8" x2="4" y2="26" stroke="#1890ff" stroke-width="2"/><line x1="28" y1="8" x2="28" y2="26" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'flowchart-predefined':
      return `<svg viewBox="0 0 40 26" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="22" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="24" stroke="#1890ff" stroke-width="2"/><line x1="32" y1="2" x2="32" y2="24" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'flowchart-connector':
      return `<svg viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="13" r="11" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'flowchart-merge':
      return `<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg"><polygon points="16,26 30,2 2,2" fill="#fff7e6" stroke="#fa8c16" stroke-width="2"/></svg>`
    case 'flowchart-internal-storage':
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="24" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/><line x1="10" y1="2" x2="10" y2="26" stroke="#1890ff" stroke-width="2"/><line x1="2" y1="10" x2="38" y2="10" stroke="#1890ff" stroke-width="2"/></svg>`

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
    case 'edge-sketch':
      return `<svg viewBox="0 0 44 20" xmlns="http://www.w3.org/2000/svg"><path d="M4,14 Q12,4 20,12 T36,10 Q40,8 42,14" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/></svg>`

    // ── UML ────────────────────────────────────────────────────────────
    case 'uml-class':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="32" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><line x1="2" y1="12" x2="42" y2="12" stroke="#333333" stroke-width="1.5"/><line x1="2" y1="24" x2="42" y2="24" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-interface':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="32" fill="#ffffff" stroke="#333333" stroke-width="1.5" stroke-dasharray="4 2"/><line x1="2" y1="12" x2="42" y2="12" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-abstract':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="32" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><text x="22" y="10" text-anchor="middle" fill="#666" font-size="6" font-family="sans-serif">&#171;abstract&#187;</text><line x1="2" y1="14" x2="42" y2="14" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-enum':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="32" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><text x="22" y="10" text-anchor="middle" fill="#666" font-size="6" font-family="sans-serif">&#171;enumeration&#187;</text><line x1="2" y1="14" x2="42" y2="14" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-actor':
      return `<svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="5" fill="none" stroke="#333333" stroke-width="2"/><line x1="12" y1="12" x2="12" y2="26" stroke="#333333" stroke-width="2"/><line x1="4" y1="18" x2="20" y2="18" stroke="#333333" stroke-width="2"/><line x1="12" y1="26" x2="4" y2="34" stroke="#333333" stroke-width="2"/><line x1="12" y1="26" x2="20" y2="34" stroke="#333333" stroke-width="2"/></svg>`
    case 'uml-use-case':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="22" cy="14" rx="20" ry="12" fill="#f5f5f5" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-package':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="10" width="40" height="24" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><rect x="2" y="4" width="16" height="8" fill="#ffffff" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-note':
      return `<svg viewBox="0 0 34 36" xmlns="http://www.w3.org/2000/svg"><path d="M2,2 L24,2 L32,10 L32,34 L2,34 Z" fill="#fffbe6" stroke="#333333" stroke-width="1.5"/><polyline points="24,2 24,10 32,10" fill="none" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-component':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="32" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><rect x="6" y="8" width="8" height="4" fill="#333333"/><rect x="6" y="16" width="8" height="4" fill="#333333"/><rect x="6" y="24" width="8" height="4" fill="#333333"/></svg>`
    case 'uml-deployment':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="40" height="26" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><rect x="8" y="2" width="40" height="26" fill="#e8e8e8" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-object':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="24" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><text x="22" y="15" text-anchor="middle" fill="#333333" font-size="8" font-family="sans-serif" text-decoration="underline">Object</text></svg>`
    case 'uml-collaboration':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="22" cy="14" rx="20" ry="12" fill="#f5f5f5" stroke="#333333" stroke-width="1.5" stroke-dasharray="5 3"/></svg>`
    case 'uml-composite':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="32" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><rect x="6" y="20" width="32" height="10" fill="none" stroke="#333333" stroke-width="1" stroke-dasharray="3 2"/></svg>`
    case 'uml-node':
      return `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="40" height="26" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><rect x="8" y="2" width="40" height="26" fill="#e8e8e8" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'uml-artifact':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><path d="M2,2 L32,2 L42,10 L42,26 L2,26 Z" fill="#ffffff" stroke="#333333" stroke-width="1.5"/><polyline points="32,2 32,10 42,10" fill="none" stroke="#333333" stroke-width="1.5"/></svg>`

    // ── ER ────────────────────────────────────────────────────────────
    case 'er-entity':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="24" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/></svg>`
    case 'er-weak-entity':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="24" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/><rect x="5" y="5" width="34" height="18" fill="none" stroke="#fa8c16" stroke-width="1"/></svg>`
    case 'er-relationship':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="22,2 42,14 22,26 2,14" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/></svg>`
    case 'er-identifying-relationship':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="22,2 42,14 22,26 2,14" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/><polygon points="22,5 39,14 22,23 5,14" fill="none" stroke="#fa8c16" stroke-width="1"/></svg>`
    case 'er-attribute':
      return `<svg viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="14" rx="16" ry="12" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/></svg>`
    case 'er-key-attribute':
      return `<svg viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="14" rx="16" ry="12" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/><line x1="4" y1="22" x2="32" y2="22" stroke="#fa8c16" stroke-width="1.5"/></svg>`
    case 'er-multivalued':
      return `<svg viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="14" rx="16" ry="12" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/><ellipse cx="18" cy="14" rx="12" ry="8" fill="none" stroke="#fa8c16" stroke-width="1"/></svg>`
    case 'er-derived':
      return `<svg viewBox="0 0 36 28" xmlns="http://www.w3.org/2000/svg"><ellipse cx="18" cy="14" rx="16" ry="12" fill="#fff2e8" stroke="#fa8c16" stroke-width="2" stroke-dasharray="4 2"/></svg>`
    case 'er-associative':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="24" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/></svg>`
    case 'er-total-participation':
      return `<svg viewBox="0 0 44 28" xmlns="http://www.w3.org/2000/svg"><polygon points="22,2 42,14 22,26 2,14" fill="#fff2e8" stroke="#fa8c16" stroke-width="2"/><line x1="22" y1="2" x2="22" y2="26" stroke="#fa8c16" stroke-width="1.5"/></svg>`

    // ── State ─────────────────────────────────────────────────────────
    case 'state-initial':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="#1890ff"/></svg>`
    case 'state-final':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="none" stroke="#1890ff" stroke-width="2"/><circle cx="14" cy="14" r="7" fill="#1890ff"/></svg>`
    case 'state-simple':
      return `<svg viewBox="0 0 44 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="20" rx="8" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'state-fork':
    case 'state-join':
      return `<svg viewBox="0 0 10 30" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="2" width="8" height="26" fill="#1890ff"/></svg>`
    case 'state-choice':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><polygon points="14,2 26,14 14,26 2,14" fill="#fff7e6" stroke="#fa8c16" stroke-width="2"/></svg>`
    case 'state-shallow-history':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="none" stroke="#1890ff" stroke-width="2"/><text x="14" y="18" text-anchor="middle" fill="#1890ff" font-size="12" font-weight="bold">H</text></svg>`
    case 'state-deep-history':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="none" stroke="#1890ff" stroke-width="2"/><text x="14" y="18" text-anchor="middle" fill="#1890ff" font-size="12" font-weight="bold">H*</text></svg>`
    case 'state-junction':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="#1890ff"/></svg>`
    case 'state-entry-point':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="none" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'state-exit-point':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="none" stroke="#1890ff" stroke-width="2"/><line x1="8" y1="8" x2="20" y2="20" stroke="#1890ff" stroke-width="2"/></svg>`
    case 'state-terminate':
      return `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="11" fill="none" stroke="#ff4d4f" stroke-width="2"/><line x1="8" y1="8" x2="20" y2="20" stroke="#ff4d4f" stroke-width="2"/><line x1="20" y1="8" x2="8" y2="20" stroke="#ff4d4f" stroke-width="2"/></svg>`
    case 'state-signal-send':
      return `<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,14 16,26 2,14" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/><polygon points="16,6 26,14 16,22 6,14" fill="#1890ff"/></svg>`
    case 'state-signal-receive':
      return `<svg viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,14 16,26 2,14" fill="#e6f7ff" stroke="#1890ff" stroke-width="2"/><polygon points="16,6 26,14 16,22 6,14" fill="none" stroke="#1890ff" stroke-width="1.5"/></svg>`

    // ── DFD ──────────────────────────────────────────────────────────
    case 'dfd-process':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#f6ffed" stroke="#52c41a" stroke-width="2"/></svg>`
    case 'dfd-data-store':
      return `<svg viewBox="0 0 44 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="20" fill="#f6ffed" stroke="none"/><line x1="2" y1="2" x2="42" y2="2" stroke="#52c41a" stroke-width="2"/><line x1="2" y1="22" x2="42" y2="22" stroke="#52c41a" stroke-width="2"/></svg>`
    case 'dfd-external-entity':
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="36" height="24" fill="#f6ffed" stroke="#52c41a" stroke-width="2"/><rect x="5" y="5" width="30" height="18" fill="none" stroke="#52c41a" stroke-width="1"/></svg>`
    case 'dfd-multiple-process':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" fill="#f6ffed" stroke="#52c41a" stroke-width="2"/><circle cx="16" cy="16" r="9" fill="none" stroke="#52c41a" stroke-width="1"/></svg>`

    // ── Swimlane ──────────────────────────────────────────────────────
    case 'swimlane-horizontal':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#fafafa" stroke="#999999" stroke-width="1"/><rect x="2" y="2" width="8" height="26" fill="#f0f0f0" stroke="#999999" stroke-width="1"/></svg>`
    case 'swimlane-vertical':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#fafafa" stroke="#999999" stroke-width="1"/><rect x="2" y="2" width="40" height="6" fill="#f0f0f0" stroke="#999999" stroke-width="1"/></svg>`
    case 'swimlane-pool':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#fafafa" stroke="#666666" stroke-width="1.5"/><rect x="2" y="2" width="4" height="26" fill="#e0e0e0" stroke="#666666" stroke-width="1"/></svg>`
    case 'swimlane-phase':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#f5f5f5" stroke="#999999" stroke-width="1"/></svg>`

    // ── Sequence ─────────────────────────────────────────────────────
    case 'sequence-actor':
      return `<svg viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="7" r="5" fill="none" stroke="#333333" stroke-width="1.5"/><line x1="12" y1="12" x2="12" y2="24" stroke="#333333" stroke-width="1.5"/><line x1="4" y1="17" x2="20" y2="17" stroke="#333333" stroke-width="1.5"/><line x1="12" y1="24" x2="4" y2="32" stroke="#333333" stroke-width="1.5"/><line x1="12" y1="24" x2="20" y2="32" stroke="#333333" stroke-width="1.5"/></svg>`
    case 'sequence-lifeline':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="2" width="24" height="12" fill="#e8f0fe" stroke="#7166F0" stroke-width="1.5"/><line x1="22" y1="14" x2="22" y2="28" stroke="#7166F0" stroke-width="1.5" stroke-dasharray="4 2"/></svg>`
    case 'sequence-activation':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="4" width="12" height="22" fill="#e8f0fe" stroke="#7166F0" stroke-width="1.5" rx="2"/></svg>`
    case 'sequence-fragment-alt':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#ffffff" stroke="#999999" stroke-width="1.5" rx="2"/><rect x="2" y="2" width="10" height="8" fill="#f5f5f5" stroke="#999999" stroke-width="1"/><line x1="2" y1="16" x2="42" y2="16" stroke="#999999" stroke-width="1" stroke-dasharray="3 2"/></svg>`
    case 'sequence-fragment-opt':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#ffffff" stroke="#999999" stroke-width="1.5" rx="2"/><rect x="2" y="2" width="10" height="8" fill="#f5f5f5" stroke="#999999" stroke-width="1"/></svg>`
    case 'sequence-fragment-loop':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#ffffff" stroke="#999999" stroke-width="1.5" rx="2"/><rect x="2" y="2" width="12" height="8" fill="#f5f5f5" stroke="#999999" stroke-width="1"/></svg>`
    case 'sequence-fragment-par':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#ffffff" stroke="#999999" stroke-width="1.5" rx="2"/><rect x="2" y="2" width="10" height="8" fill="#f5f5f5" stroke="#999999" stroke-width="1"/><line x1="2" y1="16" x2="42" y2="16" stroke="#999999" stroke-width="1" stroke-dasharray="3 2"/></svg>`
    case 'sequence-fragment-critical':
      return `<svg viewBox="0 0 44 30" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="40" height="26" fill="#ffffff" stroke="#999999" stroke-width="1.5" rx="2"/><rect x="2" y="2" width="12" height="8" fill="#f5f5f5" stroke="#999999" stroke-width="1"/></svg>`
    case 'sequence-gateway':
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><polygon points="16,2 30,16 16,30 2,16" fill="#fffde7" stroke="#333333" stroke-width="1.5"/></svg>`

    default: {
      const cat = shape.split('-')[0]
      const [df, ds] = CAT_COLOR[cat] ?? CAT_COLOR.basic!
      return `<svg viewBox="0 0 36 26" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="32" height="22" fill="${df}" stroke="${ds}" stroke-width="2"/></svg>`
    }
  }
}
