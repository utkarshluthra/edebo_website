import { SITE, CATEGORIES } from './config.mjs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const abs = (p) => (p.startsWith('http') ? p : SITE.url + p);

export const fmtDate = (d) =>
  new Date(d + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function head({ title, description, path, ogType = 'website', image, extra = '', schema = [] }) {
  const url = abs(path);
  const img = abs(image || SITE.ogImage);
  return `<!doctype html>
<html lang="${SITE.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${esc(SITE.blogTitle)}" href="${SITE.url}/blog/feed.xml">
<meta name="theme-color" content="#7C3AED">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="${SITE.locale}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${img}">
${extra}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/blog.css">
${schema.map(jsonLd).join('\n')}
</head>
<body>`;
}

const nav = () => `
<header class="bnav">
  <div class="bnav__inner">
    <a href="/" class="bnav__home" aria-label="Edebo home"><img src="/assets/img/edebo-logo.png" alt="Edebo" width="87" height="20"></a>
    <nav class="bnav__links" aria-label="Main">
      <a href="/#how">How it works</a>
      <a href="/#analysis">Skin analysis</a>
      <a href="/#pricing">Pricing</a>
      <a href="/blog/" aria-current="page">Blog</a>
    </nav>
    <a class="bbtn bbtn--yellow bnav__cta" href="${SITE.waitlistUrl}">Join waitlist</a>
    <button class="bnav__burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="bnavSheet"><span></span><span></span></button>
  </div>
  <div class="bnav__sheet" id="bnavSheet" hidden>
    <a href="/#how">How it works</a>
    <a href="/#analysis">Skin analysis</a>
    <a href="/#accuracy">Accuracy</a>
    <a href="/#security">Security</a>
    <a href="/#pricing">Pricing</a>
    <a href="/blog/">Blog</a>
    <a class="bbtn bbtn--yellow" href="${SITE.waitlistUrl}">Join waitlist</a>
  </div>
</header>`;

const footer = () => `
<footer class="bfoot">
  <div class="bwrap">
    <div class="bfoot__top">
      <div class="bfoot__brand">
        <a href="/" aria-label="Edebo home"><img src="/assets/img/edebo-logo.png" alt="Edebo" width="113" height="26" loading="lazy"></a>
        <p>India's first phone-enabled 3D imaging for clinics.</p>
      </div>
      <div class="bfoot__cols">
        <div><h4>Product</h4><a href="/#how">How it works</a><a href="/#analysis">Skin analysis</a><a href="/#accuracy">Accuracy</a><a href="/#pricing">Pricing</a></div>
        <div><h4>Blog</h4>${Object.entries(CATEGORIES)
          .map(([k, c]) => `<a href="/blog/category/${k}/">${esc(c.name)}</a>`)
          .join('')}</div>
        <div><h4>Get the app</h4><a href="${SITE.appStore}" target="_blank" rel="noopener">App Store</a><a href="${SITE.playStore}" target="_blank" rel="noopener">Google Play</a><a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a><a href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a></div>
        <div><h4>Legal</h4><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Use</a><a href="/blog/feed.xml">RSS feed</a></div>
      </div>
    </div>
    <div class="bfoot__base"><span>© ${new Date().getFullYear()} Edebo · ${SITE.email}</span><span>${esc(SITE.disclaimer)}</span></div>
  </div>
</footer>
<script>
(function(){var n=document.querySelector('.bnav'),b=n&&n.querySelector('.bnav__burger'),s=document.getElementById('bnavSheet');
if(!b)return;b.addEventListener('click',function(){var o=n.classList.toggle('is-open');s.hidden=!o;b.setAttribute('aria-expanded',String(o));});})();
</script>
</body>
</html>
`;

const cta = () => `
<section class="bcta">
  <div class="bwrap bcta__inner">
    <div>
      <p class="bcta__eyebrow">Edebo</p>
      <h2>Turn the phone in your clinic into a 3D scanner.</h2>
      <p>Capture, measure and compare face, hairline and body results in one appointment. No rig, no booth.</p>
    </div>
    <div class="bcta__actions">
      <a class="bbtn bbtn--yellow bbtn--lg" href="${SITE.waitlistUrl}">Join waitlist</a>
      <a class="bcta__link" href="/#how">See how it works</a>
    </div>
  </div>
</section>`;

const postRow = (p, { big = false } = {}) => `
<article class="prow${big ? ' prow--big' : ''}" data-cat="${p.category}">
  <a class="prow__link" href="/blog/${p.slug}/">
    <p class="prow__meta"><span class="tag">${esc(CATEGORIES[p.category].name)}</span><span>${fmtDate(p.date)}</span><span>${p.readingTime} min read</span></p>
    <h${big ? 2 : 3} class="prow__title">${esc(p.title)}</h${big ? 2 : 3}>
    <p class="prow__desc">${esc(p.description)}</p>
    <span class="prow__more">Read article <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
  </a>
</article>`;

const catNav = (active) => `
<nav class="cats" aria-label="Blog categories">
  <a href="/blog/"${!active ? ' aria-current="page"' : ''}>All</a>
  ${Object.entries(CATEGORIES)
    .map(([k, c]) => `<a href="/blog/category/${k}/"${active === k ? ' aria-current="page"' : ''}>${esc(c.name)}</a>`)
    .join('\n  ')}
</nav>`;

const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export function renderIndex(posts) {
  const [first, ...rest] = posts;
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${SITE.url}/blog/#blog`,
      name: SITE.blogTitle,
      description: SITE.blogDescription,
      url: `${SITE.url}/blog/`,
      inLanguage: SITE.lang,
      publisher: { '@id': `${SITE.url}/#org` },
      blogPost: posts.slice(0, 20).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE.url}/blog/${p.slug}/`,
        datePublished: p.date,
      })),
    },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog/' }]),
  ];
  return (
    head({
      title: `${SITE.blogTitle} | 3D Imaging Guides for Aesthetic Clinics in India`,
      description: SITE.blogDescription,
      path: '/blog/',
      schema,
    }) +
    nav() +
    `
<main>
  <section class="bhero">
    <div class="bwrap">
      <p class="bhero__eyebrow">Blog</p>
      <h1>Aesthetic results are three-dimensional. <span>So is this blog.</span></h1>
      <p class="bhero__lede">${esc(SITE.blogTagline)}</p>
    </div>
  </section>
  <section class="bwrap blist">
    ${catNav(null)}
    ${first ? postRow(first, { big: true }) : ''}
    <div class="blist__rows">${rest.map((p) => postRow(p)).join('')}</div>
  </section>
</main>` +
    cta() +
    footer()
  );
}

export function renderCategory(key, posts) {
  const c = CATEGORIES[key];
  const path = `/blog/category/${key}/`;
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${c.name} | ${SITE.blogTitle}`,
      description: c.description,
      url: SITE.url + path,
      isPartOf: { '@id': `${SITE.url}/blog/#blog` },
      inLanguage: SITE.lang,
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog/' },
      { name: c.name, path },
    ]),
  ];
  return (
    head({ title: `${c.name} Articles | ${SITE.blogTitle}`, description: c.description, path, schema }) +
    nav() +
    `
<main>
  <section class="bhero bhero--short">
    <div class="bwrap">
      <p class="bhero__eyebrow"><a href="/blog/">Blog</a> / ${esc(c.name)}</p>
      <h1>${esc(c.name)}</h1>
      <p class="bhero__lede">${esc(c.description)}</p>
    </div>
  </section>
  <section class="bwrap blist">
    ${catNav(key)}
    <div class="blist__rows">${posts.map((p) => postRow(p)).join('')}</div>
  </section>
</main>` +
    cta() +
    footer()
  );
}

