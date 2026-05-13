// 6 个 new-*.mjs 共用的小工具。提取来源：phase-1-debt D03。
// 行为必须与现有 inline 定义完全等价（已逐字段验证）。

export const yamlSafe = (s) =>
  /[:#&*!|>%@`,\[\]{}"'\\]/.test(s)
    ? `"${String(s).replace(/"/g, '\\"')}"`
    : s;

export const yamlList = (arr) =>
  arr.length ? '\n' + arr.map(s => `  - ${s}`).join('\n') : ' []';

export const yamlListQuoted = (arr) =>
  arr.length ? '\n' + arr.map(s => `  - ${yamlSafe(s)}`).join('\n') : ' []';

export const splitCsv = (v) =>
  typeof v === 'string'
    ? v.split(',').map(s => s.trim()).filter(Boolean)
    : [];

export const today = () => new Date().toISOString().slice(0, 10);
