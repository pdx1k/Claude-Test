import { getMotion } from '../motion/controller.js';

let orb;

export function initMotionDisplay() {
  orb = document.getElementById('motion-orb');
  updateDisplay();
}

function updateDisplay() {
  const m = getMotion();

  // Move orb within its container based on motion x/y
  const offsetX = (m.x - 0.5) * 28; // container is 48px, orb is 12px → 28px range
  const offsetY = (m.y - 0.5) * 28;

  orb.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

  // Shake glow
  if (m.shake > 0.1) {
    orb.style.boxShadow = `0 0 ${8 + m.shake * 20}px ${m.shake > 0.5 ? '#fd79a8' : '#a29bfe'}`;
    orb.style.background = m.shake > 0.5 ? '#fd79a8' : '#a29bfe';
  } else {
    orb.style.boxShadow = '0 0 8px #a29bfe';
    orb.style.background = '#a29bfe';
  }

  requestAnimationFrame(updateDisplay);
}
