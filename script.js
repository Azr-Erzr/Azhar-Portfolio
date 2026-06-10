// ===== Azhar Moolla — Portfolio interactions =====
// Base interactions work standalone; Motion (motion.dev, loaded via CDN as
// window.Motion) layers on entrance, scroll-linked, and spring animations.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const M = !reduceMotion && window.Motion ? window.Motion : null;
if (M) document.documentElement.classList.add("has-motion");

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Nav: fixed-position height + elevated state on scroll ---------- */
const navWrap = document.querySelector(".nav-wrap");

// The nav is position:fixed, so body padding reserves its space; keep the
// CSS variable in sync with the real rendered height.
const setNavHeight = () =>
  document.documentElement.style.setProperty("--nav-h", navWrap.offsetHeight + "px");
setNavHeight();
window.addEventListener("resize", setNavHeight);
window.addEventListener(
  "scroll",
  () => navWrap.classList.toggle("is-scrolled", window.scrollY > 12),
  { passive: true }
);

/* ---------- Scroll reveal (base, works without Motion) ---------- */
const revealEls = document.querySelectorAll(".reveal");
const heroReveals = new Set(document.querySelectorAll(".hero-inner .reveal"));

function showAll(els) {
  els.forEach((el) => el.classList.add("is-visible"));
}

if (reduceMotion || !("IntersectionObserver" in window)) {
  showAll(revealEls);
} else {
  // When Motion drives the hero entrance, exclude hero elements from the
  // observer so the two systems don't fight.
  const observed = M ? [...revealEls].filter((el) => !heroReveals.has(el)) : [...revealEls];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  observed.forEach((el) => observer.observe(el));

  // Fail-safe: never leave content hidden if the observer doesn't fire
  // (e.g. headless renderers, browser quirks).
  setTimeout(() => showAll(revealEls), 2500);
}

/* ---------- Motion: hero entrance sequence ---------- */
if (M) {
  const { animate, stagger } = M;
  const ease = [0.22, 1, 0.36, 1];

  // Split the name into characters for a staggered rise (dot keeps its accent).
  const title = document.querySelector(".hero-title");
  const label = title.textContent.trim();
  title.setAttribute("aria-label", label);
  const frag = document.createDocumentFragment();
  [...title.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      [...node.textContent].forEach((ch) => {
        if (ch === " ") {
          frag.appendChild(document.createTextNode(" "));
        } else {
          const s = document.createElement("span");
          s.className = "char";
          s.setAttribute("aria-hidden", "true");
          s.textContent = ch;
          frag.appendChild(s);
        }
      });
    } else {
      node.classList.add("char");
      node.setAttribute("aria-hidden", "true");
      frag.appendChild(node);
    }
  });
  title.textContent = "";
  title.appendChild(frag);
  title.classList.add("is-visible");

  animate(
    title.querySelectorAll(".char"),
    { opacity: [0, 1], y: ["0.55em", 0], filter: ["blur(8px)", "blur(0px)"] },
    { duration: 0.7, delay: stagger(0.035, { startDelay: 0.1 }), ease }
  );

  // Remaining hero elements rise in sequence after the name.
  const rest = [...heroReveals].filter((el) => el !== title);
  rest.forEach((el) => el.classList.add("is-visible"));
  animate(
    rest,
    { opacity: [0, 1], y: [22, 0] },
    { duration: 0.65, delay: stagger(0.12, { startDelay: 0.45 }), ease }
  );

  /* ---------- Motion: scroll progress bar ---------- */
  M.scroll(animate(".scroll-progress", { scaleX: [0, 1] }, { ease: "linear" }));

  /* ---------- Motion: stat counters ---------- */
  const stats = document.querySelectorAll(".stat-num[data-value]");
  let counted = false;
  M.inView(
    ".hero-stats",
    () => {
      if (counted) return;
      counted = true;
      stats.forEach((el) => {
        const target = parseFloat(el.dataset.value);
        const decimals = Number(el.dataset.decimals || 0);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        animate(0, target, {
          duration: 1.4,
          ease: "circOut",
          onUpdate: (v) => {
            el.textContent = prefix + v.toFixed(decimals) + suffix;
          },
        });
      });
    },
    { amount: 0.4 }
  );

  /* ---------- Motion: parallax drift on project screenshots ---------- */
  document.querySelectorAll(".project-media").forEach((media) => {
    const img = media.querySelector("img");
    M.scroll(animate(img, { y: ["-4.5%", "4.5%"] }, { ease: "linear" }), {
      target: media,
      offset: ["start end", "end start"],
    });
  });
}

/* ---------- Pointer tilt on project screenshots (fine pointers only) ---------- */
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".project-media").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
      card.style.transform = `perspective(950px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- Lightbox for analyst work gallery ---------- */
const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox.querySelector("img");
const lightboxClose = lightbox.querySelector(".lightbox-close");
let lastFocused = null;

document.querySelectorAll(".gallery-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    lastFocused = btn;
    lightboxImg.src = btn.dataset.full;
    lightboxImg.alt = btn.querySelector("img").alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (M) {
      M.animate(lightbox, { opacity: [0, 1] }, { duration: 0.25 });
      M.animate(
        lightboxImg,
        { opacity: [0, 1], scale: [0.93, 1] },
        { type: "spring", stiffness: 320, damping: 28 }
      );
    }
    lightboxClose.focus();
  });
});

function closeLightbox() {
  const finish = () => {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };
  if (M) {
    M.animate(lightbox, { opacity: 0 }, { duration: 0.18 }).then(finish);
  } else {
    finish();
  }
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
});
