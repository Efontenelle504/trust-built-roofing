# Trust Built Concrete — Landing Page Variant

A standalone concrete-services version of the Trust Built landing page. It lives in the `concrete/` directory so the existing roofing site can remain unchanged.

## What is included

- Responsive one-page concrete marketing site
- Driveways, patios, walkways, slabs, repairs, and decorative services
- Interactive project planner
- Project gallery carousel
- Accessible FAQ accordion
- Four-step concrete estimate form
- Netlify Forms registration (`concrete-estimate`)
- Privacy and terms pages
- Mobile navigation and native `<dialog>` estimate modal

## Preview locally

From the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/concrete/
```

## Deploy as its own Netlify site

Create a new Netlify site from the repository and use:

- **Base directory:** `concrete`
- **Build command:** leave blank
- **Publish directory:** `.`

After the first deploy, open **Netlify → Forms** and confirm the `concrete-estimate` form was detected. Add an email notification or connect the form to your CRM workflow.

## Before launch

Review or replace:

- Business name if this will use a different concrete brand
- Phone number and email
- Service area wording
- Customer reviews and permission to reuse them on the concrete page
- Privacy policy and terms with legal counsel
- Unsplash images with original project photos when available

## Image credits

The prototype uses photographs available under the Unsplash License:

- Mélyna Côté — concrete finishing
- Nihar Reddy Jangam — placement crew
- Samuel Cruz — residential site preparation
- Sanju Pandita — outdoor living area
- Erin Minuskin — garden walkway
- Brett Jordan — patio installation

Photo credits are listed in the page footer and should remain until the photos are replaced.
