PORT ?= 8000

.PHONY: dev test
# No build step: serves this folder as GitHub Pages will (so ?src=examples/... works).
dev:
	@echo "Viewer:  http://localhost:$(PORT)/Main.dc.html"
	@echo "Example: http://localhost:$(PORT)/Main.dc.html?src=examples/acme-platform/architecture.md"
	@python3 -m http.server $(PORT) --bind 127.0.0.1

test:
	node check.mjs
