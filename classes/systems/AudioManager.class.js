class AudioManager {
  constructor() {
    this.sounds = {};
  }

  load(name, path, volume = 1) {
    const audio = new Audio(path);
    audio.volume = volume;
    this.sounds[name] = audio;
  }

  play(name) {
    const sound = this.sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  loop(name) {
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
}