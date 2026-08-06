const menu = document.querySelector(".menu");
const nav = document.querySelector(".nav");

if (menu && nav) {
  menu.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("open", !open);
    nav.classList.toggle("mobile-open", !open);
  });

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menu.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
      nav.classList.remove("mobile-open");
    }),
  );
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

document.querySelectorAll("[data-bonsai-particles]").forEach((container) => {
  if (container.childElementCount) return;
  for (let index = 0; index < 28; index += 1) {
    const particle = document.createElement("span");
    particle.className = "production-particle";
    particle.style.left = `${54 + Math.random() * 35}%`;
    particle.style.top = `${48 + Math.random() * 32}%`;
    particle.style.setProperty(
      "--particle-duration",
      `${5.4 + Math.random() * 3}s`,
    );
    particle.style.setProperty("--particle-delay", `${-Math.random() * 7}s`);
    particle.style.setProperty(
      "--particle-drift",
      `${-18 + Math.random() * 36}px`,
    );
    container.appendChild(particle);
  }
});

const animatedHero = document.querySelector("[data-bonsai-hero]");
if (animatedHero) {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const playGrowth = () => {
    animatedHero.classList.remove("is-growing");
    void animatedHero.offsetWidth;
    animatedHero.classList.add("is-growing");
  };
  playGrowth();

  if (!reducedMotion) {
    animatedHero.addEventListener("pointermove", (event) => {
      const bounds = animatedHero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      animatedHero.style.setProperty("--tree-rotate-y", `${(x - 0.5) * 5}deg`);
      animatedHero.style.setProperty("--tree-rotate-x", `${(0.5 - y) * 4}deg`);
      animatedHero.style.setProperty("--tree-light-x", `${x * 100}%`);
      animatedHero.style.setProperty("--tree-light-y", `${y * 100}%`);
    });
    animatedHero.addEventListener("pointerleave", () => {
      animatedHero.style.setProperty("--tree-rotate-y", "0deg");
      animatedHero.style.setProperty("--tree-rotate-x", "0deg");
      animatedHero.style.setProperty("--tree-light-x", "50%");
      animatedHero.style.setProperty("--tree-light-y", "45%");
    });
  }

  if ("IntersectionObserver" in window) {
    let wasVisible = true;
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        animatedHero.classList.toggle("is-offscreen", !entry.isIntersecting);
        if (entry.isIntersecting && !wasVisible) playGrowth();
        wasVisible = entry.isIntersecting;
      },
      { threshold: 0.08 },
    );
    heroObserver.observe(animatedHero);
  }
}
