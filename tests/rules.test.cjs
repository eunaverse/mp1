const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sass = require('sass');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const html = fs.readFileSync(path.join(source, 'index.html'), 'utf8');

// Read the ordinary opening tags in our authored HTML, without a test library.
const tags = [...html.matchAll(/<([a-z][\w:-]*)\b([^<>]*?)>/gi)].map((match) => {
  const attributes = new Map();
  const attributePattern = /([^\s="'<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const attribute of match[2].matchAll(attributePattern)) {
    attributes.set(attribute[1].toLowerCase(), attribute[2] ?? attribute[3] ?? attribute[4] ?? '');
  }
  return { name: match[1].toLowerCase(), attributes };
});

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(filename) : [filename];
  });
}

test('authored HTML keeps styling and behavior in separate files and avoids table layout', () => {
  for (const tag of tags) {
    assert.notEqual(tag.name, 'style', 'Put CSS in the SCSS file, not a <style> block.');
    assert.notEqual(tag.name, 'table', 'Use semantic sections and CSS layout, not a table.');
    assert.ok(!tag.attributes.has('style'), `<${tag.name}> has an inline style attribute.`);
    for (const attribute of tag.attributes.keys()) {
      assert.ok(!/^on[a-z]+$/.test(attribute), `Move the ${attribute} handler into JavaScript.`);
    }
  }
  for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    assert.equal(script[1].trim(), '', 'Move inline script content into a JavaScript file.');
  }
});

test('the site uses plain JavaScript without runtime package dependencies', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(packageJson.dependencies ?? {}), [], 'Runtime dependencies are not needed for this assignment.');
  assert.deepEqual(Object.keys(packageJson.optionalDependencies ?? {}), [], 'Optional runtime dependencies are still runtime dependencies.');

  const importPattern = /\b(?:import\s+(?:[^;'"\n]*?\s+from\s*)?|import\s*\(\s*|require\s*\(\s*|export\s+[^;'"\n]*?\s+from\s*)(['"])([^'"]+)\1/g;
  for (const filename of sourceFiles(source).filter((file) => /\.[cm]?js$/.test(file))) {
    const javascript = fs.readFileSync(filename, 'utf8');
    for (const imported of javascript.matchAll(importPattern)) {
      assert.ok(imported[2].startsWith('.'), `Use local source files instead of importing ${imported[2]} in ${path.relative(root, filename)}.`);
    }
  }
});

test('navigation and in-page links lead to unique, existing sections', () => {
  const ids = tags.filter((tag) => tag.attributes.has('id')).map((tag) => tag.attributes.get('id'));
  assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique.');

  const sectionIds = tags.filter((tag) => tag.name === 'section' && tag.attributes.has('data-section'))
    .map((tag) => tag.attributes.get('id'));
  const navTargets = tags.filter((tag) => tag.name === 'a' && tag.attributes.has('data-nav'))
    .map((tag) => tag.attributes.get('href'));
  assert.deepEqual([...navTargets].sort(), ['#film', '#home', '#journeys', '#notes']);
  for (const target of navTargets) {
    assert.ok(sectionIds.includes(target.slice(1)), `Navigation target ${target} must be a section.`);
  }
  for (const tag of tags.filter((item) => item.name === 'a')) {
    const href = tag.attributes.get('href') ?? '';
    if (href.startsWith('#')) assert.ok(ids.includes(href.slice(1)), `Broken in-page link: ${href}`);
  }
});

test('content images include meaningful alternative text', () => {
  const images = tags.filter((tag) => tag.name === 'img');
  assert.ok(images.length > 0, 'The journal should contain images.');
  for (const image of images) {
    assert.ok(image.attributes.get('alt')?.trim(), `Describe the image ${image.attributes.get('src')} in its alt attribute.`);
  }
});

test('local HTML media, stylesheets, and CSS image references exist', () => {
  const references = [];
  for (const tag of tags) {
    for (const attribute of ['src', 'href', 'poster']) {
      const url = tag.attributes.get(attribute);
      if (url) references.push({ url, directory: source });
    }
  }
  // Compile first so SCSS loops and variables produce the actual browser URLs.
  const stylesheetDirectory = path.join(source, 'css');
  const stylesheet = sass.renderSync({ file: path.join(stylesheetDirectory, 'main.scss') }).css.toString();
  for (const match of stylesheet.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
    references.push({ url: match[2].trim(), directory: stylesheetDirectory });
  }
  for (const { url, directory } of references) {
    if (/^(?:#|[a-z][\w+.-]*:|\/\/)/i.test(url)) continue;
    const localPath = url.split(/[?#]/)[0];
    const filename = localPath.startsWith('/')
      ? path.join(source, localPath)
      : path.resolve(directory, localPath);
    assert.ok(fs.existsSync(filename), `Missing local resource: ${url}`);
    assert.ok(fs.statSync(filename).isFile(), `Local resource is not a file: ${url}`);
  }
});
