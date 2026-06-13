# Editing the Eissa Lab website

This site is plain HTML/CSS/JS — **no build step, no framework**. It runs as-is on
GitHub Pages. The content that changes often (people, publications, news) lives in
small JSON files you can edit directly on GitHub, without touching any HTML.

```
index.html            Home
research.html         Research themes
publications.html     Publications (renders from data)
members.html          People (renders from data)
contact.html          Contact + Join us (Formspree form)
assets/
  styles.css          All styling / colors / fonts
  site.js             Nav, scroll animations, hero visual
  render.js           Builds people/pubs/news from the JSON files
  data/
    members.json      ← edit to manage people
    publications.json ← edit to manage publications
    news.json         ← edit to manage announcements
.nojekyll             Tells GitHub Pages to serve files as-is
CNAME                 Custom domain (eissalab.com)
```

---

## 1. Managing content (the common stuff)

All three data files are plain JSON. Rules: keep the quotes and commas, and **no
trailing comma** after the last item in a list. If something breaks, that's almost
always a missing comma or quote — paste the file into <https://jsonlint.com> to check.

### People — `assets/data/members.json`

The PI block plus a `members` list. To add a member, copy one `{ … }` block and
edit it (remember the comma between blocks):

```json
{
  "name": "First Last",
  "role": "PhD Student",
  "initials": "FL",
  "photo": "",
  "gradient": "a",
  "dept": "Department of X\nUniversity of Colorado Anschutz",
  "blurb": "One sentence on what they work on."
}
```

- `initials` — shown on the colored placeholder tile until a photo is added.
- `photo` — leave `""` for the placeholder, **or** add a photo (see §2) and put its
  path here, e.g. `"assets/photos/first-last.jpg"`.
- `gradient` — `"a"` (blue), `"b"` (indigo), or `"c"` (teal). Just for variety.
- `dept` — use `\n` for a line break.

### Publications — `assets/data/publications.json`

Each entry has a `year`, a `type`, a `title`, `authors`, and `links`. Entries are
grouped and sorted by year automatically — order in the file doesn't matter.

```json
{
  "year": 2025,
  "type": "journal",
  "title": "The full paper title.",
  "authors": "Author A., **Eissa T.**, Author C. \u00b7 *Journal Name* \u00b7 2025",
  "links": [
    { "label": "PDF", "href": "https://..." },
    { "label": "DOI", "href": "https://doi.org/..." }
  ]
}
```

- `type` — `"journal"`, `"preprint"`, or `"conf"` (drives the colored tag + the
  filter buttons).
- `authors` — wrap text in `**double asterisks**` for **bold** (e.g. the lab
  member) and `*single asterisks*` for *italics* (e.g. the venue).
- `links` — add as many as you like; drop the array or leave it `[]` for none.

> The four entries currently in the file are **placeholders**. Replace them with
> real papers (or send me a Google Scholar / BibTeX export and I'll fill them in).

### News — `assets/data/news.json`

A simple list, newest first. The home page shows them in order.

```json
{
  "date": "JUN 2026",
  "title": "Headline of the announcement",
  "body": "A sentence or two of detail.",
  "tag": { "label": "Award", "href": "research.html" }
}
```

`tag` is the little pill on the right — set `"tag": null` to omit it.

---

## 2. Adding real photos

1. Create a folder `assets/photos/` and put image files in it (square-ish crops work
   best; ~800px is plenty).
2. In `members.json`, set the member's `"photo"` to that path, e.g.
   `"photo": "assets/photos/tahra-eissa.jpg"`.

That's it — the colored initials tile is replaced by the photo automatically.

---

## 3. The contact form (Formspree)

The form on `contact.html` is wired for [Formspree](https://formspree.io) (free tier
available, works on static hosts).

1. Sign up at formspree.io and create a form — you'll get an endpoint like
   `https://formspree.io/f/abcdwxyz`.
2. In `contact.html`, find this line and replace `your-form-id`:

   ```html
   <form ... action="https://formspree.io/f/your-form-id" method="POST" ...>
   ```

3. Done. Submissions are emailed to you; the page shows a success message in place.

Until you do this, the form stays in "demo" mode and politely points people to the
email address. (Alternatives: Getform, Basin — any of them work; just swap the
`action` URL.)

---

## 4. Publishing on GitHub Pages

1. Create a repository and push these files with **`index.html` at the root**.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. Wait a minute; your site is live at `https://<username>.github.io/<repo>/`.

### Custom domain (eissalab.com)
The included `CNAME` file points the site at `eissalab.com`. To use it, add these DNS
records at your domain registrar:

- Four `A` records for the apex domain → `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153`
- (optional) a `CNAME` record for `www` → `<username>.github.io`

Then tick **Enforce HTTPS** in Settings → Pages. **If you're not using a custom
domain yet, just delete the `CNAME` file.**

---

## 5. Previewing locally

Because the pages load the JSON data files, opening them by double-clicking
(`file://…`) will leave People/Publications/News blank — browsers block local data
loads. Two easy ways around it:

- Just push to GitHub and view the live Pages site, **or**
- Run a tiny local server in this folder:
  `python3 -m http.server` then open <http://localhost:8000>.

Everything else (layout, styling, navigation) works fine offline either way.
