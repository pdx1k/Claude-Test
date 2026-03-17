// Particle system — spawns particles on note triggers, affected by motion

const particles = [];
const MAX_PARTICLES = 200;

export function spawnParticle(color, x, y) {
  if (particles.length >= MAX_PARTICLES) {
    particles.shift(); // recycle oldest
  }

  const angle = Math.random() * Math.PI * 2;
  const speed = 1 + Math.random() * 3;

  particles.push({
    x: x ?? Math.random() * window.innerWidth,
    y: y ?? Math.random() * window.innerHeight,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 3 + Math.random() * 6,
    color: color || '#a29bfe',
    life: 1.0,
    decay: 0.008 + Math.random() * 0.012,
  });
}

export function spawnBurst(color, x, y, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 2 + Math.random() * 4;

    if (particles.length >= MAX_PARTICLES) particles.shift();

    particles.push({
      x: x ?? window.innerWidth / 2,
      y: y ?? window.innerHeight / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 5,
      color: color || '#a29bfe',
      life: 1.0,
      decay: 0.01 + Math.random() * 0.01,
    });
  }
}

export function updateParticles(ctx, width, height, motion, waveform) {
  // Gravity from motion tilt
  const gravX = (motion.x - 0.5) * 0.3;
  const gravY = (motion.y - 0.5) * 0.3;

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // Physics
    p.vx += gravX;
    p.vy += gravY;
    p.vx *= 0.98;
    p.vy *= 0.98;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;

    // Shake scatter
    if (motion.shake > 0.2) {
      p.vx += (Math.random() - 0.5) * motion.shake * 8;
      p.vy += (Math.random() - 0.5) * motion.shake * 8;
    }

    // Remove dead particles
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    // Draw
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = p.color + Math.floor(p.life * 200).toString(16).padStart(2, '0');
    ctx.fill();

    // Glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life * 2, 0, Math.PI * 2);
    ctx.fillStyle = p.color + Math.floor(p.life * 40).toString(16).padStart(2, '0');
    ctx.fill();
  }
}
