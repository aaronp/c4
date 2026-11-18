# Where the published architecture.md lives. Pages serves c4/ at the site root, so for the GitHub repo
# you/your-app that is https://you.github.io/your-app/architecture.md (worked out from the origin remote).
# The card's links open the viewer with ?src= pointing here. Override: make snapshot C4_SRC=<url>
C4_SRC ?= $(shell git remote get-url origin 2>/dev/null | sed -nE 's|^.*github\.com[:/]([^/]+)/([^/]+)$$|https://\1.github.io/\2/architecture.md|p' | sed 's|\.git/architecture|/architecture|')

.PHONY: snapshot
# Regenerates c4/badge.svg and c4/card.json from c4/architecture.md (and c4/architecture.card.json, if present).
snapshot:
	C4_SRC=$(C4_SRC) bunx c4 badge c4/architecture.md
	C4_SRC=$(C4_SRC) bunx c4 card c4/architecture.md
