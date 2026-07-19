# Codex Task — Finish Trust Built Concrete Landing Page

## Objective

Complete a standalone concrete-services landing page based on the conversion structure and polish of <https://tbroofing.netlify.app/> while leaving the existing roofing site unchanged.

## Repository and branch

- Repository: `Efontenelle504/trust-built-roofing`
- Continue from branch: `agent/concrete-services-landing-page`
- Do **not** start over from `main`.
- Keep all concrete-site work inside `concrete/` unless a repository-level change is absolutely required.

## Current state

This branch already contains:

- `concrete/README.md` — scope, deployment notes, and image-credit plan
- `concrete/favicon.svg`
- `concrete/privacy.html` — draft legal page
- `concrete/script.js` — mobile navigation, reveal effects, project planner, gallery carousel, FAQ accordion, native dialog, four-step estimate form, validation, and Netlify form submission logic

The branch is intentionally incomplete. Key page and style files still need to be created, and the starter JavaScript must be wired to matching markup.

## Required deliverables

Create and finish at least:

- `concrete/index.html`
- `concrete/styles.css`
- `concrete/terms.html`
- `concrete/netlify.toml`

Update existing files in `concrete/` as needed so the site works as one coherent product.

## Page requirements

Build a responsive, accessible, one-page marketing site for **Trust Built Concrete** covering:

- Concrete driveways
- Patios and outdoor living surfaces
- Walkways and steps
- Equipment, shed, workshop, and addition slabs
- Concrete repair and replacement
- Decorative or upgraded finish options

Use a strong lead-generation structure inspired by the roofing site:

1. Sticky header with phone and estimate CTA
2. High-impact hero with concrete-specific message
3. Service cards
4. Interactive project planner using the existing `data-planner-*` hooks in `script.js`
5. Project/gallery carousel using the existing `data-slide`, carousel control, dot, and counter hooks
6. Clear process / what-to-expect section
7. Trust and credentials section without inventing licenses, certifications, awards, or customer reviews
8. Accessible FAQ accordion using the existing JavaScript hooks
9. Strong final CTA and footer with legal links and image credits
10. Native `<dialog>` estimate flow wired to the existing script

## Estimate form contract

The visible form and hidden Netlify registration form must use the form name `concrete-estimate` and support the fields expected by `script.js`, including:

- `projectType`
- `zipCode`
- `propertyType`
- `siteConditions`
- `timeline`
- `name`
- `phone`
- `email`
- `notes`
- `consent`
- honeypot / bot field

Include the matching `data-estimate-*`, `data-form-*`, progress, summary, status, success, open, and close hooks required by the existing script. Preserve validation, keyboard accessibility, focus restoration, and reduced-motion behavior.

## Brand and visual direction

- Brand: **Trust Built Concrete**
- Visual style: modern contractor / industrial editorial
- Palette: charcoal, warm off-white, concrete gray, and a controlled safety-orange accent
- Type: Barlow Condensed for display headings and Manrope for body copy
- The page should feel related to the roofing site but should not be a simple find-and-replace clone.
- Use concrete-appropriate imagery. Do not present stock images as completed Trust Built projects. Keep required photo credits until images are replaced with owned project photography.

## Business details for the prototype

Use these existing details unless the repository indicates something more current:

- Phone: `(504) 285-7707`
- Email: `info@trustbuiltroofing.com`
- Service area language: South Louisiana and nearby Mississippi communities

Avoid unsupported promises about pricing, permits, engineering, warranties, timelines, or code compliance.

## SEO and deployment

- Add a concrete-specific title, description, Open Graph metadata, favicon, and sensible canonical placeholder behavior.
- `concrete/netlify.toml` should support deploying with Netlify base directory `concrete`, blank build command, and publish directory `.`.
- Ensure Netlify detects the `concrete-estimate` form at build time.
- Keep legal pages clearly marked as drafts where appropriate.

## Validation

Before finishing:

- Serve from the repository root with `python -m http.server 8000`.
- Test `http://localhost:8000/concrete/` at desktop and mobile widths.
- Confirm navigation, all CTAs, planner tabs, carousel, accordion, dialog opening/closing, step validation, summary, and local form-success behavior.
- Check the browser console for errors.
- Check for broken local links and missing local assets.
- Confirm the existing roofing site files were not changed.

## Completion workflow

Commit the completed implementation to `agent/concrete-services-landing-page`, then update the draft pull request into `main`. In the PR description, include what changed, validation performed, remaining business-content placeholders, and screenshots if available.
