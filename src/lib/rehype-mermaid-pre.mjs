/**
 * 极简版 Mermaid rehype 插件
 * 把 <pre><code class="language-mermaid">...</code></pre> 改写成
 *    <pre class="mermaid">...</pre>
 * 让客户端 mermaid.js 在浏览器里渲染。
 *
 * 之所以自己写，是因为官方 rehype-mermaid 即便选 pre-mermaid 策略也会
 * 在模块加载期 import('playwright')，对静态站点过重。
 */
import { visit } from 'unist-util-visit';

export default function rehypeMermaidPre() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent) return;
      const codeNode = node.children?.find((c) => c.type === 'element' && c.tagName === 'code');
      if (!codeNode) return;
      const className = codeNode.properties?.className ?? [];
      const isMermaid = Array.isArray(className)
        ? className.includes('language-mermaid')
        : typeof className === 'string' && className.includes('language-mermaid');
      if (!isMermaid) return;
      // 取出代码文本
      const text = codeNode.children
        .filter((c) => c.type === 'text')
        .map((c) => c.value)
        .join('');
      // 用 <pre class="mermaid"> 替换
      parent.children[index] = {
        type: 'element',
        tagName: 'pre',
        properties: { className: ['mermaid'] },
        children: [{ type: 'text', value: text }],
      };
    });
  };
}
