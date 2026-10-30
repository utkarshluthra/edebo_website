#!/usr/bin/env node
// Scaffold a new post:  npm run blog:new -- "Your post title" [category]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES } from './config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [title, category = 'clinic-growth'] = process.argv.slice(2);

if (!title) {
  console.error('Usage: npm run blog:new -- "Post title" [category]');
  console.error('Categories: ' + Object.keys(CATEGORIES).join(', '));
  process.exit(1);
}
if (!CATEGORIES[category]) {
  console.error(`Unknown category "${category}". Use one of: ${Object.keys(CATEGORIES).join(', ')}`);
  process.exit(1);
}

const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
const file = path.join(ROOT, 'content/blog', `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`Already exists: content/blog/${slug}.md`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const tpl = fs
  .readFileSync(path.join(ROOT, 'content/blog/_template.md'), 'utf8')
  .replace(/^title: .*$/m, `title: "${title.replace(/"/g, '\\"')}"`)
  .replace(/^date: .*$/m, `date: ${today}`)
  .replace(/^category: .*$/m, `category: ${category}`)
  .replace(/^draft: .*$/m, 'draft: true');

fs.writeFileSync(file, tpl);
console.log(`Created content/blog/${slug}.md (draft: true). Remove the draft line when it is ready to publish.`);
