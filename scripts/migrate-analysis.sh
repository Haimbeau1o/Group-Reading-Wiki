#!/usr/bin/env bash
set -euo pipefail

SRC="/Volumes/passport/project/arxiv-paper/analysis"
DST="/Volumes/passport/project/arxiv-paper/ai-paper-wiki/src/content/docs/deepseek"

mkdir -p "$DST"

migrate() {
  local in="$1"
  local out="$2"
  local title="$3"
  local desc="$4"
  local order="$5"
  local label="$6"

  {
    echo "---"
    echo "title: $title"
    echo "description: $desc"
    echo "sidebar:"
    echo "  order: $order"
    echo "  label: $label"
    echo "---"
    echo
    # 跳过原始 H1 标题及其后的空行（前 2 行）
    tail -n +3 "$in" | sed 's|assets/|/docs-assets/|g'
  } > "$out"
}

migrate "$SRC/deepseek_v4_research_deep_dive.md" \
  "$DST/v4-research.md" \
  "DeepSeek-V4 深度研究剖析" \
  "以「百万 token 上下文效率」为主轴的下一代 LLM 架构与工程系统全解读。" \
  "2" "V4 研究深度解析"

migrate "$SRC/deepseek_v4_hybrid_attention_deep_dive.md" \
  "$DST/hybrid-attention.md" \
  "DeepSeek-V4 混合注意力机制" \
  "SWA + CSA + HCA —— V4 实现百万上下文的核心架构设计。" \
  "3" "混合注意力机制"

migrate "$SRC/deepseek_visual_primitives_deep_dive.md" \
  "$DST/visual-primitives.md" \
  "DeepSeek 视觉原语" \
  "DeepSeek-VL 视觉编码栈与多模态推理闭环的完整剖析。" \
  "4" "视觉原语"

echo "Done."
ls -la "$DST"
wc -l "$DST"/*.md
