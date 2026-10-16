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
    } else if (file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walk('src');
const issues = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // 1. Grid columns without mobile-first (e.g. grid-cols-3, grid-cols-4, etc.)
    const rawGrid = l.match(/className=["'][^"']*\bgrid-cols-(?:[3-9]|1[0-2])\b/);
    if (rawGrid && !l.includes('grid-cols-1') && !l.includes('grid-cols-2') && !l.includes('sm:') && !l.includes('md:')) {
      issues.push({ file: path.relative('.', file), line: idx + 1, type: 'Raw Multi-Column Grid', text: l.trim().slice(0, 100) });
    }
    // 2. Unwrapped table
    if (l.includes('<table')) {
      const prev = lines.slice(Math.max(0, idx - 4), idx).join(' ');
      if (!prev.includes('overflow-x-auto') && !prev.includes('overflow-auto')) {
        issues.push({ file: path.relative('.', file), line: idx + 1, type: 'Unwrapped Table', text: l.trim().slice(0, 100) });
      }
    }
    // 3. Fixed large width
    const fixedWidth = l.match(/\bw-\[(\d+)px\]/);
    if (fixedWidth && parseInt(fixedWidth[1]) > 380 && !l.includes('max-w-')) {
      issues.push({ file: path.relative('.', file), line: idx + 1, type: 'Large Fixed Width ' + fixedWidth[0], text: l.trim().slice(0, 100) });
    }
    // 4. Modal container without max-w-[95vw] or max-h-[90vh] overflow
    if (l.includes('fixed inset-0') && (l.includes('flex items-center justify-center') || l.includes('flex justify-center'))) {
      const modalBlock = lines.slice(idx, idx + 10).join(' ');
      if (!modalBlock.includes('max-h-') && !modalBlock.includes('overflow-y-auto')) {
        issues.push({ file: path.relative('.', file), line: idx + 1, type: 'Potential Modal Overflow', text: l.trim().slice(0, 100) });
      }
    }
  });
});

console.log('Total issues found:', issues.length);
issues.forEach(i => console.log(`${i.file}:${i.line} [${i.type}] ${i.text}`));
