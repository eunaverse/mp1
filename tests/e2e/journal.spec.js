const { test, expect } = require('@playwright/test');

// These tests interact with the built page as a visitor would. Tests that do
// not measure animation disable motion so that their assertions stay reliable.
async function openJournal(page, hash = '') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`./${hash}`);
  await expect(page.locator('#site-header')).toBeVisible();
}

async function expectSlide(page, index) {
  const slides = page.locator('[data-slide]');
  await expect(slides).toHaveCount(3);
  for (let i = 0; i < 3; i += 1) {
    if (i === index) await expect(slides.nth(i)).toBeVisible();
    else await expect(slides.nth(i)).toBeHidden();
    await expect(page.locator(`[data-slide-to="${i}"]`)).toHaveAttribute(
      'aria-pressed',
      String(i === index),
    );
  }
  await expect(page.locator('[data-carousel-status]')).toHaveText(
    `0${index + 1} / 03`,
  );
}

async function expectSectionBelowHeader(page, sectionId) {
  await expect.poll(async () => page.evaluate((id) => {
    const headerBottom = document.querySelector('#site-header').getBoundingClientRect().bottom;
    const sectionTop = document.getElementById(id).getBoundingClientRect().top;
    const gap = sectionTop - headerBottom;
    return gap < -2 ? 'covered by header' : gap > 32 ? 'too far below header' : 'aligned';
  }, sectionId)).toBe('aligned');
}

test('the production page loads images and local assets without browser errors', async ({ page, baseURL }) => {
  const errors = [];
  const failedAssets = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.url().startsWith(new URL(baseURL).origin + '/') && response.status() >= 400) {
      failedAssets.push(`${response.status()} ${response.url()}`);
    }
  });
  await openJournal(page);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-section]')).toHaveCount(4);

  // Visit each slide so lazy images, if any, are loaded before being checked.
  for (let i = 0; i < 3; i += 1) {
    await page.locator(`[data-slide-to="${i}"]`).click();
    const visibleImages = page.locator('img:visible');
    for (const image of await visibleImages.all()) {
      await expect.poll(() => image.evaluate((element) => (
        element.complete && element.naturalWidth > 0
      ))).toBe(true);
    }
  }
  const localResources = await page.evaluate(() => performance.getEntriesByType('resource')
    .map((entry) => entry.name)
    .filter((url) => url.startsWith(location.origin)));
  expect(localResources.length).toBeGreaterThan(0);
  expect(localResources.every((url) => new URL(url).pathname.startsWith('/mp1/'))).toBe(true);
  expect(failedAssets).toEqual([]);
  expect(errors).toEqual([]);
});

test('carousel controls move forward, backward, and wrap around', async ({ page }) => {
  await openJournal(page);
  await expectSlide(page, 0);
  await page.getByRole('button', { name: 'Previous journey', exact: true }).click();
  await expectSlide(page, 2);
  await page.getByRole('button', { name: 'Next journey', exact: true }).click();
  await expectSlide(page, 0);
  await page.getByRole('button', { name: 'Next journey', exact: true }).click();
  await expectSlide(page, 1);
  await page.getByRole('button', { name: 'Next journey', exact: true }).click();
  await expectSlide(page, 2);
  await page.getByRole('button', { name: 'Next journey', exact: true }).click();
  await expectSlide(page, 0);
});

test('carousel dots select a specific journey and update their pressed state', async ({ page }) => {
  await openJournal(page);
  for (const index of [2, 0, 1]) {
    await page.getByRole('button', { name: `Show journey ${index + 1}`, exact: true }).click();
    await expectSlide(page, index);
  }
});

test('carousel supports left and right arrow keys', async ({ page }) => {
  await openJournal(page);
  const carousel = page.locator('[data-carousel]');
  await carousel.focus();
  await page.keyboard.press('ArrowLeft');
  await expectSlide(page, 2);
  await page.keyboard.press('ArrowRight');
  await expectSlide(page, 0);
  await page.keyboard.press('ArrowRight');
  await expectSlide(page, 1);
});

test('carousel arrows move focus out of a slide that becomes hidden', async ({ page }) => {
  await openJournal(page);
  // Changing slides from a link must not leave focus inside hidden content.
  const carousel = page.locator('[data-carousel]');
  await page.locator('[data-slide]').first().locator('a').focus();
  await page.keyboard.press('ArrowRight');
  await expectSlide(page, 1);
  await expect.poll(() => carousel.evaluate((element) => (
    element.contains(document.activeElement) &&
    !document.activeElement.closest('[hidden]')
  ))).toBe(true);
});

test('the sticky header shrinks on scroll and grows again at the top', async ({ page }) => {
  await openJournal(page);
  const header = page.locator('#site-header');
  const navText = page.locator('a[data-nav]').first();
  const expanded = await header.boundingBox();
  const expandedFontSize = await navText.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(header).toHaveClass(/is-compact/);
  await expect.poll(async () => (await header.boundingBox()).height).toBeLessThan(expanded.height);
  await expect.poll(() => navText.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)))
    .toBeLessThan(expandedFontSize);
  expect((await header.boundingBox()).y).toBeCloseTo(0, 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveClass(/is-compact/);
  await expect.poll(async () => Math.round((await header.boundingBox()).height))
    .toBe(Math.round(expanded.height));
});

