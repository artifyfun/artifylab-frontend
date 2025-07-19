#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { rimrafSync } from 'rimraf';
import * as mkdirp from 'mkdirp';
import { fileURLToPath } from 'url';
import fsExtra from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../dist/frontend');
const destDir = path.resolve(__dirname, '../../desktop/src/artifylab/public/frontend');

// 删除目标目录
if (fs.existsSync(destDir)) {
  rimrafSync(destDir);
}
// 创建目标目录
mkdirp.sync(destDir);
fsExtra.copySync(srcDir, destDir, { overwrite: true });
console.log('dist/frontend 已复制到 desktop/src/artifylab/public/frontend');
