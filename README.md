# C4 viewer

C4 architecture diagrams driven by **one markdown file**: people, systems, containers, components,
their relationships and the layout. Edit the markdown or the diagram; each updates the other.

**[▶ Open the viewer](https://aaronp.github.io/c4/)** ·
[Acme example](https://aaronp.github.io/c4/?src=examples/acme-platform/architecture.md)

## Adding it to your project

From your project's root (Bun shown; `npm i -D`, `npm pkg set` and `npm run` work the same):

```sh
bun add -d @pritzlaff/c4
bun pm pkg set scripts.c4="c4 docs/architecture/c4.md"
mkdir -p docs/architecture
cat > docs/architecture/c4.md <<'EOF'
# Model: My app

## Person: Customer
- slug: customer
- uses → app.web: places orders [HTTPS]

## System: My app
- slug: app
- desc: What the team builds and runs

### Container: Web app
- slug: web
- tech: TypeScript, Bun
- tags: frontend
- reads → app.db: orders [SQL]
- calls → payments: takes payments [REST/HTTPS]

### Database: Orders DB
- slug: db
- tech: Postgres

## External: Payments provider
- slug: payments
EOF
bun run c4    # opens it on localhost
```

**File → Save** writes diagram and markdown edits back to `docs/architecture/c4.md`; commit it like any
other source. Boxes without a `# Layout` line are placed automatically until you drag them, and the
viewer writes their positions back. The full format is in **[spec.md](spec.md)**, also published at <https://aaronp.github.io/c4/spec.md> and shipped in the package as `node_modules/@pritzlaff/c4/spec.md`, so people and agents working in your repo can read the version they run.

`c4 card docs/architecture/c4.md` and `c4 badge docs/architecture/c4.md` write `card.json` and
`badge.svg` beside it, for a dashboard or a README badge ([Card and badge](#card-and-badge)).
To publish it on GitHub Pages as well, copy `c4/index.html` and `.github/workflows/pages.yml` from
[examples/bun-app](examples/bun-app), which is this setup end to end with the file in `c4/`
(change that path in the workflow to match yours).
[aaronp/template](https://github.com/aaronp/template) is a project with this and its sibling tools (goals, architecture, decisions, risks, schedule, delivery) set up together behind one dashboard.

- **Source / Split / Chart** views; **Edit** (drag, connect, inspector) or **Present** mode.
- Expand a system or container to drill in; relationships roll up to whatever is visible.
- Search and tag filter: matches are highlighted (dashed when hidden inside a collapsed box); pick one to expand to it.
- File menu: **Open** (drop a file, choose one, or a URL), **Save** (Ctrl/⌘+S: writes back to the file
  when served by the [`c4` CLI](#the-c4-cli), else straight to a file in Chromium browsers, else downloads),
  **Download**, **Copy link** (a link that carries the whole model) and **Design card…** (see
  [Card and badge](#card-and-badge)).
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
| `#data=<packed>` | A model carried in the link itself (File → Copy link): the markdown, deflated and base64url-encoded. Not autosaved either. The other settings below still apply. |

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
make dev     # the c4 CLI on http://localhost:8000/ with the Acme example; File → Save writes it back
make test    # node check.mjs: parser round-trip, query string, card/badge and share links
```

There is no build step. Some browsers block the scripts over `file://`, so use `make dev`.

## The `c4` CLI

```sh
bunx @pritzlaff/c4 architecture.md   # or npx; no install needed
```

It serves the viewer and that file on localhost (loopback only) and opens the browser. The file is
re-read on each reload, and **File → Save** (Ctrl/⌘+S) writes your edits back to it.
`PORT=8000` fixes the port; `NO_OPEN=1` skips opening a browser. The package has no dependencies: it is
`bin/c4.mjs` plus the viewer files, and it uses the viewer's own parser from `Main.dc.html`.

### Card and badge

```sh
c4 card architecture.md [out-dir]    # → card.json: the model as a dashboard card (data only)
c4 badge architecture.md [out-dir]   # → badge.svg: drawn from the same card
```

`card.json` is tool-neutral data (title, a status pill, a big number, a legend with a count per element
kind and for relationships, a source link) for a dashboard to style as it likes. The pill says how many
elements are not yet placed in `# Layout`. What the card says (title, legend labels, colours, order, the
big number) comes from an optional `architecture.card.json` beside the markdown (format in
[spec.md](spec.md#card-settings)). Design it in the viewer with **File → Design card…**, which previews
the card and badge and saves the file (when served by `c4`), downloads it, or keeps it in the browser.

Links in the card open the viewer at `C4_HOST` (default `https://aaronp.github.io/c4/`) on `C4_SRC`
(where your published markdown lives, default the path given); set both as environment variables. The
Pages workflows here and in [examples/bun-app](examples/bun-app) regenerate both files on every push
(`make card` here, `make snapshot` there), so a README can embed the live badge:

```md
[![Architecture](https://you.github.io/your-app/badge.svg)](https://you.github.io/your-app/)
```

### Releasing

```sh
make bump-patch    # or bump-minor / bump-major: npm version, which commits and tags v<version>
make publish       # make test, then npm publish
make dist          # the same package as a local .tgz, without publishing
```

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
| `bin/c4.mjs`, `package.json` | The `c4` CLI and the npm package (`@pritzlaff/c4`) |
| `spec.md` | The markdown format |
| `examples/acme-platform/` | A cloneable data-only repo that points back at this viewer |
| `examples/bun-app/` | A Bun project with its own `c4/architecture.md`: `bun run c4` opens it locally, Pages publishes it |
