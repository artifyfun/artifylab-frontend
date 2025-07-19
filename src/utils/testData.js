// 测试数据生成器
import { APP_CATEGORIES, APP_POWER_LEVELS } from './index.js'

export const generateTestApps = (count = 100) => {
  const categories = [
    APP_CATEGORIES.IMAGE_GENERATION,
    APP_CATEGORIES.TEXT_PROCESSING,
    APP_CATEGORIES.DATA_ANALYSIS,
    APP_CATEGORIES.INTELLIGENT_ASSISTANT,
    APP_CATEGORIES.SPEECH_RECOGNITION
  ]

  const powerLevels = [
    APP_POWER_LEVELS.BASIC,
    APP_POWER_LEVELS.INTERMEDIATE,
    APP_POWER_LEVELS.ADVANCED,
    APP_POWER_LEVELS.PROFESSIONAL
  ]

  const descriptions = [
    '基于AI的智能图像生成工具，支持多种风格和参数调整',
    '强大的文本处理和分析工具，提供智能摘要和翻译功能',
    '专业的数据可视化工具，支持多种图表类型和交互功能',
    '自动化工作流程工具，提高工作效率和准确性',
    '创意设计助手，提供丰富的模板和素材资源',
    '智能办公助手，集成多种办公功能于一体',
    '教育领域专用工具，支持个性化学习和评估',
    '娱乐应用集合，提供游戏、音乐、视频等多种功能'
  ]

  const imageUrls = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=2',
    'https://picsum.photos/400/300?random=3',
    'https://picsum.photos/400/300?random=4',
    'https://picsum.photos/400/300?random=5',
    'https://picsum.photos/400/300?random=6',
    'https://picsum.photos/400/300?random=7',
    'https://picsum.photos/400/300?random=8'
  ]

  const apps = []

  for (let i = 1; i <= count; i++) {
    const categoryIndex = i % categories.length
    const powerIndex = i % powerLevels.length
    const descIndex = i % descriptions.length
    const imageIndex = i % imageUrls.length

    apps.push({
      id: `test-app-${i}`,
      name: `测试应用 ${i}`,
      description: descriptions[descIndex],
      imageUrl: imageUrls[imageIndex],
      category: categories[categoryIndex],
      powerLevel: powerLevels[powerIndex],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      code: '',
      template: {
        workflow: null,
        paramsNodes: [],
        prompt: {}
      },
      // 随机标记一些应用为从市场安装
      isFromMarket: i % 5 === 0 // 每5个应用中有一个来自市场
    })
  }

  return apps
}

// 性能测试函数
export const performanceTest = {
  // 测试虚拟列表渲染性能
  testVirtualListPerformance: (apps, iterations = 100) => {
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      // 模拟虚拟列表的计算
      const visibleRange = {
        start: Math.floor(Math.random() * apps.length),
        end: Math.min(apps.length, Math.floor(Math.random() * apps.length) + 10)
      }
      const visibleApps = apps.slice(visibleRange.start, visibleRange.end)
    }

    const endTime = performance.now()
    return {
      totalTime: endTime - startTime,
      averageTime: (endTime - startTime) / iterations,
      iterations
    }
  },

  // 测试传统列表渲染性能
  testTraditionalListPerformance: (apps, iterations = 100) => {
    const startTime = performance.now()

    for (let i = 0; i < iterations; i++) {
      // 模拟传统列表的渲染
      apps.forEach(app => {
        // 模拟DOM操作
        const element = document.createElement('div')
        element.textContent = app.name
      })
    }

    const endTime = performance.now()
    return {
      totalTime: endTime - startTime,
      averageTime: (endTime - startTime) / iterations,
      iterations
    }
  }
}
