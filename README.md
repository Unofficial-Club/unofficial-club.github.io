# The Unofficial Club — website

A plain HTML/CSS/JS site, built to publish straight from GitHub Pages with
no build step. Four pages: **Welcome** (`index.html`), **Schedule**
(`schedule.html`), **Records** (`records.html`), and **Resources**
(`resources.html`).

## Publish it on GitHub Pages

1. Create a new repository on GitHub (or use an existing one) and push
   everything in this folder to it, e.g.:
   ```
   git init
   git add .
   git commit -m "Unofficial Club site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. On GitHub, go to the repo's **Settings → Pages**.
3. Under "Build and deployment", set **Source** to "Deploy from a branch",
   pick the `main` branch and the `/ (root)` folder, then save.
4. GitHub gives you a URL like `https://<your-username>.github.io/<your-repo>/`
   within a minute or two. That's the whole deploy — no build step, no CI.

Any time you push a new commit to `main`, the live site updates automatically.

## Updating this week's and next week's meeting

The homepage's "Next up" section and the Schedule page both show the
same two cards — "This week" and "Next week" — pulled from a single
file: `assets/data/meetings.json`. Edit that one file and both pages
update together, so they can't drift out of sync:

```json
[
  {
    "label": "This week",
    "hue": "blue",
    "when": "Thu, Sept 4 · 6:00 PM",
    "location": "Fondren Science 154"
  },
  {
    "label": "Next week",
    "hue": "coral",
    "when": "Thu, Sept 11 · 6:00 PM",
    "location": "Fondren Science 154"
  }
]
```

`when` is plain text — write the date and time however you want it to
read, no particular format required. `hue` controls the card's color
(`blue` or `coral`); leave the `label`s as "This week" / "Next week"
unless you want different wording on both pages at once.

There's no separate listing of individual talk topics anymore, since
the lineup isn't decided until the session starts.

## Adding a recording to the archive

Open `assets/data/records.json` and add an entry:

```json
{
  "title": "Talk title",
  "presenter": "Presenter name",
  "date": "2026-10-12",
  "duration": "17 min",
  "tags": ["Biology", "Engineering"],
  "abstract": "One or two sentences on what the talk covers.",
  "video_url": "https://youtube.com/your-video-link"
}
```

`video_url` can point anywhere watchable — a YouTube/Vimeo link, a
Google Drive share link, whatever the club actually uses to host video.

## Adding a student-made resource

Open `assets/data/resources.json` and add an entry:

```json
{
  "title": "Resource title",
  "kind": "Notes",
  "contributor": "Their name",
  "tags": ["Physics", "Engineering"],
  "description": "One or two sentences on what it is and why it's useful.",
  "url": "https://link-to-the-actual-thing"
}
```

`kind` drives which icon shows up — use `Notes`, `Code`, `Slides`,
`Template`, or anything else (unrecognized kinds get a generic document
icon). A few of these show up on the homepage automatically; the full set
lives on the Resources page.

## About the tags

Tags are free text — use whatever labels make sense (`Physics`,
`Engineering`, `CS`, `Bio`, `Math`, `Chem`, whatever comes up). The
filter buttons on the Records and Resources pages are generated
automatically from whatever tags exist in the data, so there's no
separate list to maintain.

Each card also gets a small colored pin, computed automatically from its
tags: blue for a "pure science" talk (physics, math, chemistry, biology,
astronomy), red for an applied/engineering talk (engineering, CS, ML,
robotics), and purple for a talk tagged with both — the interdisciplinary
ones. That mapping lives in `assets/main.js` near the top
(`SCIENCE_TAGS` / `APPLIED_TAGS`) if you want to extend it.

## Changing contact info

The contact email (`hello@unofficialclub.org`) is a placeholder — search
for it across the HTML files (it's in every page's footer) and swap in a
real address or form link.

## Local preview

Because the pages fetch the `.json` data files, opening `index.html`
directly from disk (`file://`) will fail silently in most browsers. This
folder includes a tiny zero-dependency server for that — no `npm install`
needed, just:

```
node server.js
```

or, if you'd rather type the habitual command:

```
npm start
```

Either way, visit `http://localhost:3000` and stop it with Ctrl+C.
`server.js` is only for previewing on your own machine — once the site is
pushed to GitHub Pages, GitHub serves the static files directly and this
file isn't used at all.
