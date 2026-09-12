# MP1 submission references

- Repository: https://github.com/eunaverse/mp1
- GitHub Pages URL: https://eunaverse.github.io/mp1/
- Real conversation exports: [parent conversation](llm-chat-log.md) and [three AI subagent sessions](llm-subagents.md), indexed by [llm_logs.csv](../llm_logs.csv).
- Requirement-by-requirement audit: [REQUIREMENTS-AUDIT.md](REQUIREMENTS-AUDIT.md).
- Media sources and licenses: [ASSETS.md](ASSETS.md).
- Implementation and test explanation: [IMPLEMENTATION.md](IMPLEMENTATION.md).

## LLM disclosure

**Yes**, LLMs were used to generate and review the HTML, SCSS, JavaScript, test code, and documentation. Codex and AI subagents assisted with implementation, media preparation, tests, and review. The conversation export describes its exact coverage and privacy filtering; it is copied from recorded messages, not a reconstructed conversation. Final source code and tests are included in this repository.

## Materials referenced

- Course template and assignment: https://github.com/cs409-fa25/mp1
- HTML video reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
- Playwright assertions: https://playwright.dev/docs/test-assertions
- Unsplash license: https://unsplash.com/license
- Exact photo, video, and poster sources are in ASSETS.md.

## Still needed for the grading form

The [Fall 26 MP1 form](https://forms.gle/jfgQnaTSVmhrt2DH8) asks for email, NetID, repository, deployed site, Google Drive demo URL, references, hours spent, and LLM usage/experience answers. Publishing code and logs does not submit this form.

- Record a real demo, no more than three minutes, showing the deployed URL and required features.
- Upload it to Google Drive and share it with uiuc.web.programming@gmail.com.
- Provide your NetID and actual time spent; do not infer these from AI execution time.
- Complete the LLM experience survey with your own answers and submit the form.

## Repeat verification

```sh
npm test
MP1_BASE_URL=https://eunaverse.github.io/mp1/ npm run test:e2e
```

The second command checks the public deployment without starting a local server. The GitHub Actions deployment also runs the five source checks and 22 browser tests before publishing.
