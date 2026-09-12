# Field Notes: implementation walkthrough

Field Notes is an imagined travel journal for CS409 MP1. It uses one HTML page, SCSS, and plain JavaScript. The local implementation has passed 5 source checks and 22 Chromium browser tests. This guide explains each step; [E2E-CHECKLIST.md](E2E-CHECKLIST.md) records verification and the separate publishing/submission tasks still pending.

The original [course README](../README.md) remains the assignment specification. The [upstream course repository](https://github.com/cs409-fa25/mp1#readme) contains the requirements, rubric, rules, and submission instructions.

## 1. Run the starter toolchain

Run these commands from the project root, the folder containing `package.json`:

```sh
npm install
npm run build
npm start
```

Open [the development page](http://127.0.0.1:8080/). Stop the development server with Ctrl+C when finished. The server tries port 8080 and uses the next available port if it is occupied. Read the URL printed in the terminal; you can also choose one with `npm start -- --port 8081`.

[src/index.js](../src/index.js) imports the HTML, SCSS, and JavaScript. [webpack.config.js](../webpack.config.js) bundles the scripts, compiles SCSS, emits a separate `styles.css`, and copies local assets into `build/`. Edit `src/`, then rebuild; generated `build/` files are not the source of truth.

Webpack, Sass, their loaders, and Playwright are development dependencies. No React, jQuery, Bootstrap, carousel package, or other runtime UI library is used. The browser interactions use its built-in DOM, scrolling, and dialog APIs.

## 2. Understand the page and its SCSS

[src/index.html](../src/index.html) contains a header, four navigation sections (`home`, `journeys`, `notes`, and `film`), a photographic pause stripe, and a footer. The `data-section` attributes identify the four sections tracked by navigation. Inner `.container` elements keep section content aligned inside full-width stripes.

[src/css/main.scss](../src/css/main.scss) owns the visual presentation: colors, typography, spacing, responsive layouts, hover/focus states, animations, and icons. Its key components match the HTML: `.site-header`, `.hero`, `.carousel`, `.notes-grid`, `.pause-section`, `.film-grid`, and `.site-footer`. The notes form three columns at the required viewport sizes and stack on narrow phone screens. The hero provides the vertically centered content; the pause stripe demonstrates the fixed background image.

SCSS variables such as `$paper` and `$ink` centralize colors. The `centered-row` and `section-space` mixins reuse layout rules. An `@each` loop assigns a `--icon` CSS variable to each local SVG; `.icon` uses that SVG as a mask colored with `currentColor`. The `arrive` keyframes animate the hero, slides, and modal. A reduced-motion media query disables animations and transitions.

Keep styles in SCSS and behavior in JavaScript. The source HTML has no inline styling, inline scripts, or layout tables. The original course README is retained separately from these project notes.

## 3. Follow the navbar logic

The first part of [src/js/main.js](../src/js/main.js) has three main responsibilities:

1. `updateNavigation()` toggles `.is-compact` after 32 pixels of scrolling, identifies the section directly below the header, and assigns `aria-current="location"` to its link. An explicit page-bottom check selects the final item even when that section cannot reach the header.
2. `requestNavigationUpdate()` uses `requestAnimationFrame` to combine repeated scroll events into a browser rendering update.
3. `scrollToSection()` measures the header and scrolls to the destination with room for it. Normal motion uses smooth scrolling; a reduced-motion preference skips the animation. Hash links support direct navigation to a section.

The SCSS compact state must shrink both header dimensions and navigation text. Check both behaviors; a smaller background alone would miss part of the rubric.

## 4. Follow the carousel state

The carousel holds three `[data-slide]` elements. `currentSlide` stores the active index, and `showSlide()` returns focus to the carousel if switching would hide the focused link. It updates each slide's `hidden` property, the dot buttons' `aria-pressed` state, and the live position counter.

The expression `(index + slides.length) % slides.length` wraps a previous click from slide 1 to slide 3 and a next click from slide 3 to slide 1. Side arrows, selection dots, and left/right keyboard arrows all call the same function, so they share the same state.

## 5. Follow the modal lifecycle

Each note button has a `data-open-note` key. The `notes` object in `main.js` supplies its distinct title, paragraph, and tips. Clicking a button fills the native `<dialog>` with text and opens it with `showModal()`.

The close button, Escape key, and a click outside the dialog's rectangle dismiss it. Clicking its text keeps it open. The `close` handler removes the page's scroll lock and restores keyboard focus to the button that opened it. This makes keyboard navigation easy to resume.

## 6. Understand the media and social links

The three photographs and short MP4 live in [src/assets](../src/assets/), so they are available without third-party media requests during playback. [ASSETS.md](ASSETS.md) records the exact photographers, source URLs, licenses, dimensions, and the video's audio removal. The forest photo retains its portrait source dimensions and is cropped for its display area by CSS.

The film uses the browser's HTML5 `<video>` element with controls, muted playback, inline playback, a poster extracted from the clip, a caption track, and a download fallback. These attributes follow the [MDN video reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video).

The footer's Instagram and Pinterest icons link to those platforms' generic homepages. They do not represent personal accounts or claim that Field Notes owns a social profile.

## 7. Test the production build

To view the generated site under a GitHub Pages-style project path:

```sh
npm run build
npm run preview
```

Open [the production preview](http://127.0.0.1:4173/mp1/). The preview server supports video byte ranges. Stop it before a full test run when you want Playwright to start a fresh build and server.

```sh
# Needed once if Playwright's Chromium is not installed:
npx playwright install chromium

npm test
```

`npm test` runs `node --test tests/rules.test.cjs`, followed by `playwright test`. The Node checks inspect separation of HTML/styles/scripts, runtime imports, navigation targets, image alternative text, and local resource paths. The browser suite in [tests/e2e/journal.spec.js](../tests/e2e/journal.spec.js) uses [playwright.config.js](../playwright.config.js) to build and test the `/mp1/` production preview. It checks real clicks, scrolling, carousel wrapping, modal dismissal/focus, media playback, and layout at the five required sizes plus a phone size.

Playwright's retrying [assertions](https://playwright.dev/docs/test-assertions) wait for observable page behavior, such as visibility or an active navigation attribute. A passing automated suite still needs the visual review described in the checklist. To inspect a test run or run with a visible browser:

```sh
npx playwright show-report
npm run test:headed
```

## 8. Publishing and remaining submission steps

The checkout now uses the student repository `eunaverse/mp1` as origin and retains the course repository as upstream. Actual conversation exports are indexed in `llm_logs.csv`; see [SUBMISSION.md](SUBMISSION.md). The full course workflow is:

1. Create the student's public `mp1` repository using **Use this template** on the course repository, and move the verified project into that repository.
2. Review and commit the intended files, push to the student's repository, set **Settings → Pages → Source → GitHub Actions**, and confirm the actual deployment. The existing `.github/workflows/static.yml` is configuration, not evidence that a deployment has occurred.
3. Open the real public URL and repeat the important interaction and media checks there.
4. Export or link the real LLM conversations used for this work, include them with the source, and replace the example links in `llm_logs.csv`. Do not create a reconstructed transcript or treat these walkthroughs as chat logs. Answer the LLM survey questions in the grading form.
5. Record a demo no longer than three minutes, show the deployed URL and required features, upload it to Google Drive, share it with `uiuc.web.programming@gmail.com`, and submit the [course form](https://forms.gle/jfgQnaTSVmhrt2DH8).

The repository and real log exports are prepared. Deployment verification is reported separately; the demo, personal survey answers, and grading-form submission remain pending. The course README states that a local-only demo is capped at 80%. The README's stated deadline is September 22, 2026, at 11:59 PM CT.
