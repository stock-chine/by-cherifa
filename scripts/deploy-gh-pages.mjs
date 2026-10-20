// Publie le build Angular sur la branche gh-pages (GitHub Pages).
// Utilise la connexion GitHub configurée pour ce projet (git credential manager).
import { execSync } from 'node:child_process';
import { copyFileSync, writeFileSync } from 'node:fs';

const REPO = 'https://github.com/stock-chine/by-cherifa.git';
const OUT = 'dist/stock-chine/browser';
const run = (cmd, cwd = '.') => execSync(cmd, { cwd, stdio: 'inherit' });

run('npx ng build --base-href /by-cherifa/');

// SPA : GitHub Pages renvoie 404.html pour les liens profonds (/produit/12…).
copyFileSync(`${OUT}/index.html`, `${OUT}/404.html`);
writeFileSync(`${OUT}/.nojekyll`, '');

run('git init -q -b gh-pages', OUT);
run('git config core.autocrlf false', OUT);
run('git config credential.helper ""', OUT);
run('git config --add credential.helper manager', OUT);
run('git config credential.https://github.com.username stock-chine', OUT);
run('git add -A', OUT);
run(`git commit -q -m "Publication ${new Date().toISOString()}"`, OUT);
run(`git push -f ${REPO} gh-pages`, OUT);

console.log('\nPublié : https://stock-chine.github.io/by-cherifa/');
