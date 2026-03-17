import { getDrumNames } from '../audio/instruments.js';
import { getGrid, toggleStep, applyEuclidean, loadPreset, setOnStep } from '../audio/sequencer.js';

const STEPS = 16;
let stepElements = {};
const ROW_COLORS = {
  kick: '#6c5ce7',
  snare: '#fd79a8',
  hihat: '#00cec9',
  clap: '#fdcb6e',
  tom: '#00b894',
};

export function initStepGrid() {
  const gridEl = document.getElementById('seq-grid');
  const controlsEl = document.getElementById('seq-row-controls');
  const names = getDrumNames();

  // Build rows
  names.forEach(name => {
    // Row controls (Euclidean knob)
    const ctrl = document.createElement('div');
    ctrl.className = 'seq-row-ctrl';
    ctrl.innerHTML = `
      <span class="name">${name.slice(0, 4)}</span>
      <label style="font-size:0.55rem">E:</label>
      <input type="range" min="0" max="16" value="0" data-drum="${name}" />
      <span class="euc-val">0</span>
    `;
    const slider = ctrl.querySelector('input');
    const valSpan = ctrl.querySelector('.euc-val');
    slider.addEventListener('input', () => {
      const pulses = parseInt(slider.value);
      valSpan.textContent = pulses;
      applyEuclidean(name, pulses);
      updateGridDisplay();
    });
    controlsEl.appendChild(ctrl);

    // Step row
    const row = document.createElement('div');
    row.className = 'seq-row';

    const label = document.createElement('span');
    label.className = 'row-label';
    label.textContent = name.slice(0, 4);
    row.appendChild(label);

    stepElements[name] = [];

    for (let s = 0; s < STEPS; s++) {
      const step = document.createElement('div');
      step.className = 'seq-step';
      step.dataset.drum = name;
      step.dataset.step = s;

      step.addEventListener('click', () => {
        toggleStep(name, s);
        updateGridDisplay();
      });

      row.appendChild(step);
      stepElements[name].push(step);
    }

    gridEl.appendChild(row);
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadPreset(btn.dataset.preset);
      updateGridDisplay();
    });
  });

  // Step highlight callback
  setOnStep((step) => {
    names.forEach(name => {
      stepElements[name].forEach((el, i) => {
        el.classList.toggle('current', i === step);
      });
    });
  });

  updateGridDisplay();
}

export function updateGridDisplay() {
  const grid = getGrid();
  Object.entries(grid).forEach(([name, steps]) => {
    if (!stepElements[name]) return;
    steps.forEach((val, i) => {
      const el = stepElements[name][i];
      if (!el) return;
      el.classList.toggle('on', !!val);
      el.style.background = val ? ROW_COLORS[name] + '66' : '';
    });
  });
}
