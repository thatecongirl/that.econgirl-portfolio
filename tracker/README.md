# Commodity Tracker — setup

1. Get a free API key at https://metals.dev (free tier covers this easily —
   one call a day).
2. In the GitHub repo: **Settings → Secrets and variables → Actions → New
   repository secret**, name it `METALS_API_KEY`, paste the key.
3. Push these files (`tracker/`, `data/`, `scripts/`,
   `.github/workflows/update-prices.yml`) to the repo.
4. The workflow runs automatically once a day and commits the refreshed
   `data/prices.json`. To trigger it immediately the first time: go to the
   **Actions** tab → **Update commodity prices** → **Run workflow**.
5. Visit `https://<username>.github.io/<repo>/tracker/` once GitHub Pages
   has rebuilt.

The "Was I Right?" log is saved in the browser's local storage — it's
personal to whichever device/browser you're using, not synced anywhere.
