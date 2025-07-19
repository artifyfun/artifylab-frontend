import fs from 'fs'
import path from 'path'

// 复制 package-lib.json 到 dist/lib/package.json
const sourcePath = path.join(process.cwd(), 'package-lib.json')
const targetPath = path.join(process.cwd(), 'dist', 'lib', 'package.json')

try {
  // 确保目标目录存在
  const targetDir = path.dirname(targetPath)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // 复制文件
  fs.copyFileSync(sourcePath, targetPath)
  console.log('✅ Package file copied successfully')
} catch (error) {
  console.error('❌ Failed to copy package file:', error.message)
  process.exit(1)
}
