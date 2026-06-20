# Editing the Eissa Lab website

This site is built with **Jekyll** and published on **GitHub Pages**. The content
that changes often (people, publications, news) lives in small data files you can
edit directly on GitHub — no HTML or Liquid required.

```
index.html            Home          ┐
research.html         Research      │ page structure only (front matter + content);
publications.html     Publications  │ all styling is in assets/styles.css
members.html          People        │
contact.html          Contact       ┘
_data/
  publications.json   ← edit to manage publications
  news.json           ← edit to manage announcements
_members/
  *.md                ← one file per person (edit to manage people)
_includes/            shared header, footer, hero, cards (rarely touched)
_layouts/             page templates (rarely touched)
assets/
  styles.css          ALL styling / colors / fonts (one file)
  site.js             nav, theme toggle, scroll animations, hero visual, filters
_config.yml           site settings (incl. baseurl /eissalab.com)
```

---

## 1. People — `_members/`

Each person is one Markdown file in `_members/` (the filename becomes the page URL,
e.g. `arindrajit-paul.md` → `/people/arindrajit-paul/`). To **add a member**, copy an
existing file and edit its front matter:

```yaml
---
name: First Last
role: PhD Student
initials: FL
photo: ""            # "" = colored initials tile, or "assets/photos/first-last.jpg"
gradient: a          # tile color: a (blue), b (indigo), c (teal)
dept: "Department of X\nUniversity of Colorado"   # \n = line break
blurb: "One sentence on what they work on."
---
```

- The **PI** is whichever file has `badge: Principal Investigator` — it gets the large
  card and is automatically left out of the team grid. The PI file also has `title`,
  `affiliations:` (a list), and `links:` (label/href pairs).
- Anything you write *below* the `---` (Markdown) becomes a bio on that person's detail page.

## 2. Publications — `_data/publications.json`

Each entry has a `year`, `type`, `title`, `authors`, and `links`. Entries are grouped
and sorted by year automatically — order in the file doesn't matter.

```json
{
  "year": 2025,
  "type": "publications",
  "title": "The full paper title.",
  "authors": "<strong>Eissa T.</strong>, Author B. · <em>Journal Name</em> · 2025",
  "links": [
    { "label": "PDF", "href": "https://..." },
    { "label": "DOI", "href": "https://doi.org/..." }
  ]
}
```

- `type` — `"publications"` or `"preprint"` (sets the colored tag + the filter buttons).
- `authors` — use `<strong>…</strong>` for **bold** (e.g. the lab member) and `<em>…</em>`
  for *italics* (e.g. the venue). The `·` characters are just separators.
- `links` — add as many as you like; use `[]` for none.

## 3. News — `_data/news.json`

A list, newest first. The home page shows them in order.

```json
{
  "date": "JUN 2026",
  "title": "Headline of the announcement",
  "body": "A sentence or two of detail.",
  "tag": { "label": "Award", "href": "/research/" }
}
```

`tag` is the little pill on the right — set `"tag": null` to omit it. Internal `href`s
are root-relative (`/research/`, `/contact/#join`, `/members/`).

> **JSON tip:** keep the quotes and commas, and **no trailing comma** after the last item
> in a list. A stray comma can break the build — paste into <https://jsonlint.com> to check.

---

## 4. Adding real photos

1. Put image files in `assets/photos/`.
2. Set that person's `photo:` to the path, e.g. `photo: "assets/photos/tahra-eissa.jpg"`.

The colored initials tile is replaced by the photo automatically.

### Photo specs (head shots)

The **same file** is shown in more than one frame, and the site always fills the
frame and crops the rest, anchored to the **top‑centre** (so heads are never cut off):

| Where it appears            | Frame shape        |
| --------------------------- | ------------------ |
| Team grid card (`/members/`)| **square** (1 : 1) |
| PI card + every detail page | **portrait** (4 : 5)|

So shoot/crop for a portrait that also survives a square crop:

- **Aspect ratio:** portrait **4 : 5** is ideal (e.g. `1000 × 1250`). A **square** photo
  also works — it just shows in full on the card and is trimmed to 4 : 5 on the detail page.
- **Framing:** head‑and‑shoulders, face centred left‑to‑right, with a little headroom
  above the hair. Keep the face in the **upper two‑thirds** — the bottom is what gets
  cropped in the square card, so don't put anything important down there.
- **Size:** about **1000–1200 px** on the long edge is plenty (≈ `1000 × 1250`). Bigger
  just makes the page slower; please **down‑size very large originals** (a 10–20 MP phone
  photo is far more than needed) and aim for **under ~400 KB**.
- **Format:** **JPG** for photos. Use PNG only if you genuinely need transparency.
- **Filename:** lowercase, hyphenated, matching the person, e.g. `tahra-eissa.jpg`.

## 5. Previewing locally

The pages are Jekyll templates, so you can't just open them in a browser — they must be
built. The easiest way is Docker (no Ruby setup needed):

```sh
docker compose up      # then open http://localhost:4000
```

Edits to content/data are picked up automatically (livereload). To stop, press Ctrl-C.

## 6. Publishing

Push to the GitHub repository's default branch — the GitHub Actions workflow
(`.github/workflows/jekyll.yml`) builds and deploys automatically (no `_site` to commit).
The site is served at **https://bamr87.github.io/eissalab.com/**.

To put it back on a custom domain (`eissalab.com`): point the domain's DNS at GitHub Pages,
set the custom domain under **Settings → Pages**, and change `baseurl` back to `""` (and `url`
to `https://eissalab.com`) in `_config.yml`.
