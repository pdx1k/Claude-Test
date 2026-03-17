// Motion controller — normalizes device orientation/motion + mouse fallback
// Exports a shared motion state object used by audio engine and visualizer

const motion = {
  x: 0.5,       // 0-1, maps to filter cutoff
  y: 0.5,       // 0-1, maps to reverb wet
  rotation: 0,  // -1 to 1, maps to pan
  shake: 0,     // 0-1, decays over time, maps to crusher
};

let targetX = 0.5;
let targetY = 0.5;
let targetRotation = 0;
let hasMotionPermission = false;
let shakeDecayTimer = null;
let lastAccel = { x: 0, y: 0, z: 0 };
const SHAKE_THRESHOLD = 20;
const LERP_FACTOR = 0.12;

export function getMotion() { return motion; }

function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

function handleOrientation(e) {
  // beta: front-back tilt (-180 to 180), gamma: left-right tilt (-90 to 90)
  const beta = e.beta ?? 0;
  const gamma = e.gamma ?? 0;

  // Normalize to 0-1 range (centered around neutral hold position ~45 degrees)
  targetX = Math.max(0, Math.min(1, (gamma + 45) / 90));
  targetY = Math.max(0, Math.min(1, (beta - 20) / 70));

  // Alpha for rotation (-1 to 1), but we use gamma for more intuitive control
  targetRotation = Math.max(-1, Math.min(1, gamma / 45));
}

function handleMotion(e) {
  const accel = e.accelerationIncludingGravity || e.acceleration;
  if (!accel) return;

  const dx = Math.abs(accel.x - lastAccel.x);
  const dy = Math.abs(accel.y - lastAccel.y);
  const dz = Math.abs(accel.z - lastAccel.z);
  const magnitude = dx + dy + dz;

  lastAccel = { x: accel.x || 0, y: accel.y || 0, z: accel.z || 0 };

  if (magnitude > SHAKE_THRESHOLD) {
    motion.shake = Math.min(1, magnitude / 60);
    clearTimeout(shakeDecayTimer);
    shakeDecayTimer = setTimeout(() => {
      motion.shake = 0;
    }, 300);
  }
}

function handleMouse(e) {
  targetX = e.clientX / window.innerWidth;
  targetY = e.clientY / window.innerHeight;
  targetRotation = (targetX - 0.5) * 2; // -1 to 1
}

function handleMouseShake(e) {
  // Right-click as shake on desktop (for testing)
  if (e.button === 2) {
    e.preventDefault();
    motion.shake = 0.8;
    clearTimeout(shakeDecayTimer);
    shakeDecayTimer = setTimeout(() => { motion.shake = 0; }, 300);
  }
}

// Smooth update loop
function updateLoop() {
  motion.x = lerp(motion.x, targetX, LERP_FACTOR);
  motion.y = lerp(motion.y, targetY, LERP_FACTOR);
  motion.rotation = lerp(motion.rotation, targetRotation, LERP_FACTOR);

  // Decay shake
  if (motion.shake > 0.01) {
    motion.shake *= 0.92;
  } else {
    motion.shake = 0;
  }

  requestAnimationFrame(updateLoop);
}

export async function initMotion() {
  // Try to request device orientation permission (iOS 13+)
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const perm = await DeviceOrientationEvent.requestPermission();
      hasMotionPermission = perm === 'granted';
    } catch {
      hasMotionPermission = false;
    }
  } else if (typeof DeviceOrientationEvent !== 'undefined') {
    // Android / non-iOS — access is automatic
    hasMotionPermission = true;
  }

  if (typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      await DeviceMotionEvent.requestPermission();
    } catch { /* ignore */ }
  }

  if (hasMotionPermission) {
    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    window.addEventListener('devicemotion', handleMotion, { passive: true });
  }

  // Always set up mouse fallback (works on desktop, supplements mobile)
  window.addEventListener('mousemove', handleMouse, { passive: true });
  window.addEventListener('mousedown', handleMouseShake);
  window.addEventListener('contextmenu', e => e.preventDefault());

  // Start smooth update loop
  updateLoop();
}
