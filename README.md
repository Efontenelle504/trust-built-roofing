# Trust Built Roofing Co. — Landing Page

Static roofing landing page (HTML / CSS / JS) with a multi-step lead form, looping hero video, and real Google reviews. Navy + gold brand, Montserrat type.

## Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Efontenelle504/trust-built-roofing)

Click the button, authorize GitHub, deploy. Publish dir and headers come from `netlify.toml`.

### After deploy — turn on leads
1. Netlify dashboard → **Forms** → the `roof-estimate` form is auto-detected.
2. **Form notifications → Add notification → Email** → your inbox. Leads land there.

## Lead routing
The form picks the first available path:
- **GoHighLevel** — set `TRUST_GHL_WEBHOOK_URL` in `script.js` (Workflow Inbound Webhook). Works on any host.
- **Netlify Forms** — automatic fallback when deployed on Netlify and no GHL URL is set.
- Otherwise — shows a call-us message (no dead end).

Honeypot spam guard active on both paths.

## Local preview
Serve the folder over any static server, e.g.:

    python -m http.server 8000

Then open http://localhost:8000

## Files
- `index.html` · `styles.css` · `script.js` — the page
- `terms.html` · `privacy.html` — legal (DRAFT, replace before launch)
- `netlify.toml` — deploy config
- `trust-built-assets/` · `roof-assets/` · `videos/` · `fonts/` — assets
