#!/bin/bash

# 发布到公共仓库的便捷脚本
# 使用方法: ./scripts/release-to-public.sh [patch|minor|major] [username/repo-name]

# 默认公共仓库
DEFAULT_PUBLIC_REPO="artifyfun/artifylab-desktop-web"

if [ $# -lt 1 ]; then
    echo "使用方法: $0 [patch|minor|major] [username/repo-name]"
    echo "示例: $0 patch"
    echo "示例: $0 patch your-username/your-public-repo"
    echo ""
    echo "默认公共仓库: $DEFAULT_PUBLIC_REPO"
    exit 1
fi

VERSION_TYPE=$1
PUBLIC_REPO=${2:-$DEFAULT_PUBLIC_REPO}

echo "🚀 准备发布到公共仓库: $PUBLIC_REPO"
echo "📦 版本类型: $VERSION_TYPE"
echo ""

# 设置环境变量并运行发布脚本
PUBLIC_REPO=$PUBLIC_REPO node scripts/release.js $VERSION_TYPE

echo ""
echo "✅ 发布完成！"
echo "🔗 下载地址: https://github.com/$PUBLIC_REPO/releases/latest" 