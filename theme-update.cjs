const fs = require('fs');
const path = require('path');

const dirs = ['src/components', 'src/pages', 'src/layouts'];
const exts = ['.jsx'];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (exts.includes(path.extname(file))) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [];
dirs.forEach(d => files.push(...walk(d)));

const replacements = [
  // backgrounds
  { from: /bg-neutral-950/g, to: 'bg-neutral-50' },
  { from: /bg-neutral-900/g, to: 'bg-white' },
  { from: /bg-neutral-800\/50/g, to: 'bg-neutral-50' },
  { from: /bg-neutral-800/g, to: 'bg-white' },
  { from: /hover:bg-neutral-800/g, to: 'hover:bg-neutral-50' },
  { from: /hover:bg-neutral-700/g, to: 'hover:bg-neutral-100' },
  
  // borders
  { from: /border-neutral-800/g, to: 'border-neutral-200' },
  { from: /border-neutral-700/g, to: 'border-neutral-300' },
  { from: /hover:border-neutral-700/g, to: 'hover:border-neutral-300' },
  { from: /hover:border-neutral-600/g, to: 'hover:border-neutral-400' },
  
  // texts
  { from: /text-neutral-100/g, to: '__TEXT_900__' },
  { from: /text-neutral-300/g, to: '__TEXT_700__' },
  { from: /text-neutral-400/g, to: '__TEXT_600__' },
  { from: /text-neutral-600/g, to: '__TEXT_400__' },
  { from: /text-neutral-500/g, to: '__TEXT_500__' },
];

let changes = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  
  // Second pass for the placeholders
  content = content.replace(/__TEXT_900__/g, 'text-neutral-900');
  content = content.replace(/__TEXT_700__/g, 'text-neutral-700');
  content = content.replace(/__TEXT_600__/g, 'text-neutral-600');
  content = content.replace(/__TEXT_500__/g, 'text-neutral-500');
  content = content.replace(/__TEXT_400__/g, 'text-neutral-400');
  
  // fix ring offsets
  content = content.replace(/ring-offset-neutral-950/g, 'ring-offset-white');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    changes++;
  }
});

console.log('Total files updated for Light Theme: ' + changes);
