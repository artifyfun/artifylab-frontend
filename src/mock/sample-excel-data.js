// 示例Excel数据生成脚本
// 这个脚本可以用来生成测试用的Excel文件

const sampleData = [
  {
    name: '张三',
    age: '25',
    email: 'zhangsan@example.com',
    department: '技术部',
    salary: '8000',
    joinDate: '2023-01-15'
  },
  {
    name: '李四',
    age: '30',
    email: 'lisi@example.com',
    department: '市场部',
    salary: '9000',
    joinDate: '2022-08-20'
  },
  {
    name: '王五',
    age: '28',
    email: 'wangwu@example.com',
    department: '设计部',
    salary: '8500',
    joinDate: '2023-03-10'
  },
  {
    name: '赵六',
    age: '32',
    email: 'zhaoliu@example.com',
    department: '技术部',
    salary: '12000',
    joinDate: '2021-12-01'
  },
  {
    name: '钱七',
    age: '26',
    email: 'qianqi@example.com',
    department: '人事部',
    salary: '7500',
    joinDate: '2023-06-15'
  }
]

// 导出数据供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = sampleData
} else if (typeof window !== 'undefined') {
  window.sampleExcelData = sampleData
}

console.log('示例Excel数据已准备就绪:', sampleData)
