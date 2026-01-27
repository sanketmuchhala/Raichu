/**
 * Sound Effects Manager for Raichu
 * Provides audio feedback for game events
 */

const SoundManager = {
    enabled: localStorage.getItem('sound_enabled') !== 'false',
    volume: parseFloat(localStorage.getItem('sound_volume') || '0.5'),

    sounds: {
        move: null,
        capture: null,
        promotion: null,
        gameStart: null,
        gameEnd: null
    },

    init() {
        // Create simple beep sounds using Web Audio API (no external files needed)
        this.sounds.move = this.createTone(440, 0.1, 'sine'); // A4 note
        this.sounds.capture = this.createTone(330, 0.15, 'square'); // E4 note
        this.sounds.promotion = this.createTone(523, 0.2, 'triangle'); // C5 note
        this.sounds.gameStart = this.createTone(392, 0.15, 'sine'); // G4 note
        this.sounds.gameEnd = this.createTone(262, 0.3, 'sine'); // C4 note
    },

    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.enabled) return;

            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = type;

                gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (e) {
                console.warn('Sound playback failed:', e);
            }
        };
    },

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', this.enabled.toString());
        return this.enabled;
    },

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        localStorage.setItem('sound_volume', this.volume.toString());
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        SoundManager.init();
    });
    window.SoundManager = SoundManager;
}
