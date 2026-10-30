# edebo.in

The marketing website for **Edebo**, phone-enabled 3D imaging for aesthetic clinics. It is a static site: plain HTML, CSS and JavaScript, with a small Node script that builds the blog from Markdown. There is no framework and no bundler.

Live at **https://edebo.in**, deployed on Vercel from the `main` branch.

## Quick start

```bash
npm install        # first time only (installs the blog build dependencies)
npm run dev        # build the blog, then serve the site at http://localhost:8080
```

| Command | What it does |
|---|---|
| `npm run build` | Builds the blog from `content/blog/*.md` into `site/blog/` and `site/sitemap-blog.xml` |
| `npm run blog:check` | Validates blog posts without writing any files |
| `npm run blog:new -- "Post title" treatments` | Creates a new draft post from the template |
| `npm run serve` | Serves `site/` at http://localhost:8080 without rebuilding |
| `npm run dev` | `build` + `serve` |

## Project structure

```
edebo_website/
├── site/                         # THE WEB ROOT: everything here is public, served as-is
│   ├── index.html                # Home page
│   ├── privacy.html, terms.html  # Legal pages
│   ├── *-3d.html, *-compared.html, before-after-*.html   # SEO topic pages (URLs are indexed, do not rename)
│   ├── blog/                     # GENERATED from content/blog. Never edit by hand
│   ├── favicon.ico, apple-touch-icon.png, og-image.jpg   # Kept at the root: browsers and social sites look for them there
│   ├── site.webmanifest, robots.txt
│   ├── sitemap.xml               # Hand-maintained (main pages)
│   ├── sitemap-blog.xml          # GENERATED (blog pages)
│   └── assets/
│       ├── css/
│       │   ├── home.css          # Home page styles
│       │   ├── topic.css         # Shared by the topic pages
│       │   ├── legal.css         # Shared by privacy and terms
│       │   └── blog.css          # Blog pages
│       ├── js/
│       │   ├── home/             # Home page scripts, loaded in numbered order
│       │   └── topic3d.js        # 3D hero on the topic pages
│       ├── img/                  # Logo, video poster
│       ├── icons/                # Favicons and PWA icons
│       ├── video/                # Product film (full + 720p)
│       └── models/               # head-model.glb, the 3D head used across the site
├── content/blog/                 # Blog posts, one Markdown file each (the source of truth)
│   ├── _template.md
│   └── README.md                 # How to write and publish a post
├── scripts/blog/                 # Blog build tooling
│   ├── build.mjs                 # Markdown → HTML, feed, sitemap; validates links and frontmatter
│   ├── config.mjs                # Site name, URLs, categories. Edit settings here
│   ├── templates.mjs             # HTML templates for blog pages
│   └── new-post.mjs              # Scaffolds a new post
├── docs/DEPLOY.md                # Hosting, caching and post-deploy checklist
├── .github/workflows/build-blog.yml   # Rebuilds the blog on push and commits the output
├── vercel.json                   # Build command, output directory (site/), headers
└── package.json
```

The one rule that keeps this tidy: **anything a visitor can load lives in `site/`; anything that only builds or documents the site lives outside it.**

## How the home page is put together

`site/index.html` holds the markup only. Its styles and behaviour are split out:

**Styles: `assets/css/home.css`.** One file, in nine numbered sections (base, then design iterations v2 to v6, the logo animation and the nav/waitlist). Later sections intentionally override earlier ones, so **keep the order** when editing. To change something, search for the class name and edit the last section that sets it.

**Scripts: `assets/js/home/`.** Loaded after three.js, GLTFLoader, OrbitControls and Lenis (from CDNs), in this order:

| File | Responsible for |
|---|---|
| `01-hero-and-compare.js` | Shared helpers (`clamp`, `smooth`), copy buttons, testimonials, product film, loading the head model (`EDEBO`), the hero scroll scan and the Day 0 vs Day 30 compare demo |
| `02-studio-3d.js` | The 3D studio: face and body meshes you can orbit, mark and measure |
| `03-interactions.js` | Smooth scrolling, parallax, reveals, skin analysis, annotation, accuracy ruler, security vault, practice calculator, pricing |
| `04-scroll-choreography.js` | Scroll-linked motion in one animation loop |
| `05-how-it-works-3d.js` | The four "How it works" 3D renders |
| `06-nav-and-waitlist.js` | Mobile menu and the waitlist form |
| `07-preloader-and-logo.js` | Preloader exit and the nav logo spin |

These are classic scripts that share global variables, so later files can use what earlier files define. If you add a file, give it the next number and add a `<script>` tag in the same order at the bottom of `index.html`.

Two small pieces stay inline in `index.html` on purpose: the JSON-LD structured data (for search engines) and the one-line preloader kick (it must run before anything else loads).

## Brand and content rules

- Colours: violet carries every accent; **yellow is only for CTAs and draggable handles**. No grey (it is not in the brand kit).
- The logo's E is not yellow. The favicon is Edebo's E in yellow on violet.
- The primary CTA is **Join waitlist**, which emails the sign-up to the team.
- Visuals should be real, interactive 3D where possible, with low text per screen.
- Edebo is a measurement and visualisation tool, **not a diagnostic device**. Avoid "diagnose", "clinically validated" and "most accurate" anywhere on the site.
- Blog writing rules: see `content/blog/README.md`.

## Common tasks

**Publish a blog post.** Add a Markdown file to `content/blog/`, push to `main`. Vercel builds and deploys it. Full guide: `content/blog/README.md`.

**Add a top-level page.** Create it in `site/`, add it to `site/sitemap.xml`, link to it from the footer. See `docs/DEPLOY.md`.

**Replace the product film, poster or 3D model.** Put the new file in the matching `site/assets/` folder **with a new filename**, then update the references. Media is cached for a year, so reusing a filename means returning visitors keep seeing the old file.

**Change site-wide blog settings** (store links, socials, categories, waitlist URL). Edit `scripts/blog/config.mjs`, then `npm run build`.
