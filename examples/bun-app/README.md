# bun-app — a Bun project with its own C4 model

A tiny Bun service whose architecture lives beside the code in
[`c4/architecture.md`](c4/architecture.md).

```sh
bun install
bun run c4       # opens c4/architecture.md in the viewer, served from localhost
bun start        # the app itself
```

`bun run c4` uses the [`@pritzlaff/c4`](https://www.npmjs.com/package/@pritzlaff/c4) dev dependency.
Edits in the viewer are written back to `c4/architecture.md` with **File → Save** (Ctrl/⌘+S); edits
to the file show on reload. Commit the file as usual.

No install? `bunx @pritzlaff/c4 c4/architecture.md` does the same.

## Badge and summary card

```sh
make snapshot    # → c4/badge.svg and c4/card.json
```

- `badge.svg` is a status badge for your README:
  `[![Architecture](https://you.github.io/your-app/badge.svg)](https://you.github.io/your-app/)`
- `card.json` is the same summary as data (title, status pill, big number, a count per element kind,
  links) for a dashboard to style as it likes.

Both come from `c4/architecture.md`. To change the title, labels, colours or which counts show, open the
viewer (`bun run c4`), pick **File → Design card…** and **Save** `architecture.card.json` (it lands in
`c4/`), then run `make snapshot` again.

The links in the card and badge open the hosted viewer on your published `architecture.md`
(`…?src=https://you.github.io/your-app/architecture.md`). `make` works out that URL from your `origin`
remote; override it with `make snapshot C4_SRC=<url>`, and point the links at another viewer with
`C4_HOST=<url>` (the same address as `VIEWER` in `c4/index.html`).

## Publishing on GitHub Pages

`.github/workflows/pages.yml` publishes only the `c4/` folder. Its `index.html` redirects to the hosted
viewer with `?src=` pointing at your `architecture.md`, as in [acme-platform](../acme-platform). It also
runs `make snapshot`, so `c4/badge.svg` and `c4/card.json` are published beside it.
On GitHub: Settings → Pages → Source: **GitHub Actions**.

Live copy of this example:
[aaronp.github.io/c4/?src=examples/bun-app/c4/architecture.md](https://aaronp.github.io/c4/?src=examples/bun-app/c4/architecture.md)
