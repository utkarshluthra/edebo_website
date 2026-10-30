#!/usr/bin/env node
// Builds the blog from content/blog/*.md into static HTML under site/blog/.
//   node scripts/blog/build.mjs           build everything
//   node scripts/blog/build.mjs --check   validate content only, write nothing
//
// Output, relative to site/ (all generated, do not edit by hand):
//   blog/index.html, blog/<slug>/index.html, blog/category/<key>/index.html,
//   blog/feed.xml, sitemap-blog.xml
// site/sitemap.xml is hand-maintained and is NOT touched by this script.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { Marked } from 'marked';
import { SITE, CATEGORIES, WORDS_PER_MINUTE } from './config.mjs';
import { renderIndex, renderCategory, renderPost, renderFeed } from './templates.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'content/blog');
const WEB = path.join(ROOT, 'site'); // the deployable web root
const OUT = path.join(WEB, 'blog');
const CHECK_ONLY = process.argv.includes('--check');

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const toISO = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
};

// ---------- markdown ----------
function makeMarked(headings) {
  const used = new Set();
  const m = new Marked({ gfm: true });
  m.use({
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens);
        let id = slugify(text) || 'section';
        let n = 2;
        while (used.has(id)) id = `${slugify(text)}-${n++}`;
        used.add(id);
        if (depth === 2) headings.push({ id, text: text.replace(/[*_`]/g, '') });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const ext = /^https?:\/\//.test(href) && !href.startsWith(SITE.url);
        const t = title ? ` title="${title}"` : '';
        return ext
          ? `<a href="${href}"${t} target="_blank" rel="noopener">${inner}</a>`
          : `<a href="${href}"${t}>${inner}</a>`;
      },
      image({ href, title, text }) {
        const t = title ? `<figcaption>${title}</figcaption>` : '';
        return `<figure><img src="${href}" alt="${text}" loading="lazy" decoding="async">${t}</figure>`;
      },
    },
  });
  return m;
}

// ---------- load posts ----------
if (!fs.existsSync(SRC)) {
  console.error(`No content folder at ${SRC}`);
  process.exit(1);
}

const files = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith('.md') && !f.startsWith('_') && f.toLowerCase() !== 'readme.md');

const posts = [];
const slugs = new Set();

for (const file of files) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const { data: fm, content } = matter(raw);
  const slug = fm.slug ? slugify(fm.slug) : file.replace(/\.md$/, '');

  if (fm.draft === true) continue;
  const todayISO = new Date().toISOString().slice(0, 10);
  if (fm.date && toISO(fm.date) > todayISO) {
    console.log(`  skip  ${file}: scheduled for ${toISO(fm.date)}`);
    continue;
  }

  for (const k of ['title', 'description', 'date', 'category']) {
    if (!fm[k]) err(file, `missing required frontmatter field "${k}"`);
  }
  if (fm.category && !CATEGORIES[fm.category])
    err(file, `category "${fm.category}" is not one of: ${Object.keys(CATEGORIES).join(', ')}`);
  if (slugs.has(slug)) err(file, `duplicate slug "${slug}"`);
  if (slug !== slugify(slug)) err(file, `slug "${slug}" should be lowercase-with-hyphens`);
  slugs.add(slug);

  const date = toISO(fm.date);
  const updated = toISO(fm.updated);
  if (fm.date && !date) err(file, `date "${fm.date}" is not a valid YYYY-MM-DD date`);

  if (fm.title && fm.title.length > 70) warn(file, `title is ${fm.title.length} chars; Google shows about 60`);
  if (fm.description && (fm.description.length < 70 || fm.description.length > 165))
    warn(file, `description is ${fm.description.length} chars; aim for 120-160`);
  if (/^#\s/m.test(content)) warn(file, 'body contains an H1 (#). The title is the H1; start sections at ##');

  const faq = Array.isArray(fm.faq) ? fm.faq : [];
  faq.forEach((f, i) => {
    if (!f?.q || !f?.a) err(file, `faq item ${i + 1} needs both "q" and "a"`);
  });

  const headings = [];
  const html = makeMarked(headings).parse(content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount < 500) warn(file, `only ${wordCount} words; posts under ~600 words rarely rank`);

  posts.push({
    file,
    slug,
    title: fm.title,
    seoTitle: fm.seoTitle,
    description: fm.description,
    date,
    updated,
    category: fm.category,
    tags: fm.tags || [],
    keyword: fm.keyword,
    author: fm.author || SITE.defaultAuthor,
    image: fm.image,
    related: fm.related || [],
    featured: fm.featured === true,
    order: Number.isFinite(fm.order) ? fm.order : 999,
    faq,
    html: html.replace(/<table>/g, '<div class="table"><table>').replace(/<\/table>/g, '</table></div>'),
    headings,
    wordCount,
    readingTime: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
    links: [...content.matchAll(/\]\((\/blog\/[^)\s#]*)/g)].map((m) => m[1]),
  });
}

// newest first; `featured: true` pins a post to the top; `order` breaks same-day ties
posts.sort(
  (a, b) =>
    Number(b.featured) - Number(a.featured) ||
    (b.date || '').localeCompare(a.date || '') ||
    a.order - b.order ||
    a.title.localeCompare(b.title)
);

// ---------- validate internal links ----------
const validPaths = new Set(['/blog/', ...posts.map((p) => `/blog/${p.slug}/`), ...Object.keys(CATEGORIES).map((k) => `/blog/category/${k}/`)]);
for (const p of posts) {
  for (const l of p.links) {
    const norm = l.endsWith('/') ? l : l + '/';
    if (!validPaths.has(norm)) err(p.file, `broken internal link ${l}`);
  }
  for (const r of p.related) if (!slugs.has(r)) err(p.file, `related slug "${r}" does not exist`);
  if (p.links.length < 2) warn(p.file, `only ${p.links.length} internal blog links; aim for 3+`);
}

// ---------- report ----------
warnings.forEach((w) => console.warn('  warn  ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('  ERROR ' + e));
  console.error(`\nBlog build failed: ${errors.length} error(s).`);
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log(`Blog check passed: ${posts.length} posts, ${warnings.length} warning(s).`);
  process.exit(0);
}

// ---------- related posts ----------
function relatedFor(p) {
  const picked = [];
  const add = (q) => q && q !== p && !picked.includes(q) && picked.length < 3 && picked.push(q);
  p.related.forEach((s) => add(posts.find((x) => x.slug === s)));
  const scored = posts
    .filter((x) => x !== p)
    .map((x) => ({
      x,
      s: (x.category === p.category ? 2 : 0) + x.tags.filter((t) => p.tags.includes(t)).length,
    }))
    .filter((o) => o.s > 0)
    .sort((a, b) => b.s - a.s || b.x.date.localeCompare(a.x.date));
  scored.forEach((o) => add(o.x));
  return picked;
}

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, content) => {
  const f = path.join(WEB, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};

write('blog/index.html', renderIndex(posts));
for (const p of posts) write(`blog/${p.slug}/index.html`, renderPost(p, relatedFor(p)));
for (const key of Object.keys(CATEGORIES)) {
  const list = posts.filter((p) => p.category === key);
  if (list.length) write(`blog/category/${key}/index.html`, renderCategory(key, list));
}
write('blog/feed.xml', renderFeed(posts));

// sitemap-blog.xml: blog index, categories and posts
const latest = posts.reduce((m, p) => ((p.updated || p.date) > m ? p.updated || p.date : m), '2026-01-01');
const urls = [
  { loc: '/blog/', lastmod: latest, changefreq: 'weekly', priority: '0.8' },
  ...Object.keys(CATEGORIES)
    .filter((k) => posts.some((p) => p.category === k))
    .map((k) => ({
      loc: `/blog/category/${k}/`,
      lastmod: posts.filter((p) => p.category === k).reduce((m, p) => ((p.updated || p.date) > m ? p.updated || p.date : m), '2026-01-01'),
      changefreq: 'weekly',
      priority: '0.5',
    })),
  ...posts.map((p) => ({ loc: `/blog/${p.slug}/`, lastmod: p.updated || p.date, changefreq: 'monthly', priority: '0.7' })),
];
write(
  'sitemap-blog.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${SITE.url}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>
`
);

console.log(`Blog built: ${posts.length} posts, ${Object.keys(CATEGORIES).length} categories, ${urls.length} sitemap URLs, ${warnings.length} warning(s).`);
