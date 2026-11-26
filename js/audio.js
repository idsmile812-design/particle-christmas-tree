/**
 * LumièreTree - Zero-Dependency Web Audio Music Box Synthesizer
 * Plays crystalline celesta / music-box renditions of Christmas melodies offline.
 */
window.createMusicBox = function createMusicBox() {
  const NOTE_FREQ = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, G3: 196.00, A3: 220.00, B3: 246.94, F3: 174.61, E3: 164.81, D3: 146.83, C3: 130.81
  };

  const TRACKS = {
    jingle: {
      tempo: 155,
      notes: [
        ['E5', 1, 'C4'], ['E5', 1], ['E5', 2, 'G3'],
        ['E5', 1, 'C4'], ['E5', 1], ['E5', 2, 'G3'],
        ['E5', 1, 'C4'], ['G5', 1], ['C5', 1.5, 'E4'], ['D5', 0.5],
        ['E5', 4, 'C4'],
        ['F5', 1, 'F3'], ['F5', 1], ['F5', 1.5, 'C4'], ['F5', 0.5],
        ['F5', 1, 'C4'], ['E5', 1], ['E5', 1, 'G3'], ['E5', 0.5], ['E5', 0.5],
        ['E5', 1, 'D4'], ['D5', 1], ['D5', 1, 'G3'], ['E5', 1],
        ['D5', 2, 'G3'], ['G5', 2, 'B3'],
        ['E5', 1, 'C4'], ['E5', 1], ['E5', 2, 'G3'],
        ['E5', 1, 'C4'], ['E5', 1], ['E5', 2, 'G3'],
        ['E5', 1, 'C4'], ['G5', 1], ['C5', 1.5, 'E4'], ['D5', 0.5],
        ['E5', 4, 'C4'],
        ['F5', 1, 'F3'], ['F5', 1], ['F5', 1.5, 'C4'], ['F5', 0.5],
        ['F5', 1, 'C4'], ['E5', 1], ['E5', 1, 'G3'], ['E5', 0.5], ['E5', 0.5],
        ['G5', 1, 'G3'], ['G5', 1], ['F5', 1, 'B3'], ['D5', 1],
        ['C5', 4, 'C4']
      ]
    },
    wish: {
      tempo: 140,
      notes: [
        ['G4', 1, 'C4'],
        ['C5', 1, 'C4'], ['C5', 0.5], ['D5', 0.5], ['C5', 0.5], ['B4', 0.5],
        ['A4', 1, 'F3'], ['A4', 1], ['A4', 1, 'A3'],
        ['D5', 1, 'D4'], ['D5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5],
        ['B4', 1, 'G3'], ['G4', 1], ['G4', 1, 'B3'],
        ['E5', 1, 'E4'], ['E5', 0.5], ['F5', 0.5], ['E5', 0.5], ['D5', 0.5],
        ['C5', 1, 'A3'], ['A4', 1], ['G4', 0.5], ['G4', 0.5],
        ['A4', 1, 'F3'], ['D5', 1, 'G3'], ['B4', 1],
        ['C5', 2, 'C4'], ['G4', 1],
        ['C5', 1, 'C4'], ['C5', 1], ['C5', 1],
        ['B4', 2, 'G3'], ['B4', 1],
        ['C5', 1, 'A3'], ['B4', 1], ['A4', 1],
        ['G4', 2, 'E3'], ['D5', 1],
        ['E5', 1, 'C4'], ['D5', 1, 'G3'], ['C5', 1],
        ['G5', 1, 'E4'], ['G4', 1], ['G4', 0.5], ['G4', 0.5],
        ['A4', 1, 'F3'], ['D5', 1, 'G3'], ['B4', 1],
        ['C5', 3, 'C4']
      ]
    },
    silent: {
      tempo: 95,
      notes: [
        ['G4', 1.5, 'C4'], ['A4', 0.5], ['G4', 1], ['E4', 3, 'G3'],
        ['G4', 1.5, 'C4'], ['A4', 0.5], ['G4', 1], ['E4', 3, 'G3'],
        ['D5', 2, 'G3'], ['D5', 1], ['B4', 3, 'B3'],
        ['C5', 2, 'C4'], ['C5', 1], ['G4', 3, 'E4'],
        ['A4', 2, 'F3'], ['A4', 1], ['C5', 1.5, 'A3'], ['B4', 0.5], ['A4', 1],
        ['G4', 1.5, 'C4'], ['A4', 0.5], ['G4', 1], ['E4', 3, 'G3'],
        ['A4', 2, 'F3'], ['A4', 1], ['C5', 1.5, 'A3'], ['B4', 0.5], ['A4', 1],
        ['G4', 1.5, 'C4'], ['A4', 0.5], ['G4', 1], ['E4', 3, 'G3'],
        ['D5', 2, 'G3'], ['D5', 1], ['F5', 1.5, 'B3'], ['D5', 0.5], ['B4', 1],
        ['C5', 3, 'C4'], ['E5', 3, 'G4'],
        ['C5', 1, 'C4'], ['G4', 1], ['E4', 1], ['G4', 1.5, 'G3'], ['F4', 0.5], ['D4', 1],
        ['C4', 4, 'C3']
      ]
    }
  };

  let ctx = null;
  let playing = false;
  let timer = null;
  let stepIndex = 0;
  let currentTrack = 'jingle';
  let beatCallback = null;

  function onBeat(fn) {
    beatCallback = typeof fn === 'function' ? fn : null;
  }

  function ensureCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function playBellNote(freq, duration, volume) {
    const audio = ensureCtx();
    if (!audio || !freq) return;
    const now = audio.currentTime;

    const osc1 = audio.createOscillator();
    const osc2 = audio.createOscillator();
    const gain = audio.createGain();
    const gain2 = audio.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.55, duration * 1.45));

    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.exponentialRampToValueAtTime(volume * 0.22, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.25, duration * 0.6));

    osc1.connect(gain);
    osc2.connect(gain2);
    gain.connect(audio.destination);
    gain2.connect(audio.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + Math.max(0.6, duration * 1.55));
    osc2.stop(now + Math.max(0.3, duration * 0.7));
  }

  function tick() {
    if (!playing) return;
    const track = TRACKS[currentTrack];
    if (!track) {
      stop();
      return;
    }
    const item = track.notes[stepIndex % track.notes.length];
    const beatMs = (60 / track.tempo) * 1000;
    const durSec = (item[1] * beatMs) / 1000;

    if (item[0] && NOTE_FREQ[item[0]]) {
      playBellNote(NOTE_FREQ[item[0]], durSec, 0.14);
    }
    if (item[2] && NOTE_FREQ[item[2]]) {
      playBellNote(NOTE_FREQ[item[2]], durSec * 1.4, 0.055);
    }
    if (beatCallback) {
      const intensity = item[2] ? 1.0 : (item[1] >= 1 ? 0.72 : 0.48);
      beatCallback(intensity);
    }

    stepIndex = (stepIndex + 1) % track.notes.length;
    timer = setTimeout(tick, item[1] * beatMs);
  }

  function start(trackId) {
    if (trackId) currentTrack = trackId;
    if (currentTrack === 'none' || !TRACKS[currentTrack]) {
      stop();
      return false;
    }
    stop();
    ensureCtx();
    playing = true;
    stepIndex = 0;
    tick();
    return true;
  }

  function stop() {
    playing = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function toggle(trackId) {
    if (trackId) currentTrack = trackId;
    if (playing) {
      stop();
      return false;
    }
    return start(currentTrack);
  }

  function setTrack(trackId) {
    currentTrack = trackId;
    if (playing) {
      if (trackId === 'none') stop();
      else start(trackId);
    }
  }

  function isPlaying() {
    return playing;
  }

  return { start, stop, toggle, setTrack, isPlaying, onBeat };
};
