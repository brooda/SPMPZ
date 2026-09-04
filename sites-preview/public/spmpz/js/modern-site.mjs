import { initializeGalleries } from "./gallery-lightbox.mjs";

const VALID_VARIANTS = new Set(["a", "b", "c", "d"]);
const DEFAULT_VARIANT = "c";
const STORAGE_KEY = "spmpz-variant";
const THEME_COLORS = {
  a: "#e7efe9",
  b: "#e3eaf4",
  c: "#f6e7cf",
  d: "#f8ecdf",
};

export function resolveVariant(search, stored) {
  const requested = new URLSearchParams(search).get("variant");
  if (VALID_VARIANTS.has(requested)) return requested;
  return VALID_VARIANTS.has(stored) ? stored : DEFAULT_VARIANT;
}

export function withVariant(url, variant) {
  const next = new URL(url);
  next.searchParams.set("variant", VALID_VARIANTS.has(variant) ? variant : DEFAULT_VARIANT);
  return next.toString();
}

export function isLocalHtmlLink(href) {
  if (typeof href !== "string") return false;
  const value = href.trim();
  if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(value)) return false;
  return value.split(/[?#]/, 1)[0].toLowerCase().endsWith(".html");
}

export function initializeSite(doc, win) {
  const root = doc.documentElement;
  const buttons = [...doc.querySelectorAll("[data-variant-choice]")];
  const theme = doc.querySelector('meta[name="theme-color"]');
  const header = doc.getElementById("site-header");
  const navToggle = doc.getElementById("nav-toggle");
  const navigation = doc.getElementById("primary-navigation");

  root.classList.add("js");
  initializeGalleries(doc);

  let stored = null;
  try {
    stored = win.localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  const storeVariant = (variant) => {
    try {
      win.localStorage.setItem(STORAGE_KEY, variant);
    } catch {
      // Links still carry the visual choice when storage is blocked.
    }
  };

  const applyVariant = (variant, persist = false) => {
    const selected = VALID_VARIANTS.has(variant) ? variant : DEFAULT_VARIANT;
    root.dataset.variant = selected;

    for (const button of buttons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.variantChoice === selected),
      );
    }

    theme?.setAttribute("content", THEME_COLORS[selected]);

    for (const link of doc.querySelectorAll('a[href]')) {
      const href = link.getAttribute("href");
      if (!isLocalHtmlLink(href)) continue;
      try {
        link.setAttribute("href", withVariant(new URL(href, win.location.href).toString(), selected));
      } catch {
        // Keep the original target if a preview environment exposes an invalid base URL.
      }
    }

    if (!persist) return;

    storeVariant(selected);

    try {
      win.history.replaceState(null, "", withVariant(win.location.href, selected));
    } catch {
      // Some local preview contexts do not allow history replacement.
    }
  };

  const initialVariant = resolveVariant(win.location.search, stored);
  applyVariant(initialVariant);
  storeVariant(initialVariant);

  for (const button of buttons) {
    button.addEventListener("click", () => {
      applyVariant(button.dataset.variantChoice, true);
    });
  }

  const closeMenu = () => {
    if (header) header.dataset.navOpen = "false";
    navToggle?.setAttribute("aria-expanded", "false");
  };

  closeMenu();

  navToggle?.addEventListener("click", () => {
    const isOpen = header?.dataset.navOpen === "true";
    if (header) header.dataset.navOpen = String(!isOpen);
    navToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  for (const link of navigation?.querySelectorAll('a[href^="#"]') ?? []) {
    link.addEventListener("click", closeMenu);
  }

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  initializeSite(document, window);
}
