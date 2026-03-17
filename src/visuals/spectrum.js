// Frequency spectrum bar renderer

export function drawSpectrum(ctx, width, height, fftData, motion) {
  if (!fftData || fftData.length === 0) return;

  const barCount = 64;
  const step = Math.floor(fftData.length / barCount);
  const barWidth = width / barCount - 2;
  const maxBarHeight = height * 0.7;

  for (let i = 0; i < barCount; i++) {
    // Average a chunk of FFT bins
    let sum = 0;
    for (let j = 0; j < step; j++) {
      const val = fftData[i * step + j];
      // FFT values are in dB (-Infinity to 0), normalize to 0-1
      sum += (val + 140) / 140;
    }
    const amplitude = Math.max(0, Math.min(1, sum / step));
    const barHeight = amplitude * maxBarHeight;

    const x = (i / barCount) * width + 1;
    const y = height - barHeight;

    // Color gradient based on frequency position + motion
    const hue = (i / barCount) * 120 + 200 + motion.x * 60;
    const saturation = 70 + motion.y * 30;

    // Bar
    ctx.fillStyle = `hsla(${hue}, ${saturation}%, 60%, 0.8)`;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Glow top
    ctx.fillStyle = `hsla(${hue}, ${saturation}%, 70%, 0.3)`;
    ctx.fillRect(x - 1, y - 4, barWidth + 2, 8);

    // Reflection
    ctx.fillStyle = `hsla(${hue}, ${saturation}%, 60%, 0.1)`;
    ctx.fillRect(x, height, barWidth, barHeight * 0.3);
  }
}
