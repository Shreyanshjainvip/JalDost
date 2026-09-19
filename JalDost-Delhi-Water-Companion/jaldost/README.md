# JalDost — Delhi Water Companion

A mobile-first civic-tech prototype for the SchoolNet India hackathon. JalDost turns practical, self-reported water-saving actions into a visible daily habit.

## Run locally

Serve the directory with any static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Architecture

- `index.html` — semantic Landing Page and Dashboard templates
- `styles.css` — reusable tokens, components and responsive layouts
- `js/data.js` — structured actions and milestone configuration
- `js/store.js` — persistence and domain state transitions
- `js/app.js` — routing, rendering, dialogs, notifications and interactions

The project intentionally uses zero runtime dependencies. State is stored locally for the prototype, while UI, domain data and persistence are separated so the store can later be replaced by Firebase-backed repositories.

## Trust model

Savings are always labeled as estimates. The prototype records self-reported actions; it does not claim sensor measurement. Each configured action can carry an assumption, evidence source, confidence level and review date.

For a production Firebase build, XP, streaks, cumulative savings and leaderboard totals should be calculated through controlled server-side logic rather than trusted client writes. Firestore rules should limit users to their own permitted records.

## Prototype QA

The primary flow covers landing → dashboard → action confirmation → immediate XP, estimated-savings and progress updates. Duplicate daily completion is prevented. Layouts support desktop, tablet and mobile; controls include keyboard focus states, semantic labels and reduced-motion handling.
