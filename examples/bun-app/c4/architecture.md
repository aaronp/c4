# Model: bun-app

## Person: User
- slug: user
- uses → app: says hello [HTTP]

## System: bun-app
- slug: app
- desc: A tiny Bun service

### Container: HTTP server
- slug: server
- desc: Answers every request with a greeting
- tech: Bun.serve

# Layout

- user: 96, 96
- app: 96, 352
- app.server: 0, 0
