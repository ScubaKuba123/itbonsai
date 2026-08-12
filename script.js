const header = document.querySelector(".header");
let nav = header?.querySelector(".nav");

if (header && !nav) {
  nav = document.createElement("nav");
  header.appendChild(nav);
}

if (header && nav) {
  nav.className = "nav projects-nav";
  nav.setAttribute("aria-label", "Główna nawigacja");
  nav.innerHTML = `
    <a href="index.html">Start</a>
    <a href="uslugi.html">Usługi</a>
    <a href="dla-biznesu.html">Dla biznesu</a>
    <a href="realizacje.html">Portfolio</a>
    <a href="o-nas.html">O nas</a>
    <a class="nav-cta" href="index.html#contact">Kontakt</a>`;

  header.querySelector(":scope > .button-small")?.remove();
  if (!header.querySelector(".menu")) {
    const menuButton = document.createElement("button");
    menuButton.className = "menu";
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", "Otwórz menu");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.innerHTML = "<span></span><span></span>";
    header.appendChild(menuButton);
  }
}

const menu = header?.querySelector(".menu");

if (menu && nav) {
  const closeMobileMenu = () => {
    menu.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
    nav.classList.remove("mobile-open");
  };

  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("open", !open);
    nav.classList.toggle("mobile-open", !open);
  });

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", closeMobileMenu),
  );

  document.addEventListener("pointerdown", (event) => {
    if (
      menu.getAttribute("aria-expanded") === "true" &&
      !nav.contains(event.target) &&
      !menu.contains(event.target)
    ) closeMobileMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => revealObserver.observe(element));
} else {
  document
    .querySelectorAll(".reveal")
    .forEach((element) => element.classList.add("visible"));
}

document.querySelectorAll(".interactive-preview").forEach((card) => {
  const media = card.querySelector(
    ".featured-website-media, .site-showcase-media, .portfolio-project-media",
  );
  if (!media) return;

  const startPreview = () => {
    if (card.classList.contains("preview-loaded")) return;
    const frame = document.createElement("iframe");
    frame.src = card.dataset.previewSrc;
    frame.title = card.dataset.previewTitle || "Podgląd strony";
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "fullscreen";
    frame.addEventListener("load", () => card.classList.add("preview-ready"), { once: true });
    media.prepend(frame);
    card.classList.add("preview-loaded");
  };

  media.addEventListener("pointerenter", startPreview, { once: true });
  media.addEventListener("focus", startPreview, { once: true });
});

// A restrained interaction layer: physical feedback without distracting from content.
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (finePointer.matches && !reducedMotion.matches) {
  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.14;
      button.style.setProperty("--magnetic-x", `${x}px`);
      button.style.setProperty("--magnetic-y", `${y}px`);
    });
    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("--magnetic-x");
      button.style.removeProperty("--magnetic-y");
    });
  });

  const heroArt = document.querySelector(".home-production-hero .hero-art");
  heroArt?.addEventListener("pointermove", (event) => {
    const rect = heroArt.getBoundingClientRect();
    heroArt.style.setProperty("--pointer-x", `${((event.clientX - rect.left) / rect.width - 0.5) * 14}px`);
    heroArt.style.setProperty("--pointer-y", `${((event.clientY - rect.top) / rect.height - 0.5) * 10}px`);
  });
  heroArt?.addEventListener("pointerleave", () => {
    heroArt.style.removeProperty("--pointer-x");
    heroArt.style.removeProperty("--pointer-y");
  });
}
