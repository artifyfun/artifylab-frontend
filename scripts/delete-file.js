#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = process.argv[2];
if (!file) {
  console.error('请传入要删除的文件路径');
  process.exit(1);
}
const absPath = path.resolve(process.cwd(), file);
if (fs.existsSync(absPath)) {
  fs.unlinkSync(absPath);
  console.log(`已删除: ${absPath}`);
} else {
  console.log(`文件不存在: ${absPath}`);
}
