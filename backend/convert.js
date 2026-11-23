// One-time helper: turns data/content.json and data/resources.json
// into data/content.js and data/resources.js (JavaScript modules).
// Run from the backend folder:  node convert.js
const fs = require('fs');
const path = require('path');

for (const name of ['content', 'resources']) {
  const jsonPath = path.join(__dirname, 'data', `${name}.json`);
  const jsPath = path.join(__dirname, 'data', `${name}.js`);

  if (!fs.existsSync(jsonPath)) {
    console.log(`Skipped ${name}: data/${name}.json not found`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const out = `// ${name} data (converted from ${name}.json)\nmodule.exports = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(jsPath, out);
  console.log(`Created data/${name}.js`);
}
