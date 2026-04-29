const fs = require('fs');
const path = require('path');
const backendRoot = path.resolve('.');

const walk = (dir) => {
  let res = [];
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) res = res.concat(walk(p));
    else if (/\.jsx?$/.test(name)) res.push(path.relative(backendRoot, p).replace(/\\/g, '/'));
  }
  return res;
};

const allFiles = walk(path.join(backendRoot, 'src'));
const byName = allFiles.reduce((acc, file) => {
  const name = path.basename(file);
  acc[name] = acc[name] || [];
  acc[name].push(file);
  return acc;
}, {});
const duplicates = Object.entries(byName).filter(([, files]) => files.length > 1);
console.log('DUPLICATE FILENAMES:');
if (duplicates.length === 0) console.log('  None');
else duplicates.forEach(([name, files]) => {
  console.log(`  ${name}`);
  files.forEach(f => console.log(`    - ${f}`));
});

console.log('\nROUTE FILES:');
const routeFiles = allFiles.filter(f => f.startsWith('src/routes/'));
routeFiles.forEach(f => console.log('  ' + f));

const controllersDir = path.join(backendRoot, 'src', 'controllers');
const routeIssues = [];
routeFiles.forEach(routeFile => {
  const abs = path.join(backendRoot, routeFile);
  const source = fs.readFileSync(abs, 'utf8');
  const importRegex = new RegExp("const \\{([\\s\\S]*?)\\} = require\\('\\.\\./controllers\\/([^']+)'\\);");
  const importMatch = source.match(importRegex);
  const imports = importMatch ? importMatch[1].split(',').map(s => s.trim()).filter(Boolean) : [];
  const controllerFile = importMatch ? importMatch[2] + '.js' : null;
  let controllerExports = [];
  if (controllerFile) {
    const ctrlPath = path.join(controllersDir, controllerFile);
    if (fs.existsSync(ctrlPath)) {
      try {
        const ctrl = require(ctrlPath);
        controllerExports = Object.keys(ctrl);
      } catch (err) {
        routeIssues.push(`${routeFile}: failed to require controller ${controllerFile}: ${err.message}`);
      }
    } else {
      routeIssues.push(`${routeFile}: controller file ${controllerFile} missing`);
    }
  }
  source.split(/\r?\n/).forEach((line, idx) => {
    const m = line.match(/router\.(get|post|put|delete|patch)\(([^\)]*)\)/);
    if (m) {
      const parts = m[2].split(',').map(s => s.trim()).filter(Boolean);
      parts.slice(1).forEach(handler => {
        if (handler === 'undefined') {
          routeIssues.push(`${routeFile}:${idx+1} handler undefined in ${line.trim()}`);
          return;
        }

        const rawHandler = handler;
        const baseHandlerName = rawHandler.includes('(')
          ? rawHandler.slice(0, rawHandler.indexOf('(')).trim()
          : rawHandler.replace(/[\[\]\{\}\s'"=>]/g, '');

        const allowedHandlerPatterns = [
          /^auth$/,
          /^validate$/,
          /^checkConnection$/,
          /^upload\.handleMulterError$/,
          /^upload\.single$/,
          /^objectIdParam$/,
          /^\.\.\./,
        ];

        const allowedHandlerNames = [
          'paginationValidator',
          'createSwapValidator',
          'updateSwapValidator',
          'swapPaginationValidator',
          'createReviewValidator',
          'reviewUserParamValidator',
          'reviewPaginationValidator',
          'updateProfileValidator',
          'uploadProfilePic',
          'enhanceBio',
          'generateBio',
          'generateEncryptionKeys',
          'getPublicKey',
          'aiChatAssistant',
        ];

        const isAllowed =
          allowedHandlerPatterns.some((pattern) => pattern.test(baseHandlerName)) ||
          allowedHandlerNames.includes(baseHandlerName) ||
          rawHandler.includes('...');

        if (imports.length && !controllerExports.includes(baseHandlerName) && !isAllowed) {
          routeIssues.push(`${routeFile}:${idx+1} likely missing import/export for handler ${handler}`);
        }
      });
    }
  });
});
console.log('\nROUTE ISSUES:');
if (routeIssues.length === 0) console.log('  None found');
else routeIssues.forEach(issue => console.log('  ' + issue));
