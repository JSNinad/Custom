/**
 * Petal / flower / leaf particle system (Canvas)
 * Soft wedding petals — not snow.
 */
(function (global) {
  "use strict";

  const ASSET_PATHS = [
    "assets/images/petal-pink.png",
    "assets/images/petal-rose.png",
    "assets/images/petal-white.png",
    "assets/images/leaf-green.png",
    "assets/images/flower-white.png",
    "assets/images/flower-yellow.png",
  ];

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isMobile() {
    return window.matchMedia("(max-width: 480px)").matches ||
      ("ontouchstart" in window && window.innerWidth < 768);
  }

  /**
   * @param {HTMLCanvasElement} canvas
   * @returns {{ start: Function, stop: Function, setActive: Function }}
   */
  function initPetalSystem(canvas) {
    if (!canvas) {
      return { start() {}, stop() {}, setActive() {} };
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    const images = [];
    let particles = [];
    let raf = 0;
    let running = false;
    let active = false;
    let visible = !document.hidden;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function maxCount() {
      if (prefersReducedMotion()) return 0;
      return isMobile() ? 18 : 32;
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function loadImages() {
      return Promise.all(
        ASSET_PATHS.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
              img.src = src;
            })
        )
      ).then((imgs) => imgs.filter(Boolean));
    }

    function createParticle(fromTop) {
      const img = images[Math.floor(Math.random() * images.length)];
      const size = 10 + Math.random() * 22;
      return {
        img,
        x: Math.random() * width,
        y: fromTop ? -40 - Math.random() * height * 0.3 : Math.random() * height,
        size,
        speedY: 0.25 + Math.random() * 0.55,
        drift: (Math.random() - 0.5) * 0.45,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.35 + Math.random() * 0.45,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.008 + Math.random() * 0.012,
      };
    }

    function seed() {
      const n = maxCount();
      particles = [];
      for (let i = 0; i < n; i++) {
        particles.push(createParticle(false));
      }
    }

    function draw() {
      if (!running || !active || !visible || prefersReducedMotion()) {
        raf = 0;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.sway += p.swaySpeed;
        p.x += p.drift + Math.sin(p.sway) * 0.35;
        p.y += p.speedY;
        p.rot += p.rotSpeed;

        if (p.y > height + 50 || p.x < -60 || p.x > width + 60) {
          particles[i] = createParticle(true);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.img) {
          ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size * 1.25);
        } else {
          // Fallback soft petal oval if images fail
          ctx.fillStyle = "rgba(201, 123, 134, 0.7)";
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.35, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    }

    function startLoop() {
      if (raf || !running || !active || !visible) return;
      raf = requestAnimationFrame(draw);
    }

    function stopLoop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      ctx && ctx.clearRect(0, 0, width, height);
    }

    function onVisibility() {
      visible = !document.hidden;
      if (visible) startLoop();
      else stopLoop();
    }

    resize();
    window.addEventListener("resize", () => {
      resize();
      if (particles.length !== maxCount()) seed();
    });
    document.addEventListener("visibilitychange", onVisibility);

    loadImages().then((imgs) => {
      images.push(...(imgs.length ? imgs : [null]));
      seed();
    });

    return {
      start() {
        running = true;
        active = true;
        canvas.classList.add("is-active");
        startLoop();
      },
      stop() {
        running = false;
        active = false;
        canvas.classList.remove("is-active");
        stopLoop();
      },
      setActive(on) {
        active = !!on;
        if (active) {
          canvas.classList.add("is-active");
          startLoop();
        } else {
          canvas.classList.remove("is-active");
          stopLoop();
        }
      },
    };
  }

  global.initPetalSystem = initPetalSystem;
})(window);
