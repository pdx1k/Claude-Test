import { getAnalyser } from '../audio/engine.js';
import { getMotion } from '../motion/controller.js';
import { updateParticles, spawnBurst, spawnParticle } from './particles.js';
import { drawWaveform } from './waveform.js';
import { drawSpectrum } from './spectrum.js';
import { drawNebula } from './nebula.js';
import * as Tone from 'tone';

let canvas, ctx;
let vizMode = 0; // 0=particles, 1=waveform, 2=spectrum, 3=nebula
const VIZ_MODES = ['Particles', 'Waveform', 'Spectrum', 'Nebula'];
let fftAnalyser;

export function getVizModes() { return VIZ_MODES; }
export function getCurrentVizMode() { return vizMode; }

export function initCanvas() {
  canvas = document.getElementById('viz-canvas');
  ctx = canvas.getContext('2d');

  resize();
  window.addEventListener('resize', resize);

  // FFT analyser for spectrum mode
  fftAnalyser = new Tone.Analyser({ type: 'fft', size: 256 });
  const waveAnalyser = getAnalyser();
  if (waveAnalyser) {
    waveAnalyser.connect(fftAnalyser);
  }

  // Cycle viz mode button
  document.getElementById('viz-mode-btn').addEventListener('click', () => {
    vizMode = (vizMode + 1) % VIZ_MODES.length;
  });

  // Start render loop
  render();
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function render() {
  const w = canvas.width;
  const h = canvas.height;
  const motion = getMotion();

  // Clear with fade trail
  ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
  ctx.fillRect(0, 0, w, h);

  // Get audio data
  const analyser = getAnalyser();
  let waveform = null;
  let fftData = null;

  if (analyser) {
    waveform = analyser.getValue();
  }
  if (fftAnalyser) {
    fftData = fftAnalyser.getValue();
  }

  // Draw based on current mode
  switch (vizMode) {
    case 0: // Particles
      updateParticles(ctx, w, h, motion, waveform);
      // Ambient background particles from audio energy
      if (waveform) {
        let energy = 0;
        for (let i = 0; i < waveform.length; i += 8) {
          energy += Math.abs(waveform[i]);
        }
        energy /= (waveform.length / 8);
        if (energy > 0.05 && Math.random() < energy * 2) {
          spawnParticle(
            `hsl(${260 + motion.x * 100}, 70%, 60%)`,
            Math.random() * w,
            Math.random() * h
          );
        }
      }
      break;
    case 1: // Waveform
      drawWaveform(ctx, w, h, waveform, motion);
      break;
    case 2: // Spectrum
      ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
      ctx.fillRect(0, 0, w, h);
      drawSpectrum(ctx, w, h, fftData, motion);
      break;
    case 3: // Nebula
      drawNebula(ctx, w, h, waveform, fftData, motion);
      break;
  }

  requestAnimationFrame(render);
}

// Called when a pad is triggered — spawn visual effect
export function onNoteVisual(index, color) {
  const w = canvas?.width || window.innerWidth;
  const h = canvas?.height || window.innerHeight;

  // Map pad index to screen position (4x4 grid)
  const col = index % 4;
  const row = Math.floor(index / 4);
  const x = (col + 0.5) / 4 * w;
  const y = (row + 0.5) / 4 * h * 0.6 + h * 0.2;

  spawnBurst(color, x, y, 6);
}
