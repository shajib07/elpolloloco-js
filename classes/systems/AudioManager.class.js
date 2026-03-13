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

  loadDefaultGameSounds() {
    this.getDefaultGameSoundEntries().forEach((entry) => {
      this.load(entry.name, entry.path, entry.volume);
    });
  }

  getDefaultGameSoundEntries() {
    return [
      { name: "GAME_START", path: AUDIO_PATHS.GAME.START, volume: 0.5 },
      { name: "GAME_WIN", path: AUDIO_PATHS.GAME.WIN, volume: 0.5 },
      { name: "JUMP", path: AUDIO_PATHS.PLAYER.JUMP, volume: 0.5 },
      { name: "PLAYER_HIT", path: AUDIO_PATHS.PLAYER.DAMAGE, volume: 0.5 },
      { name: "PLAYER_DEAD", path: AUDIO_PATHS.PLAYER.DEAD, volume: 0.6 },
      { name: "COIN", path: AUDIO_PATHS.COLLECT.COIN, volume: 0.5 },
      { name: "BOTTLE_COLLECT", path: AUDIO_PATHS.COLLECT.BOTTLE, volume: 0.5 },
      { name: "BOTTLE_BREAK", path: AUDIO_PATHS.BOTTLE.BREAK, volume: 0.6 },
      { name: "CHICKEN_DEAD", path: AUDIO_PATHS.ENEMY.CHICKEN_DEAD, volume: 0.5 },
      { name: "BOSS_APPROACH", path: AUDIO_PATHS.BOSS.APPROACH, volume: 0.5 },
    ];
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
