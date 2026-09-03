const VALID_VARIANTS = new Set(["a", "b"]);
const STORAGE_KEY = "spmpz-variant";
const THEME_COLORS = {
  a: "#f7f2e8",
  b: "#071b2c",
};

export function resolveVariant(search, stored) {
  const requested = new URLSearchParams(search).get("variant");
  if (VALID_VARIANTS.has(requested)) return requested;
  return VALID_VARIANTS.has(stored) ? stored : "a";
}

export function withVariant(url, variant) {
  const next = new URL(url);
  next.searchParams.set("variant", VALID_VARIANTS.has(variant) ? variant : "a");
  return next.toString();
}

export function initializeSite(doc, win) {
  const root = doc.documentElement;
  const buttons = [...doc.querySelectorAll("[data-variant-choice]")];
  const theme = doc.querySelector('meta[name="theme-color"]');
  const header = doc.getElementById("top");
  const navToggle = doc.getElementById("nav-toggle");
  const navigation = doc.getElementById("primary-navigation");

  root.classList.add("js");

  let stored = null;
  try {
    stored = win.localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  const applyVariant = (variant, persist = false) => {
    const selected = VALID_VARIANTS.has(variant) ? variant : "a";
    root.dataset.variant = selected;

    for (const button of buttons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.variantChoice === selected),
      );
    }

    theme?.setAttribute("content", THEME_COLORS[selected]);

    if (!persist) return;

    try {
      win.localStorage.setItem(STORAGE_KEY, selected);
    } catch {
      // The visual choice still works when storage is blocked.
    }

    try {
      win.history.replaceState(null, "", withVariant(win.location.href, selected));
    } catch {
      // Some local preview contexts do not allow history replacement.
    }
  };

  applyVariant(resolveVariant(win.location.search, stored));

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
