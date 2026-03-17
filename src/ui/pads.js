import { playPad, getPadColors, getPadLabels } from '../audio/instruments.js';

let padElements = [];
let onPadTrigger = null; // callback for visualizer

// Keyboard mapping (4 rows)
const KEY_MAP = {
  '1': 0, '2': 1, '3': 2, '4': 3,
  'q': 4, 'w': 5, 'e': 6, 'r': 7,
  'a': 8, 's': 9, 'd': 10, 'f': 11,
  'z': 12, 'x': 13, 'c': 14, 'v': 15,
};

export function setOnPadTrigger(cb) { onPadTrigger = cb; }

export function initPads() {
  const grid = document.getElementById('pad-grid');
  const colors = getPadColors();
  const labels = getPadLabels();

  for (let i = 0; i < 16; i++) {
    const pad = document.createElement('div');
    pad.className = 'pad';
    pad.dataset.index = i;

    // Glow overlay
    const glow = document.createElement('div');
    glow.className = 'glow';
    glow.style.background = `radial-gradient(circle, ${colors[i]}44, transparent)`;
    pad.appendChild(glow);

    // Label
    const label = document.createElement('span');
    label.textContent = labels[i];
    pad.appendChild(label);

    // Touch/mouse events
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerPad(i);
      pad.setPointerCapture(e.pointerId);
    });

    pad.addEventListener('pointerup', () => {
      pad.classList.remove('active');
    });

    pad.addEventListener('pointerleave', () => {
      pad.classList.remove('active');
    });

    // Multi-touch: entering a different pad while dragging
    pad.addEventListener('pointerenter', (e) => {
      if (e.pressure > 0) {
        triggerPad(i);
      }
    });

    grid.appendChild(pad);
    padElements.push(pad);
  }

  // Keyboard
  window.addEventListener('keydown', (e) => {
    // Don't trigger if typing in code editor
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    const idx = KEY_MAP[e.key.toLowerCase()];
    if (idx !== undefined && !e.repeat) {
      triggerPad(idx);
    }
  });

  window.addEventListener('keyup', (e) => {
    const idx = KEY_MAP[e.key.toLowerCase()];
    if (idx !== undefined) {
      padElements[idx]?.classList.remove('active');
    }
  });
}

function triggerPad(index) {
  const pad = padElements[index];
  const colors = getPadColors();
  if (!pad) return;

  // Play sound
  playPad(index);

  // Visual feedback
  pad.classList.add('active');

  // Ripple effect
  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = '60px';
  ripple.style.left = '50%';
  ripple.style.top = '50%';
  ripple.style.marginLeft = '-30px';
  ripple.style.marginTop = '-30px';
  ripple.style.background = `radial-gradient(circle, ${colors[index]}88, transparent)`;
  pad.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);

  // Notify visualizer
  if (onPadTrigger) {
    onPadTrigger(index, colors[index]);
  }
}
