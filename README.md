# Challenge website

Static project microsite for the AI Beauty Contest 2026 submission.

## Preview

From the repository root:

```bash
python -m http.server 4173 --directory challenge_website
```

Then open `http://localhost:4173`.

## Update submission details

Edit `site-config.js` to set:

- team name and members;
- repository and full-demo links;
- evaluated repository commit;
- final KPI values.

The report and repository-generated media live under `assets/`.
