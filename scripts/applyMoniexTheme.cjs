const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walk('src');
let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Replace Hex references
  content = content.replace(/#2563eb/gi, '#f5764b');
  content = content.replace(/#1d4ed8/gi, '#e05a2b');
  content = content.replace(/#eff6ff/gi, '#fff3ed');
  content = content.replace(/#bfdbfe/gi, '#fed7aa');

  // Specific Tailwind class replacements for blue -> Moniex warm coral orange
  // Backgrounds
  content = content.replace(/\bhover:bg-blue-700\b/g, 'hover:bg-[#e05a2b]');
  content = content.replace(/\bhover:bg-blue-600\b/g, 'hover:bg-[#f5764b]');
  content = content.replace(/\bhover:bg-blue-50\b/g, 'hover:bg-orange-50');
  content = content.replace(/\bbg-blue-700\b/g, 'bg-[#e05a2b]');
  content = content.replace(/\bbg-blue-600\b/g, 'bg-[#f5764b]');
  content = content.replace(/\bbg-blue-500\b/g, 'bg-[#f5764b]');
  content = content.replace(/\bbg-blue-100\b/g, 'bg-orange-100');
  content = content.replace(/\bbg-blue-50\b/g, 'bg-orange-50');

  // Text
  content = content.replace(/\bhover:text-blue-700\b/g, 'hover:text-[#e05a2b]');
  content = content.replace(/\bhover:text-blue-600\b/g, 'hover:text-[#f5764b]');
  content = content.replace(/\btext-blue-700\b/g, 'text-[#e05a2b]');
  content = content.replace(/\btext-blue-600\b/g, 'text-[#f5764b]');
  content = content.replace(/\btext-blue-500\b/g, 'text-[#f5764b]');
  content = content.replace(/\btext-blue-800\b/g, 'text-orange-950');
  content = content.replace(/\btext-blue-900\b/g, 'text-orange-950');

  // Borders
  content = content.replace(/\bhover:border-blue-600\b/g, 'hover:border-[#f5764b]');
  content = content.replace(/\bhover:border-blue-500\b/g, 'hover:border-[#f5764b]');
  content = content.replace(/\bhover:border-blue-300\b/g, 'hover:border-orange-300');
  content = content.replace(/\bborder-blue-600\b/g, 'border-[#f5764b]');
  content = content.replace(/\bborder-blue-500\b/g, 'border-[#f5764b]');
  content = content.replace(/\bborder-blue-300\b/g, 'border-orange-300');
  content = content.replace(/\bborder-blue-200\b/g, 'border-orange-200');
  content = content.replace(/\bborder-blue-100\b/g, 'border-orange-100');

  // Rings & Focus
  content = content.replace(/\bfocus:ring-blue-500\b/g, 'focus:ring-[#f5764b]');
  content = content.replace(/\bfocus:ring-blue-600\b/g, 'focus:ring-[#f5764b]');
  content = content.replace(/\bfocus:border-blue-500\b/g, 'focus:border-[#f5764b]');
  content = content.replace(/\bfocus:border-blue-600\b/g, 'focus:border-[#f5764b]');
  content = content.replace(/\bring-blue-500\b/g, 'ring-[#f5764b]');
  content = content.replace(/\baccent-blue-600\b/g, 'accent-[#f5764b]');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated: ${path.relative('.', file)}`);
  }
}

console.log(`Total files updated to Moniex color theme: ${changedFiles}`);