export function renderPost(p, related) {
  const path = `/blog/${p.slug}/`;
  const cat = CATEGORIES[p.category];
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${SITE.url}${path}#article`,
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.updated || p.date,
      inLanguage: SITE.lang,
      wordCount: p.wordCount,
      timeRequired: `PT${p.readingTime}M`,
      articleSection: cat.name,
      keywords: [p.keyword, ...(p.tags || [])].filter(Boolean).join(', '),
      image: abs(p.image || SITE.ogImage),
      url: SITE.url + path,
      mainEntityOfPage: { '@type': 'WebPage', '@id': SITE.url + path },
      author: { '@type': 'Organization', name: p.author, url: SITE.url + '/' },
      publisher: {
        '@type': 'Organization',
        '@id': `${SITE.url}/#org`,
        name: SITE.name,
        logo: { '@type': 'ImageObject', url: `${SITE.url}/assets/icons/icon-512.png` },
      },
      isPartOf: { '@id': `${SITE.url}/blog/#blog` },
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog/' },
      { name: cat.name, path: `/blog/category/${p.category}/` },
      { name: p.title, path },
    ]),
  ];
  if (p.faq?.length) {
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  const extra = [
    `<meta property="article:published_time" content="${p.date}">`,
    `<meta property="article:modified_time" content="${p.updated || p.date}">`,
    `<meta property="article:section" content="${esc(cat.name)}">`,
    ...(p.tags || []).map((t) => `<meta property="article:tag" content="${esc(t)}">`),
  ].join('\n');

  const toc = p.headings.length >= 3
    ? `<nav class="toc" aria-label="On this page"><p>On this page</p><ol>${p.headings
        .map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`)
        .join('')}</ol></nav>`
    : '';

  const faq = p.faq?.length
    ? `<section class="faq" id="faq"><h2>Frequently asked questions</h2>${p.faq
        .map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join('')}</section>`
    : '';

  return (
    head({
      title: p.seoTitle || `${p.title} | Edebo`,
      description: p.description,
      path,
      ogType: 'article',
      image: p.image,
      extra,
      schema,
    }) +
    nav() +
    `
