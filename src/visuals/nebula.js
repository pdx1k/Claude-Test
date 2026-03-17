// Nebula / cloud renderer — soft drifting particles that morph with music

const blobs = [];
const MAX_BLOBS = 40;

function ensureBlobs(width, height) {
  while (blobs.length < MAX_BLOBS) {
    blobs.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 30 + Math.random() * 80,
      baseRadius: 30 + Math.random() * 80,
      hue: 220 + Math.random() * 140,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

export function drawNebula(ctx, width, height, waveform, fftData, motion) {
  ensureBlobs(width, height);

  // Calculate overall audio energy from waveform
  let energy = 0;
  if (waveform) {
    for (let i = 0; i < waveform.length; i++) {
      energy += Math.abs(waveform[i]);
    }
    energy /= waveform.length;
  }

  const time = Date.now() * 0.001;

  for (const blob of blobs) {
    // Drift
    blob.x += blob.vx + (motion.x - 0.5) * 0.8;
    blob.y += blob.vy + (motion.y - 0.5) * 0.8;

    // Wrap
    if (blob.x < -blob.radius) blob.x = width + blob.radius;
    if (blob.x > width + blob.radius) blob.x = -blob.radius;
    if (blob.y < -blob.radius) blob.y = height + blob.radius;
    if (blob.y > height + blob.radius) blob.y = -blob.radius;

    // Pulse with audio
    blob.radius = blob.baseRadius + energy * 60 + Math.sin(time + blob.phase) * 10;

    // Shake scatter
    if (motion.shake > 0.2) {
      blob.vx += (Math.random() - 0.5) * motion.shake * 3;
      blob.vy += (Math.random() - 0.5) * motion.shake * 3;
    }

    // Dampen velocity
    blob.vx *= 0.99;
    blob.vy *= 0.99;

    // Shift hue with motion
    const hue = blob.hue + motion.x * 40;

    // Draw soft radial gradient blob
    const gradient = ctx.createRadialGradient(
      blob.x, blob.y, 0,
      blob.x, blob.y, blob.radius
    );
    gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, ${0.08 + energy * 0.15})`);
    gradient.addColorStop(0.5, `hsla(${hue}, 60%, 40%, ${0.03 + energy * 0.05})`);
    gradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}
