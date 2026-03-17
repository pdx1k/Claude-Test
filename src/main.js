import { initAudioEngine, setFilterFrequency, setReverbWet, setPan, setCrusherWet } from './audio/engine.js';
import { createInstruments } from './audio/instruments.js';
import { initGrid, setTempo } from './audio/sequencer.js';
import { initMotion, getMotion } from './motion/controller.js';
import { initPads, setOnPadTrigger } from './ui/pads.js';
import { initControls } from './ui/controls.js';
import { initStepGrid } from './ui/step-grid.js';
import { initEditor } from './ui/editor.js';
import { initMotionDisplay } from './ui/motion-display.js';
import { initCanvas, onNoteVisual } from './visuals/canvas.js';

const landing = document.getElementById('landing');
const app = document.getElementById('app');
const enterBtn = document.getElementById('enter-btn');

enterBtn.addEventListener('click', async () => {
  // Initialize everything
  try {
    await initAudioEngine();
    createInstruments();
    initGrid();
    setTempo(120);
    await initMotion();

    // UI
    initPads();
    initControls();
    initStepGrid();
    initEditor();
    initMotionDisplay();

    // Visuals
    initCanvas();

    // Connect pad triggers to visualizer
    setOnPadTrigger((index, color) => {
      onNoteVisual(index, color);
    });

    // Start motion → audio mapping loop
    startMotionAudioLoop();

    // Transition
    landing.classList.add('fade-out');
    setTimeout(() => {
      landing.classList.add('hidden');
      app.classList.remove('hidden');
    }, 600);
  } catch (err) {
    console.error('Failed to initialize ÆTHER:', err);
    enterBtn.textContent = 'Error — tap to retry';
  }
});

// Continuously map motion values to audio effects
function startMotionAudioLoop() {
  function update() {
    const m = getMotion();

    // Filter cutoff: 200Hz to 8000Hz
    const freq = 200 + m.x * 7800;
    setFilterFrequency(freq);

    // Reverb wet: 0 to 0.8
    setReverbWet(m.y * 0.8);

    // Pan: -1 to 1
    setPan(m.rotation);

    // Crusher: shake drives it
    setCrusherWet(m.shake);

    requestAnimationFrame(update);
  }
  update();
}
