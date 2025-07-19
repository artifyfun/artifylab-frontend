#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 读取package.json
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
const currentVersion = packageJson.version;

function runCommand(command, options = {}) {
  try {
    console.log(`执行命令: ${command}`);
    execSync(command, {
      stdio: 'inherit',
      cwd: rootDir,
      ...options
    });
  } catch (error) {
    console.error(`命令执行失败: ${command}`);
    process.exit(1);
  }
}

function buildProject() {
  console.log('\n🔨 构建项目...');

  try {
    // 清理之前的构建产物
    console.log('清理之前的构建产物...');
    runCommand('rm -rf dist');

    // 构建项目
    console.log('开始构建...');
    runCommand('pnpm run build');

    console.log('✅ 构建完成！');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

function updateVersion(type) {
  const versionMap = {
    patch: '补丁版本 (1.0.0 -> 1.0.1)',
    minor: '次要版本 (1.0.0 -> 1.1.0)',
    major: '主要版本 (1.0.0 -> 2.0.0)'
  };

  console.log(`\n当前版本: ${currentVersion}`);
  console.log(`准备更新为: ${versionMap[type]}`);

  // 更新package.json版本
  runCommand(`npm version ${type} --no-git-tag-version`);

  // 读取新的版本号
  const newPackageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  const newVersion = newPackageJson.version;

  console.log(`版本已更新为: ${newVersion}`);
  return newVersion;
}

function createGitTag(version) {
  const tag = `v${version}`;
  console.log(`\n创建Git标签: ${tag}`);

  // 检查标签是否已存在
  try {
    execSync(`git rev-parse ${tag}`, { stdio: 'ignore', cwd: rootDir });
    console.log(`⚠️  标签 ${tag} 已存在，跳过标签创建`);
    return tag;
  } catch (error) {
    // 标签不存在，继续创建
  }

  // 添加所有更改
  runCommand('git add .');

  // 提交更改
  runCommand(`git commit -m "chore: release version ${version}"`);

  // 创建标签
  runCommand(`git tag ${tag}`);

  return tag;
}

function createReleaseAssets(version) {
  console.log(`\n📦 创建发布资源...`);

  // 创建压缩包
  const distDir = join(rootDir, 'dist');
  const zipFile = join(rootDir, `artifylab.zip`);

  try {
    // 创建 version.json
    const versionJsonPath = join(distDir, 'version.json');
    const gitHash = execSync('git rev-parse HEAD', { cwd: rootDir }).toString().trim();
    const versionJson = {
      version,
      gitHash,
      buildTime: new Date().toISOString()
    };
    writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2), 'utf8');

    // 创建 zip
    execSync(`cd ${distDir} && zip -r "${zipFile}" frontend/ version.json`, { stdio: 'pipe' });
    console.log('✅ zip 压缩包创建完成 (frontend/)');

    return { zipFile };
  } catch (error) {
    console.error('❌ 创建压缩包失败:', error.message);
    return null;
  }
}

function uploadToGitHubReleases(version, assets) {
  if (!assets) {
    console.log('⚠️  没有资源文件可上传');
    return;
  }

  console.log(`\n📤 上传到 GitHub Releases...`);

  // 配置上传目标仓库
  const targetRepo = process.env.PUBLIC_REPO || 'artifyfun/artifylab-frontend';
  const isPublicRepo = targetRepo !== 'artifyfun/artifylab-frontend';

  try {
    // 检查是否已登录 GitHub CLI
    execSync('gh auth status', { stdio: 'pipe' });

    const tag = `v${version}`;

    // 如果是上传到公共仓库，先检查 release 是否存在，不存在则创建
    if (isPublicRepo) {
      try {
        // 检查 release 是否存在
        execSync(`gh release view ${tag} --repo ${targetRepo}`, { stdio: 'pipe' });
        console.log(`✅ Release ${tag} 已存在于公共仓库 ${targetRepo}`);
      } catch (error) {
        // Release 不存在，创建新的 release
        console.log(`📝 在公共仓库 ${targetRepo} 创建新的 release: ${tag}`);
        const releaseNotes = `Release version ${version} of Artify App Generator`;
        execSync(`gh release create ${tag} --title "v${version}" --notes "${releaseNotes}" --repo ${targetRepo}`, { stdio: 'inherit' });
      }
    }

    // 上传 zip 文件
    console.log(`📤 上传 ZIP 文件到 ${targetRepo}...`);
    execSync(`gh release upload ${tag} "${assets.zipFile}" --repo ${targetRepo}`, { stdio: 'inherit' });

    console.log('✅ 文件上传完成！');

    if (isPublicRepo) {
      console.log(`🔗 公共仓库下载地址: https://github.com/${targetRepo}/releases/latest`);
      console.log(`📥 直接下载链接:`);
      console.log(`   ZIP: https://github.com/${targetRepo}/releases/download/${tag}/artifylab.zip`);
    }

  } catch (error) {
    console.error('❌ 上传到 GitHub Releases 失败:', error.message);
    console.log('💡 请手动上传文件到 GitHub Releases 页面');
  }
}

