# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing/research website for the **Eissa Lab** (cognition / computation / neuroscience, CU Anschutz). Plain HTML + CSS + vanilla JS with **no build step, no framework, no package manager, and no tests**. It is served as-is by GitHub Pages at `eissalab.com` (custom domain set via `CNAME`; `.nojekyll` disables Jekyll processing).

`EDITING.md` is the content-editor's guide (written for non-developers) — read it for the exact JSON field meanings and the Formspree/GitHub Pages setup steps. This file covers the parts that require reading across multiple files.

## Running locally

There is nothing to build. But you **cannot** just open the HTML files via `file://` — the People, Publications, and News sections fetch JSON at runtime and browsers block `fetch()` over `file://`, leaving those sections blank (the code shows a "couldn't load" message). Always run a server:

```sh
python3 -m http.server   # then open http://localhost:8000
```

Layout, styling, nav, theme toggle, and the hero animation work fine over `file://`; only the data-driven sections need the server.

## Architecture: data-driven content rendering

The central pattern is that **frequently-changing content is not in the HTML**. Pages ship with empty mount-point elements; `assets/render.js` fetches JSON from `assets/data/` and injects the HTML client-side. Editing content means editing JSON only — never the HTML.

The contract between the three layers (break any link and the section silently fails):

| Data file (`assets/data/`) | Rendered by `render.js` into element ID | Lives on page |
| --- | --- | --- |
| `news.json` (array) | `#news-mount` | `index.html` |
| `members.json` (`{pi, members}`) | `#pi-mount`, `#team-grid` | `members.html` |
| `publications.json` (`{entries}`) | `#pubs-mount` | `publications.html` |

`render.js` runs all three blocks unconditionally but each is guarded by an `if (mount)` check, so a single shared script works across pages — the mount IDs present on a given page decide what renders. `research.html` and `contact.html` have no data mounts (fully static).

Rendering details worth knowing before editing JSON or `render.js`:
- **Publications** are grouped and sorted by `year` descending in code, so order in the file is irrelevant. `type` (`journal`/`preprint`/`conf`) drives both the colored tag and the filter buttons (`initFilters()` toggles `.pub` visibility by `data-type`).
- **`authors`** field supports inline markup: `**bold**` → `<strong>`, `*italic*` → `<em>` via `rich()`. The `dept` field supports `\n` → `<br>` via `nl()`. All other fields are HTML-escaped.
- **Members/PI** show colored initials placeholders until `photo` is set to a real path (e.g. `assets/photos/name.jpg` — that folder doesn't exist yet; create it when adding photos).
- The team grid inserts member cards *before* the static `#join-card` element, so that card must stay last in the HTML.

## Architecture: shared behavior & theming

`assets/site.js` is loaded on every page and wires up cross-page behavior:
- **Mobile nav toggle**, **header shadow on scroll**.
- **Theme (light/dark)**: state lives in `localStorage['eissa-theme']` and as `data-theme="dark"` on `<html>`. To avoid a flash, an **inline `<script>` in each page's `<head>`** applies the saved/preferred theme *before* CSS loads — `site.js` only handles the toggle button afterward. All colors are CSS custom properties in `assets/styles.css` with a `[data-theme="dark"]` override block; the hero canvas re-reads them on a `eissa:themechange` event.
- **Reveal-on-scroll animations**: `site.js` exposes a global `window.eissaObserveReveals(scope)`. `render.js` must call it (via its local `observe()`) after injecting content so dynamically-added `.reveal` elements animate too. New animated content needs the `reveal` class plus optional `d1`–`d4` stagger classes.

The hero "decision network" canvas animation (`#net` on the home page) is `initNetwork()` in `site.js` — a self-contained forward-pass / decision visualization. It respects `prefers-reduced-motion` (renders a single static resolved frame).

## Editing conventions

- **JSON is hand-edited and unvalidated at build time** — a missing comma or trailing comma silently breaks the whole section at runtime. After editing a data file, paste it into a JSON validator or load the local server and check the section renders.
- Each HTML page is self-contained: header, footer, and page-specific `<style>` blocks are duplicated inline per page rather than shared. A nav/footer change must be applied to all five pages.
- The contact form (`contact.html`) posts to Formspree. The placeholder action `https://formspree.io/f/your-form-id` keeps it in "demo" mode; the page JS detects the literal `your-form-id` string to decide demo vs. live, so replacing it is what activates real submissions.

## Not a git repo (yet)

This working copy is not initialized as a git repository. Publishing (per `EDITING.md`) is: push to GitHub with `index.html` at the repo root → Settings → Pages → deploy from `main` / root.
