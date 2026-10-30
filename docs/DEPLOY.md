# Deploying edebo.in

The site is hosted on Vercel. Every push to `main` builds and deploys automatically.

- **Build:** `npm ci` then `npm run build` (generates the blog into `site/blog/`).
- **Output directory:** `site/`. Everything inside it is served as-is; nothing outside it is public.
- **Config:** `vercel.json` sets the build, the output directory, cache headers and content types.

If you ever move to another static host, run `npm run build` and upload the contents of `site/` to the web root.

## What `vercel.json` already handles

| Path | Header |
|---|---|
| `/assets/video`, `/assets/models`, `/assets/img`, `/assets/icons` | `Cache-Control: public, max-age=31536000` (1 year) |
| `/assets/css`, `/assets/js` | `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` (1 day, refreshed in the background) |
| `*.glb` | `Content-Type: model/gltf-binary` |
| `/site.webmanifest` | `Content-Type: application/manifest+json` |

CSS and JS get a short cache because their filenames do not change between releases. Media gets a long cache, so **if you replace a video, image or model, give the new file a new name** (for example `edebo-product-v2.mp4`) and update the references. Otherwise returning visitors keep the old file for up to a year.

Vercel applies Brotli/Gzip compression automatically.

## Set in the Vercel dashboard (not in code)

1. `www.edebo.in` and `http://` both 301-redirect to `https://edebo.in/` (Project → Settings → Domains).

## After a deploy that changes pages

- Search Console: submit `https://edebo.in/sitemap.xml` and `https://edebo.in/sitemap-blog.xml` (only needed once, or after adding a new sitemap).
- Run PageSpeed Insights on mobile and the Rich Results test on the home page.
- Browsers cache favicons hard: check icon changes in a private window.

## Adding a new top-level page

1. Create `site/<page-name>.html`. Reuse `assets/css/topic.css` and `assets/js/topic3d.js` if it is a topic page.
2. Add the URL to `site/sitemap.xml` by hand (blog URLs are added to `site/sitemap-blog.xml` automatically).
3. Link to it from the home page footer or a related blog post so it gets crawled.
