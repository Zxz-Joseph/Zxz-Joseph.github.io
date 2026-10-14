export interface TimelineEntry {
  period: string
  organization: string
  role: string
  description: string[]
  type: string
}

// Personal content and the stylized portrait are configured here.
export const profile: {
  name: string
  alias: string
  tagline: string
  bio: string
  email: string
  github: string
  portraitUrl: string
  timeline: TimelineEntry[]
} = {
  name: '张鑫振',
  alias: 'Joseph',
  tagline: '戴着镣铐跳舞的理想主义刺头',
  bio: '一年实习，两年半AI测试负责人经验',
  email: 'ZXZ_Joseph@hotmail.com',
  github: 'https://github.com/Zxz-Joseph',
  portraitUrl: 'portrait-joseph-v2.webp',
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
        '统筹技术中心多个大模型项目的全生命周期测试与质量保障，覆盖云端、端侧和实车验证；差异化制定量产与 POC 项目策略，前置识别风险，保障按期交付。',
        '从 0 到 1 主导制定公司首个《车机大模型测试标准规范》，建立感知、分析、生成、决策四维评测与验收体系，成为内部及客户统一验证依据；维护公司级全场景测试集与语料库，支撑跨项目复用和质量基线校准。',
        '参与 AI 语音自动化测试工具核心开发与落地，打通语音合成、设备响应采集、ASR 识别、语义评分和报告生成的端侧闭环，提升测试效率。',
        '累计编写 3000+ 测试用例、提交 1000+ 有效 Bug，平均 2 天内完成修复与回归。',
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