<main>
  <article class="post">
    <header class="phead">
      <div class="bwrap bwrap--narrow">
        <p class="crumbs"><a href="/blog/">Blog</a> <span aria-hidden="true">/</span> <a href="/blog/category/${p.category}/">${esc(cat.name)}</a></p>
        <h1>${esc(p.title)}</h1>
        <p class="phead__lede">${esc(p.description)}</p>
        <p class="phead__meta"><span>${esc(p.author)}</span><span><time datetime="${p.date}">${fmtDate(p.date)}</time></span>${
          p.updated && p.updated !== p.date ? `<span>Updated <time datetime="${p.updated}">${fmtDate(p.updated)}</time></span>` : ''
        }<span>${p.readingTime} min read</span></p>
      </div>
    </header>
    <div class="bwrap pgrid">
      <aside class="pside">${toc}</aside>
      <div class="prose">
${p.html}
${faq}
        <p class="disclaimer">${esc(SITE.disclaimer)} Clinical decisions remain with the treating practitioner.</p>
      </div>
    </div>
  </article>
  ${
    related.length
      ? `<section class="bwrap related"><h2>Keep reading</h2><div class="blist__rows">${related.map((r) => postRow(r)).join('')}</div></section>`
      : ''
  }
</main>` +
    cta() +
    footer()
  );
}

export function renderFeed(posts) {
  const items = posts
    .slice(0, 30)
    .map(
      (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${SITE.url}/blog/${p.slug}/</link>
    <guid isPermaLink="true">${SITE.url}/blog/${p.slug}/</guid>
    <pubDate>${new Date(p.date + 'T04:30:00Z').toUTCString()}</pubDate>
    <category>${esc(CATEGORIES[p.category].name)}</category>
    <description>${esc(p.description)}</description>
  </item>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(SITE.blogTitle)}</title>
  <link>${SITE.url}/blog/</link>
  <atom:link href="${SITE.url}/blog/feed.xml" rel="self" type="application/rss+xml"/>
  <description>${esc(SITE.blogDescription)}</description>
  <language>${SITE.lang}</language>
  <lastBuildDate>${new Date((posts[0]?.updated || posts[0]?.date || '2026-01-01') + 'T04:30:00Z').toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>
`;
}
