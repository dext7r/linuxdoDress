# Fresh Deno Deploy 部署脚本
echo "🚀 部署 Fresh 应用到 Deno Deploy"

# 检查 deployctl
if ! command -v deployctl &> /dev/null; then
    echo "❌ deployctl 未安装，请运行: deno install -A --no-check -r -f https://deno.land/x/deploy/deployctl.ts"
    exit 1
fi

# 清理和构建
echo "🧹 清理构建缓存..."
rm -rf _fresh/

echo "📦 缓存依赖..."
deno cache main.ts

echo "📝 生成清单文件..."
deno task manifest || { echo "❌ 清单生成失败"; exit 1; }

echo "🔨 构建应用..."
deno task build || { echo "❌ 构建失败"; exit 1; }

# 验证关键文件
if [ ! -f "fresh.gen.ts" ]; then
    echo "❌ Fresh 清单文件不存在"
    exit 1
fi

if [ ! -d "_fresh" ]; then
    echo "❌ 构建产物不存在"
    exit 1
fi

# 部署
echo "🌐 部署到 Deno Deploy..."
deployctl deploy --project=linuxdodress main.ts --prod

echo "🎉 部署完成！"
