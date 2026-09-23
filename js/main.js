/**
 * Main invitation orchestration
 * Opening · countdown · scroll · music · gallery
 */
(function () {
  "use strict";

  const WEDDING_MOMENT = new Date(2026, 10, 15, 9, 25, 0); // Nov 15, 2026 9:25 local

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Music ---------- */
  function initMusic() {
    const audio = document.getElementById("wedding-audio");
    const btn = document.getElementById("music-toggle");
    if (!audio || !btn) return { playFromOpen() {} };

    let available = true;

    audio.addEventListener("error", () => {
      available = false;
      // Keep control usable visually but no-op if file missing
    });

    async function tryPlay() {
      if (!available) return;
      try {
        await audio.play();
        btn.classList.add("is-playing");
        btn.setAttribute("aria-label", "Pause music");
      } catch {
        // Autoplay blocked until gesture — open already is a gesture
      }
    }

    function pause() {
      audio.pause();
      btn.classList.remove("is-playing");
      btn.setAttribute("aria-label", "Play music");
    }

    btn.addEventListener("click", () => {
      if (audio.paused) tryPlay();
      else pause();
    });

    return {
      playFromOpen() {
        btn.hidden = false;
        tryPlay();
      },
    };
  }

  /* ---------- Countdown ---------- */
  function initCountdown() {
    const root = document.getElementById("countdown-timer");
    if (!root) return;

    const els = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]'),
    };

    function pad(n) {
      return String(Math.max(0, n)).padStart(2, "0");
    }

    function tick() {
      const now = new Date();
      let diff = WEDDING_MOMENT.getTime() - now.getTime();
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      update(els.days, pad(days));
      update(els.hours, pad(hours));
      update(els.minutes, pad(minutes));
      update(els.seconds, pad(seconds));
    }

    function update(el, value) {
      if (!el) return;
      if (el.textContent === value) return;
      el.textContent = value;
      el.classList.add("is-tick");
      window.setTimeout(() => el.classList.remove("is-tick"), 220);
    }

    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------- Character / word name reveal ---------- */
  function wrapChars(el) {
    if (!el || el.dataset.wrapped) return;
    const text = el.textContent.trim();
    el.dataset.wrapped = "1";
    el.classList.add("char-reveal");
    el.innerHTML = text
      .split("")
      .map((ch) => {
        if (ch === " ") return '<span class="char">&nbsp;</span>';
        return `<span class="char">${ch}</span>`;
      })
      .join("");
  }

  /* ---------- Opening animation ---------- */
  function initOpeningAnimation({ onOpened, petals, music }) {
    const opening = document.getElementById("opening");
    const btn = document.getElementById("open-invite");
    const invitation = document.getElementById("invitation");
    const bride = document.getElementById("name-bride");
    const amp = document.getElementById("name-amp");
    const groom = document.getElementById("name-groom");
    const dateEl = document.getElementById("opening-date");

    if (!opening || !btn || !invitation) return;

    wrapChars(bride);
    wrapChars(groom);

    let opened = false;

    function revealNamesGSAP() {
      if (typeof gsap === "undefined" || prefersReducedMotion()) {
        bride.style.opacity = "1";
        amp.style.opacity = "1";
        groom.style.opacity = "1";
        dateEl.style.opacity = "1";
        return Promise.resolve();
      }

      const brideChars = bride.querySelectorAll(".char");
      const groomChars = groom.querySelectorAll(".char");

      gsap.set([brideChars, amp, groomChars, dateEl], { opacity: 0, y: 18 });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(brideChars, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.045,
      })
        .to(amp, { opacity: 1, y: 0, duration: 0.45 }, "-=0.15")
        .to(
          groomChars,
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.045 },
          "-=0.1"
        )
        .to(dateEl, { opacity: 1, y: 0, duration: 0.7 }, "-=0.15");

      return new Promise((resolve) => tl.eventCallback("onComplete", resolve));
    }

    async function openInvitation() {
      if (opened) return;
      opened = true;

      opening.classList.add("is-opening", "is-opened");
      btn.setAttribute("aria-hidden", "true");

      if (petals) petals.start();
      if (music) music.playFromOpen();

      // Soft scale on seal already handled by CSS :active / class
      await revealNamesGSAP();

      // Brief beat so guests see the names on the cover
      await wait(prefersReducedMotion() ? 200 : 900);

      invitation.hidden = false;
      opening.classList.add("is-hidden");

      // Unlock page scroll focus
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });

      if (typeof onOpened === "function") onOpened();
    }

    btn.addEventListener("click", openInvitation);
    btn.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openInvitation();
        }
      }
    );
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /* ---------- Scroll animations ---------- */
  function initScrollAnimations() {
    const items = document.querySelectorAll(".anim-item");
    if (!items.length) return;

    if (prefersReducedMotion()) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }

    // Prefer GSAP ScrollTrigger when available
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      items.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
            onStart() {
              el.classList.add("is-in");
            },
          }
        );
      });

      // Gentle parallax on hero image
      document.querySelectorAll(".parallax-img").forEach((img) => {
        gsap.to(img, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return;
    }

    // Fallback: IntersectionObserver
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  /* ---------- Gallery ---------- */
  function initGallery() {
    const items = document.querySelectorAll(".gallery__item");
    if (!items.length) return;

    if (prefersReducedMotion()) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((el) => io.observe(el));
  }

  /* ---------- Boot ---------- */
  function boot() {
    const canvas = document.getElementById("petal-canvas");
    const petals = window.initPetalSystem(canvas);
    const music = initMusic();

    initCountdown();

    initOpeningAnimation({
      petals,
      music,
      onOpened() {
        initScrollAnimations();
        initGallery();

        // Init scratch after layout is visible
        requestAnimationFrame(() => {
          window.initScratchCard({
            canvas: document.getElementById("scratch-canvas"),
            reveal: document.getElementById("scratch-reveal"),
            hint: document.getElementById("scratch-hint"),
            threshold: 0.58,
          });
        });
      },
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
