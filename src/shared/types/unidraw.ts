import type { GraphData } from './graph'

export interface AssetItem {
  id: string
  name: string
  category?: string
  type: 'svg' | 'image'
  content: string
}

export interface TemplateItem {
  id: string
  name: string
  description?: string
  thumbnail?: string
  tags?: string[]
  data: GraphData
}

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface UniDrawTheme {
  primaryColor?: string
  primaryBg?: string
  primaryBgLight?: string
  canvasBg?: string
  panelBg?: string
  panelBgAlt?: string
  borderColor?: string
  textColor?: string
  textSecondary?: string
  textMuted?: string
  hoverBg?: string
  shadowSm?: string
  shadowMd?: string
  radiusSm?: string
  radiusMd?: string
  radiusLg?: string
  panelWidth?: string
}
