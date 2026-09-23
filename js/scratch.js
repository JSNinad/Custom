/**
 * Scratch-to-reveal card (Canvas)
 * Touch + mouse · auto-clear around 55–60% scratched
 */
(function (global) {
  "use strict";

  /**
   * @param {object} opts
   * @param {HTMLCanvasElement} opts.canvas
   * @param {HTMLElement} opts.reveal
   * @param {HTMLElement} [opts.hint]
   * @param {number} [opts.threshold=0.58]
   */
  function initScratchCard(opts) {
    const canvas = opts.canvas;
    const reveal = opts.reveal;
    const hint = opts.hint || null;
    const threshold = opts.threshold ?? 0.58;

    if (!canvas || !reveal) {
      return { destroy() {} };
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let drawing = false;
    let done = false;
    let lastX = 0;
    let lastY = 0;
    let checkTimer = 0;

    function sizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintCover(w, h);
    }

    function paintCover(w, h) {
      // Gold / blush decorative scratch surface
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#e8c98a");
      grad.addColorStop(0.35, "#d4b978");
      grad.addColorStop(0.65, "#c9a45c");
      grad.addColorStop(1, "#b8924a");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Soft pattern
      ctx.fillStyle = "rgba(255, 248, 235, 0.18)";
      for (let i = 0; i < 40; i++) {
        const x = (i * 47) % w;
        const y = (i * 73) % h;
        ctx.beginPath();
        ctx.arc(x, y, 8 + (i % 5), 0, Math.PI * 2);
        ctx.fill();
      }

      // Border shimmer
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, w - 8, h - 8);
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const point = e.touches && e.touches[0] ? e.touches[0] : e;
      return {
        x: point.clientX - rect.left,
        y: point.clientY - rect.top,
      };
    }

    function scratch(x, y) {
      if (done) return;
      const radius = Math.max(22, canvas.clientWidth * 0.07);
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = radius * 2;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      lastX = x;
      lastY = y;

      if (hint) hint.classList.add("is-hidden");

      // Throttle reveal checks
      if (!checkTimer) {
        checkTimer = window.setTimeout(() => {
          checkTimer = 0;
          measureScratch();
        }, 120);
      }
    }

    function measureScratch() {
      if (done) return;
      const { width, height } = canvas;
      if (!width || !height) return;

      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, width, height);
      } catch {
        return;
      }

      const data = imageData.data;
      // Sample every Nth pixel for performance
      const step = 4 * 8; // every 8th pixel (RGBA)
      let transparent = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += step) {
        total++;
        if (data[i] < 32) transparent++;
      }

      const ratio = total ? transparent / total : 0;
      if (ratio >= threshold) {
        complete();
      }
    }

    function complete() {
      if (done) return;
      done = true;
      canvas.classList.add("is-done");
      reveal.classList.add("is-shown");
      if (hint) hint.classList.add("is-hidden");
      // Clear remaining cover smoothly
      window.setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 400);
    }

    function onStart(e) {
      if (done) return;
      e.preventDefault();
      drawing = true;
      const p = getPos(e);
      lastX = p.x;
      lastY = p.y;
      scratch(p.x, p.y);
    }

    function onMove(e) {
      if (!drawing || done) return;
      e.preventDefault();
      const p = getPos(e);
      scratch(p.x, p.y);
    }

    function onEnd() {
      drawing = false;
    }

    sizeCanvas();
    const onResize = () => {
      if (!done) sizeCanvas();
    };
    window.addEventListener("resize", onResize);

    canvas.addEventListener("mousedown", onStart);
    canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onEnd);
    canvas.addEventListener("touchcancel", onEnd);

    return {
      destroy() {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mouseup", onEnd);
      },
    };
  }

  global.initScratchCard = initScratchCard;
})(window);
