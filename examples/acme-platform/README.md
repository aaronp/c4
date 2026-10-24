# Acme — architecture

**[▶ View the model](https://aaronp.github.io/c4-example/)**

The model lives in [`architecture.md`](architecture.md) ([format](https://github.com/aaronp/c4/blob/main/spec.md)).
The UI comes from [aaronp/c4](https://github.com/aaronp/c4).

## Using this as a template

1. Create an empty repo on GitHub, then from this directory run
   `make clone REPO=you/your-repo` (or `./clone.sh`, which prompts).
   It copies the files to `../your-repo`, points the View link above at
   your Pages site and sets the git remote.
2. Edit `architecture.md` (or edit it in the viewer and Save / Download it),
   then commit and push.
3. On GitHub: Settings → Pages → Source: **GitHub Actions**.

The workflow deploys from `main` or `master`. "Branch … is not allowed to
deploy to github-pages"? Add your branch under Settings → Environments →
github-pages → Deployment branches and tags.

Your site redirects to the viewer with `?src=` pointing at your `architecture.md`.
Any query params you add are passed on, e.g. `?view=split&theme=dark` or
`?mode=present&sel=trading.orders`.

No Pages? Link straight to the raw file:
`https://aaronp.github.io/c4/?src=https://raw.githubusercontent.com/<you>/<repo>/<branch>/architecture.md`
