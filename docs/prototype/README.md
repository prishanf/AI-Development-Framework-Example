# Design prototype (clickable)

Open Design–informed clickable review surface for `docs/design/income-expense-tracker.md`.

- Skill: `frontend-design`
- Design system: `cal` (Cal.com monochrome)
- OD project: `income-expense-tracker-prototype` ([studio](http://127.0.0.1:5175/projects/income-expense-tracker-prototype/conversations/cf4931e1-b9ea-4917-8f7b-b78fe6dcd353))

> Note: Open Design agent runs failed on this machine (Claude spending cap until ~10:30pm; Gemini unauthenticated; Copilot CLI missing). The prototype was implemented here by applying the same `frontend-design` + `cal` craft guidance locally so review can continue.

## Layout

```text
docs/prototype/
  index.html
  month.html
  year.html
  css/styles.css
  js/store.js
  js/month.js
  js/year.js
  data/seed.json
  README.md
```

## Run with Live Server

Serve **this folder** over HTTP (required for `fetch('./data/seed.json')`).

### VS Code / Cursor Live Server

1. Right-click `docs/prototype/index.html`
2. **Open with Live Server**

### Python

```bash
cd docs/prototype
python3 -m http.server 5500
```

Open [http://127.0.0.1:5500/](http://127.0.0.1:5500/).

## What to exercise

- **Add item under a category** in Manage categories & items
- Archive / unarchive category and item
- Bulk grid Type → Category → Item cascade; blank rows skipped
- Year view pivots and month links
- Reset fixture
