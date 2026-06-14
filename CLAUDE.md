# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing/research website for the **Eissa Lab** (cognition / computation / neuroscience, CU Anschutz), built with **Jekyll** (via the `github-pages` gem) and deployed on **GitHub Pages** at the project path **https://bamr87.github.io/eissalab.com/**. No JS framework, no npm, no tests — the only build is `jekyll build`. Styling is hand-written CSS (custom properties), not a CSS framework.

**Base path matters.** The site is served under `/eissalab.com/`, so `_config.yml` sets `baseurl: "/eissalab.com"`. Always build internal links/assets with `{{ '/path' | relative_url }}` (or `| relative_url` on data-driven hrefs) — never hardcode root-relative `/path`, which 404s at the subpath. Local dev stays at root because the Docker serve command overrides `--baseurl ""`. (There's no custom domain / `CNAME` currently; to add one back, set the Pages custom domain and revert `baseurl`/`url`.)

`EDITING.md` is the non-developer content guide (which `_data` / `_members` files to edit). This file covers the architecture that spans multiple files.

## Running locally

Local Ruby is too old for the `github-pages` gem, so use the bundled **Docker** dev server (defined in `Dockerfile` + `docker-compose.yml`):

```sh
docker compose up           # serves at http://localhost:4000 with --watch + livereload
```

One-shot build / sanity check:

```sh
docker compose run --rm jekyll bundle exec jekyll build --trace
```

(`.claude/launch.json` points the preview tooling at the same `docker compose up` on port 4000.) Do **not** serve the raw repo with a plain static server — the `.html` files are Liquid templates and must be built first.

## Architecture

Five top-level pages (`index/research/members/contact/publications.html`) carry only front matter + page structure. Everything shared is in layouts, includes, data, and one stylesheet.

**Layouts** (`_layouts/`):
- `default.html` — the shell: `<head>` + header + `{{ content }}` + footer + `site.js`. Every page gets it via the `_config.yml` default.
- `page.html` — `default` + a hero rendered from the page's `hero:` front-matter object (see `_includes/page-hero.html`). Used by research/members/contact/publications.
- `member.html` — detail page for one `_members/*` document (auto-applied to the `members` collection).

**Includes** (`_includes/`): `head.html`, `header.html`, `footer.html` (shared chrome); `page-hero.html` (front-matter-driven hero); `research-preview.html`, `news.html`, `join-cta.html` (home/CTA sections); `pi-card.html`, `member-card.html` (people, each takes an `include.*` parameter).

**Content lives in data, not HTML:**
- `_data/publications.json` → rendered **server-side** by Liquid in `publications.html` (`group_by: "year"`, sorted descending). `type` (`journal`/`preprint`/`conf`) drives the colored tag and the JS filter buttons.
- `_data/news.json` → home page, via `_includes/news.html`.
- `_members/*.md` → a Jekyll **collection** (`output: true`, permalink `/people/:name/`). The People page (`members.html`, at `/members/`) lists them; the **PI is distinguished by `badge: Principal Investigator`** (filtered out of the team grid and shown via `pi-card.html`). Each file is front matter only (name, role, initials, gradient, dept, blurb, optional photo/affiliations/links); body markdown, if present, becomes the detail-page bio.

**One stylesheet, one script:**
- `assets/styles.css` is the **single source of truth for all styling** — including the per-page section styles, which were deliberately consolidated here (see the `PAGE SECTIONS` banner comment around line 346). Do **not** re-inline page CSS into `<style>` blocks; add rules here.
- `assets/site.js` (loaded once by `default.html`) owns all client behavior, each guarded so it no-ops where the elements are absent: mobile nav, theme toggle, header shadow, reveal-on-scroll (`window.eissaObserveReveals`), the hero `#net` canvas animation (`initNetwork`), and publication filters (`initFilters`).

**Theming:** light/dark state is in `localStorage['eissa-theme']` + `data-theme` on `<html>`. An inline script in `_includes/head.html` applies it *before* CSS loads (anti-flash); `site.js` only handles the toggle. Colors are CSS custom properties with a `[data-theme="dark"]` override block; the canvas re-reads them on the `eissa:themechange` event.

## Conventions & gotchas

- **Pretty permalinks** (`_config.yml`): pages are at `/research/`, `/publications/`, `/members/`, `/contact/`, members at `/people/<name>/`. Internal links use `{{ '/path/' | relative_url }}`; the `_data/news.json` tag hrefs are root-relative (e.g. `/contact/#join`) — never the old `.html` paths.
- **Publication author emphasis is inline HTML** (`<strong>…</strong>`, `<em>…</em>`) in `publications.json`, because the template prints `{{ pub.authors }}` verbatim. (The old `**markdown**` convention from the pre-Jekyll `render.js` no longer applies.) The `dept` field uses literal `\n`, converted with a Liquid `replace`.
- **JSON data is unvalidated at build time** — a trailing/missing comma can fail the build or silently drop a section. Run the one-shot build above after editing data.
- `_includes/head.html` loads the **Tailwind CDN**, but no markup uses Tailwind utility classes yet — it is currently dead weight (and Tailwind warns against the CDN in production). Remove it or commit to using it.
- The Contact page (`contact.html`) is now just lab contact info — there is no message form. Outreach is by email (`mailto:`) and the Join section's CTA.
- `_site/` is build output (git-ignored); never edit it by hand.
