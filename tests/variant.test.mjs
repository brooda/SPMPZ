import test from "node:test";
import assert from "node:assert/strict";
import {
  initializeSite,
  isLocalHtmlLink,
  resolveVariant,
  withVariant,
} from "../js/modern-site.mjs";

test("query parameter wins over stored preference", () => {
  assert.equal(resolveVariant("?variant=b", "a"), "b");
  assert.equal(resolveVariant("?variant=a", "b"), "a");
  assert.equal(resolveVariant("?variant=c", "a"), "c");
});

test("stored valid preference is used and invalid values fall back to A", () => {
  assert.equal(resolveVariant("", "b"), "b");
  assert.equal(resolveVariant("", "c"), "c");
  assert.equal(resolveVariant("?variant=orange", "orange"), "a");
  assert.equal(resolveVariant("?variant=B", null), "a");
});

test("share URL preserves unrelated query values and the hash", () => {
  assert.equal(
    withVariant("https://example.org/?ref=mail#projekty", "b"),
    "https://example.org/?ref=mail&variant=b#projekty",
  );
});

test("only navigable local HTML pages inherit the visual variant", () => {
  for (const href of ["about_pl.html", "projects_en.html#archive", "./english.html", "en/index.html?ref=old"])
    assert.equal(isLocalHtmlLink(href), true, href);

  for (const href of ["#projekty", "statute_pl.pdf", "mailto:kontakt@spmpz.zamosc.pl", "https://example.org/page.html", "//example.org/page.html"])
    assert.equal(isLocalHtmlLink(href), false, href);
});

test("variant URL helper keeps page path and fragment", () => {
  assert.equal(
    withVariant("https://spmpz.test/about_en.html#mission", "b"),
    "https://spmpz.test/about_en.html?variant=b#mission",
  );
});

class FakeElement {
  constructor(dataset = {}) {
    this.dataset = { ...dataset };
    this.attributes = new Map();
    this.listeners = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(name, handler) {
    const handlers = this.listeners.get(name) ?? [];
    handlers.push(handler);
    this.listeners.set(name, handlers);
  }

  dispatch(name, event = {}) {
    for (const handler of this.listeners.get(name) ?? []) handler(event);
  }
}

function buildPage({ search = "", stored = null } = {}) {
  const root = new FakeElement();
  const classes = new Set();
  root.classList = { add: (value) => classes.add(value), contains: (value) => classes.has(value) };

  const buttonA = new FakeElement({ variantChoice: "a" });
  const buttonB = new FakeElement({ variantChoice: "b" });
  const buttonC = new FakeElement({ variantChoice: "c" });
  const navToggle = new FakeElement();
  navToggle.setAttribute("aria-expanded", "false");
  const header = new FakeElement();
  const menuLink = new FakeElement();
  const nav = new FakeElement();
  nav.querySelectorAll = () => [menuLink];
  const theme = new FakeElement();
  const documentListeners = new Map();

  const doc = {
    documentElement: root,
    getElementById(id) {
      return {
        "nav-toggle": navToggle,
        "primary-navigation": nav,
        "site-header": header,
      }[id] ?? null;
    },
    querySelector(selector) {
      return selector === 'meta[name="theme-color"]' ? theme : null;
    },
    querySelectorAll(selector) {
      return selector === "[data-variant-choice]" ? [buttonA, buttonB, buttonC] : [];
    },
    addEventListener(name, handler) {
      documentListeners.set(name, handler);
    },
    dispatch(name, event) {
      documentListeners.get(name)?.(event);
    },
  };

  const writes = [];
  const history = [];
  const win = {
    location: {
      search,
      href: `https://example.org/${search}#aktualnosci`,
    },
    localStorage: {
      getItem: () => stored,
      setItem: (key, value) => writes.push([key, value]),
    },
    history: {
      replaceState: (_state, _title, url) => history.push(url),
    },
  };

  return {
    buttonA,
    buttonB,
    buttonC,
    classes,
    doc,
    header,
    history,
    menuLink,
    navToggle,
    root,
    theme,
    win,
    writes,
  };
}

test("initializer applies query choice and keeps controls synchronized", () => {
  const page = buildPage({ search: "?variant=b", stored: "a" });

  initializeSite(page.doc, page.win);

  assert.equal(page.root.dataset.variant, "b");
  assert.equal(page.buttonA.getAttribute("aria-pressed"), "false");
  assert.equal(page.buttonB.getAttribute("aria-pressed"), "true");
  assert.equal(page.theme.getAttribute("content"), "#e3eaf4");
  assert.equal(page.classes.has("js"), true);
});

test("explicit variant selection is stored and reflected in the URL", () => {
  const page = buildPage();
  initializeSite(page.doc, page.win);

  page.buttonC.dispatch("click");

  assert.equal(page.root.dataset.variant, "c");
  assert.deepEqual(page.writes, [["spmpz-variant", "c"]]);
  assert.equal(page.history.at(-1), "https://example.org/?variant=c#aktualnosci");
  assert.equal(page.theme.getAttribute("content"), "#f6e7cf");
});

test("mobile navigation closes from an anchor and Escape", () => {
  const page = buildPage();
  initializeSite(page.doc, page.win);

  page.navToggle.dispatch("click");
  assert.equal(page.header.dataset.navOpen, "true");
  assert.equal(page.navToggle.getAttribute("aria-expanded"), "true");

  page.menuLink.dispatch("click");
  assert.equal(page.header.dataset.navOpen, "false");

  page.navToggle.dispatch("click");
  page.doc.dispatch("keydown", { key: "Escape" });
  assert.equal(page.header.dataset.navOpen, "false");
  assert.equal(page.navToggle.getAttribute("aria-expanded"), "false");
});
