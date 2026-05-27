import type { GraphData } from '@uni-draw/draw'

export interface ScenarioTemplate {
  id: string
  name: string
  description: string
  tags: string[]
  emoji: string
  category: string
  data: GraphData
}

export interface TemplateCategory {
  key: string
  label: string
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  { key: 'all',           label: '全部'   },
  { key: 'flowchart',     label: '流程图' },
  { key: 'architecture',  label: '架构图' },
  { key: 'data-model',    label: '数据模型' },
  { key: 'organization',  label: '组织管理' },
  { key: 'state-machine', label: '状态机' },
  { key: 'mind-map',      label: '思维导图' },
  { key: 'analysis',      label: '分析图'  },
]

const BASE_CANVAS = {
  backgroundColor: '#ffffff',
  grid: { size: 10, visible: true, type: 'dot' as const },
  zoom: 1,
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. 用户登录流程 (Login Flowchart)
// ──────────────────────────────────────────────────────────────────────────────
const loginFlowchart: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '用户登录流程', type: 'flowchart' },
  nodes: [
    { id: 'n1', shape: 'flowchart-start-end', position: { x: 260, y: 40 },  size: { width: 120, height: 44 }, label: '开始',       style: { fill: '#e6f7ff', stroke: '#1890ff' } },
    { id: 'n2', shape: 'flowchart-process',   position: { x: 260, y: 130 }, size: { width: 120, height: 56 }, label: '输入账号密码', style: { fill: '#fff', stroke: '#1890ff' } },
    { id: 'n3', shape: 'flowchart-decision',  position: { x: 240, y: 240 }, size: { width: 160, height: 76 }, label: '验证通过？',  style: { fill: '#fffbe6', stroke: '#faad14' } },
    { id: 'n4', shape: 'flowchart-process',   position: { x: 460, y: 260 }, size: { width: 120, height: 56 }, label: '提示错误',    style: { fill: '#fff1f0', stroke: '#f5222d' } },
    { id: 'n5', shape: 'flowchart-process',   position: { x: 260, y: 380 }, size: { width: 120, height: 56 }, label: '跳转主页',    style: { fill: '#f6ffed', stroke: '#52c41a' } },
    { id: 'n6', shape: 'flowchart-start-end', position: { x: 260, y: 490 }, size: { width: 120, height: 44 }, label: '结束',       style: { fill: '#e6f7ff', stroke: '#1890ff' } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'n1', target: 'n2' },
    { id: 'e2', shape: 'edge', source: 'n2', target: 'n3' },
    { id: 'e3', shape: 'edge', source: 'n3', target: 'n4', label: '否' },
    { id: 'e4', shape: 'edge', source: 'n4', target: 'n2', label: '重试', vertices: [{ x: 540, y: 158 }] },
    { id: 'e5', shape: 'edge', source: 'n3', target: 'n5', label: '是' },
    { id: 'e6', shape: 'edge', source: 'n5', target: 'n6' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. 电商 ER 图 (E-commerce ER Diagram)
// ──────────────────────────────────────────────────────────────────────────────
const ecommerceER: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '电商 ER 图', type: 'er' },
  nodes: [
    // Entities
    { id: 'user',    shape: 'er-entity', position: { x: 60,  y: 180 }, size: { width: 140, height: 120 }, label: '用户\n──────\nid (PK)\nname\nemail\nphone' },
    { id: 'order',   shape: 'er-entity', position: { x: 320, y: 180 }, size: { width: 140, height: 140 }, label: '订单\n──────\nid (PK)\nuser_id\ntotal\nstatus\ncreated_at' },
    { id: 'product', shape: 'er-entity', position: { x: 580, y: 80 },  size: { width: 140, height: 140 }, label: '商品\n──────\nid (PK)\nname\nprice\nstock\ncategory' },
    { id: 'addr',    shape: 'er-entity', position: { x: 580, y: 280 }, size: { width: 140, height: 120 }, label: '收货地址\n──────\nid (PK)\nuser_id\nprovince\ncity\ndetail' },
    // Relationships
    { id: 'r_place',    shape: 'er-relationship', position: { x: 230, y: 212 }, size: { width: 80, height: 56 }, label: '下单' },
    { id: 'r_contains', shape: 'er-relationship', position: { x: 470, y: 152 }, size: { width: 80, height: 56 }, label: '包含' },
    { id: 'r_ship',     shape: 'er-relationship', position: { x: 470, y: 302 }, size: { width: 80, height: 56 }, label: '配送至' },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'user',  target: 'r_place',    label: '1' },
    { id: 'e2', shape: 'edge', source: 'r_place',    target: 'order',   label: 'N' },
    { id: 'e3', shape: 'edge', source: 'order',  target: 'r_contains', label: '1' },
    { id: 'e4', shape: 'edge', source: 'r_contains', target: 'product', label: 'N' },
    { id: 'e5', shape: 'edge', source: 'order',  target: 'r_ship',     label: '1' },
    { id: 'e6', shape: 'edge', source: 'r_ship',     target: 'addr',    label: '1' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. 微服务架构图 (Microservice Architecture)
// ──────────────────────────────────────────────────────────────────────────────
const microserviceArch: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '微服务架构图', type: 'custom' },
  nodes: [
    { id: 'client',   shape: 'basic-rect',     position: { x: 60,  y: 200 }, size: { width: 110, height: 60 }, label: '客户端',    style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 8 } },
    { id: 'gateway',  shape: 'basic-rect',     position: { x: 250, y: 200 }, size: { width: 120, height: 60 }, label: 'API 网关',  style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 4 } },
    { id: 'auth',     shape: 'basic-rect',     position: { x: 460, y: 80  }, size: { width: 120, height: 56 }, label: '认证服务',  style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'user_svc', shape: 'basic-rect',     position: { x: 460, y: 176 }, size: { width: 120, height: 56 }, label: '用户服务',  style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'order_svc',shape: 'basic-rect',     position: { x: 460, y: 272 }, size: { width: 120, height: 56 }, label: '订单服务',  style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'pay_svc',  shape: 'basic-rect',     position: { x: 460, y: 368 }, size: { width: 120, height: 56 }, label: '支付服务',  style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'db_user',  shape: 'basic-cylinder', position: { x: 660, y: 164 }, size: { width: 100, height: 68 }, label: '用户 DB',   style: { fill: '#e6fffb', stroke: '#13c2c2' } },
    { id: 'db_order', shape: 'basic-cylinder', position: { x: 660, y: 260 }, size: { width: 100, height: 68 }, label: '订单 DB',   style: { fill: '#e6fffb', stroke: '#13c2c2' } },
    { id: 'mq',       shape: 'basic-cloud',    position: { x: 640, y: 360 }, size: { width: 130, height: 70 }, label: '消息队列',  style: { fill: '#fff2e8', stroke: '#fa541c' } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'client',    target: 'gateway',   label: 'HTTP' },
    { id: 'e2', shape: 'edge', source: 'gateway',   target: 'auth',      label: '鉴权' },
    { id: 'e3', shape: 'edge', source: 'gateway',   target: 'user_svc',  label: '/user' },
    { id: 'e4', shape: 'edge', source: 'gateway',   target: 'order_svc', label: '/order' },
    { id: 'e5', shape: 'edge', source: 'gateway',   target: 'pay_svc',   label: '/pay' },
    { id: 'e6', shape: 'edge', source: 'user_svc',  target: 'db_user' },
    { id: 'e7', shape: 'edge', source: 'order_svc', target: 'db_order' },
    { id: 'e8', shape: 'edge', source: 'order_svc', target: 'mq',        label: '发布事件' },
    { id: 'e9', shape: 'edge', source: 'pay_svc',   target: 'mq',        label: '订阅' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. 公司组织架构图 (Org Chart)
// ──────────────────────────────────────────────────────────────────────────────
const orgChart: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '公司组织架构图', type: 'custom' },
  nodes: [
    { id: 'ceo',   shape: 'basic-rounded-rect', position: { x: 300, y: 30  }, size: { width: 120, height: 50 }, label: 'CEO',      style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 25 } },
    { id: 'cto',   shape: 'basic-rounded-rect', position: { x: 120, y: 140 }, size: { width: 110, height: 46 }, label: 'CTO',      style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 20 } },
    { id: 'coo',   shape: 'basic-rounded-rect', position: { x: 260, y: 140 }, size: { width: 110, height: 46 }, label: 'COO',      style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 20 } },
    { id: 'cmo',   shape: 'basic-rounded-rect', position: { x: 400, y: 140 }, size: { width: 110, height: 46 }, label: 'CMO',      style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 20 } },
    { id: 'cfo',   shape: 'basic-rounded-rect', position: { x: 540, y: 140 }, size: { width: 110, height: 46 }, label: 'CFO',      style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 20 } },
    { id: 'dev',   shape: 'basic-rect',         position: { x: 40,  y: 250 }, size: { width: 100, height: 44 }, label: '研发团队',   style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'qa',    shape: 'basic-rect',         position: { x: 155, y: 250 }, size: { width: 100, height: 44 }, label: '测试团队',   style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'ops',   shape: 'basic-rect',         position: { x: 260, y: 250 }, size: { width: 100, height: 44 }, label: '运营团队',   style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'sales', shape: 'basic-rect',         position: { x: 370, y: 250 }, size: { width: 100, height: 44 }, label: '销售团队',   style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'mkt',   shape: 'basic-rect',         position: { x: 480, y: 250 }, size: { width: 100, height: 44 }, label: '市场团队',   style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'fin',   shape: 'basic-rect',         position: { x: 590, y: 250 }, size: { width: 100, height: 44 }, label: '财务团队',   style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'ceo', target: 'cto' },
    { id: 'e2', shape: 'edge', source: 'ceo', target: 'coo' },
    { id: 'e3', shape: 'edge', source: 'ceo', target: 'cmo' },
    { id: 'e4', shape: 'edge', source: 'ceo', target: 'cfo' },
    { id: 'e5', shape: 'edge', source: 'cto', target: 'dev' },
    { id: 'e6', shape: 'edge', source: 'cto', target: 'qa' },
    { id: 'e7', shape: 'edge', source: 'coo', target: 'ops' },
    { id: 'e8', shape: 'edge', source: 'cmo', target: 'sales' },
    { id: 'e9', shape: 'edge', source: 'cmo', target: 'mkt' },
    { id: 'e10', shape: 'edge', source: 'cfo', target: 'fin' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. 订单状态机 (Order State Machine)
// ──────────────────────────────────────────────────────────────────────────────
const orderStateMachine: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '订单状态机', type: 'custom' },
  nodes: [
    { id: 'init',      shape: 'state-initial',    position: { x: 60,  y: 192 }, size: { width: 28,  height: 28  }, label: '' },
    { id: 'pending',   shape: 'state-simple',     position: { x: 120, y: 172 }, size: { width: 110, height: 50 }, label: '待付款',   style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 6 } },
    { id: 'paid',      shape: 'state-simple',     position: { x: 270, y: 172 }, size: { width: 110, height: 50 }, label: '已付款',   style: { fill: '#f6ffed', stroke: '#52c41a', rx: 6 } },
    { id: 'shipped',   shape: 'state-simple',     position: { x: 420, y: 172 }, size: { width: 110, height: 50 }, label: '配送中',   style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 6 } },
    { id: 'delivered', shape: 'state-simple',     position: { x: 570, y: 172 }, size: { width: 110, height: 50 }, label: '已送达',   style: { fill: '#f6ffed', stroke: '#52c41a', rx: 6 } },
    { id: 'completed', shape: 'state-final',      position: { x: 726, y: 184 }, size: { width: 28,  height: 28  }, label: '' },
    { id: 'cancelled', shape: 'state-simple',     position: { x: 270, y: 290 }, size: { width: 110, height: 50 }, label: '已取消',   style: { fill: '#fff1f0', stroke: '#f5222d', rx: 6 } },
    { id: 'refunding', shape: 'state-simple',     position: { x: 420, y: 290 }, size: { width: 110, height: 50 }, label: '退款中',   style: { fill: '#fff2e8', stroke: '#fa541c', rx: 6 } },
    { id: 'refunded',  shape: 'state-simple',     position: { x: 570, y: 290 }, size: { width: 110, height: 50 }, label: '已退款',   style: { fill: '#fff', stroke: '#aaa', rx: 6 } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'init',      target: 'pending',   label: '' },
    { id: 'e2', shape: 'edge', source: 'pending',   target: 'paid',      label: '支付' },
    { id: 'e3', shape: 'edge', source: 'paid',      target: 'shipped',   label: '发货' },
    { id: 'e4', shape: 'edge', source: 'shipped',   target: 'delivered', label: '签收' },
    { id: 'e5', shape: 'edge', source: 'delivered', target: 'completed', label: '确认' },
    { id: 'e6', shape: 'edge', source: 'pending',   target: 'cancelled', label: '取消' },
    { id: 'e7', shape: 'edge', source: 'paid',      target: 'refunding', label: '申请退款' },
    { id: 'e8', shape: 'edge', source: 'refunding', target: 'refunded',  label: '退款完成' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. 注册邮件验证流程
// ──────────────────────────────────────────────────────────────────────────────
const registerFlowchart: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '注册邮件验证流程', type: 'flowchart' },
  nodes: [
    { id: 'n1', shape: 'flowchart-start-end', position: { x: 260, y: 30  }, size: { width: 120, height: 44 }, label: '开始',       style: { fill: '#e6f7ff', stroke: '#1890ff' } },
    { id: 'n2', shape: 'flowchart-process',   position: { x: 260, y: 120 }, size: { width: 120, height: 52 }, label: '填写注册信息', style: { fill: '#fff', stroke: '#1890ff' } },
    { id: 'n3', shape: 'flowchart-decision',  position: { x: 240, y: 220 }, size: { width: 160, height: 72 }, label: '格式验证通过？', style: { fill: '#fffbe6', stroke: '#faad14' } },
    { id: 'n4', shape: 'flowchart-process',   position: { x: 460, y: 236 }, size: { width: 110, height: 44 }, label: '提示格式错误', style: { fill: '#fff1f0', stroke: '#f5222d' } },
    { id: 'n5', shape: 'flowchart-process',   position: { x: 260, y: 340 }, size: { width: 120, height: 52 }, label: '发送验证邮件', style: { fill: '#fff', stroke: '#1890ff' } },
    { id: 'n6', shape: 'flowchart-decision',  position: { x: 240, y: 440 }, size: { width: 160, height: 72 }, label: '邮件已验证？',  style: { fill: '#fffbe6', stroke: '#faad14' } },
    { id: 'n7', shape: 'flowchart-process',   position: { x: 460, y: 456 }, size: { width: 110, height: 44 }, label: '重发验证邮件', style: { fill: '#fff7e6', stroke: '#fa8c16' } },
    { id: 'n8', shape: 'flowchart-process',   position: { x: 260, y: 560 }, size: { width: 120, height: 52 }, label: '创建账号',     style: { fill: '#f6ffed', stroke: '#52c41a' } },
    { id: 'n9', shape: 'flowchart-start-end', position: { x: 260, y: 660 }, size: { width: 120, height: 44 }, label: '结束',         style: { fill: '#e6f7ff', stroke: '#1890ff' } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'n1', target: 'n2' },
    { id: 'e2', shape: 'edge', source: 'n2', target: 'n3' },
    { id: 'e3', shape: 'edge', source: 'n3', target: 'n4', label: '否' },
    { id: 'e4', shape: 'edge', source: 'n4', target: 'n2', vertices: [{ x: 540, y: 148 }] },
    { id: 'e5', shape: 'edge', source: 'n3', target: 'n5', label: '是' },
    { id: 'e6', shape: 'edge', source: 'n5', target: 'n6' },
    { id: 'e7', shape: 'edge', source: 'n6', target: 'n7', label: '否' },
    { id: 'e8', shape: 'edge', source: 'n7', target: 'n6', vertices: [{ x: 560, y: 400 }] },
    { id: 'e9', shape: 'edge', source: 'n6', target: 'n8', label: '是' },
    { id: 'e10', shape: 'edge', source: 'n8', target: 'n9' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. 文档审批流程
// ──────────────────────────────────────────────────────────────────────────────
const approvalFlowchart: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '文档审批流程', type: 'flowchart' },
  nodes: [
    { id: 'n1', shape: 'flowchart-start-end', position: { x: 260, y: 30  }, size: { width: 120, height: 44 }, label: '发起申请',     style: { fill: '#e6f7ff', stroke: '#1890ff' } },
    { id: 'n2', shape: 'flowchart-process',   position: { x: 260, y: 120 }, size: { width: 120, height: 52 }, label: '填写申请表单', style: { fill: '#fff', stroke: '#1890ff' } },
    { id: 'n3', shape: 'flowchart-decision',  position: { x: 240, y: 220 }, size: { width: 160, height: 72 }, label: '部门主管审核', style: { fill: '#fffbe6', stroke: '#faad14' } },
    { id: 'n4', shape: 'flowchart-process',   position: { x: 460, y: 236 }, size: { width: 110, height: 44 }, label: '驳回通知',     style: { fill: '#fff1f0', stroke: '#f5222d' } },
    { id: 'n5', shape: 'flowchart-process',   position: { x: 260, y: 340 }, size: { width: 120, height: 52 }, label: 'HR 复核',      style: { fill: '#fff', stroke: '#722ed1' } },
    { id: 'n6', shape: 'flowchart-decision',  position: { x: 240, y: 440 }, size: { width: 160, height: 72 }, label: 'HR 是否批准', style: { fill: '#fffbe6', stroke: '#faad14' } },
    { id: 'n7', shape: 'flowchart-process',   position: { x: 460, y: 456 }, size: { width: 110, height: 44 }, label: '需补充材料',   style: { fill: '#fff7e6', stroke: '#fa8c16' } },
    { id: 'n8', shape: 'flowchart-process',   position: { x: 260, y: 560 }, size: { width: 120, height: 52 }, label: '审批完成通知', style: { fill: '#f6ffed', stroke: '#52c41a' } },
    { id: 'n9', shape: 'flowchart-start-end', position: { x: 260, y: 660 }, size: { width: 120, height: 44 }, label: '归档',         style: { fill: '#e6f7ff', stroke: '#1890ff' } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'n1', target: 'n2' },
    { id: 'e2', shape: 'edge', source: 'n2', target: 'n3' },
    { id: 'e3', shape: 'edge', source: 'n3', target: 'n4', label: '驳回' },
    { id: 'e4', shape: 'edge', source: 'n4', target: 'n2', vertices: [{ x: 540, y: 148 }] },
    { id: 'e5', shape: 'edge', source: 'n3', target: 'n5', label: '通过' },
    { id: 'e6', shape: 'edge', source: 'n5', target: 'n6' },
    { id: 'e7', shape: 'edge', source: 'n6', target: 'n7', label: '否' },
    { id: 'e8', shape: 'edge', source: 'n7', target: 'n5', vertices: [{ x: 560, y: 390 }] },
    { id: 'e9', shape: 'edge', source: 'n6', target: 'n8', label: '批准' },
    { id: 'e10', shape: 'edge', source: 'n8', target: 'n9' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 8. 前端技术栈架构
// ──────────────────────────────────────────────────────────────────────────────
const frontendArch: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '前端技术栈架构', type: 'custom' },
  nodes: [
    { id: 'browser', shape: 'basic-rect',     position: { x: 280, y: 30  }, size: { width: 140, height: 52 }, label: '用户浏览器',    style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 8 } },
    { id: 'cdn',     shape: 'basic-cloud',    position: { x: 600, y: 30  }, size: { width: 130, height: 64 }, label: 'CDN / Nginx',   style: { fill: '#f0f5ff', stroke: '#2f54eb' } },
    { id: 'vue',     shape: 'basic-rect',     position: { x: 280, y: 140 }, size: { width: 140, height: 52 }, label: 'Vue 3 应用',     style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'router',  shape: 'basic-rect',     position: { x: 80,  y: 250 }, size: { width: 110, height: 44 }, label: 'Vue Router',    style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'pinia',   shape: 'basic-rect',     position: { x: 220, y: 250 }, size: { width: 110, height: 44 }, label: 'Pinia 状态管理', style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'axios',   shape: 'basic-rect',     position: { x: 360, y: 250 }, size: { width: 110, height: 44 }, label: 'Axios / Fetch', style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'ui',      shape: 'basic-rect',     position: { x: 500, y: 250 }, size: { width: 110, height: 44 }, label: 'UI 组件库',      style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'api',     shape: 'basic-rect',     position: { x: 360, y: 380 }, size: { width: 120, height: 52 }, label: '后端 REST API', style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 4 } },
    { id: 'local',   shape: 'basic-rect',     position: { x: 220, y: 380 }, size: { width: 110, height: 44 }, label: 'LocalStorage',  style: { fill: '#f6ffed', stroke: '#52c41a', rx: 4 } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'browser', target: 'cdn',    label: '静态资源' },
    { id: 'e2', shape: 'edge', source: 'browser', target: 'vue',    label: '加载应用' },
    { id: 'e3', shape: 'edge', source: 'vue',     target: 'router' },
    { id: 'e4', shape: 'edge', source: 'vue',     target: 'pinia' },
    { id: 'e5', shape: 'edge', source: 'vue',     target: 'axios' },
    { id: 'e6', shape: 'edge', source: 'vue',     target: 'ui' },
    { id: 'e7', shape: 'edge', source: 'axios',   target: 'api',    label: 'HTTP/JSON' },
    { id: 'e8', shape: 'edge', source: 'pinia',   target: 'local',  label: '持久化' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 9. CI/CD 发布流水线
// ──────────────────────────────────────────────────────────────────────────────
const cicdPipeline: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: 'CI/CD 发布流水线', type: 'custom' },
  nodes: [
    { id: 'commit',  shape: 'basic-rect',     position: { x: 40,  y: 200 }, size: { width: 110, height: 50 }, label: '代码提交 Git', style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 4 } },
    { id: 'ci',      shape: 'basic-rect',     position: { x: 200, y: 200 }, size: { width: 110, height: 50 }, label: '触发 CI',       style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 4 } },
    { id: 'test',    shape: 'basic-rect',     position: { x: 360, y: 120 }, size: { width: 110, height: 44 }, label: '单元测试',      style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'scan',    shape: 'basic-rect',     position: { x: 360, y: 200 }, size: { width: 110, height: 44 }, label: '代码扫描',      style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'build',   shape: 'basic-rect',     position: { x: 360, y: 280 }, size: { width: 110, height: 44 }, label: 'Docker 构建',   style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'staging', shape: 'basic-rect',     position: { x: 530, y: 200 }, size: { width: 110, height: 50 }, label: '测试环境部署',  style: { fill: '#f6ffed', stroke: '#52c41a', rx: 4 } },
    { id: 'approve', shape: 'flowchart-decision', position: { x: 680, y: 176 }, size: { width: 140, height: 80 }, label: '人工审批',   style: { fill: '#fffbe6', stroke: '#faad14' } },
    { id: 'prod',    shape: 'basic-rect',     position: { x: 880, y: 200 }, size: { width: 110, height: 50 }, label: '生产环境发布',  style: { fill: '#fff1f0', stroke: '#f5222d', rx: 4 } },
    { id: 'monitor', shape: 'basic-cloud',    position: { x: 870, y: 310 }, size: { width: 130, height: 60 }, label: '监控告警',      style: { fill: '#e6f7ff', stroke: '#1890ff' } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'commit',  target: 'ci' },
    { id: 'e2', shape: 'edge', source: 'ci',      target: 'test' },
    { id: 'e3', shape: 'edge', source: 'ci',      target: 'scan' },
    { id: 'e4', shape: 'edge', source: 'ci',      target: 'build' },
    { id: 'e5', shape: 'edge', source: 'test',    target: 'staging' },
    { id: 'e6', shape: 'edge', source: 'scan',    target: 'staging' },
    { id: 'e7', shape: 'edge', source: 'build',   target: 'staging' },
    { id: 'e8', shape: 'edge', source: 'staging', target: 'approve' },
    { id: 'e9', shape: 'edge', source: 'approve', target: 'prod',    label: '批准' },
    { id: 'e10', shape: 'edge', source: 'prod',   target: 'monitor' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 10. 博客系统 ER 图
// ──────────────────────────────────────────────────────────────────────────────
const blogER: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '博客系统 ER 图', type: 'er' },
  nodes: [
    { id: 'user',     shape: 'er-entity',       position: { x: 60,  y: 200 }, size: { width: 140, height: 120 }, label: '用户\n──────\nid (PK)\nusername\nemail\navatar' },
    { id: 'post',     shape: 'er-entity',       position: { x: 320, y: 140 }, size: { width: 140, height: 140 }, label: '文章\n──────\nid (PK)\ntitle\ncontent\nstatus\ncreated_at' },
    { id: 'comment',  shape: 'er-entity',       position: { x: 580, y: 200 }, size: { width: 140, height: 120 }, label: '评论\n──────\nid (PK)\npost_id\nuser_id\ncontent' },
    { id: 'tag',      shape: 'er-entity',       position: { x: 320, y: 380 }, size: { width: 140, height: 100 }, label: '标签\n──────\nid (PK)\nname\nslug' },
    { id: 'r_writes', shape: 'er-relationship', position: { x: 218, y: 232 }, size: { width: 80, height: 56 }, label: '撰写' },
    { id: 'r_has',    shape: 'er-relationship', position: { x: 468, y: 232 }, size: { width: 80, height: 56 }, label: '评论' },
    { id: 'r_tag',    shape: 'er-relationship', position: { x: 380, y: 300 }, size: { width: 80, height: 56 }, label: '打标签' },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'user',     target: 'r_writes', label: '1' },
    { id: 'e2', shape: 'edge', source: 'r_writes', target: 'post',     label: 'N' },
    { id: 'e3', shape: 'edge', source: 'post',     target: 'r_has',    label: '1' },
    { id: 'e4', shape: 'edge', source: 'r_has',    target: 'comment',  label: 'N' },
    { id: 'e5', shape: 'edge', source: 'post',     target: 'r_tag',    label: 'N' },
    { id: 'e6', shape: 'edge', source: 'r_tag',    target: 'tag',      label: 'N' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 11. RBAC 权限模型
// ──────────────────────────────────────────────────────────────────────────────
const rbacModel: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: 'RBAC 权限模型', type: 'er' },
  nodes: [
    { id: 'user',       shape: 'er-entity', position: { x: 60,  y: 180 }, size: { width: 130, height: 110 }, label: '用户\n──────\nid\nusername\nemail' },
    { id: 'role',       shape: 'er-entity', position: { x: 280, y: 180 }, size: { width: 130, height: 110 }, label: '角色\n──────\nid\nname\ndesc' },
    { id: 'permission', shape: 'er-entity', position: { x: 500, y: 180 }, size: { width: 130, height: 110 }, label: '权限\n──────\nid\naction\nresource' },
    { id: 'resource',   shape: 'er-entity', position: { x: 500, y: 360 }, size: { width: 130, height: 100 }, label: '资源\n──────\nid\nname\ntype\npath' },
    { id: 'r_ur', shape: 'er-relationship', position: { x: 188, y: 210 }, size: { width: 72, height: 50 }, label: '分配' },
    { id: 'r_rp', shape: 'er-relationship', position: { x: 406, y: 210 }, size: { width: 72, height: 50 }, label: '包含' },
    { id: 'r_pr', shape: 'er-relationship', position: { x: 520, y: 290 }, size: { width: 72, height: 50 }, label: '作用于' },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'user',       target: 'r_ur',  label: 'N' },
    { id: 'e2', shape: 'edge', source: 'r_ur',       target: 'role',  label: 'N' },
    { id: 'e3', shape: 'edge', source: 'role',       target: 'r_rp',  label: 'N' },
    { id: 'e4', shape: 'edge', source: 'r_rp',       target: 'permission', label: 'N' },
    { id: 'e5', shape: 'edge', source: 'permission', target: 'r_pr' },
    { id: 'e6', shape: 'edge', source: 'r_pr',       target: 'resource' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 12. 项目团队结构图
// ──────────────────────────────────────────────────────────────────────────────
const projectTeam: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '项目团队结构图', type: 'custom' },
  nodes: [
    { id: 'pm',      shape: 'basic-rounded-rect', position: { x: 300, y: 30  }, size: { width: 130, height: 50 }, label: '项目经理 PM',  style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 25 } },
    { id: 'po',      shape: 'basic-rounded-rect', position: { x: 80,  y: 140 }, size: { width: 120, height: 46 }, label: '产品经理 PO',  style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 20 } },
    { id: 'tl',      shape: 'basic-rounded-rect', position: { x: 300, y: 140 }, size: { width: 120, height: 46 }, label: '技术负责人',   style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 20 } },
    { id: 'qa_lead', shape: 'basic-rounded-rect', position: { x: 520, y: 140 }, size: { width: 120, height: 46 }, label: '测试负责人',   style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 20 } },
    { id: 'fe',      shape: 'basic-rect',         position: { x: 200, y: 250 }, size: { width: 100, height: 44 }, label: '前端开发',     style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'be',      shape: 'basic-rect',         position: { x: 315, y: 250 }, size: { width: 100, height: 44 }, label: '后端开发',     style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'devops',  shape: 'basic-rect',         position: { x: 430, y: 250 }, size: { width: 100, height: 44 }, label: '运维 DevOps',  style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'qa1',     shape: 'basic-rect',         position: { x: 490, y: 250 }, size: { width: 100, height: 44 }, label: '自动化测试',   style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
    { id: 'design',  shape: 'basic-rect',         position: { x: 40,  y: 250 }, size: { width: 100, height: 44 }, label: 'UI/UX 设计',   style: { fill: '#fff', stroke: '#aaa', rx: 4 } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'pm', target: 'po' },
    { id: 'e2', shape: 'edge', source: 'pm', target: 'tl' },
    { id: 'e3', shape: 'edge', source: 'pm', target: 'qa_lead' },
    { id: 'e4', shape: 'edge', source: 'po', target: 'design' },
    { id: 'e5', shape: 'edge', source: 'tl', target: 'fe' },
    { id: 'e6', shape: 'edge', source: 'tl', target: 'be' },
    { id: 'e7', shape: 'edge', source: 'tl', target: 'devops' },
    { id: 'e8', shape: 'edge', source: 'qa_lead', target: 'qa1' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 13. 用户账号状态机
// ──────────────────────────────────────────────────────────────────────────────
const userAccountStateMachine: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '用户账号状态机', type: 'custom' },
  nodes: [
    { id: 'init',      shape: 'state-initial',    position: { x: 40,  y: 196 }, size: { width: 28,  height: 28  }, label: '' },
    { id: 'inactive',  shape: 'state-simple',     position: { x: 100, y: 176 }, size: { width: 110, height: 50 }, label: '待激活',   style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 6 } },
    { id: 'active',    shape: 'state-simple',     position: { x: 260, y: 176 }, size: { width: 110, height: 50 }, label: '正常',     style: { fill: '#f6ffed', stroke: '#52c41a', rx: 6 } },
    { id: 'banned',    shape: 'state-simple',     position: { x: 260, y: 300 }, size: { width: 110, height: 50 }, label: '封禁中',   style: { fill: '#fff1f0', stroke: '#f5222d', rx: 6 } },
    { id: 'locked',    shape: 'state-simple',     position: { x: 420, y: 176 }, size: { width: 110, height: 50 }, label: '锁定',     style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 6 } },
    { id: 'deleted',   shape: 'state-simple',     position: { x: 580, y: 176 }, size: { width: 110, height: 50 }, label: '已注销',   style: { fill: '#fff', stroke: '#aaa', rx: 6 } },
    { id: 'final',     shape: 'state-final',      position: { x: 736, y: 188 }, size: { width: 28,  height: 28  }, label: '' },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'init',     target: 'inactive', label: '注册' },
    { id: 'e2', shape: 'edge', source: 'inactive', target: 'active',   label: '激活邮件' },
    { id: 'e3', shape: 'edge', source: 'active',   target: 'banned',   label: '违规封禁' },
    { id: 'e4', shape: 'edge', source: 'banned',   target: 'active',   label: '解封', vertices: [{ x: 315, y: 260 }] },
    { id: 'e5', shape: 'edge', source: 'active',   target: 'locked',   label: '多次失败' },
    { id: 'e6', shape: 'edge', source: 'locked',   target: 'active',   label: '解锁', vertices: [{ x: 475, y: 150 }] },
    { id: 'e7', shape: 'edge', source: 'active',   target: 'deleted',  label: '注销申请' },
    { id: 'e8', shape: 'edge', source: 'deleted',  target: 'final' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 14. 思维导图 – 产品规划 (Mind Map)
// ──────────────────────────────────────────────────────────────────────────────
const mindMap: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '产品规划思维导图', type: 'custom' },
  nodes: [
    { id: 'c',    shape: 'basic-circle',       position: { x: 295, y: 195 }, size: { width: 110, height: 110 }, label: '产品规划',   style: { fill: '#f9f0ff', stroke: '#722ed1', strokeWidth: 2 } },
    { id: 'm1',   shape: 'basic-rounded-rect', position: { x: 60,  y: 50  }, size: { width: 110, height: 44 }, label: '用户研究',   style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 22 } },
    { id: 'm2',   shape: 'basic-rounded-rect', position: { x: 530, y: 50  }, size: { width: 110, height: 44 }, label: '功能设计',   style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 22 } },
    { id: 'm3',   shape: 'basic-rounded-rect', position: { x: 60,  y: 330 }, size: { width: 110, height: 44 }, label: '技术选型',   style: { fill: '#f6ffed', stroke: '#52c41a', rx: 22 } },
    { id: 'm4',   shape: 'basic-rounded-rect', position: { x: 530, y: 330 }, size: { width: 110, height: 44 }, label: '市场策略',   style: { fill: '#fff1f0', stroke: '#f5222d', rx: 22 } },
    { id: 's1a',  shape: 'basic-rect',         position: { x: 10,  y: 10  }, size: { width: 90, height: 34 }, label: '用户访谈',   style: { fill: '#fff', stroke: '#fa8c16', rx: 4 } },
    { id: 's1b',  shape: 'basic-rect',         position: { x: 10,  y: 110 }, size: { width: 90, height: 34 }, label: '问卷调研',   style: { fill: '#fff', stroke: '#fa8c16', rx: 4 } },
    { id: 's2a',  shape: 'basic-rect',         position: { x: 650, y: 10  }, size: { width: 90, height: 34 }, label: '原型设计',   style: { fill: '#fff', stroke: '#1890ff', rx: 4 } },
    { id: 's2b',  shape: 'basic-rect',         position: { x: 650, y: 110 }, size: { width: 90, height: 34 }, label: '需求拆解',   style: { fill: '#fff', stroke: '#1890ff', rx: 4 } },
    { id: 's3a',  shape: 'basic-rect',         position: { x: 10,  y: 290 }, size: { width: 90, height: 34 }, label: '前端框架',   style: { fill: '#fff', stroke: '#52c41a', rx: 4 } },
    { id: 's3b',  shape: 'basic-rect',         position: { x: 10,  y: 380 }, size: { width: 90, height: 34 }, label: '云服务商',   style: { fill: '#fff', stroke: '#52c41a', rx: 4 } },
    { id: 's4a',  shape: 'basic-rect',         position: { x: 650, y: 290 }, size: { width: 90, height: 34 }, label: '竞品分析',   style: { fill: '#fff', stroke: '#f5222d', rx: 4 } },
    { id: 's4b',  shape: 'basic-rect',         position: { x: 650, y: 380 }, size: { width: 90, height: 34 }, label: '定价策略',   style: { fill: '#fff', stroke: '#f5222d', rx: 4 } },
  ],
  edges: [
    { id: 'e1',  shape: 'edge', source: 'c',  target: 'm1' },
    { id: 'e2',  shape: 'edge', source: 'c',  target: 'm2' },
    { id: 'e3',  shape: 'edge', source: 'c',  target: 'm3' },
    { id: 'e4',  shape: 'edge', source: 'c',  target: 'm4' },
    { id: 'e5',  shape: 'edge', source: 'm1', target: 's1a' },
    { id: 'e6',  shape: 'edge', source: 'm1', target: 's1b' },
    { id: 'e7',  shape: 'edge', source: 'm2', target: 's2a' },
    { id: 'e8',  shape: 'edge', source: 'm2', target: 's2b' },
    { id: 'e9',  shape: 'edge', source: 'm3', target: 's3a' },
    { id: 'e10', shape: 'edge', source: 'm3', target: 's3b' },
    { id: 'e11', shape: 'edge', source: 'm4', target: 's4a' },
    { id: 'e12', shape: 'edge', source: 'm4', target: 's4b' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 15. 智能体流程编排 (AI Agent Flow)
// ──────────────────────────────────────────────────────────────────────────────
const agentFlow: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '智能体流程编排', type: 'custom' },
  nodes: [
    { id: 'input',       shape: 'basic-rounded-rect', position: { x: 40,  y: 215 }, size: { width: 110, height: 50 }, label: '用户输入',    style: { fill: '#f6ffed', stroke: '#52c41a', rx: 25 } },
    { id: 'planner',     shape: 'basic-rounded-rect', position: { x: 220, y: 205 }, size: { width: 130, height: 70 }, label: '规划器 Agent', style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 8, strokeWidth: 2 } },
    { id: 'tool_search', shape: 'basic-rect',         position: { x: 430, y: 100 }, size: { width: 120, height: 50 }, label: '搜索工具',    style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 4 } },
    { id: 'tool_code',   shape: 'basic-rect',         position: { x: 430, y: 215 }, size: { width: 120, height: 50 }, label: '代码执行',    style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 4 } },
    { id: 'tool_db',     shape: 'basic-rect',         position: { x: 430, y: 330 }, size: { width: 120, height: 50 }, label: '数据库查询',  style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 4 } },
    { id: 'aggregator',  shape: 'basic-rounded-rect', position: { x: 640, y: 205 }, size: { width: 120, height: 70 }, label: '结果聚合器',  style: { fill: '#e6fffb', stroke: '#13c2c2', rx: 8 } },
    { id: 'output',      shape: 'basic-rounded-rect', position: { x: 850, y: 215 }, size: { width: 110, height: 50 }, label: '最终输出',    style: { fill: '#f6ffed', stroke: '#52c41a', rx: 25 } },
    { id: 'memory',      shape: 'basic-cylinder',     position: { x: 220, y: 360 }, size: { width: 110, height: 60 }, label: '记忆存储',    style: { fill: '#e6fffb', stroke: '#13c2c2' } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'input',       target: 'planner' },
    { id: 'e2', shape: 'edge', source: 'planner',     target: 'tool_search', label: '调用' },
    { id: 'e3', shape: 'edge', source: 'planner',     target: 'tool_code',   label: '调用' },
    { id: 'e4', shape: 'edge', source: 'planner',     target: 'tool_db',     label: '调用' },
    { id: 'e5', shape: 'edge', source: 'tool_search', target: 'aggregator',  label: '结果' },
    { id: 'e6', shape: 'edge', source: 'tool_code',   target: 'aggregator',  label: '结果' },
    { id: 'e7', shape: 'edge', source: 'tool_db',     target: 'aggregator',  label: '结果' },
    { id: 'e8', shape: 'edge', source: 'aggregator',  target: 'output' },
    { id: 'e9', shape: 'edge', source: 'planner',     target: 'memory',      label: '读写' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 16. 数据管道 DAG
// ──────────────────────────────────────────────────────────────────────────────
const dagPipeline: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '数据管道 DAG', type: 'custom' },
  nodes: [
    { id: 'src_mysql',   shape: 'basic-cylinder',     position: { x: 40,  y: 70  }, size: { width: 110, height: 60 }, label: 'MySQL 源',   style: { fill: '#e6f7ff', stroke: '#1890ff' } },
    { id: 'src_mongo',   shape: 'basic-cylinder',     position: { x: 40,  y: 190 }, size: { width: 110, height: 60 }, label: 'MongoDB 源', style: { fill: '#e6f7ff', stroke: '#1890ff' } },
    { id: 'src_kafka',   shape: 'basic-cloud',        position: { x: 30,  y: 320 }, size: { width: 130, height: 60 }, label: 'Kafka 流',   style: { fill: '#fff7e6', stroke: '#fa541c' } },
    { id: 'etl_batch',   shape: 'basic-rect',         position: { x: 240, y: 110 }, size: { width: 120, height: 50 }, label: '批量 ETL',   style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'etl_stream',  shape: 'basic-rect',         position: { x: 240, y: 330 }, size: { width: 120, height: 50 }, label: '实时处理',   style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'warehouse',   shape: 'basic-cylinder',     position: { x: 460, y: 110 }, size: { width: 120, height: 60 }, label: '数据仓库',   style: { fill: '#e6fffb', stroke: '#13c2c2' } },
    { id: 'realtime_db', shape: 'basic-cylinder',     position: { x: 460, y: 330 }, size: { width: 120, height: 60 }, label: '实时数据库', style: { fill: '#fff2e8', stroke: '#fa541c' } },
    { id: 'bi',          shape: 'basic-rect',         position: { x: 680, y: 50  }, size: { width: 110, height: 50 }, label: 'BI 报表',    style: { fill: '#f6ffed', stroke: '#52c41a', rx: 4 } },
    { id: 'ml',          shape: 'basic-rect',         position: { x: 680, y: 160 }, size: { width: 110, height: 50 }, label: '机器学习',   style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 4 } },
    { id: 'dashboard',   shape: 'basic-rect',         position: { x: 680, y: 330 }, size: { width: 110, height: 50 }, label: '实时看板',   style: { fill: '#f6ffed', stroke: '#52c41a', rx: 4 } },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'src_mysql',   target: 'etl_batch' },
    { id: 'e2', shape: 'edge', source: 'src_mongo',   target: 'etl_batch' },
    { id: 'e3', shape: 'edge', source: 'src_kafka',   target: 'etl_stream' },
    { id: 'e4', shape: 'edge', source: 'etl_batch',   target: 'warehouse' },
    { id: 'e5', shape: 'edge', source: 'etl_stream',  target: 'realtime_db' },
    { id: 'e6', shape: 'edge', source: 'warehouse',   target: 'bi' },
    { id: 'e7', shape: 'edge', source: 'warehouse',   target: 'ml' },
    { id: 'e8', shape: 'edge', source: 'realtime_db', target: 'dashboard' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 17. SaaS 多租户 ER 图
// ──────────────────────────────────────────────────────────────────────────────
const erSaaS: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: 'SaaS 多租户 ER 图', type: 'er' },
  nodes: [
    { id: 'tenant',      shape: 'er-entity',       position: { x: 60,  y: 150 }, size: { width: 150, height: 130 }, label: '租户\n──────\nid (PK)\nname\nslug\nstatus\nplan_id (FK)' },
    { id: 'user',        shape: 'er-entity',       position: { x: 320, y: 50  }, size: { width: 150, height: 140 }, label: '用户\n──────\nid (PK)\ntenant_id (FK)\nemail\nrole\nlast_login' },
    { id: 'plan',        shape: 'er-entity',       position: { x: 60,  y: 370 }, size: { width: 150, height: 130 }, label: '订阅计划\n──────\nid (PK)\nname\nprice\nmax_users\nfeatures' },
    { id: 'workspace',   shape: 'er-entity',       position: { x: 570, y: 150 }, size: { width: 150, height: 130 }, label: '工作空间\n──────\nid (PK)\ntenant_id (FK)\nname\ntype\nsettings' },
    { id: 'r_has_user',  shape: 'er-relationship', position: { x: 230, y: 183 }, size: { width: 76, height: 52 }, label: '拥有' },
    { id: 'r_uses',      shape: 'er-relationship', position: { x: 155, y: 315 }, size: { width: 76, height: 52 }, label: '订阅' },
    { id: 'r_in',        shape: 'er-relationship', position: { x: 462, y: 183 }, size: { width: 76, height: 52 }, label: '属于' },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'tenant',    target: 'r_has_user', label: '1' },
    { id: 'e2', shape: 'edge', source: 'r_has_user', target: 'user',      label: 'N' },
    { id: 'e3', shape: 'edge', source: 'tenant',    target: 'r_uses',     label: 'N' },
    { id: 'e4', shape: 'edge', source: 'r_uses',    target: 'plan',       label: '1' },
    { id: 'e5', shape: 'edge', source: 'tenant',    target: 'r_in',       label: '1' },
    { id: 'e6', shape: 'edge', source: 'r_in',      target: 'workspace',  label: 'N' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 18. BPMN 订单履行流程
// ──────────────────────────────────────────────────────────────────────────────
const bpmnOrder: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: 'BPMN 订单履行流程', type: 'flowchart' },
  nodes: [
    { id: 'start',   shape: 'state-initial',     position: { x: 40,  y: 224 }, size: { width: 32,  height: 32  }, label: '' },
    { id: 'receive', shape: 'flowchart-process',  position: { x: 110, y: 206 }, size: { width: 120, height: 60 }, label: '接收订单',  style: { fill: '#e6f7ff', stroke: '#1890ff' } },
    { id: 'check',   shape: 'flowchart-decision', position: { x: 295, y: 190 }, size: { width: 140, height: 80 }, label: '检查库存',  style: { fill: '#fffbe6', stroke: '#faad14' } },
    { id: 'pick',    shape: 'flowchart-process',  position: { x: 510, y: 140 }, size: { width: 110, height: 54 }, label: '拣货打包',  style: { fill: '#f6ffed', stroke: '#52c41a' } },
    { id: 'procure', shape: 'flowchart-process',  position: { x: 510, y: 300 }, size: { width: 110, height: 54 }, label: '紧急采购',  style: { fill: '#fff7e6', stroke: '#fa8c16' } },
    { id: 'ship',    shape: 'flowchart-process',  position: { x: 690, y: 140 }, size: { width: 110, height: 54 }, label: '发货配送',  style: { fill: '#f6ffed', stroke: '#52c41a' } },
    { id: 'restock', shape: 'flowchart-process',  position: { x: 690, y: 300 }, size: { width: 110, height: 54 }, label: '库存补货',  style: { fill: '#f9f0ff', stroke: '#722ed1' } },
    { id: 'notify',  shape: 'flowchart-process',  position: { x: 870, y: 206 }, size: { width: 110, height: 60 }, label: '通知买家',  style: { fill: '#e6f7ff', stroke: '#1890ff' } },
    { id: 'end',     shape: 'state-final',        position: { x: 1050, y: 222 }, size: { width: 32, height: 32 }, label: '' },
  ],
  edges: [
    { id: 'e1', shape: 'edge', source: 'start',   target: 'receive' },
    { id: 'e2', shape: 'edge', source: 'receive',  target: 'check' },
    { id: 'e3', shape: 'edge', source: 'check',    target: 'pick',    label: '有货' },
    { id: 'e4', shape: 'edge', source: 'check',    target: 'procure', label: '缺货' },
    { id: 'e5', shape: 'edge', source: 'pick',     target: 'ship' },
    { id: 'e6', shape: 'edge', source: 'procure',  target: 'restock' },
    { id: 'e7', shape: 'edge', source: 'restock',  target: 'pick',    vertices: [{ x: 745, y: 220 }] },
    { id: 'e8', shape: 'edge', source: 'ship',     target: 'notify' },
    { id: 'e9', shape: 'edge', source: 'notify',   target: 'end' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 19. 研发部组织架构 (R&D Org Chart)
// ──────────────────────────────────────────────────────────────────────────────
const orgRD: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '研发部组织架构', type: 'custom' },
  nodes: [
    { id: 'cto',    shape: 'basic-rounded-rect', position: { x: 330, y: 30  }, size: { width: 130, height: 50 }, label: '技术总监 CTO',  style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 25 } },
    { id: 'arch',   shape: 'basic-rounded-rect', position: { x: 50,  y: 140 }, size: { width: 120, height: 46 }, label: '架构组',         style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 20 } },
    { id: 'fe',     shape: 'basic-rounded-rect', position: { x: 200, y: 140 }, size: { width: 120, height: 46 }, label: '前端组',         style: { fill: '#f6ffed', stroke: '#52c41a', rx: 20 } },
    { id: 'be',     shape: 'basic-rounded-rect', position: { x: 350, y: 140 }, size: { width: 120, height: 46 }, label: '后端组',         style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 20 } },
    { id: 'mobile', shape: 'basic-rounded-rect', position: { x: 500, y: 140 }, size: { width: 120, height: 46 }, label: '移动端组',       style: { fill: '#fff1f0', stroke: '#f5222d', rx: 20 } },
    { id: 'data',   shape: 'basic-rounded-rect', position: { x: 650, y: 140 }, size: { width: 120, height: 46 }, label: '数据组',         style: { fill: '#e6fffb', stroke: '#13c2c2', rx: 20 } },
    { id: 'cloud',  shape: 'basic-rect',         position: { x: 10,  y: 250 }, size: { width: 100, height: 40 }, label: '云架构师',       style: { fill: '#fff', stroke: '#1890ff', rx: 4 } },
    { id: 'sec',    shape: 'basic-rect',         position: { x: 125, y: 250 }, size: { width: 100, height: 40 }, label: '安全工程师',     style: { fill: '#fff', stroke: '#1890ff', rx: 4 } },
    { id: 'fe1',    shape: 'basic-rect',         position: { x: 165, y: 250 }, size: { width: 100, height: 40 }, label: 'Vue 工程师',     style: { fill: '#fff', stroke: '#52c41a', rx: 4 } },
    { id: 'fe2',    shape: 'basic-rect',         position: { x: 280, y: 250 }, size: { width: 100, height: 40 }, label: 'React 工程师',   style: { fill: '#fff', stroke: '#52c41a', rx: 4 } },
    { id: 'be1',    shape: 'basic-rect',         position: { x: 315, y: 250 }, size: { width: 100, height: 40 }, label: 'Java 工程师',    style: { fill: '#fff', stroke: '#fa8c16', rx: 4 } },
    { id: 'be2',    shape: 'basic-rect',         position: { x: 430, y: 250 }, size: { width: 100, height: 40 }, label: 'Go 工程师',      style: { fill: '#fff', stroke: '#fa8c16', rx: 4 } },
  ],
  edges: [
    { id: 'e1',  shape: 'edge', source: 'cto',  target: 'arch' },
    { id: 'e2',  shape: 'edge', source: 'cto',  target: 'fe' },
    { id: 'e3',  shape: 'edge', source: 'cto',  target: 'be' },
    { id: 'e4',  shape: 'edge', source: 'cto',  target: 'mobile' },
    { id: 'e5',  shape: 'edge', source: 'cto',  target: 'data' },
    { id: 'e6',  shape: 'edge', source: 'arch', target: 'cloud' },
    { id: 'e7',  shape: 'edge', source: 'arch', target: 'sec' },
    { id: 'e8',  shape: 'edge', source: 'fe',   target: 'fe1' },
    { id: 'e9',  shape: 'edge', source: 'fe',   target: 'fe2' },
    { id: 'e10', shape: 'edge', source: 'be',   target: 'be1' },
    { id: 'e11', shape: 'edge', source: 'be',   target: 'be2' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// 20. 克服拖延症 – 决策型鱼骨图 (Fishbone / Ishikawa)
// ──────────────────────────────────────────────────────────────────────────────
const fishbone: GraphData = {
  canvas: BASE_CANVAS,
  meta: { title: '克服拖延症鱼骨图', type: 'custom' },
  nodes: [
    { id: 'effect', shape: 'basic-rect',         position: { x: 720, y: 212 }, size: { width: 140, height: 70 }, label: '任务无法完成', style: { fill: '#fff1f0', stroke: '#f5222d', strokeWidth: 2, rx: 4 } },
    { id: 'sp1',    shape: 'basic-circle',        position: { x: 555, y: 238 }, size: { width: 14,  height: 14  }, label: '', style: { fill: '#999', stroke: '#999' } },
    { id: 'sp2',    shape: 'basic-circle',        position: { x: 385, y: 238 }, size: { width: 14,  height: 14  }, label: '', style: { fill: '#999', stroke: '#999' } },
    { id: 'sp3',    shape: 'basic-circle',        position: { x: 215, y: 238 }, size: { width: 14,  height: 14  }, label: '', style: { fill: '#999', stroke: '#999' } },
    { id: 'c1',     shape: 'basic-rounded-rect',  position: { x: 490, y: 100 }, size: { width: 120, height: 44 }, label: '心理因素', style: { fill: '#f9f0ff', stroke: '#722ed1', rx: 8 } },
    { id: 'c2',     shape: 'basic-rounded-rect',  position: { x: 320, y: 100 }, size: { width: 120, height: 44 }, label: '任务本身', style: { fill: '#e6f7ff', stroke: '#1890ff', rx: 8 } },
    { id: 'c3',     shape: 'basic-rounded-rect',  position: { x: 150, y: 100 }, size: { width: 120, height: 44 }, label: '环境因素', style: { fill: '#fff7e6', stroke: '#fa8c16', rx: 8 } },
    { id: 'c4',     shape: 'basic-rounded-rect',  position: { x: 490, y: 356 }, size: { width: 120, height: 44 }, label: '时间管理', style: { fill: '#f6ffed', stroke: '#52c41a', rx: 8 } },
    { id: 'c5',     shape: 'basic-rounded-rect',  position: { x: 320, y: 356 }, size: { width: 120, height: 44 }, label: '工具方法', style: { fill: '#fff2e8', stroke: '#fa541c', rx: 8 } },
    { id: 'c6',     shape: 'basic-rounded-rect',  position: { x: 150, y: 356 }, size: { width: 120, height: 44 }, label: '习惯养成', style: { fill: '#fffbe6', stroke: '#faad14', rx: 8 } },
    { id: 'sc1a',   shape: 'basic-rect',           position: { x: 490, y: 36  }, size: { width: 100, height: 32 }, label: '完美主义',     style: { fill: '#fff', stroke: '#722ed1', rx: 4 } },
    { id: 'sc1b',   shape: 'basic-rect',           position: { x: 600, y: 62  }, size: { width: 100, height: 32 }, label: '焦虑恐惧',     style: { fill: '#fff', stroke: '#722ed1', rx: 4 } },
    { id: 'sc2a',   shape: 'basic-rect',           position: { x: 320, y: 36  }, size: { width: 100, height: 32 }, label: '任务不明确',   style: { fill: '#fff', stroke: '#1890ff', rx: 4 } },
    { id: 'sc2b',   shape: 'basic-rect',           position: { x: 430, y: 62  }, size: { width: 100, height: 32 }, label: '难度过高',     style: { fill: '#fff', stroke: '#1890ff', rx: 4 } },
    { id: 'sc3a',   shape: 'basic-rect',           position: { x: 150, y: 36  }, size: { width: 100, height: 32 }, label: '噪音干扰',     style: { fill: '#fff', stroke: '#fa8c16', rx: 4 } },
    { id: 'sc3b',   shape: 'basic-rect',           position: { x: 260, y: 62  }, size: { width: 100, height: 32 }, label: '手机分心',     style: { fill: '#fff', stroke: '#fa8c16', rx: 4 } },
    { id: 'sc4a',   shape: 'basic-rect',           position: { x: 490, y: 432 }, size: { width: 100, height: 32 }, label: '计划不清',     style: { fill: '#fff', stroke: '#52c41a', rx: 4 } },
    { id: 'sc4b',   shape: 'basic-rect',           position: { x: 600, y: 406 }, size: { width: 100, height: 32 }, label: '截止日期不明', style: { fill: '#fff', stroke: '#52c41a', rx: 4 } },
    { id: 'sc5a',   shape: 'basic-rect',           position: { x: 320, y: 432 }, size: { width: 100, height: 32 }, label: '工具缺乏',     style: { fill: '#fff', stroke: '#fa541c', rx: 4 } },
    { id: 'sc5b',   shape: 'basic-rect',           position: { x: 430, y: 406 }, size: { width: 100, height: 32 }, label: '流程复杂',     style: { fill: '#fff', stroke: '#fa541c', rx: 4 } },
    { id: 'sc6a',   shape: 'basic-rect',           position: { x: 150, y: 432 }, size: { width: 100, height: 32 }, label: '缺乏激励',     style: { fill: '#fff', stroke: '#faad14', rx: 4 } },
    { id: 'sc6b',   shape: 'basic-rect',           position: { x: 260, y: 406 }, size: { width: 100, height: 32 }, label: '拖延习惯',     style: { fill: '#fff', stroke: '#faad14', rx: 4 } },
  ],
  edges: [
    { id: 'spine1', shape: 'edge', source: 'sp1',  target: 'effect' },
    { id: 'spine2', shape: 'edge', source: 'sp2',  target: 'sp1' },
    { id: 'spine3', shape: 'edge', source: 'sp3',  target: 'sp2' },
    { id: 'b1',     shape: 'edge', source: 'c1',   target: 'sp1' },
    { id: 'b2',     shape: 'edge', source: 'c2',   target: 'sp2' },
    { id: 'b3',     shape: 'edge', source: 'c3',   target: 'sp3' },
    { id: 'b4',     shape: 'edge', source: 'c4',   target: 'sp1' },
    { id: 'b5',     shape: 'edge', source: 'c5',   target: 'sp2' },
    { id: 'b6',     shape: 'edge', source: 'c6',   target: 'sp3' },
    { id: 'sc1',    shape: 'edge', source: 'sc1a', target: 'c1' },
    { id: 'sc2',    shape: 'edge', source: 'sc1b', target: 'c1' },
    { id: 'sc3',    shape: 'edge', source: 'sc2a', target: 'c2' },
    { id: 'sc4',    shape: 'edge', source: 'sc2b', target: 'c2' },
    { id: 'sc5',    shape: 'edge', source: 'sc3a', target: 'c3' },
    { id: 'sc6',    shape: 'edge', source: 'sc3b', target: 'c3' },
    { id: 'sc7',    shape: 'edge', source: 'sc4a', target: 'c4' },
    { id: 'sc8',    shape: 'edge', source: 'sc4b', target: 'c4' },
    { id: 'sc9',    shape: 'edge', source: 'sc5a', target: 'c5' },
    { id: 'sc10',   shape: 'edge', source: 'sc5b', target: 'c5' },
    { id: 'sc11',   shape: 'edge', source: 'sc6a', target: 'c6' },
    { id: 'sc12',   shape: 'edge', source: 'sc6b', target: 'c6' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// Exported list
// ──────────────────────────────────────────────────────────────────────────────
export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'login-flowchart',
    name: '用户登录流程',
    description: '用户登录身份验证标准流程图，包含错误处理与重试分支',
    tags: ['流程图', '认证'],
    emoji: '🔐',
    category: 'flowchart',
    data: loginFlowchart,
  },
  {
    id: 'register-flowchart',
    name: '注册邮件验证流程',
    description: '新用户注册流程，含格式校验、邮件验证与账号创建步骤',
    tags: ['流程图', '注册'],
    emoji: '📧',
    category: 'flowchart',
    data: registerFlowchart,
  },
  {
    id: 'approval-flowchart',
    name: '文档审批流程',
    description: '多级审批工作流：申请人→部门主管→HR，含驳回与补材料分支',
    tags: ['流程图', '审批'],
    emoji: '📋',
    category: 'flowchart',
    data: approvalFlowchart,
  },
  {
    id: 'microservice-arch',
    name: '微服务架构图',
    description: '典型微服务后端架构，包含 API 网关、各微服务与数据库',
    tags: ['架构', '后端'],
    emoji: '⚙️',
    category: 'architecture',
    data: microserviceArch,
  },
  {
    id: 'frontend-arch',
    name: '前端技术栈架构',
    description: 'Vue3 + Pinia + Vue Router + Axios 前端技术栈完整架构',
    tags: ['架构', '前端'],
    emoji: '🖥️',
    category: 'architecture',
    data: frontendArch,
  },
  {
    id: 'cicd-pipeline',
    name: 'CI/CD 发布流水线',
    description: '代码提交到生产发布的完整 DevOps 流水线，含测试、扫描、审批',
    tags: ['架构', 'DevOps'],
    emoji: '🚀',
    category: 'architecture',
    data: cicdPipeline,
  },
  {
    id: 'ecommerce-er',
    name: '电商 ER 图',
    description: '电商平台核心实体关系，含用户、订单、商品、地址',
    tags: ['ER 图', '数据库'],
    emoji: '🛒',
    category: 'data-model',
    data: ecommerceER,
  },
  {
    id: 'blog-er',
    name: '博客系统 ER 图',
    description: '博客平台实体关系：用户、文章、评论、标签，含多对多关系',
    tags: ['ER 图', '数据库'],
    emoji: '📝',
    category: 'data-model',
    data: blogER,
  },
  {
    id: 'rbac-model',
    name: 'RBAC 权限模型',
    description: '基于角色的访问控制模型：用户→角色→权限→资源四层结构',
    tags: ['权限', '数据库'],
    emoji: '🔑',
    category: 'data-model',
    data: rbacModel,
  },
  {
    id: 'org-chart',
    name: '公司组织架构',
    description: '公司层级组织架构图，CEO → 各部门负责人 → 团队',
    tags: ['组织', '人事'],
    emoji: '🏢',
    category: 'organization',
    data: orgChart,
  },
  {
    id: 'project-team',
    name: '项目团队结构',
    description: '软件项目团队分工图：PM、PO、技术负责人、测试负责人及各子团队',
    tags: ['组织', '项目管理'],
    emoji: '👥',
    category: 'organization',
    data: projectTeam,
  },
  {
    id: 'order-state-machine',
    name: '订单状态机',
    description: '电商订单完整生命周期状态转换图，含退款分支',
    tags: ['状态机', '业务流程'],
    emoji: '📦',
    category: 'state-machine',
    data: orderStateMachine,
  },
  {
    id: 'user-account-state',
    name: '用户账号状态机',
    description: '账号生命周期：待激活→正常→封禁/锁定→注销，含解封流转',
    tags: ['状态机', '用户管理'],
    emoji: '👤',
    category: 'state-machine',
    data: userAccountStateMachine,
  },
  {
    id: 'mind-map',
    name: '产品规划思维导图',
    description: '以产品规划为中心，辐射用户研究、功能设计、技术选型、市场策略四大主题',
    tags: ['思维导图', '产品'],
    emoji: '🧠',
    category: 'mind-map',
    data: mindMap,
  },
  {
    id: 'agent-flow',
    name: '智能体流程编排',
    description: 'AI 规划器 Agent 多工具协同：搜索、代码执行、数据库查询，结果聚合后统一输出',
    tags: ['AI', '智能体', '架构'],
    emoji: '🤖',
    category: 'architecture',
    data: agentFlow,
  },
  {
    id: 'dag-pipeline',
    name: '数据管道 DAG',
    description: 'MySQL/MongoDB 批量 + Kafka 实时双路 ETL，汇入数仓与实时库，下游 BI、ML 与看板',
    tags: ['DAG', '数据工程', '架构'],
    emoji: '🔀',
    category: 'architecture',
    data: dagPipeline,
  },
  {
    id: 'er-saas',
    name: 'SaaS 多租户 ER 图',
    description: 'SaaS 平台核心数据模型：租户、用户、订阅计划、工作空间四实体关系',
    tags: ['ER 图', 'SaaS', '数据库'],
    emoji: '☁️',
    category: 'data-model',
    data: erSaaS,
  },
  {
    id: 'bpmn-order',
    name: 'BPMN 订单履行流程',
    description: 'BPMN 风格：接收→库存判断→拣货/采购→发货→通知买家，含缺货补货分支',
    tags: ['BPMN', '业务流程', '流程图'],
    emoji: '📋',
    category: 'flowchart',
    data: bpmnOrder,
  },
  {
    id: 'org-rd',
    name: '研发部组织架构',
    description: 'CTO 统领架构、前端、后端、移动端、数据五大组，含二级工程师岗位拆分',
    tags: ['组织', '研发', '人事'],
    emoji: '💻',
    category: 'organization',
    data: orgRD,
  },
  {
    id: 'fishbone',
    name: '克服拖延症鱼骨图',
    description: '以"任务无法完成"为结果，从心理、任务、环境、时间、工具、习惯六维分析拖延根因',
    tags: ['分析', '鱼骨图', '决策'],
    emoji: '🐟',
    category: 'analysis',
    data: fishbone,
  },
]
