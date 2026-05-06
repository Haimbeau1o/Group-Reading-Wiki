#!/usr/bin/env bash
# 部署前一键替换占位脚本。
# 用法：bash scripts/configure-deploy.sh <github-owner> <repo-name> <site-url>
# 例：  bash scripts/configure-deploy.sh liuche ai-paper-wiki https://wiki.example.org
#
# 这个脚本只做文本替换，不改 Giscus 的 repoId / categoryId（那两个仍要手工填，
# 因为需要去 giscus.app 拿）。
set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <github-owner> <repo-name> <site-url>"
  echo "  e.g. $0 liuche ai-paper-wiki https://wiki.example.org"
  exit 1
fi

OWNER="$1"
REPO="$2"
SITE="$3"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# macOS / BSD sed 与 GNU sed 兼容
if sed --version >/dev/null 2>&1; then
  SED_INPLACE=(-i)
else
  SED_INPLACE=(-i '')
fi

FILES=(
  "astro.config.mjs"
  "README.md"
  "CONTRIBUTING.md"
  ".github/PULL_REQUEST_TEMPLATE.md"
  ".github/ISSUE_TEMPLATE/config.yml"
  ".github/ISSUE_TEMPLATE/nominate-paper.yml"
  ".github/ISSUE_TEMPLATE/content-error.yml"
  "src/content/docs/index.mdx"
  "src/content/docs/welcome.md"
  "src/content/docs/onboarding.md"
  "src/content/docs/how-to-contribute.md"
  "src/content/docs/roadmap.md"
  "src/content/docs/concepts/index.md"
  "src/content/docs/papers/index.md"
  "src/content/docs/deepseek/overview.mdx"
  "src/content/docs/sessions/index.mdx"
  "scripts/init-group.mjs"
)

for f in "${FILES[@]}"; do
  [[ ! -f "$f" ]] && continue
  sed "${SED_INPLACE[@]}" \
    -e "s|your-org/ai-paper-wiki|${OWNER}/${REPO}|g" \
    -e "s|https://wiki.example.com|${SITE}|g" \
    "$f"
done

echo "✅ Replaced placeholders in ${#FILES[@]} files."
echo "⚠️  仍需手工填的：astro.config.mjs 里的 Giscus repoId / categoryId"
echo "   → 见 README → 部署 → Giscus 配置 一节"