test('the hero link scrolls to a journey below the compact header', async ({ page }) => {
  await openJournal(page);
  await page.locator('a[data-scroll][href="#journeys"]').click();
  await expect(page.locator('a[data-nav][href="#journeys"]'))
    .toHaveAttribute('aria-current', 'location');
  await expectSectionBelowHeader(page, 'journeys');
});

test('normal-motion navigation moves through intermediate scroll positions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('./');
  await page.evaluate(() => {
    window.__scrollSamples = [];
    window.addEventListener('scroll', () => window.__scrollSamples.push(window.scrollY));
  });
  await page.locator('a[data-nav][href="#notes"]').click();
  await expect(page.locator('a[data-nav][href="#notes"]')).toHaveAttribute('aria-current', 'location');
  await expectSectionBelowHeader(page, 'notes');
  const samples = await page.evaluate(() => window.__scrollSamples);
  expect(new Set(samples.map(Math.round)).size).toBeGreaterThan(2);
});

test('the navigation indicator follows manual scroll and the page bottom', async ({ page }) => {
  await openJournal(page);
  for (const id of ['journeys', 'notes', 'home']) {
    await page.evaluate((sectionId) => {
      const section = document.getElementById(sectionId);
      window.scrollTo(0, section.offsetTop);
    }, id);
    await expect(page.locator(`a[data-nav][href="#${id}"]`))
      .toHaveAttribute('aria-current', 'location');
    await expect(page.locator('a[data-nav][aria-current="location"]')).toHaveCount(1);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('a[data-nav][href="#film"]')).toHaveAttribute('aria-current', 'location');
});

test('opening a deep link places its section below the header', async ({ page }) => {
  await openJournal(page, '#notes');
  await expect(page.locator('#site-header')).toHaveClass(/is-compact/);
  await expect(page.locator('a[data-nav][href="#notes"]')).toHaveAttribute('aria-current', 'location');
  await expectSectionBelowHeader(page, 'notes');
});

