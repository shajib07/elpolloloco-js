class AudioManager {
  constructor() {
    this.sounds = {};
    this.muted = localStorage.getItem("muted") === "true";
  }

  load(name, path, volume = 1) {
    const audio = new Audio(path);
    audio.volume = volume;
    this.sounds[name] = audio;
  }

  play(name) {
    if (this.muted) return;
    const sound = this.sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  loop(name) {
    if (this.muted) return;
    const sound = this.sounds[name];
    if (!sound) return;

    sound.loop = true;
    sound.play().catch(() => {});
  }

  stop(name) {
    const sound = this.sounds[name];
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
  }

  setMuted(value) {
    this.muted = Boolean(value);
    localStorage.setItem("muted", String(this.muted));

    if (this.muted) {
      Object.values(this.sounds).forEach((sound) => {
        sound.pause();
        sound.currentTime = 0;
      });
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
  }

  isMuted() {
    return this.muted;
  }
}
