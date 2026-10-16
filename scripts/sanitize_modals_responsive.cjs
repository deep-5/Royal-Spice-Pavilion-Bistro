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
let updatedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Pattern: <div className="fixed inset-0 ..."> \s* <div className="w-full ...">
  // If the inner modal div doesn't contain max-h-, add max-h-[90vh] overflow-y-auto
  content = content.replace(/(<div className="fixed inset-0 [^"]*">[\s\S]*?<div className=")([^"]*)(")/g, (match, p1, p2, p3) => {
    if (!p2.includes('max-h-') && (p2.includes('max-w-') || p2.includes('bg-white') || p2.includes('rounded-'))) {
      const newClasses = p2 + ' max-h-[90vh] overflow-y-auto';
      return `${p1}${newClasses}${p3}`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Updated modals in: ${path.relative('.', file)}`);
  }
}

console.log(`Total files with responsive modal updates: ${updatedCount}`);
