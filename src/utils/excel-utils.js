import * as XLSX from 'xlsx'

/**
 * Excel文件处理工具类
 */
export class ExcelProcessor {
  /**
   * 解析Excel文件
   * @param {File} file - Excel文件对象
   * @param {Object} options - 解析选项
   * @returns {Promise<Array>} 解析后的数据数组
   */
  static async parseExcelFile(file, options = {}) {
    const {
      sheetIndex = 0, // 工作表索引
      headerRow = 0, // 表头行索引
      dataStartRow = 1, // 数据开始行索引
      maxRows = 10000, // 最大行数限制
      includeEmptyRows = false, // 是否包含空行
      dateFormat = 'YYYY-MM-DD', // 日期格式
      numberFormat = 'string' // 数字格式: 'string' | 'number'
    } = options

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: true, // 自动识别日期
            cellNF: false, // 不包含数字格式
            cellStyles: false // 不包含样式
          })

          // 检查工作表是否存在
          if (workbook.SheetNames.length === 0) {
            reject(new Error('Excel文件不包含任何工作表'))
            return
          }

          // 获取指定工作表
          const sheetName = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          // 获取工作表范围
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

          if (range.e.r < headerRow) {
            reject(new Error('表头行超出工作表范围'))
            return
          }

          // 读取表头
          const headers = []
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col })
            const cell = worksheet[cellAddress]
            const headerValue = cell ? this.formatCellValue(cell, 'string') : `Column_${col + 1}`
            headers.push(headerValue)
          }

          // 读取数据行
          const processedData = []
          const maxDataRow = Math.min(range.e.r, dataStartRow + maxRows - 1)

          for (let row = dataStartRow; row <= maxDataRow; row++) {
            const item = {}
            let hasData = false

            headers.forEach((header, colIndex) => {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex })
              const cell = worksheet[cellAddress]
              let value = cell ? this.formatCellValue(cell, numberFormat) : ''

              // 处理日期格式
              if (value instanceof Date) {
                value = this.formatDate(value, dateFormat)
              }

              item[header] = value
              if (value !== '') hasData = true
            })

            // 根据配置决定是否包含空行
            if (hasData || includeEmptyRows) {
              processedData.push(item)
            }
          }

          resolve({
            data: processedData,
            headers: headers,
            sheetName: sheetName,
            totalRows: processedData.length,
            originalRange: range
          })

        } catch (error) {
          console.error('Excel文件解析失败:', error)
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 格式化单元格值
   * @param {Object} cell - 单元格对象
   * @param {string} numberFormat - 数字格式
   * @returns {*} 格式化后的值
   */
  static formatCellValue(cell, numberFormat = 'string') {
    if (!cell) return ''

    // 处理不同类型的单元格
    switch (cell.t) {
      case 's': // 字符串
        return cell.v || ''
      case 'n': // 数字
        return numberFormat === 'string' ? cell.v.toString() : cell.v
      case 'b': // 布尔值
        return cell.v ? 'true' : 'false'
      case 'd': // 日期
        return new Date(cell.v)
      case 'e': // 错误
        return ''
      default:
        return cell.v || ''
    }
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @param {string} format - 格式字符串
   * @returns {string} 格式化后的日期字符串
   */
  static formatDate(date, format = 'YYYY-MM-DD') {
    if (!(date instanceof Date) || isNaN(date)) {
      return ''
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
  }

  /**
   * 获取Excel文件信息
   * @param {File} file - Excel文件对象
   * @returns {Promise<Object>} 文件信息
   */
  static async getExcelInfo(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })

          const info = {
            sheetNames: workbook.SheetNames,
            sheetCount: workbook.SheetNames.length,
            fileSize: file.size,
            fileName: file.name,
            sheets: []
          }

          // 获取每个工作表的信息
          workbook.SheetNames.forEach((sheetName, index) => {
            const worksheet = workbook.Sheets[sheetName]
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')

            info.sheets.push({
              name: sheetName,
              index: index,
              rows: range.e.r + 1,
              columns: range.e.c + 1,
              range: worksheet['!ref']
            })
          })

          resolve(info)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 验证Excel文件
   * @param {File} file - Excel文件对象
   * @returns {Object} 验证结果
   */
  static validateExcelFile(file) {
    const errors = []
    const warnings = []

    // 检查文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream' // 某些系统可能返回这个类型
    ]

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      errors.push('不支持的文件类型，请上传Excel文件(.xlsx或.xls)')
    }

    // 检查文件大小 (10MB限制)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push('文件大小超过10MB限制')
    }

    // 检查文件名
    if (!file.name || file.name.trim() === '') {
      errors.push('文件名不能为空')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 导出数据为Excel文件
   * @param {Array} data - 数据数组
   * @param {string} fileName - 文件名
   * @param {Object} options - 导出选项
   */
  static exportToExcel(data, fileName = 'export.xlsx', options = {}) {
    const {
      sheetName = 'Sheet1',
      headers = null,
      autoWidth = true
    } = options

    try {
      // 创建工作簿
      const workbook = XLSX.utils.book_new()

      // 准备数据
      let sheetData = data
      if (headers) {
        // 如果提供了表头，使用表头作为第一行
        sheetData = [headers, ...data]
      }

      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData)

      // 自动调整列宽
      if (autoWidth) {
        const columnWidths = []
        sheetData.forEach(row => {
          row.forEach((cell, index) => {
            const cellLength = String(cell).length
            columnWidths[index] = Math.max(columnWidths[index] || 0, cellLength)
          })
        })

        worksheet['!cols'] = columnWidths.map(width => ({
          width: Math.min(Math.max(width + 2, 8), 50)
        }))
      }

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      // 导出文件
      XLSX.writeFile(workbook, fileName)

      return true
    } catch (error) {
      console.error('导出Excel文件失败:', error)
      return false
    }
  }
}

export default ExcelProcessor
