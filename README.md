# C4 viewer

C4 architecture diagrams driven by **one markdown file**: people, systems, containers, components,
their relationships and the layout. Edit the markdown or the diagram; each updates the other.

**[▶ Open the viewer](https://aaronp.github.io/c4/)** ·
[Acme example](https://aaronp.github.io/c4/?src=examples/acme-platform/architecture.md)

- **Source / Split / Chart** views; **Edit** (drag, connect, inspector) or **Present** mode.
- Expand a system or container to drill in; relationships roll up to whatever is visible.
- Button bar: **Open** (drop a file, choose one, or a URL), **Download**, **Save**
  (writes straight to a file in Chromium browsers, Ctrl/⌘+S; elsewhere it downloads).
  The source pane has its own **Copy to clipboard** button.
- Four themes: Light, Dark, Blueprint and Warm.
- Split view has a draggable divider (arrow keys too; double-click resets), remembered in the browser.
- Undo/redo across markdown and diagram edits.

Changes are autosaved in this browser (localStorage). **The saved/downloaded `.md` is the real
copy**: keep it in git next to your code.

## The file format

The full format, with a minimal and a complete example, is in **[spec.md](spec.md)**.

```markdown
# Model: Shop

## Person: Customer
- slug: customer
- uses → shop: buys things [HTTPS]

## System: Shop
- slug: shop
```

## Links and settings

| Query | Shows |
| --- | --- |
| _(none)_ | The file saved in this browser, or the built-in sample. |
| `?src=<url>` | That markdown file (absolute, or relative to the page). It is not autosaved, so it never overwrites your saved file. |

Add any of these to choose what shows (unknown values are ignored):

| Query | Values |
| --- | --- |
| `view` | `chart` (default), `split`, `source` |
| `mode` | `edit` (default), `present` |
| `theme` | `light` (default), `dark`, `blueprint`, `warm`; wins over the markdown's `- theme:` and the theme saved in the browser |
| `sel` | An element path, e.g. `trading.orders.gateway`: selects it and expands what contains it |
| `open` | Comma-separated paths to expand, e.g. `broker,trading` |
| `zoom` | `0.3` to `2` (default `1`) |

The address bar follows along, so it is always a shareable link, and Back/Forward step between
views, modes and selections. Sources on another host must allow CORS (GitHub Pages and
raw.githubusercontent.com do).

## Viewing locally

```sh
make dev     # serves this folder on http://localhost:8000/ (python3) and prints the example's URL
make test    # node check.mjs: parser round-trip and query-string handling
```

There is no build step. Some browsers block the scripts over `file://`, so use `make dev`.

## Hosting

`.github/workflows/pages.yml` runs the check on pushes to `main` or `master`, then publishes
`Main.dc.html` as `index.html` with `examples/` beside it (Settings → Pages → Source:
**GitHub Actions**; the `github-pages` environment must allow your branch). `.md` files are
served raw, without Jekyll.

## Publishing your own model

Your model lives in its own data-only repo (`architecture.md`, a redirecting `index.html` and a
Pages workflow); this repo stays the viewer. Create an empty repo on GitHub, then:

```sh
cd examples/acme-platform
make clone REPO=you/your-architecture    # or ./clone.sh to be prompted
```

This copies the example to `../your-architecture` as a fresh repo on `main`, points its README link
at `https://you.github.io/your-architecture/` and sets the `origin` remote. Commit, push, and set
Settings → Pages → Source: **GitHub Actions**. Your site redirects here with `?src=` pointing at
your `architecture.md`.

## Layout

| Path | What |
| --- | --- |
| `Main.dc.html` | The whole app: markup, styles (theme tokens on `:root[data-theme]`) and the component logic. Originally a design-tool export; the inline styles carry the design values |
| `support.js`, `vendor/react*.js` | The runtime that renders the component; not edited |
| `check.mjs` | Smoke test run by `make test` and CI |
| `spec.md` | The markdown format |
| `examples/acme-platform/` | A cloneable data-only repo that points back at this viewer |
