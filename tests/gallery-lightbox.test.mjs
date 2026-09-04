import test from "node:test";
import assert from "node:assert/strict";
import {
  initializeGallery,
  wrappedIndex,
} from "../js/gallery-lightbox.mjs";

class FakeElement {
  constructor(attributes = {}) {
    this.attributes = new Map(Object.entries(attributes));
    this.listeners = new Map();
    this.textContent = "";
    this.open = false;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  addEventListener(name, handler) {
    const handlers = this.listeners.get(name) ?? [];
    handlers.push(handler);
    this.listeners.set(name, handlers);
  }

  dispatch(name, event = {}) {
    event.target ??= this;
    for (const handler of this.listeners.get(name) ?? []) handler(event);
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
    this.dispatch("close");
  }

  focus() {
    this.focused = true;
  }
}

function galleryFixture() {
  const image = new FakeElement();
  const caption = new FakeElement();
  const status = new FakeElement();
  const previous = new FakeElement();
  const next = new FakeElement();
  const close = new FakeElement();
  const dialog = new FakeElement();

  const links = [
    new FakeElement({ href: "images/one-large.webp" }),
    new FakeElement({
      href: "images/two-large.webp",
      "data-gallery-alt": "Drugie zdjęcie",
      "data-gallery-caption": "Prezentacja — Archiwum SPMPZ",
    }),
  ];
  const thumbnails = [
    new FakeElement({ alt: "Pierwsze zdjęcie" }),
    null,
  ];
  const captions = [new FakeElement(), null];
  captions[0].textContent = "Otwarcie — Archiwum SPMPZ";

  links.forEach((link, index) => {
    link.querySelector = (selector) => selector === "img" ? thumbnails[index] : null;
    link.closest = () => captions[index] ? ({
      querySelector: (selector) => selector === "figcaption" ? captions[index] : null,
    }) : null;
  });

  const selectors = new Map([
    ["[data-gallery-dialog]", dialog],
    ["[data-gallery-image]", image],
    ["[data-gallery-caption]", caption],
    ["[data-gallery-status]", status],
    ["[data-gallery-previous]", previous],
    ["[data-gallery-next]", next],
    ["[data-gallery-close]", close],
  ]);
  const section = {
    querySelector: (selector) => selectors.get(selector) ?? null,
    querySelectorAll: (selector) => selector === "[data-gallery-item]" ? links : [],
  };

  return { caption, close, dialog, image, links, next, previous, section, status };
}

test("wrapped gallery navigation continues across both ends", () => {
  assert.equal(wrappedIndex(0, -1, 6), 5);
  assert.equal(wrappedIndex(5, 1, 6), 0);
  assert.equal(wrappedIndex(2, 1, 6), 3);
});

test("lightbox opens a photo and supports buttons, keyboard and focus return", () => {
  const gallery = galleryFixture();
  initializeGallery(gallery.section);

  let prevented = false;
  gallery.links[0].dispatch("click", { preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(gallery.dialog.open, true);
  assert.equal(gallery.image.getAttribute("src"), "images/one-large.webp");
  assert.equal(gallery.image.getAttribute("alt"), "Pierwsze zdjęcie");
  assert.equal(gallery.caption.textContent, "Otwarcie — Archiwum SPMPZ");
  assert.equal(gallery.status.textContent, "1 / 2");

  gallery.next.dispatch("click");
  assert.equal(gallery.image.getAttribute("src"), "images/two-large.webp");
  assert.equal(gallery.image.getAttribute("alt"), "Drugie zdjęcie");
  assert.equal(gallery.caption.textContent, "Prezentacja — Archiwum SPMPZ");
  assert.equal(gallery.status.textContent, "2 / 2");

  gallery.dialog.dispatch("keydown", { key: "ArrowRight", preventDefault() {} });
  assert.equal(gallery.image.getAttribute("src"), "images/one-large.webp");

  gallery.previous.dispatch("click");
  assert.equal(gallery.image.getAttribute("src"), "images/two-large.webp");

  gallery.close.dispatch("click");
  assert.equal(gallery.dialog.open, false);
  assert.equal(gallery.links[0].focused, true);
});
