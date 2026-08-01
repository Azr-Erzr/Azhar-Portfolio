# Azhar Moolla — Personal Portfolio

A static, zero-dependency portfolio site. No build step — just HTML, CSS, and vanilla JS, ready for GitHub Pages.

## Structure

```
azhar-portfolio/
|-- index.html      # all content
|-- styles.css      # design system + responsive layout
|-- script.js       # mobile nav, scroll reveal, gallery lightbox
`-- assets/img/     # live-site screenshots + work sample renders
```

## Run locally

Open `index.html` in a browser, or serve it:

```bash
python -m http.server 8000
```

## Deploy (GitHub Pages — free)

1. Create a repo (e.g. `azharmoolla.github.io` for a root domain, or any repo name for a subpath).
2. Push these files to `main`.
3. Repo **Settings → Pages → Deploy from a branch → main / root**.
4. Live in ~1 minute at `https://<username>.github.io/<repo>/`.

## Updating content

- **Projects**: edit the `<article class="project">` blocks in `index.html`.
- **Screenshots**: replace files in `assets/img/` (keep filenames, or update the `src` attributes).
- **Work samples**: gallery images are rendered pages from the work-sample PDFs; captions live in each `<figcaption>`.
