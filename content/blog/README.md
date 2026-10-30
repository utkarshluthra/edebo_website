# Edebo blog content

Every blog post is one Markdown file in this folder. This folder is the only source of truth: the HTML under `/blog/` and `sitemap.xml` are generated from it and should never be edited by hand.

## Add a new post

1. Copy `_template.md` to `content/blog/<url-slug>.md` (or run `npm run blog:new -- "Post title" treatments`).
2. Fill in the frontmatter and write the post. Remove `draft: true` when it is ready.
3. Commit and push to `main`.

GitHub Actions (`.github/workflows/build-blog.yml`) then builds the HTML, updates `sitemap.xml` and `blog/feed.xml`, and commits them back. You can also build locally:

```bash
npm install        # first time only
npm run build      # writes /blog and sitemap.xml
npm run blog:check # validate content without writing
npm run blog:serve # build, then preview at http://localhost:8080/blog/
```

Then upload the site as described in `DEPLOY.txt` (the `blog/` folder, `assets/blog.css`, `assets/edebo-logo-light.png` and `sitemap.xml` are the new pieces).

## Frontmatter

| Field | Required | Notes |
|---|---|---|
| `title` | yes | 50-65 characters, main keyword early. Becomes the H1. |
| `description` | yes | 120-160 characters. Meta description and lede. |
| `date` | yes | `YYYY-MM-DD`. Newest posts list first. |
| `category` | yes | One of the keys in `scripts/blog/config.mjs`. |
| `keyword` | no | The single query this post targets. |
| `tags` | no | Drives related-post suggestions. |
| `faq` | no | List of `q` / `a`. Rendered on the page and as FAQ schema. |
| `updated` | no | Set when a post is materially revised. |
| `related` | no | Slugs to pin as "Keep reading". |
| `slug`, `seoTitle`, `author`, `image`, `draft` | no | See `_template.md`. |

## What the build checks

- Fails on: missing required fields, unknown category, duplicate slugs, a `/blog/...` link to a post that does not exist, a `related` slug that does not exist.
- Warns on: long titles, descriptions outside 70-165 characters, an H1 inside the body, posts under 500 words, fewer than 2 internal links.

## Editorial rules

- Write for dermatologists, plastic surgeons, clinic owners and aesthetic industry teams in India.
- Edebo is a measurement and visualisation tool, not a diagnostic device. Avoid "diagnose", "clinically validated", "most accurate".
- Cite published research by name rather than inventing numbers. Edebo's own validation figures are not yet published.
- On public pages, show plan scan limits only as multiples (2x Starter, 10x Starter).
- Link every new post to at least three existing posts, and add a link back to it from one or two older posts.
