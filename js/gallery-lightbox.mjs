export function wrappedIndex(current, change, length) {
  if (length <= 0) return 0;
  return (current + change + length) % length;
}

export function initializeGallery(section) {
  const links = [...section.querySelectorAll("[data-gallery-item]")];
  const dialog = section.querySelector("[data-gallery-dialog]");
  const image = section.querySelector("[data-gallery-image]");
  const caption = section.querySelector("[data-gallery-caption]");
  const status = section.querySelector("[data-gallery-status]");
  const previous = section.querySelector("[data-gallery-previous]");
  const next = section.querySelector("[data-gallery-next]");
  const close = section.querySelector("[data-gallery-close]");

  if (!links.length || !dialog || !image || !caption || !status || !previous || !next || !close) return;

  let currentIndex = 0;
  let activeTrigger = null;

  const show = (index) => {
    currentIndex = wrappedIndex(index, 0, links.length);
    const link = links[currentIndex];
    const thumbnail = link.querySelector("img");
    const figureCaption = link.closest("figure")?.querySelector("figcaption");
    image.setAttribute("src", link.getAttribute("href"));
    image.setAttribute(
      "alt",
      link.getAttribute("data-gallery-alt") ?? thumbnail?.getAttribute("alt") ?? "",
    );
    caption.textContent = link.getAttribute("data-gallery-caption")
      ?? figureCaption?.textContent?.trim()
      ?? "";
    status.textContent = `${currentIndex + 1} / ${links.length}`;
  };

  links.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      if (typeof dialog.showModal !== "function") return;
      event.preventDefault();
      activeTrigger = link;
      show(index);
      dialog.showModal();
    });
  });

  previous.addEventListener("click", () => show(wrappedIndex(currentIndex, -1, links.length)));
  next.addEventListener("click", () => show(wrappedIndex(currentIndex, 1, links.length)));
  close.addEventListener("click", () => dialog.close());

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(wrappedIndex(currentIndex, -1, links.length));
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(wrappedIndex(currentIndex, 1, links.length));
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => activeTrigger?.focus());
}

export function initializeGalleries(doc) {
  for (const section of doc.querySelectorAll("[data-meeting-gallery]")) initializeGallery(section);
}
