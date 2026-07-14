const fs = require('fs');
const path = require('path');

function ensureFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) return;
  fs.writeFileSync(filePath, contents, 'utf8');
}

const base = path.join(__dirname, '..', 'generated', 'prisma');

// Prisma generates TS files in this repo, but the generated client imports `.js` files.
// These tiny shims make those runtime imports work under ts-node.
ensureFile(path.join(base, 'enums.js'), "module.exports = require('./enums.ts');\n");
ensureFile(
  path.join(base, 'internal', 'class.js'),
  "module.exports = require('./class.ts');\n",
);
ensureFile(
  path.join(base, 'internal', 'prismaNamespace.js'),
  "module.exports = require('./prismaNamespace.ts');\n",
);

console.log('Prisma shims ensured.');

