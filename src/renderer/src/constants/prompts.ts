export interface PromptTemplate {
  id: string
  title: string
  description: string
  content: string
  category: string
  icon: string
}

export const promptCategories = [
  { id: 'coding', name: '编程开发', icon: 'ri--code-line' },
  { id: 'writing', name: '写作助手', icon: 'ri--quill-pen-line' },
  { id: 'analysis', name: '分析总结', icon: 'ri--bar-chart-line' },
  { id: 'creative', name: '创意设计', icon: 'ri--palette-line' },
  { id: 'learning', name: '学习教育', icon: 'ri--book-open-line' },
  { id: 'business', name: '商务办公', icon: 'ri--briefcase-line' }
]

export const promptTemplates: PromptTemplate[] = [
  // 编程开发
  {
    id: 'code-review',
    title: '代码审查',
    description: '帮助审查代码质量、性能和最佳实践',
    content:
      '请帮我审查以下代码，重点关注：\n1. 代码质量和可读性\n2. 性能优化建议\n3. 潜在的bug或安全问题\n4. 最佳实践建议\n\n```\n[在这里粘贴你的代码]\n```',
    category: 'coding',
    icon: 'ri--search-eye-line'
  },
  {
    id: 'debug-help',
    title: '调试助手',
    description: '帮助分析和解决代码问题',
    content:
      '我遇到了一个编程问题，请帮我分析和解决：\n\n**问题描述：**\n[描述你遇到的问题]\n\n**相关代码：**\n```\n[粘贴相关代码]\n```\n\n**错误信息：**\n```\n[粘贴错误信息]\n```\n\n**期望结果：**\n[描述你期望的结果]',
    category: 'coding',
    icon: 'ri--bug-line'
  },
  {
    id: 'api-design',
    title: 'API 设计',
    description: '设计 RESTful API 接口',
    content:
      '请帮我设计一个 RESTful API，要求如下：\n\n**功能需求：**\n[描述API需要实现的功能]\n\n**数据模型：**\n[描述涉及的数据结构]\n\n**请提供：**\n1. API 端点设计\n2. 请求/响应格式\n3. 状态码定义\n4. 错误处理机制\n5. 认证授权方案',
    category: 'coding',
    icon: 'ri--api-line'
  },

  // 写作助手
  {
    id: 'article-writing',
    title: '文章写作',
    description: '协助撰写各类文章',
    content:
      '请帮我写一篇关于 **[主题]** 的文章，要求：\n\n**文章类型：** [技术文章/科普文章/观点文章等]\n**目标读者：** [描述目标读者群体]\n**文章长度：** [字数要求]\n**写作风格：** [正式/轻松/学术等]\n\n**大纲要求：**\n1. 引人入胜的开头\n2. 逻辑清晰的主体内容\n3. 有力的结论\n4. 适当的例子和数据支撑',
    category: 'writing',
    icon: 'ri--article-line'
  },
  {
    id: 'email-template',
    title: '邮件模板',
    description: '生成专业的邮件模板',
    content:
      '请帮我写一封 **[邮件类型]** 邮件：\n\n**收件人：** [描述收件人身份]\n**邮件目的：** [说明邮件目的]\n**关键信息：** [需要传达的关键信息]\n**语调要求：** [正式/友好/紧急等]\n\n请包含：\n- 合适的主题行\n- 专业的开头和结尾\n- 清晰的正文结构\n- 必要的行动号召',
    category: 'writing',
    icon: 'ri--mail-line'
  },

  // 分析总结
  {
    id: 'data-analysis',
    title: '数据分析',
    description: '分析数据并提供洞察',
    content:
      '请帮我分析以下数据并提供洞察：\n\n**数据背景：**\n[描述数据来源和背景]\n\n**数据内容：**\n```\n[粘贴数据或描述数据结构]\n```\n\n**分析目标：**\n[说明希望从数据中获得什么洞察]\n\n**请提供：**\n1. 数据概览和基本统计\n2. 关键趋势和模式\n3. 异常值分析\n4. 结论和建议',
    category: 'analysis',
    icon: 'ri--line-chart-line'
  },
  {
    id: 'document-summary',
    title: '文档总结',
    description: '总结长文档的关键内容',
    content:
      '请帮我总结以下文档的关键内容：\n\n**文档类型：** [报告/论文/手册等]\n**总结要求：** [详细/简要/要点式等]\n\n**文档内容：**\n```\n[粘贴文档内容]\n```\n\n**请提供：**\n1. 核心观点和结论\n2. 关键数据和事实\n3. 重要建议或行动项\n4. 结构化的要点总结',
    category: 'analysis',
    icon: 'ri--file-text-line'
  },

  // 创意设计
  {
    id: 'creative-brainstorm',
    title: '创意头脑风暴',
    description: '生成创意想法和方案',
    content:
      '我需要为 **[项目/产品/活动]** 进行创意头脑风暴：\n\n**项目背景：**\n[描述项目背景和目标]\n\n**目标用户：**\n[描述目标用户群体]\n\n**限制条件：**\n[预算、时间、技术等限制]\n\n**请提供：**\n1. 5-10个创意方向\n2. 每个方向的具体实施建议\n3. 优缺点分析\n4. 推荐的优先级排序',
    category: 'creative',
    icon: 'ri--lightbulb-line'
  },

  // 学习教育
  {
    id: 'explain-concept',
    title: '概念解释',
    description: '深入浅出地解释复杂概念',
    content:
      '请帮我解释 **[概念名称]** 这个概念：\n\n**我的背景：** [描述你的知识背景]\n**学习目的：** [说明学习这个概念的目的]\n**理解程度：** [目前对这个概念的理解程度]\n\n**请提供：**\n1. 简单易懂的定义\n2. 具体的例子和类比\n3. 相关的背景知识\n4. 实际应用场景\n5. 进一步学习的建议',
    category: 'learning',
    icon: 'ri--question-answer-line'
  },

  // 商务办公
  {
    id: 'meeting-agenda',
    title: '会议议程',
    description: '制定高效的会议议程',
    content:
      '请帮我制定一个 **[会议类型]** 的会议议程：\n\n**会议目的：** [说明会议的主要目的]\n**参会人员：** [描述参会人员角色]\n**会议时长：** [预计会议时间]\n**关键议题：** [列出需要讨论的关键问题]\n\n**请提供：**\n1. 结构化的议程安排\n2. 每个议题的时间分配\n3. 讨论要点和预期产出\n4. 会议准备清单\n5. 后续行动计划模板',
    category: 'business',
    icon: 'ri--calendar-check-line'
  }
]

// 根据分类获取模板
export const getPromptsByCategory = (category: string): PromptTemplate[] => {
  return promptTemplates.filter((template) => template.category === category)
}

// 获取所有分类
export const getAllCategories = () => {
  return promptCategories
}

// 根据ID获取模板
export const getPromptById = (id: string): PromptTemplate | undefined => {
  return promptTemplates.find((template) => template.id === id)
}
