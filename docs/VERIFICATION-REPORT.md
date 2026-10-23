# Verification Report

Date: 2026-10-23. Checks ran with headless Chrome (Playwright) against the built files, using `file://` and a local HTTP server.

## 1. Content preservation (automated, verbatim)

Every visible text string was extracted from the live original pages and searched for, character for character (including curly quotes, en and em dashes, `é`, `©`), in the matching new page.

| Page | Original strings | Found verbatim | Not in static HTML |
|---|---|---|---|
| Home | 88 | 88 | 0 |
| About | 55 | 55 | 0 |
| Services | 68 | 68 | 0 |
| Projects | 63 | 63 | 0 |
| Testimonials | 59 | 59 | 0 |
| Contact | 53 | 50 | 3 ¹ |
| **Total** | **380** | **377** | **3** |

¹ The three are the "This field is required." messages. The original pre-renders them hidden. The new site inserts the identical text when a field fails validation (confirmed in the functional tests below).

**Reverse check (anything added):** the only text in the new pages that isn't on the original is screen-reader-only and never shown on screen: "5 out of 5 stars" (label for the ★★★★★ ratings), "Subject" (hidden form label, from the original field name) and "Leave this field empty" (hidden spam-trap label). The other additions are non-visible ARIA labels on controls, such as "Open menu" and "Previous slide".

One configurable string is added: the success message after a form is sent to a configured endpoint (`js/config.js` → `successMessage`). The original's success text is set inside WordPress and isn't visible publicly. It only appears when an endpoint is configured.

Contact details checked manually against the original: +91 98441 23702 ✅ · 8073718896 ✅ · +918073718896 ✅ · info@jkinteriors.in ✅ · GST No:29AVDPK8064F2ZA ✅ · Srinagar, / Bengaluru – 560050 ✅ · Srinagar, Bengaluru - 560050 ✅ · map address ✅ · WhatsApp 918073718896 ✅ · page titles and meta descriptions ✅ · canonical URLs ✅.

## 2. Responsive and visual checks (automated)

6 pages × 8 viewport widths (**320, 375, 425, 768, 1024, 1280, 1440, 1920 px**) = **48 combinations: all clean.** Each combination was checked for:

- no horizontal page overflow and no element extending past the viewport
- no broken `<img>` (lazy images were triggered by scrolling the full page) and every CSS background image loads
- no JavaScript errors and no failed local requests
- exactly one `<h1>` per page

Full-page screenshots at 375 px and 1440 px were reviewed by eye for every page. Issues found and fixed during review: a 2 px overflow on phones from a decorative frame, a carousel showing 2 slides instead of 3 on desktop, an awkward heading wrap, gallery column widths on alternating project rows, testimonial reading order, and the hero indicators colliding with the WhatsApp button.

## 3. Functional tests (automated, over HTTP)

| Test | Result |
|---|---|
| Mobile menu opens, focus moves into it, Esc closes it, links navigate | ✅ |
| Desktop nav visible and hamburger hidden at 1440 px | ✅ |
| Home hero slideshow advances after 5 s | ✅ |
| Home carousel: 4 slides, 3 visible, 2 dot pages; next/prev scroll; prev disabled at start | ✅ |
| Lightbox opens on click, arrow keys change image, Esc closes | ✅ |
| About counters finish at 400 and 100 | ✅ |
| Contact form: empty submit shows 3 × "This field is required."; a bad email shows "Enter a valid email address."; valid input passes | ✅ |
| Google Map iframe loads | ✅ |
| Projects page: 5 carousels, 15 images | ✅ |
| No JS errors on any tested page | ✅ |

## 4. Accessibility measures

Semantic landmarks (`header`, `nav`, `main`, `footer`, `address`), a skip link, visible `:focus-visible` outlines, `aria-current` on the active nav item, `aria-expanded`/`aria-controls` on the menu toggle, a focus trap in the mobile menu, real `<button>` elements for every control, labelled form fields with `aria-invalid` and live error regions, `prefers-reduced-motion` support (turns off the slideshow, autoplay and animations), and 44–48 px touch targets. The original image alt text is kept. Decorative card photos whose original alt was a meaningless Unsplash ID ("Photo 1618221195710 Dd6b41faaea6?…") now use `alt=""` because the card heading already describes them. The footer logo uses "JK Interiors" in place of the original's "transparentjk".

## 5. Known limitations and discrepancies

1. **Contact form delivery**: the original SureForms/WordPress backend can't be called from a static site. By default the form opens the visitor's email app, pre-addressed to info@jkinteriors.in. Direct sending needs a form endpoint in `js/config.js`. Endpoint mode has **not** been tested against a live service, because none is configured.
2. **Social links**: the original's links all point to `#` or nowhere, so they show as non-clickable labels until URLs are added in `js/config.js`.
3. **Header phone button**: on the original it isn't a link. Here it is `tel:+919844123702`. Its text is unchanged.
4. **"Let's Talk" button** (Services): on the original it points to `#`. It now links to the Contact page.
5. **"View All Services" under Projects (Home)**: kept exactly as the original, including its label and its link to /services/.
6. **Not recreated**: the WordPress sample post `/hello-world/` and its `/category/uncategorized/` archive. See INVENTORY §1 for the reasons.
7. **URL structure**: the pages live at `pages/*.html`. Canonical tags keep the original `/about/`-style URLs, so production needs rewrites or updated canonicals (see README).
8. **Image resolution**: the About page images are only 515–640 px wide at source. The layout keeps them at moderate sizes so they aren't stretched.
9. **Not checked in a physical device lab**: real iOS Safari or Android hardware. Mobile layouts were checked with Chrome viewport emulation.
