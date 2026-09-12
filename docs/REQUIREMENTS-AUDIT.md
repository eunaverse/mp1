# MP1 independent requirements audit

## Conclusion and scope

All 16 numbered implementation requirements are present in the inspected HTML, SCSS, and JavaScript. This source audit found no missing required feature. The initial audit found example links in `llm_logs.csv`. Those entries have since been replaced with the actual [parent conversation export](llm-chat-log.md) and [subagent exports](llm-subagents.md). The public student repository has been created from the required template. Publication/CI verification and the separate demo/form obligations are tracked independently in [SUBMISSION.md](SUBMISSION.md).

**Pass below means the requirement is implemented and internally consistent in the inspected source.** It does not promise a grade or replace a browser run. The main workflow is running the production build and browser tests separately. [E2E-CHECKLIST.md](E2E-CHECKLIST.md) records the previous local test and visual review; this audit independently read the implementation and test bodies rather than copying that checklist's verdicts. No browser-test result is newly claimed by this audit.

The authority is the unmodified [README.md:18](../README.md#L18), [rules at README.md:63](../README.md#L63), and [LLM policy at README.md:100](../README.md#L100), also available in the [course repository](https://github.com/cs409-fa25/mp1#readme). Line references below refer to the inspected working tree based on commit `23e9c223d60244e595c05c3bb227529baa9fd12b`, including its uncommitted implementation changes.

## All 16 numbered requirements

| # | Requirement | Source verdict | Concrete evidence and verification boundary |
| --- | --- | --- | --- |
| 1 | Single page, full-width stripes, header and footer | Pass | [src/index.html:15](../src/index.html#L15) contains the header, four main sections, a pause stripe, and the footer at [src/index.html:323](../src/index.html#L323). [src/css/main.scss:24](../src/css/main.scss#L24) removes body margins; stripes contain centered inner containers. Overall visual quality remains graded subjectively. |
| 2 | Sticky top navbar | Pass | [src/css/main.scss:120](../src/css/main.scss#L120) uses `position: sticky`, `top: 0`, and an elevated stacking level. [tests/e2e/journal.spec.js:119](../tests/e2e/journal.spec.js#L119) checks that its top stays at the viewport top after scrolling. |
| 3 | Reading-position indicator, including the final item at page bottom | Pass | [src/js/main.js:8](../src/js/main.js#L8) measures the reading line below the navbar and selects the matching section; the explicit bottom override is at line 21. Scroll and resize listeners are at line 84. [src/css/main.scss:169](../src/css/main.scss#L169) makes the current item visibly distinct. [tests/e2e/journal.spec.js:159](../tests/e2e/journal.spec.js#L159) checks manual scrolling and the bottom case. |
| 4 | Larger navbar and font at the top, smaller while scrolling | Pass | [src/js/main.js:9](../src/js/main.js#L9) toggles the compact state after 32 px. [src/css/main.scss:127](../src/css/main.scss#L127) starts at 96 px header height and [src/css/main.scss:179](../src/css/main.scss#L179) reduces it to 72 px; navigation font changes from 15 px to 13 px. Phone overrides also reduce both dimensions. The browser case at [tests/e2e/journal.spec.js:119](../tests/e2e/journal.spec.js#L119) measures both height and font size. |
| 5 | Smooth section scrolling through navigation | Pass | [src/js/main.js:45](../src/js/main.js#L45) calculates the destination beneath the measured header and calls native smooth scrolling. Reduced-motion users intentionally receive an immediate move. [tests/e2e/journal.spec.js:145](../tests/e2e/journal.spec.js#L145) checks intermediate scroll positions, rather than only checking the final hash. |
| 6 | Carousel with at least three slides and side arrows | Pass | [src/index.html:81](../src/index.html#L81) contains exactly three distinct slide articles; previous/next buttons begin at line 170. [src/js/main.js:100](../src/js/main.js#L100) hides inactive slides and wraps the index. [src/css/main.scss:341](../src/css/main.scss#L341) anchors arrows to opposite sides. [tests/e2e/journal.spec.js:71](../tests/e2e/journal.spec.js#L71) covers forward/backward wraparound; separate cases cover dots, keyboard input, and focus leaving hidden slides. |
| 7 | A section with at least three columns | Pass | Three cards begin at [src/index.html:226](../src/index.html#L226). [src/css/main.scss:390](../src/css/main.scss#L390) uses `repeat(3, minmax(0, 1fr))`; only the phone breakpoint changes to one column. [tests/e2e/journal.spec.js:335](../tests/e2e/journal.spec.js#L335) checks the cards share a row at all five required widths. |
| 8 | Horizontal centering and vertical centering that survives parent resizing | Pass | [src/css/main.scss:81](../src/css/main.scss#L81) centers each stripe's content container with automatic inline margins. [src/css/main.scss:190](../src/css/main.scss#L190) centers the hero content using CSS Grid. [tests/e2e/journal.spec.js:275](../tests/e2e/journal.spec.js#L275) changes viewport height, verifies the parent actually changes height, and checks centers within 2 px. The horizontal criterion is interpreted as centering the content block, not forcing every paragraph to use centered text. |
| 9 | Good presentation at all five required viewport sizes | Pass for implementation; aesthetic grade unscored | [src/css/main.scss:630](../src/css/main.scss#L630) and subsequent breakpoints adapt spacing and layout. [tests/e2e/journal.spec.js:298](../tests/e2e/journal.spec.js#L298) lists 1920×1080, 1366×768, 1280×720, 1024×768, and 768×1024, plus an extra phone size. Tests measure overflow, navigation overlap, columns, carousel text overlap, and modal fit. Screenshots still require human visual judgment. |
| 10 | Fixed-position background image | Pass | [src/css/main.scss:438](../src/css/main.scss#L438) assigns the local coast photograph with `center / cover fixed` to the pause stripe. [tests/e2e/journal.spec.js:290](../tests/e2e/journal.spec.js#L290) checks both the image URL and fixed attachment. A visible scrolling inspection supplements that computed-style check. |
| 11 | Modal windows with additional content | Pass | [src/index.html:365](../src/index.html#L365) provides a native dialog. [src/js/main.js:139](../src/js/main.js#L139) defines three distinct notes, and line 174 populates and opens the dialog. The close button, Escape, backdrop, background scroll lock, and focus return are covered by cases beginning at [tests/e2e/journal.spec.js:181](../tests/e2e/journal.spec.js#L181). Reusing one dialog for multiple notes satisfies the additional-content requirement. |
| 12 | Embedded HTML5 video | Pass | [src/index.html:295](../src/index.html#L295) uses `<video>` with native controls, a local MP4, poster, and caption track. [tests/e2e/journal.spec.js:255](../tests/e2e/journal.spec.js#L255) verifies metadata and advancing playback time. [docs/ASSETS.md:19](ASSETS.md#L19) records source, license, dimensions, and the silent clip. |
| 13 | SCSS features or CSS variables | Pass | [src/css/main.scss:2](../src/css/main.scss#L2) defines shared SCSS variables; lines 9 and 14 define mixins used by real rules. [src/css/main.scss:613](../src/css/main.scss#L613) uses an `@each` loop and `--icon` custom properties. [webpack.config.js:20](../webpack.config.js#L20) compiles SCSS to an extracted stylesheet. |
| 14 | CSS3 animation | Pass | [src/css/main.scss:618](../src/css/main.scss#L618) defines `arrive` keyframes, used by the hero, slides, and dialog. Link/button transitions provide additional animation. [src/css/main.scss:854](../src/css/main.scss#L854) disables motion for the accessibility preference. The browser scroll test is not proof of these CSS animations; inspect their visual appearance with normal motion enabled. |
| 15 | Scalable vector icons through CSS | Pass | [src/css/main.scss:605](../src/css/main.scss#L605) applies local SVG assets as CSS masks, sized with CSS and colored with `currentColor`. For example, [src/assets/compass.svg:1](../src/assets/compass.svg#L1) is vector markup with a `viewBox`. FontAwesome is an example in the assignment, not a required dependency. |
| 16 | Social-media icons | Pass | [src/index.html:336](../src/index.html#L336) includes Instagram and Pinterest icon links; [src/assets/instagram.svg:1](../src/assets/instagram.svg#L1) and [src/assets/pinterest.svg:1](../src/assets/pinterest.svg#L1) provide the vector shapes. The links intentionally go to generic platform homepages, as disclosed in [docs/IMPLEMENTATION.md:61](IMPLEMENTATION.md#L61). Personal profiles are not required by the README. |

The assignment introduction mentions webfonts as an example of CSS experience at [README.md:16](../README.md#L16). It does not make a webfont, a canvas, a particular theme, or any specific example screenshot a mandatory feature. The use of local/system fonts therefore does not constitute a missing requirement.

## Rules audit

| Rule | Verdict | Evidence and limits |
| --- | --- | --- |
| 1. Individual assignment; no collaboration | No conflicting activity observed in this workflow | This workflow consists of the user and AI assistance/review, which belongs under the explicit LLM policy. No other student or human collaborator was involved in the observed assistant workflow. Source inspection cannot establish what occurred outside this session. |
| 2. No copying others' code; declare all referenced sources | References present; submission completion pending | No third-party application-code copy was identified in the reviewed source. Course-provided starter files remain part of the template. [docs/IMPLEMENTATION.md:5](IMPLEMENTATION.md#L5), [docs/IMPLEMENTATION.md:59](IMPLEMENTATION.md#L59), [docs/IMPLEMENTATION.md:83](IMPLEMENTATION.md#L83), and [docs/ASSETS.md:7](ASSETS.md#L7) declare the course, MDN, Playwright, photo, and video sources. Provenance cannot be proven from source alone, and the actual LLM exports are now indexed in `llm_logs.csv`. The grading-form disclosure remains pending. |
| 3. No libraries | Pass for the authored browser application | [package.json:16](../package.json#L16) lists development tooling only; both runtime dependency objects are absent. [src/index.js:7](../src/index.js#L7) imports local files, and the interaction file uses native browser APIs. Webpack/Sass are the assignment's build-tool pattern; Playwright runs outside the delivered page. No Bootstrap, jQuery, React, icon runtime, or remote UI script is used. This is an implementation interpretation, not a separate staff ruling. |
| 4. No inline styling | Pass, directly scanned | Source HTML and the existing built HTML contain zero `style` attributes and zero `<style>` elements. [webpack.config.js:43](../webpack.config.js#L43) emits a separate `styles.css`; [tests/rules.test.cjs:28](../tests/rules.test.cjs#L28) checks authored markup. |
| 5. No inline script tags | Pass, directly scanned | Source HTML and the existing built HTML contain no nonempty inline script bodies. Event listeners are in [src/js/main.js:61](../src/js/main.js#L61). Webpack injects an external bundle; [tests/rules.test.cjs:37](../tests/rules.test.cjs#L37) checks inline bodies. |
| 6. No HTML tables for layout | Pass, directly scanned | No `<table>` exists in source or built HTML. The notes use CSS Grid at [src/css/main.scss:390](../src/css/main.scss#L390). Documentation tables are not part of the website layout. |
| 7. Ask on Piazza if acceptability is uncertain | No unresolved implementation-specific conflict identified | The source audit did not identify a feature requiring an exception to the stated rules. No Piazza question was sent or claimed. The audit cannot substitute for a course-staff decision if a new ambiguity arises. |

The direct scans also found no runtime dependencies or optional runtime dependencies in `package.json`. The five source-rule tests include compilation of SCSS before checking generated icon paths at [tests/rules.test.cjs:90](../tests/rules.test.cjs#L90), avoiding a false missing-file result for SCSS interpolation.

## Complete grading-weight mapping

These are the README's 16 grading categories and weights, totaling 100%. They are not awarded scores.

| Grading category | Weight | Covered by requirement(s) above / audit |
| --- | ---: | --- |
| Layout and overall design | 20% | 1 and 8; consistency, typography, spacing, colors, and UX remain subjective |
| Code practices | 12% | Rules audit; semantic HTML, separated SCSS/JS, readable native interaction code |
| Smooth scrolling | 10% | 5 |
| Carousel | 10% | 6 |
| Modal | 10% | 11 |
| Responsiveness | 10% | 9 |
| Position indicator | 5% | 3 |
| Navbar resizing | 5% | 4 |
| Multi-column layout | 5% | 7 |
| SCSS features / CSS variables | 1% | 13 |
| CSS3 animations | 5% | 14 |
| Centering | 2% | 8 |
| Video | 2% | 12 |
| Sticky navbar | 1% | 2 |
| Background image | 1% | 10 |
| Scalable vector icons and social-media icons | 1% | 15 and 16 together |

## Remaining evidence and submission obligations

| Obligation | Status at this source-audit snapshot | Required evidence |
| --- | --- | --- |
| Fresh production build and browser verification | Main workflow handles separately | Successful build, source tests, current Chromium run, and reviewed screenshots; the audit does not claim a new test execution |
| Public student repository created using the course template | Verified: https://github.com/eunaverse/mp1, PUBLIC, template cs409-fa25/mp1 | Actual repository URL and template provenance, per [README.md:74](../README.md#L74) |
| Push source and deploy through GitHub Pages Actions | Publication workflow pending verification | The commit pushed, matching successful Actions run, actual public URL, and live behavior; [.github/workflows/static.yml:17](../.github/workflows/static.yml#L17) is configuration only |
| Submit real LLM chat logs with source | Actual exports prepared and indexed; remote accessibility checked by publication workflow | [llm_logs.csv](../llm_logs.csv) indexes the parent and three child-session exports. Timestamps, snapshot hashes, and privacy filtering are disclosed; no transcript was reconstructed. |
| Answer LLM-experience survey questions | Pending; separate grading-form task | Actual responses submitted in the course form, as required by [README.md:104](../README.md#L104) |
| Record a deployed-site demo of at most three minutes | Pending; not performed by this audit | A real video showing the public URL and required features, per [README.md:94](../README.md#L94) |
| Upload and share the demo | Pending; separate demo task | Google Drive file shared with `uiuc.web.programming@gmail.com` and a working share link |
| Submit the grading form | Pending; separate submission task | Confirmation from the [course form](https://forms.gle/jfgQnaTSVmhrt2DH8), including the actual demo link and LLM answers |

The user's current request to publish the site and provide actual LLM logs is being handled by the main workflow. This audit does not treat that as proof that a demo was recorded or that the grading form was submitted. The README gives a deadline of **September 22, 2026, 11:59 PM CT** and an **80% cap for a local-only demo**.

## Audited source identity

The implementation was uncommitted when inspected. These SHA-256 values identify the exact three application files reviewed, independently of the template base commit:

```text
src/index.html       6ae8daae81c77dd17575ccb09ee372e63236c47023b314f8cb9fd29b8ab77cdd
src/css/main.scss    6bbc1912ca35d634ed3d59416fe2c7c957295af13931a64feee80595f5190de5
src/js/main.js       8f8d01d2ead0b9d77c448a2e0de6a0d4050b98132ca6e3d0c12a0d2efd642080
```
