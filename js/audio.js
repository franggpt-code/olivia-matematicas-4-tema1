// =============================================================================
// GESTOR DE AUDIO Y SÍNTESIS DE VOZ PARA MATEMÁTICAS 4.º
// Web Audio API sintetizado nativo + SpeechSynthesis en Español
// Compatible con iPad (iOS Safari), Chrome, Edge, Firefox y Android
// =============================================================================

class SoundManager {
  constructor() {
    this.soundEnabled = true;
    this.voiceEnabled = false;
    this.audioCtx = null;
    this.synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
    this.spanishVoice = null;
    this.currentUtterance = null;
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const findVoice = () => {
      try {
        const voices = this.synth.getVoices();
        // Buscar voz en español (España preferida)
        this.spanishVoice = voices.find(v => v.lang === 'es-ES') ||
                            voices.find(v => v.lang && v.lang.startsWith('es')) ||
                            null;
      } catch (e) {
        console.warn("Error cargando voces", e);
      }
    };
    findVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = findVoice;
    }
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.audioCtx = new AudioContextClass();
        } catch (e) {
          console.warn("AudioContext error", e);
        }
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      try {
        this.audioCtx.resume();
      } catch (e) {}
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    if (!this.voiceEnabled && this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    return this.voiceEnabled;
  }

  playTone(frequency, type = "sine", duration = 0.15, gainValue = 0.12, startTime = 0) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const t = this.audioCtx.currentTime + startTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  playClick() {
    this.playTone(600, "triangle", 0.04, 0.06, 0);
  }

  playCorrect() {
    if (!this.soundEnabled) return;
    this.initContext();
    // Arpegio mayor alegre: Do5, Mi5, Sol5, Do6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, "sine", 0.16, 0.12, idx * 0.06);
    });
  }

  playSuperCorrect() {
    if (!this.soundEnabled) return;
    this.initContext();
    // Acorde triunfal brillante
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, "triangle", 0.25, 0.14, idx * 0.05);
    });
  }

  playWrong() {
    if (!this.soundEnabled) return;
    this.initContext();
    // Tono suave descendente (pedagógico, nunca punitivo)
    this.playTone(320, "sine", 0.15, 0.1, 0);
    this.playTone(260, "sine", 0.22, 0.08, 0.1);
  }

  playFanfare() {
    if (!this.soundEnabled) return;
    this.initContext();
    const fanfare = [
      { f: 523.25, d: 0.12, t: 0.0 },   // C5
      { f: 523.25, d: 0.12, t: 0.12 },  // C5
      { f: 523.25, d: 0.12, t: 0.24 },  // C5
      { f: 659.25, d: 0.25, t: 0.36 },  // E5
      { f: 783.99, d: 0.2,  t: 0.62 },  // G5
      { f: 1046.5, d: 0.5,  t: 0.82 }   // C6
    ];
    fanfare.forEach(item => {
      this.playTone(item.f, "triangle", item.d, 0.15, item.t);
    });
  }

  speakText(text, force = false) {
    if (!force && !this.voiceEnabled) return;
    if (!this.synth) return;

    try {
      this.synth.cancel();
      // Limpiar texto para lectura óptima (ej. números ordinales 1.º -> primero)
      let cleanText = text
        .replace(/1\.º/g, "primero")
        .replace(/2\.º/g, "segundo")
        .replace(/3\.º/g, "tercero")
        .replace(/DM/g, "decenas de millar")
        .replace(/UM/g, "unidades de millar")
        .replace(/\bC\b/g, "centenas")
        .replace(/\bD\b/g, "decenas")
        .replace(/\bU\b/g, "unidades")
        .replace(/<[^>]*>/g, " ");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "es-ES";
      utterance.rate = 0.95; // Un poco pausado para que Olivia entienda bien
      utterance.pitch = 1.05;

      if (this.spanishVoice) {
        utterance.voice = this.spanishVoice;
      }
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speech error", e);
    }
  }

  stopVoice() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }
}

// Instancia global
window.sound = new SoundManager();

// Desbloqueo anticipado de AudioContext en iOS Safari con el primer toque en pantalla
['touchstart', 'touchend', 'click'].forEach(function(evt) {
  document.addEventListener(evt, function() {
    if (window.sound) sound.initContext();
  }, { passive: true, once: true });
});
