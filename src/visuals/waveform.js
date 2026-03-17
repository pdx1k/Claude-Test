// Oscilloscope-style waveform renderer

export function drawWaveform(ctx, width, height, waveform, motion) {
  if (!waveform || waveform.length === 0) return;

  const sliceWidth = width / waveform.length;
  const centerY = height / 2;

  // Main waveform
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = `hsl(${260 + motion.x * 120}, 80%, 70%)`;

  for (let i = 0; i < waveform.length; i++) {
    const x = i * sliceWidth;
    const y = centerY + waveform[i] * centerY * 0.8;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Glow trail (slightly offset, more transparent)
  ctx.beginPath();
  ctx.lineWidth = 6;
  ctx.strokeStyle = `hsla(${260 + motion.x * 120}, 80%, 60%, 0.15)`;

  for (let i = 0; i < waveform.length; i++) {
    const x = i * sliceWidth;
    const y = centerY + waveform[i] * centerY * 0.8;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Center line
  ctx.beginPath();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = 'rgba(162, 155, 254, 0.2)';
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.stroke();
}
