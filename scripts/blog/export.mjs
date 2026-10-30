#!/usr/bin/env node
// Copies the deployable site into ./public for Vercel (or any static host).
// Everything at the repo root is the site, except the build tooling below.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'public');
const EXCLUDE = new Set([
  'public', 'node_modules', 'content', 'scripts', '.git', '.github', '.vercel',
  'package.json', 'package-lock.json', 'vercel.json', 'DEPLOY.txt', '.gitignore', 'README.md',
]);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);
let n = 0;
for (const name of fs.readdirSync(ROOT)) {
  if (EXCLUDE.has(name)) continue;
  fs.cpSync(path.join(ROOT, name), path.join(OUT, name), { recursive: true });
  n++;
}
console.log(`Exported ${n} top-level items to public/`);
