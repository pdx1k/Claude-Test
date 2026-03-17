import * as Tone from 'tone';
import { parseCode, CODE_PRESETS } from '../dsl/parser.js';
import { playDrum } from '../audio/instruments.js';

let editorEl, statusEl;
let activePatterns = [];
let codeLoop = null;
let isCodePlaying = false;

export function initEditor() {
  editorEl = document.getElementById('code-editor');
  statusEl = document.getElementById('code-status');

  // Evaluate on input (debounced)
  let debounceTimer;
  editorEl.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => evaluateCode(), 400);
  });

  // Preset buttons
  document.querySelectorAll('.code-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      if (CODE_PRESETS[preset]) {
        editorEl.value = CODE_PRESETS[preset];
        evaluateCode();
      }
    });
  });

  // Allow tab in textarea
  editorEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorEl.selectionStart;
      editorEl.value = editorEl.value.substring(0, start) + '  ' + editorEl.value.substring(editorEl.selectionEnd);
      editorEl.selectionStart = editorEl.selectionEnd = start + 2;
    }
  });
}

function evaluateCode() {
  const code = editorEl.value.trim();
  if (!code) {
    stopCodeSequencer();
    statusEl.textContent = '';
    statusEl.className = '';
    return;
  }

  const { patterns, errors } = parseCode(code);

  if (errors.length > 0) {
    statusEl.textContent = errors[0];
    statusEl.className = 'error';
    return;
  }

  if (patterns.length === 0) {
    statusEl.textContent = 'No valid patterns found';
    statusEl.className = 'error';
    return;
  }

  activePatterns = patterns;
  statusEl.textContent = `${patterns.length} pattern${patterns.length > 1 ? 's' : ''} active`;
  statusEl.className = 'ok';

  startCodeSequencer();
}

function startCodeSequencer() {
  if (codeLoop) {
    codeLoop.dispose();
  }

  const transport = Tone.getTransport();

  // Re-parse on each cycle to pick up motion changes
  codeLoop = new Tone.Loop((time) => {
    // Re-evaluate to get fresh motion values
    const code = editorEl.value.trim();
    if (!code) return;
    const { patterns } = parseCode(code);

    const position = transport.progress || 0;

    patterns.forEach(pattern => {
      const event = pattern.getEvent(
        (transport.ticks / (transport.PPQ * 4)) % 1
      );
      if (event) {
        playDrum(event);
      }
    });
  }, '16n');

  codeLoop.start(0);

  if (transport.state !== 'started') {
    transport.start();
  }

  isCodePlaying = true;
}

function stopCodeSequencer() {
  if (codeLoop) {
    codeLoop.stop();
    codeLoop.dispose();
    codeLoop = null;
  }
  activePatterns = [];
  isCodePlaying = false;
}
