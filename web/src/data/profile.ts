export interface TimelineEntry {
  period: string
  organization: string
  role: string
  description: string[]
  type: string
}

// Personal content and optional assets are configured here, independently of the scene.
export const profile: {
  name: string
  alias: string
  tagline: string
  bio: string
  email: string
  github: string
  portraitUrl: string
  modelUrl: string | null
  timeline: TimelineEntry[]
} = {
  name: '张鑫振',
  alias: 'Joseph',
  tagline: '戴着镣铐跳舞的理想主义刺头',
  bio: '一年实习，两年半AI测试负责人经验',
  email: 'ZXZ_Joseph@hotmail.com',
  github: 'https://github.com/Zxz-Joseph',
  portraitUrl: 'portrait-stylized.webp',
  modelUrl: 'models/portrait.glb',
  timeline: [
    {
      period: '2021 — 2025',
      organization: '广东技术师范大学',
      role: '网络工程 · 本科',
      description: [],
      type: 'EDUCATION',
    },
    {
      period: '2024.07 — 2026.05',
      organization: '德赛西威汽车电子股份有限公司',
      role: '软件测试工程师',
      description: [
        '负责大模型测试全流程，覆盖需求分析、测试策略、用例设计、云端/板端/实车验证和缺陷闭环。',
        '从零建立车机大模型测试规范与全场景测试集，统一测试维度和验收标准。',
        '参与语音自动化测试闭环建设，串联TTS、设备响应采集、ASR、语义评估和报告输出。',
      ],
      type: 'EXPERIENCE',
    },
    {
      period: '2026.06 — 至今',
      organization: '沐刻智能科技（深圳）有限公司',
      role: 'AI算法测试工程师',
      description: ['待更新'],
      type: 'NOW',
    },
  ],
}

export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
