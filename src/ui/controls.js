import { setVolume } from '../audio/engine.js';
import { setTempo, startSequencer, stopSequencer, isSequencerPlaying } from '../audio/sequencer.js';

export function initControls() {
  // Mode toggle
  const modeButtons = document.querySelectorAll('.mode-btn');
  const panels = {
    pads: document.getElementById('pad-container'),
    sequencer: document.getElementById('seq-container'),
    code: document.getElementById('code-container'),
  };

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;

      // Update buttons
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide panels
      Object.entries(panels).forEach(([key, panel]) => {
        panel.classList.toggle('hidden', key !== mode);
      });
    });
  });

  // Tempo slider
  const tempoSlider = document.getElementById('tempo-slider');
  const tempoValue = document.getElementById('tempo-value');
  tempoSlider.addEventListener('input', () => {
    const bpm = parseInt(tempoSlider.value);
    tempoValue.textContent = bpm;
    setTempo(bpm);
  });

  // Volume slider
  const volumeSlider = document.getElementById('volume-slider');
  volumeSlider.addEventListener('input', () => {
    setVolume(parseInt(volumeSlider.value) / 100);
  });

  // Play/Stop button
  const playBtn = document.getElementById('play-btn');
  playBtn.addEventListener('click', () => {
    if (isSequencerPlaying()) {
      stopSequencer();
      playBtn.classList.remove('active');
      playBtn.innerHTML = '&#9654;'; // play icon
    } else {
      startSequencer();
      playBtn.classList.add('active');
      playBtn.innerHTML = '&#9632;'; // stop icon
    }
  });
}
