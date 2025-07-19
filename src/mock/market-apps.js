// 市场应用Mock数据
import { APP_CATEGORIES, APP_POWER_LEVELS } from '../utils/index.js'

// 模拟市场应用数据
export const getMockMarketApps = () => {
  return [
    {
      id: 'market-1',
      name: 'AI 图像生成器',
      description: '基于 Stable Diffusion 的智能图像生成工具，支持多种艺术风格和自定义参数',
      category: APP_CATEGORIES.IMAGE_GENERATION,
      imageUrl: 'https://picsum.photos/400/300?random=1',
      powerLevel: APP_POWER_LEVELS.ADVANCED,
      rating: '4.8',
      downloads: '2.5k',
      createdAt: new Date('2024-01-15'),
      features: [
        '多种艺术风格支持',
        '自定义参数调节',
        '批量生成功能',
        '高清输出'
      ]
    },
    {
      id: 'market-2',
      name: '智能文本编辑器',
      description: 'AI 驱动的智能文本编辑工具，支持语法检查、内容优化和自动补全',
      category: APP_CATEGORIES.TEXT_PROCESSING,
      imageUrl: 'https://picsum.photos/400/300?random=2',
      powerLevel: APP_POWER_LEVELS.INTERMEDIATE,
      rating: '4.6',
      downloads: '1.8k',
      createdAt: new Date('2024-01-20'),
      features: [
        '智能语法检查',
        '内容优化建议',
        '自动补全功能',
        '多语言支持'
      ]
    },
    {
      id: 'market-3',
      name: '数据分析助手',
      description: '强大的数据分析工具，支持数据可视化、趋势分析和智能报告生成',
      category: APP_CATEGORIES.DATA_ANALYSIS,
      imageUrl: 'https://picsum.photos/400/300?random=3',
      powerLevel: APP_POWER_LEVELS.PROFESSIONAL,
      rating: '4.9',
      downloads: '3.2k',
      createdAt: new Date('2024-01-25'),
      features: [
        '智能数据可视化',
        '趋势分析算法',
        '自动报告生成',
        '多数据源支持'
      ]
    },
    {
      id: 'market-4',
      name: '语音转文字工具',
      description: '高精度的语音识别工具，支持多种语言和实时转写功能',
      category: APP_CATEGORIES.SPEECH_RECOGNITION,
      imageUrl: 'https://picsum.photos/400/300?random=4',
      powerLevel: APP_POWER_LEVELS.ADVANCED,
      rating: '4.7',
      downloads: '1.5k',
      createdAt: new Date('2024-01-30'),
      features: [
        '多语言支持',
        '实时转写',
        '高精度识别',
        '噪音过滤'
      ]
    },
    {
      id: 'market-5',
      name: '代码生成器',
      description: 'AI 驱动的代码生成工具，支持多种编程语言和框架',
      category: APP_CATEGORIES.INTELLIGENT_ASSISTANT,
      imageUrl: 'https://picsum.photos/400/300?random=5',
      powerLevel: APP_POWER_LEVELS.PROFESSIONAL,
      rating: '4.5',
      downloads: '2.1k',
      createdAt: new Date('2024-02-05'),
      features: [
        '多语言支持',
        '智能代码补全',
        '代码优化建议',
        '框架集成'
      ]
    },
    {
      id: 'market-6',
      name: '智能翻译助手',
      description: '基于深度学习的智能翻译工具，支持多种语言和上下文理解',
      category: APP_CATEGORIES.TEXT_PROCESSING,
      imageUrl: 'https://picsum.photos/400/300?random=6',
      powerLevel: APP_POWER_LEVELS.INTERMEDIATE,
      rating: '4.4',
      downloads: '1.9k',
      createdAt: new Date('2024-02-10'),
      features: [
        '多语言翻译',
        '上下文理解',
        '专业术语支持',
        '实时翻译'
      ]
    }
  ]
}
