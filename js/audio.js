/* Lectura en voz alta de oraciones y pasos del Rosario.
   Usa la Web Speech API del navegador; no envía texto a ningún servidor. */
const LumenAudio = {
    _rate: 0.95,
    _speaking: false,
    _paused: false,
    _currentBtn: null,
    _wakeLock: null,
    _queue: [],
    _queueIndex: 0,

    supported: function() {
        return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    },

    _esc: function(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    buttonHTML: function(text, label) {
        if (!this.supported() || !text) return '';
        const safe = this._esc(text);
        const safeLabel = this._esc(label || 'Escuchar');
        return `<button class="audio-btn" type="button" data-audio-text="${safe}" data-audio-label="${safeLabel}" aria-pressed="false" title="${safeLabel}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M11 5L6 9H3v6h3l5 4V5z"></path><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>
            <span>${safeLabel}</span>
        </button>`;
    },

    _voices: function() {
        if (!this.supported()) return [];
        try { return window.speechSynthesis.getVoices() || []; } catch (e) { return []; }
    },

    _voice: function() {
        const voices = this._voices();
        if (!voices.length) return null;
        const preferred = ['es-ES', 'es-MX', 'es-US', 'es-AR', 'es-419', 'es-CO', 'es-VE'];
        for (let i = 0; i < preferred.length; i++) {
            const found = voices.find(function(v) { return (v.lang || '').toLowerCase() === preferred[i].toLowerCase(); });
            if (found) return found;
        }
        return voices.find(function(v) { return /^es/i.test(v.lang || ''); }) || null;
    },

    _chunk: function(text) {
        const clean = String(text || '')
            .replace(/\s+/g, ' ')
            .replace(/\s+([.,;:!?])/g, '$1')
            .trim();
        if (!clean) return [];
        const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
        const chunks = [];
        let current = '';
        sentences.forEach(function(sentence) {
            const piece = sentence.trim();
            if (!piece) return;
            if (piece.length > 220) {
                if (current) { chunks.push(current); current = ''; }
                const words = piece.split(' ');
                let part = '';
                words.forEach(function(word) {
                    if ((part + ' ' + word).trim().length > 190) {
                        if (part) chunks.push(part.trim());
                        part = word;
                    } else {
                        part = (part + ' ' + word).trim();
                    }
                });
                if (part) chunks.push(part.trim());
                return;
            }
            if ((current + ' ' + piece).trim().length > 220) {
                if (current) chunks.push(current.trim());
                current = piece;
            } else {
                current = (current + ' ' + piece).trim();
            }
        });
        if (current) chunks.push(current.trim());
        return chunks;
    },

    _setButton: function(btn, mode) {
        if (!btn) return;
        const label = btn.getAttribute('data-audio-label') || 'Escuchar';
        const span = btn.querySelector('span');
        btn.classList.toggle('playing', mode === 'playing');
        btn.classList.toggle('paused', mode === 'paused');
        btn.setAttribute('aria-pressed', mode === 'playing' ? 'true' : 'false');
        if (span) span.textContent = mode === 'playing' ? 'Pausar' : (mode === 'paused' ? 'Reanudar' : label);
        btn.setAttribute('title', mode === 'playing' ? 'Pausar lectura' : (mode === 'paused' ? 'Reanudar lectura' : label));
    },

    _resetButton: function() {
        if (this._currentBtn) this._setButton(this._currentBtn, 'idle');
        this._currentBtn = null;
    },

    _requestWakeLock: function() {
        const self = this;
        if (!navigator.wakeLock || !navigator.wakeLock.request || document.visibilityState !== 'visible') return;
        navigator.wakeLock.request('screen').then(function(lock) {
            self._wakeLock = lock;
            lock.addEventListener('release', function() {
                if (self._wakeLock === lock) self._wakeLock = null;
            });
        }).catch(function() {});
    },

    _releaseWakeLock: function() {
        if (this._wakeLock && this._wakeLock.release) {
            try { this._wakeLock.release(); } catch (e) {}
        }
        this._wakeLock = null;
    },

    speak: function(text, btn) {
        if (!this.supported() || !text) return;
        this.stop();
        const chunks = this._chunk(text);
        if (!chunks.length) return;
        this._currentBtn = btn || null;
        this._setButton(btn, 'playing');
        this._speaking = true;
        this._paused = false;
        this._queue = chunks;
        this._queueIndex = 0;
        this._requestWakeLock();
        this._speakNext();
    },

    _speakNext: function() {
        const self = this;
        if (!this._speaking) return;
        if (this._queueIndex >= this._queue.length) {
            this._finish();
            return;
        }
        const text = this._queue[this._queueIndex++];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = this._rate;
        utterance.pitch = 1;
        const voice = this._voice();
        if (voice) utterance.voice = voice;
        utterance.onend = function() {
            if (self._speaking && !self._paused) self._speakNext();
        };
        utterance.onerror = function() {
            if (self._speaking) self._finish();
        };
        try { window.speechSynthesis.speak(utterance); } catch (e) { this._finish(); }
    },

    _finish: function() {
        this._speaking = false;
        this._paused = false;
        this._queue = [];
        this._queueIndex = 0;
        this._releaseWakeLock();
        this._resetButton();
    },

    pause: function() {
        if (!this.supported() || !this._speaking || this._paused) return;
        try { window.speechSynthesis.pause(); } catch (e) {}
        this._paused = true;
        this._setButton(this._currentBtn, 'paused');
        this._releaseWakeLock();
    },

    resume: function() {
        if (!this.supported() || !this._speaking || !this._paused) return;
        try { window.speechSynthesis.resume(); } catch (e) {}
        this._paused = false;
        this._setButton(this._currentBtn, 'playing');
        this._requestWakeLock();
    },

    stop: function() {
        if (!this.supported()) return;
        this._speaking = false;
        this._paused = false;
        this._queue = [];
        this._queueIndex = 0;
        try { window.speechSynthesis.cancel(); } catch (e) {}
        this._releaseWakeLock();
        this._resetButton();
    },

    toggle: function(btn) {
        if (!btn) return;
        const text = btn.getAttribute('data-audio-text') || '';
        if (this._currentBtn === btn && this._speaking) {
            if (this._paused) this.resume();
            else this.pause();
            return;
        }
        this.speak(text, btn);
    },

    setRate: function(rate) {
        const value = Number(rate);
        if (!isFinite(value)) return;
        this._rate = Math.max(0.6, Math.min(1.4, value));
        if (this._speaking) {
            const btn = this._currentBtn;
            const text = btn ? btn.getAttribute('data-audio-text') : '';
            if (text) this.speak(text, btn);
        }
    }
};

document.addEventListener('click', function(event) {
    const btn = event.target && event.target.closest ? event.target.closest('.audio-btn') : null;
    if (!btn) return;
    event.preventDefault();
    LumenAudio.toggle(btn);
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && LumenAudio._speaking && !LumenAudio._paused) {
        LumenAudio._requestWakeLock();
    } else if (document.visibilityState === 'hidden') {
        LumenAudio._releaseWakeLock();
    }
});
