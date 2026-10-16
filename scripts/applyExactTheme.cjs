const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '..', 'src'));

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace dark button and section backgrounds
  content = content.replace(/bg-(stone|slate|gray)-900 hover:bg-(stone|slate|gray)-800 text-white/g, 'bg-blue-600 hover:bg-blue-700 text-white');
  content = content.replace(/bg-(stone|slate)-900 text-white/g, 'bg-blue-600 text-white');
  content = content.replace(/bg-stone-950|bg-slate-950/g, 'bg-gray-900');

  // Replace colors
  content = content.replace(/teal-/g, 'blue-');
  content = content.replace(/emerald-/g, 'green-');
  content = content.replace(/rose-/g, 'red-');
  content = content.replace(/stone-/g, 'gray-');
  content = content.replace(/slate-/g, 'gray-');

  // Remove glassmorphism / excessive shadows
  content = content.replace(/backdrop-blur-(xs|sm|md|lg|xl)/g, 'backdrop-blur-none');
  content = content.replace(/shadow-(2xl|xl|lg|md)/g, 'shadow-xs');

  // Replace specific dark banners with clean light cards
  content = content.replace(/bg-gray-900 text-white space-y-1/g, 'bg-gray-50 text-gray-900 border border-gray-200 space-y-1');
  content = content.replace(/bg-gray-900 text-white rounded-b-2xl/g, 'bg-gray-50 text-gray-900 border-t border-gray-200');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Updated: ${path.relative(path.join(__dirname, '..'), file)}`);
  }
});

console.log(`Done! Modified ${modifiedCount} files.`);
