// ── EKG canvas animation ───────────────────────────────────
(function () {
  const canvas = document.getElementById('ekgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, x, points;

  // EKG shape: flat → spike → flat
  const SEGMENT = [
    [0,   0],
    [0.1, 0],
    [0.15, -0.9],
    [0.2,  0.6],
    [0.25, -0.2],
    [0.3,  0],
    [1.0,  0],
  ];

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    x = 0;
    points = [];
  }

  function ekgY(t) {
    // t ∈ [0,1] within one cycle
    const cycle = t % 1;
    for (let i = 0; i < SEGMENT.length - 1; i++) {
      const [x0, y0] = SEGMENT[i];
      const [x1, y1] = SEGMENT[i + 1];
      if (cycle >= x0 && cycle <= x1) {
        const p = (cycle - x0) / (x1 - x0);
        return y0 + (y1 - y0) * p;
      }
    }
    return 0;
  }

  const SPEED    = 1.8;   // px per frame
  const CYCLE_W  = 320;   // px per heartbeat cycle
  const TRAIL    = 900;   // how many px of history to draw

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const midY = H * 0.55;
    const amp  = H * 0.38;

    // advance
    x += SPEED;

    const t = x / CYCLE_W;
    const y = midY + ekgY(t) * amp * -1;
    points.push({ x: x % (W + TRAIL), y });

    // trim old points
    if (points.length > TRAIL / SPEED + 20) points.shift();

    if (points.length < 2) { requestAnimationFrame(draw); return; }

    // Draw fading trail
    for (let i = 1; i < points.length; i++) {
      const alpha = i / points.length;
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = `rgba(0, 230, 118, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Glowing dot at head
    const head = points[points.length - 1];
    const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 12);
    grad.addColorStop(0, 'rgba(0, 230, 118, 0.8)');
    grad.addColorStop(1, 'rgba(0, 230, 118, 0)');
    ctx.beginPath();
    ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ── Smooth nav highlight on scroll ────────────────────────
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${entry.target.id}`
            ? 'var(--text)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();
