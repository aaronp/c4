# C4 markdown format

One markdown file is the whole model: the C4 elements, their relationships and where the boxes sit.
The viewer reads it, draws it, and writes diagram edits back to it.

## Sections

The file is a list of `#` sections, kept in their order:

| Heading | What it holds |
| --- | --- |
| `# Model: <Title>` | **Exactly one.** The C4 model (see below). |
| `# Layout` | Optional. Box positions; written for you when you drag. |
| `# <anything else>` | Prose, kept verbatim. So is any text before the first `#`. |

## The model

Elements nest by heading depth:

| Heading | Kinds | May contain |
| --- | --- | --- |
| `## <Kind>: <Name>` | `Person`, `External Person`, `System`, `External` | Systems and Externals contain containers |
| `### <Kind>: <Name>` | `Container`, `Database`, `Queue` | Containers contain components |
| `#### <Kind>: <Name>` | `Component` | — |

C4 stops at components, so `#####` is an error.

### Theme

```markdown
# Model: Shop
- theme: dark
```

An optional `- theme:` bullet directly under `# Model:` (before the first element) picks the theme:
`light`, `dark`, `blueprint` or `warm`. It is used when the link has no `?theme=`, and wins over the
theme last picked in the browser.

### Bullets under an element

Every `- ` bullet directly under an element heading must be one of these:

| Bullet | Meaning |
| --- | --- |
| `- slug: <id>` | **Required.** Lower-case letters, digits and single hyphens (`order-service`). Unique among siblings. |
| `- desc: <text>` | What it does; shown on the box. |
| `- tech: <text>` | Its technology, shown as `[Container: Java]`. |
| `- <verb> → <path>[: <label>] [<tech>]` | A relationship (`->` also accepted; `→` is written back). |

Each field may appear once per element. Other non-bullet lines under an element are kept as its notes.

### Paths

An element's **path** is its slugs joined with dots, e.g. `trading.orders.gateway`.
Relationships and the layout refer to elements by path, so renaming an element never breaks them
(changing a slug in the viewer rewrites every path that uses it).

### Relationships

```markdown
- calls → trading.orders.gateway: places orders [REST/HTTPS]
```

- `calls` is the verb; it is shown on the line when there is no label.
- `trading.orders.gateway` is the target path. It must exist, and cannot be the element itself, its
  parent or its child (the boundary already shows that).
- `: places orders` (label) and `[REST/HTTPS]` (technology) are optional. Neither may contain `[` or `]`.

A relationship is drawn between whatever boxes currently stand for its two ends: when a container is
collapsed, relationships to its components roll up to it, and several that share the same two boxes
are drawn as one line ("3 relationships").

## Layout

```markdown
# Layout

- trading: 416, 352
- trading.orders: 0, 0
```

One `- <path>: <x>, <y>` line per positioned element. Top-level elements are in canvas pixels;
nested elements are in pixels inside their parent's boundary, so moving a parent moves everything
in it. Each path may appear once and must be in the model. Elements without a line are placed
automatically and flagged **auto** until you drag them.

## Rules the viewer keeps

- Typing in the markdown never rewrites it. A diagram edit rewrites the file in the canonical form
  (as in the examples here); prose, notes and section order are kept.
- A parse error is shown with its line number. The diagram shows the last valid version and
  editing it pauses until the error is fixed, so a broken file is never overwritten.
- Code fences (```` ``` ```` or `~~~`) are kept verbatim wherever they appear, and must be closed.

## Minimal example

```markdown
# Model: Shop

## Person: Customer
- slug: customer
- uses → shop: buys things [HTTPS]

## System: Shop
- slug: shop
```

## Complete example

[`examples/acme-platform/architecture.md`](examples/acme-platform/architecture.md) uses every
element kind, nested relationships that roll up, and a layout. It is also the viewer's built-in sample.
