// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import giscus from 'starlight-giscus';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeMermaidPre from './src/lib/rehype-mermaid-pre.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://group-reading-wiki.pages.dev',
  markdown: {
    remarkPlugins: [remarkMath],
    // rehype-katex 渲染数学公式；rehype-mermaid-pre 把 ```mermaid 代码块改为 <pre class="mermaid">
    rehypePlugins: [rehypeKatex, rehypeMermaidPre],
  },
  integrations: [
    starlight({
      title: "Leon's Group",
      description: "Leon's Group 课题组共享大脑：共读、笔记、研究记忆、新人入口。",
      // 知识图聚合段（Backlinks / ThemePages / MemberActivity）注入到所有页 footer 上方
      components: {
        Footer: './src/components/KnowledgeFooter.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Haimbeau1o/Group-Reading-Wiki' },
      ],
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
        en: { label: 'English', lang: 'en' },
      },
      sidebar: [
        {
          label: '🏠 课题组',
          translations: { en: 'The Group' },
          items: [
            { label: '欢迎', slug: 'welcome', translations: { en: 'Welcome' } },
            { label: '🎯 新人入口 (Onboarding)', slug: 'onboarding', translations: { en: 'Onboarding' } },
            { label: '如何贡献', slug: 'how-to-contribute', translations: { en: 'How to Contribute' } },
            { label: '路线图', slug: 'roadmap', translations: { en: 'Roadmap' } },
          ],
        },
        {
          label: '🗓️ 共读会议',
          translations: { en: 'Sessions' },
          autogenerate: { directory: 'sessions' },
        },
        {
          label: '🧭 研究主线',
          translations: { en: 'Research Themes' },
          autogenerate: { directory: 'themes' },
        },
        {
          label: '👥 成员',
          translations: { en: 'Members' },
          autogenerate: { directory: 'members' },
          collapsed: true,
        },
        {
          label: '📚 共读笔记',
          translations: { en: 'Reading Notes' },
          items: [
            {
              label: '🐋 DeepSeek 专题',
              items: [
                { label: '专题概览', slug: 'deepseek/overview' },
                { label: 'V4 研究深度解析', slug: 'deepseek/v4-research' },
                { label: '混合注意力机制', slug: 'deepseek/hybrid-attention' },
                { label: '视觉原语', slug: 'deepseek/visual-primitives' },
              ],
            },
            {
              label: '� 论文索引',
              autogenerate: { directory: 'papers' },
              collapsed: true,
            },
          ],
        },
        {
          label: '� 概念词典',
          translations: { en: 'Concepts' },
          autogenerate: { directory: 'concepts' },
          collapsed: true,
        },
      ],
      plugins: [
        giscus({
          repo: 'Haimbeau1o/Group-Reading-Wiki',
          repoId: 'R_kgDOSV5qhA',
          category: 'Wiki Comments',
          categoryId: 'DIC_kwDOSV5qhM4C8fEF',
          mapping: 'pathname',
          reactions: true,
          inputPosition: 'bottom',
          lazy: true,
          theme: { light: 'light', dark: 'dark_dimmed', auto: 'preferred_color_scheme' },
        }),
      ],
      customCss: ['katex/dist/katex.min.css', './src/styles/custom.css'],
      // 客户端 Mermaid 渲染：仅在页面包含 <pre class="mermaid"> 时才动态加载 mermaid.js
      head: [
        {
          tag: 'script',
          attrs: { type: 'module' },
          content: `
            let mermaidPromise;
            const loadMermaid = () => mermaidPromise ||= import('https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs').then(m => m.default);
            const render = async () => {
              const nodes = document.querySelectorAll('pre.mermaid');
              if (nodes.length === 0) return;
              // 首次见到的节点：缓存原始源码到 data-source
              nodes.forEach((el) => {
                if (!el.hasAttribute('data-source')) el.setAttribute('data-source', el.textContent);
                else el.textContent = el.getAttribute('data-source');
                el.removeAttribute('data-processed');
              });
              const mermaid = await loadMermaid();
              const isDark = document.documentElement.dataset.theme === 'dark';
              mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default', securityLevel: 'loose', fontFamily: 'inherit' });
              await mermaid.run({ nodes });
            };
            document.addEventListener('DOMContentLoaded', render);
            document.addEventListener('astro:page-load', render);
            new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
          `.trim(),
        },
      ],
      lastUpdated: true,
      editLink: {
        baseUrl: 'https://github.com/Haimbeau1o/Group-Reading-Wiki/edit/main/',
      },
    }),
  ],
});
