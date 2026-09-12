# MP1 verification checklist

**Status: local implementation verified on September 11, 2026.** Source checks and Chromium browser tests passed. Desktop/tablet/phone screenshots were reviewed; fixed-background scrolling and video presentation were inspected in the live local preview. Local test success, remote deployment, and course submission are separate results.

This table follows all 16 grading categories in the [original README](../README.md#grading-breakdown) and [upstream specification](https://github.com/cs409-fa25/mp1#readme). `HTML`, `SCSS`, and `JS` below link to [src/index.html](../src/index.html), [src/css/main.scss](../src/css/main.scss), and [src/js/main.js](../src/js/main.js). Browser cases are in [tests/e2e/journal.spec.js](../tests/e2e/journal.spec.js); source checks are in [tests/rules.test.cjs](../tests/rules.test.cjs).

| Rubric item | Weight | Implementation to inspect | Verification | Result |
| --- | ---: | --- | --- | --- |
| Layout and overall design | 20% | HTML sections/header/footer; SCSS containers, typography, spacing | Browser viewport screenshots; manually inspect every stripe, image crop, contrast, hierarchy, and consistent spacing | Verified locally |
| Code practices | 12% | HTML, SCSS, JS; webpack configuration | Run source-rule checks; review semantic elements, separate files, readable state changes, no runtime libraries, no inline styles/scripts, and no layout tables | Verified locally |
| Smooth scrolling | 10% | JS `scrollToSection()` and navigation handlers | Browser normal-motion case must observe intermediate positions; destination must sit below the header; check reduced-motion behavior manually | Verified locally |
| Carousel | 10% | HTML `[data-carousel]`; JS `showSlide()` | Browser cases cover three slides, side arrows, next/previous wraparound, dots, keyboard arrows, and updated counter/state | Verified locally |
| Modal | 10% | HTML `#note-dialog`; JS note handlers | Browser cases cover three distinct notes, close button, Escape, backdrop, content click, focus return, and viewport fit; browser test checks keyboard containment and background scroll lock | Verified locally |
| Responsiveness | 10% | SCSS media queries and component layouts | Browser viewport cases check overflow, nonoverlapping navigation, columns, carousel, modal, and screenshots at all sizes listed below | Verified locally |
| Position indicator | 5% | JS `updateNavigation()`; SCSS current-link state | Browser manual-scroll and bottom-of-page case; verify exactly one active link, including `Slow moments` at the bottom | Verified locally |
| Navbar resizing | 5% | JS `.is-compact` toggle; SCSS header/nav states | Browser case measures smaller header height and smaller nav font, then confirms expansion at the top | Verified locally |
| Multi-column layout | 5% | HTML `.notes-grid`; SCSS grid | Browser viewport cases require three side-by-side cards at widths of 768 and above, with stacking at phone width | Verified locally |
| SCSS features / variables | 1% | SCSS `$paper`/`$ink`, `centered-row`/`section-space` mixins, `@each`, and `--icon`; webpack Sass compilation | Source review plus production build; confirm variables/mixins affect real page rules | Verified locally |
| CSS3 animations | 5% | SCSS `arrive` keyframes, hover transitions, and reduced-motion rules | Source review; manually observe entrance/interaction animation with normal motion, then compare reduced motion | Verified locally |
| Centering | 2% | SCSS `.container`, `.hero`, `.hero-content` | Browser hero-center check measures both parent heights and requires center error under 2 pixels; inspect horizontal centering in every stripe | Verified locally |
| Video | 2% | HTML `<video>` and local `flower.mp4` | Browser case checks metadata, duration, actual advancing playback time, native controls, and no media error; visually inspect the clip and captions | Verified locally |
| Sticky navbar | 1% | SCSS `.site-header` | Browser header case checks its top edge remains at the viewport top after scrolling | Verified locally |
| Fixed background image | 1% | SCSS `.pause-section` | Browser case checks a real background URL and fixed attachment; manually scroll through the stripe to verify its visible behavior | Verified locally |
| Scalable vector and social icons | 1% | SCSS `.icon` mask/`--icon` classes, local SVG assets, HTML footer links | Inspect CSS-based scalable rendering at increased zoom; verify icons remain sharp and Instagram/Pinterest links open the intended generic homepages | Verified locally |

## Run and record

From the project root:

```sh
npm install
npx playwright install chromium
npm test
npx playwright show-report
```

Chromium installation is only needed when the browser binary is missing. `npm test` runs the Node source-rule tests and then Playwright. The Playwright configuration builds and serves the production output at [the local `/mp1/` preview](http://127.0.0.1:4173/mp1/). Stop any stale preview first so the test run can launch its own current build.

| Evidence | Record after verification |
| --- | --- |
| Tested revision or local change state | Uncommitted local implementation on starter 23e9c223d60244e595c05c3bb227529baa9fd12b |
| Date and environment | September 11, 2026; macOS, Chromium via Playwright 1.63.0 |
| Production build result | Passed; webpack warns about the 942 KiB video and 325 KiB forest image; total JS + CSS is about 18 KiB |
| Source-rule test result | 5 passed (`npm run test:rules`) |
| Browser test result and report | 22 passed; `playwright-report/index.html` (generated, gitignored) |
| Visual review and unresolved issues | Six viewport screenshots reviewed; fixed background and video inspected in live preview. Full-page screenshots may omit offscreen fixed backgrounds; live viewport confirmed the image. Public-site verification remains pending. |

The browser suite uses retrying [Playwright assertions](https://playwright.dev/docs/test-assertions). Its video case checks actual playback, not only the presence of a `<video>` tag; see the [MDN video reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video). Media sources and license evidence are in [ASSETS.md](ASSETS.md).

## Required viewport review

Inspect each full-page screenshot and try the navbar, carousel, and a modal. Automated geometry checks do not determine whether the design looks good.

- [x] 1920 × 1080 — automated controls/layout checks and screenshot review passed.
- [x] 1366 × 768 — automated controls/layout checks and screenshot review passed.
- [x] 1280 × 720 — automated controls/layout checks and screenshot review passed.
- [x] 1024 × 768 — automated controls/layout checks and screenshot review passed.
- [x] 768 × 1024 — automated controls/layout checks and screenshot review passed.
- [x] 390 × 844 — additional phone checks and screenshot review passed.
- [x] Resize the hero parent by changing viewport height; center differs by less than 2 pixels before and after.
- [x] Keyboard controls, modal focus/background scroll isolation, and reduced-motion paths tested; visible focus styles included. No formal accessibility certification is claimed.
- [x] Review image crops and video presentation. Fixed background verified in a live scrolled viewport; smooth animation verified in the normal-motion test.

## Publishing and remaining submission steps

These tasks require their own evidence and are not completed by this document or a passing test report. Follow the [course submission instructions](../README.md#submission-details).

- [x] Create the student's **public** `mp1` repository from the class template: `eunaverse/mp1`.
- [ ] Review and push the intended source to that student-owned repository.
- [ ] Configure GitHub Pages to use GitHub Actions; verify the workflow and resulting live URL.
- [ ] Verify the public site loads its media and supports navigation, carousel controls, modals, and video playback.
- [x] Replace `llm_logs.csv` examples with actual parent and subagent conversation exports. Public accessibility is verified during deployment; no transcript was invented.
- [ ] Declare referenced materials, including the documents and media sources listed in this project's guides.
- [ ] Record a demo of **three minutes or less**, showing the deployed URL and required features.
- [ ] Upload the demo to Google Drive and share it with `uiuc.web.programming@gmail.com`.
- [ ] Submit the [grading form](https://forms.gle/jfgQnaTSVmhrt2DH8), including the working video share link and LLM survey responses.
- [ ] Confirm the form submission succeeded before the README's stated deadline: September 22, 2026, 11:59 PM CT.

The footer's social links go to generic Instagram and Pinterest homepages, not student profiles. A local-only demo has an 80% cap under the course README. The repository and actual log files are prepared; deployment is verified separately. No demo sharing or form submission is claimed here.
