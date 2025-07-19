#!/bin/bash

# 初始化公共仓库脚本
# 使用方法: ./scripts/init-public-repo.sh

echo "🚀 初始化公共仓库..."

PUBLIC_REPO="artifyfun/artifylab-desktop-web"

# 创建临时目录
TEMP_DIR=$(mktemp -d)
echo "📁 创建临时目录: $TEMP_DIR"

# 进入临时目录
cd "$TEMP_DIR"

# 克隆公共仓库
echo "📥 克隆公共仓库..."
gh repo clone "$PUBLIC_REPO" .

# 检查是否为空
if [ -z "$(ls -A)" ]; then
    echo "📝 仓库为空，添加初始内容..."
    
    # 创建 README.md
    cat > README.md << 'EOF'
# ArtifyLab Desktop Web

This repository contains the web distribution files for ArtifyLab Desktop.

## Downloads

Visit the [Releases](https://github.com/artifyfun/artifylab-desktop-web/releases) page to download the latest version.

## About

This repository is automatically updated with releases from the private development repository.
EOF

    # 创建 .gitkeep 文件确保目录结构
    mkdir -p releases
    touch releases/.gitkeep

    # 提交初始内容
    git add .
    git commit -m "Initial commit: Add README and releases directory"
    git push origin main
    
    echo "✅ 公共仓库初始化完成！"
else
    echo "✅ 公共仓库已有内容，无需初始化"
fi

# 清理临时目录
cd - > /dev/null
rm -rf "$TEMP_DIR"

echo "🎉 初始化完成！现在可以创建 releases 了。" 