function pushToGitHub(tag) {
  console.log(`\n推送到GitHub...`);

  // 获取当前分支名
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`当前分支: ${currentBranch}`);

  // 推送代码到当前分支
  runCommand(`git push origin ${currentBranch}`);

  // 推送标签（如果标签已存在，使用 --force 强制推送）
  try {
    runCommand(`git push origin ${tag}`);
  } catch (error) {
    console.log(`⚠️  标签推送失败，尝试强制推送...`);
    runCommand(`git push origin ${tag} --force`);
  }

  console.log(`\n✅ 发布完成！`);
  console.log(`📦 版本: ${tag}`);
  console.log(`🔗 下载地址: https://github.com/artifyfun/artifylab-frontend/releases/latest`);
  console.log(`📥 直接下载链接:`);
  console.log(`   ZIP: https://github.com/artifyfun/artifylab-frontend/releases/download/${tag}/artifylab.zip`);
}

function showHelp() {
  console.log(`
使用方法: node scripts/release.js [选项]

选项:
  patch    发布补丁版本 (1.0.0 -> 1.0.1)
  minor    发布次要版本 (1.0.0 -> 1.1.0)
  major    发布主要版本 (1.0.0 -> 2.0.0)
  help     显示帮助信息

环境变量:
  PUBLIC_REPO    指定公共仓库地址 (格式: username/repo-name)
                  例如: PUBLIC_REPO=your-username/your-public-repo node scripts/release.js patch

示例:
  node scripts/release.js patch    # 发布补丁版本到私有仓库
  PUBLIC_REPO=your-username/your-public-repo node scripts/release.js patch    # 发布到公共仓库

发布流程:
  1. 更新 package.json 版本号
  2. 构建应用（使用新版本号）
  3. 创建 Git 标签
  4. 推送到 GitHub
  5. 上传产物到指定仓库的 Releases

注意:
  - 确保已配置GitHub仓库
  - 确保有推送权限
  - 确保已安装并登录 GitHub CLI (gh)
  - 如果指定 PUBLIC_REPO，产物会上传到公共仓库的 Releases
  - 构建会使用更新后的版本号
  `);
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const type = args[0];

  if (!type || type === 'help') {
    showHelp();
    return;
  }

  if (!['patch', 'minor', 'major'].includes(type)) {
    console.error('❌ 无效的版本类型。请使用 patch, minor 或 major');
    showHelp();
    process.exit(1);
  }

  try {
    console.log('🚀 开始发布流程...');

    // 1. 构建项目
    buildProject();

    // 2. 更新版本号
    const newVersion = updateVersion(type);

    // 2. 构建应用（使用新版本号）
    console.log('\n🔨 构建应用...');
    runCommand('pnpm run build:app');

    // 3. 创建发布资源
    const assets = createReleaseAssets(newVersion);

    // 4. 创建Git标签
    const tag = createGitTag(newVersion);

    // 5. 推送到GitHub
    pushToGitHub(tag);

    // 6. 上传到 GitHub Releases
    uploadToGitHubReleases(newVersion, assets);

    // 7. 清理临时文件
    if (assets) {
      try {
        execSync(`rm -f "${assets.zipFile}"`, { stdio: 'pipe' });
        console.log('🧹 临时文件清理完成');
      } catch (error) {
        console.log('⚠️  临时文件清理失败，请手动删除');
      }
    }

  } catch (error) {
    console.error('❌ 发布过程中出现错误:', error.message);
    process.exit(1);
  }
}

main();
