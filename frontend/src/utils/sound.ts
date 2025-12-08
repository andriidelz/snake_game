class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {};
  private enabled = localStorage.getItem('soundEnabled') !== 'false';
  private background?: HTMLAudioElement;

  constructor() {
    this.preload();
  }

  private preload() {
    const list = [
      'eat', 'powerup', 'game-over', 'achievement',
      'button-click', 'background', 'speed-up', 'shield'
    ];

    list.forEach(name => {
      const audio = new Audio(`/sounds/${name}.mp3`);
      audio.preload = 'auto';
      audio.volume = name === 'background' ? 0.25 : 0.5;
      if (name === 'background') {
        audio.loop = true;
        this.background = audio;
      }
      this.sounds[name] = audio;
    });
  }

  play(name: string) {
    if (!this.enabled || !this.sounds[name]) return;
    this.sounds[name].currentTime = 0;
    this.sounds[name].play().catch(() => {});
  }

  playBackground() {
    if (this.enabled && this.background) {
      this.background.play().catch(() => {});
    }
  }

  pauseBackground() {
    this.background?.pause();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());
    if (!enabled) this.pauseBackground();
  }

  toggleBackground() {
    if (!this.background) return;
    if (this.background.paused) {
      this.playBackground();
    } else {
      this.pauseBackground();
    }
  }
}

export const sound = new SoundManager();