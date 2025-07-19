// Mock数据统一入口
// 集中管理所有测试和示例数据

// 导入现有的测试数据
export { generateTestApps, performanceTest } from '../utils/testData.js'

// 导入示例数据
export { default as sampleExcelData } from './sample-excel-data.js'
export { default as sampleBatchData } from './sample-batch-data.json'
export { default as sampleBatchDataCSV } from './sample-batch-data.csv'

// 市场应用mock数据
export { getMockMarketApps } from './market-apps.js'

// 统一导出所有mock数据
export const mockData = {
  apps: {
    test: generateTestApps,
    market: getMockMarketApps
  },
  batch: {
    excel: sampleExcelData,
    json: sampleBatchData,
    csv: sampleBatchDataCSV
  },
  performance: performanceTest
}
