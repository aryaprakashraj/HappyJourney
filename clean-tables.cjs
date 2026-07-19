const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/pages');

let changes = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace container
  content = content.replace(/className="card (overflow-[^"]+)"/g, 'className="data-table-container $1"');
  content = content.replace(/className="card"/g, 'className="data-table-container"');

  // We only want to touch tables if they have data-table, but let's just make sure all tables have data-table
  content = content.replace(/<table className="w-full">/g, '<table className="data-table">');
  content = content.replace(/<table className="data-table w-full">/g, '<table className="data-table">');

  // Strip redundant th classes
  content = content.replace(/<th className="[^"]*">/g, '<th>');
  // Strip redundant td classes 
  content = content.replace(/<td className="p-3">/g, '<td>');
  content = content.replace(/<td className="p-4">/g, '<td>');
  
  // Clean up tr classes
  content = content.replace(/<tr className="border-b[^"]*">/g, '<tr>');
  content = content.replace(/<tr key=\{([^\}]+)\} className="border-b[^"]*">/g, '<tr key={$1}>');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    changes++;
    console.log('Updated tables in: ' + f);
  }
});

console.log('Updated ' + changes + ' files.');
