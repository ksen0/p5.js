const yaml = require('js-yaml');
const fs = require('fs');

const yamlData = fs.readFileSync('stewards.yml', 'utf8');
const parsed = yaml.load(yamlData);
const areaMap = {};

for (const [user, roles] of Object.entries(parsed)) {
  roles.forEach(role => {
    if (typeof role === 'string') {
      areaMap[role] = areaMap[role] || new Set();
      areaMap[role].add(`@${user}`);
    } else {
      for (const [main, subs] of Object.entries(role)) {
        subs.forEach(sub => {
          const key = `${main} (${sub})`;
          areaMap[key] = areaMap[key] || new Set();
          areaMap[key].add(`@${user}`);
        });
      }
    }
  });
}

const header = '| Area | Steward(s) |';
const divider = '|------|-------------|';
const rows = Object.entries(areaMap)
  .map(([area, users]) => `| ${area} | ${[...users].join(', ')} |`)
  .join('\n');

const newTable = [header, divider, rows].join('\n');

let readme = fs.readFileSync('README.md', 'utf8');

// Regex: match any markdown table starting with "| Area" and "|"
readme = readme.replace(
  /\| *Area *\|[\s\S]+?\n\|.*?\|/g,
  newTable
);

fs.writeFileSync('README.md', readme);
