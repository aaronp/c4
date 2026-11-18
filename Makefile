PORT ?= 8000

.PHONY: dev test card dist publish bump-patch bump-minor bump-major
# No build step. Serves the viewer with the example through the `c4` CLI, so File → Save writes it back.
dev:
	@PORT=$(PORT) NO_OPEN=1 node bin/c4.mjs examples/acme-platform/architecture.md

test:
	node check.mjs

# → examples/acme-platform/card.json and badge.svg (as the Pages workflow publishes them)
card:
	node bin/c4.mjs card examples/acme-platform/architecture.md
	node bin/c4.mjs badge examples/acme-platform/architecture.md

# Packs the `c4` CLI into pritzlaff-c4-<version>.tgz (install with: npm i -D ./pritzlaff-c4-*.tgz)
dist: test
	npm pack

# Bumps package.json, commits and tags v<version> (needs a clean tree)
bump-patch bump-minor bump-major:
	npm version $(@:bump-%=%)

# Publishes @pritzlaff/c4 to npm. Bump first: make bump-patch|bump-minor|bump-major
publish: test
	npm publish