test('all three notes show distinct details and return focus when closed', async ({ page }) => {
  await openJournal(page);
  const titles = [];
  const bodies = [];
  for (const note of ['slow', 'pack', 'notice']) {
    const trigger = page.locator(`[data-open-note="${note}"]`);
    await trigger.click();
    await expect(page.locator('#note-dialog')).toBeVisible();
    await expect(page.locator('#note-title')).not.toBeEmpty();
    await expect(page.locator('#note-body')).not.toBeEmpty();
    await expect(page.locator('#note-extra')).not.toBeEmpty();
    titles.push((await page.locator('#note-title').textContent()).trim());
    bodies.push((await page.locator('#note-body').textContent()).trim());
    await page.getByRole('button', { name: 'Close note', exact: true }).click();
    await expect(page.locator('#note-dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  expect(new Set(titles).size).toBe(3);
  expect(new Set(bodies).size).toBe(3);
});

test('Escape closes a note and restores keyboard focus', async ({ page }) => {
  await openJournal(page);
  const trigger = page.locator('[data-open-note="slow"]');
  await trigger.click();
  await expect(page.locator('#note-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#note-dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('the modal keeps background controls inert and prevents background scrolling', async ({ page }) => {
  await openJournal(page);
  await page.locator('[data-open-note="slow"]').click();
  const dialog = page.locator('#note-dialog');
  const closeButton = page.getByRole('button', { name: 'Close note', exact: true });
  await expect(closeButton).toBeFocused();

  for (const direction of ['Tab', 'Shift+Tab']) {
    for (let step = 0; step < 2; step += 1) {
      await page.keyboard.press(direction);
      // Native dialogs may let Tab visit browser chrome (activeElement=body),
      // but must never let it reach an interactive control behind the modal.
      expect(await dialog.evaluate((element) => (
        document.activeElement === document.body || element.contains(document.activeElement)
      ))).toBe(true);
    }
    await expect(closeButton).toBeFocused();
  }

  const beforeScroll = await page.evaluate(() => window.scrollY);
  const box = await dialog.boundingBox();
  await page.mouse.move(4, box.y + box.height / 2);
  await page.mouse.wheel(0, 600);
  // Observe a brief interval because a scroll-lock assertion checks that a
  // wheel event does not cause asynchronous scrolling behind the dialog.
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.scrollY)).toBe(beforeScroll);
  await expect(dialog).toBeVisible();
});

test('clicking the backdrop closes a note without treating content clicks as dismissal', async ({ page }) => {
  await openJournal(page);
  const trigger = page.locator('[data-open-note="pack"]');
  await trigger.click();
  await page.locator('#note-body').click();
  await expect(page.locator('#note-dialog')).toBeVisible();
  const box = await page.locator('#note-dialog').boundingBox();
  expect(box.x).toBeGreaterThan(8);
  await page.mouse.click(4, box.y + box.height / 2);
  await expect(page.locator('#note-dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('the embedded video loads metadata and actually plays', async ({ page }) => {
  await openJournal(page);
  const video = page.locator('video');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('controls', true);
  await expect(video).toHaveJSProperty('muted', true);
  await expect(video).toHaveAttribute('playsinline', '');
  await expect.poll(() => video.evaluate((element) => element.readyState), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(1);
  expect(await video.evaluate((element) => element.duration)).toBeGreaterThan(0);
  // A real click supplies a user gesture; play() then avoids browser-specific
  // coordinates inside the native video controls.
  await video.click();
  await video.evaluate((element) => element.play());
  await expect.poll(() => video.evaluate((element) => element.currentTime), { timeout: 10_000 })
    .toBeGreaterThan(0.1);
  expect(await video.evaluate((element) => element.error)).toBeNull();
  await video.evaluate((element) => element.pause());
});

test('the hero is vertically centered and the pause section has a fixed background', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await openJournal(page);
  const heights = [];
  for (const height of [768, 1000]) {
    await page.setViewportSize({ width: 1366, height });
    const hero = await page.locator('#home').boundingBox();
    const content = await page.locator('.hero-content').boundingBox();
    const heroCenter = hero.y + hero.height / 2;
    const contentCenter = content.y + content.height / 2;
    expect(Math.abs(contentCenter - heroCenter)).toBeLessThan(2);
    heights.push(hero.height);
  }
  // Resizing must change the outer element, not merely rerun the same check.
  expect(heights[1]).toBeGreaterThan(heights[0]);
  const background = await page.locator('.pause-section').evaluate((element) => {
    const style = getComputedStyle(element);
    return { attachment: style.backgroundAttachment, image: style.backgroundImage };
  });
  expect(background.attachment).toContain('fixed');
  expect(background.image).toContain('url(');
});

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`layout and controls work at ${viewport.width} × ${viewport.height}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await openJournal(page);
    const overflow = await page.evaluate(() => (
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    ));
    expect(overflow).toBeLessThanOrEqual(1);

    const navLinks = page.locator('#site-header a');
    const boxes = [];
    for (const link of await navLinks.all()) {
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      boxes.push(box);
    }
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const overlapWidth = Math.min(boxes[i].x + boxes[i].width, boxes[j].x + boxes[j].width)
          - Math.max(boxes[i].x, boxes[j].x);
        const overlapHeight = Math.min(boxes[i].y + boxes[i].height, boxes[j].y + boxes[j].height)
          - Math.max(boxes[i].y, boxes[j].y);
        expect(overlapWidth > 1 && overlapHeight > 1).toBe(false);
      }
    }

    const cards = page.locator('.notes-grid > *');
    await expect(cards).toHaveCount(3);
    const cardBoxes = await Promise.all((await cards.all()).map((card) => card.boundingBox()));
    if (viewport.width >= 768) {
      expect(Math.abs(cardBoxes[0].y - cardBoxes[1].y)).toBeLessThan(2);
      expect(Math.abs(cardBoxes[1].y - cardBoxes[2].y)).toBeLessThan(2);
      expect(cardBoxes[1].x).toBeGreaterThan(cardBoxes[0].x);
    } else {
      expect(cardBoxes[1].y).toBeGreaterThan(cardBoxes[0].y);
      expect(cardBoxes[2].y).toBeGreaterThan(cardBoxes[1].y);
      expect(Math.abs(cardBoxes[0].x - cardBoxes[1].x)).toBeLessThan(2);
    }

    await page.locator('a[data-nav][href="#journeys"]').click();
    await expectSectionBelowHeader(page, 'journeys');
    await page.getByRole('button', { name: 'Next journey', exact: true }).click();
    await expectSlide(page, 1);
    const copyBlocks = page.locator('[data-slide]:visible .slide-copy > *');
    const arrows = page.locator('[data-carousel] .carousel-arrow');
    for (const block of await copyBlocks.all()) {
      const copyBox = await block.boundingBox();
      for (const arrow of await arrows.all()) {
        const arrowBox = await arrow.boundingBox();
        const overlapWidth = Math.min(copyBox.x + copyBox.width, arrowBox.x + arrowBox.width)
          - Math.max(copyBox.x, arrowBox.x);
        const overlapHeight = Math.min(copyBox.y + copyBox.height, arrowBox.y + arrowBox.height)
          - Math.max(copyBox.y, arrowBox.y);
        expect(overlapWidth > 1 && overlapHeight > 1, 'Carousel arrows must not cover slide text')
          .toBe(false);
      }
    }
    await page.locator('[data-open-note="notice"]').click();
    await expect(page.locator('#note-dialog')).toBeVisible();
    const dialog = await page.locator('#note-dialog').boundingBox();
    expect(dialog.width).toBeLessThanOrEqual(viewport.width);
    expect(dialog.height).toBeLessThanOrEqual(viewport.height);
    await page.getByRole('button', { name: 'Close note', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath('full-page.png'), fullPage: true });
  });
}
