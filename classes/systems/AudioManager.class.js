/**
 * Manages sound loading, playback, mute state and persistence.
 */
class AudioManager {
  constructor() {
    this.sounds = {};
    this.muted = localStorage.getItem("muted") === "true";
  }

  /**
   * Registers one sound asset.
   * @param {string} name - Sound identifier.
   * @param {string} path - Audio file path.
   * @param {number} [volume=1] - Volume in range 0..1.
   */
  load(name, path, volume = 1) {
    const audio = new Audio(path);
    audio.volume = volume;
    this.sounds[name] = audio;
  }

  /**
   * Registers all default game sound effects.
   */
  loadDefaultGameSounds() {
    this.getDefaultGameSoundEntries().forEach((entry) => {
      this.load(entry.name, entry.path, entry.volume);
    });
  }

  /**
   * Provides default game sound definitions.
   * @returns {{name:string,path:string,volume:number}[]}
   */
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

  /**
   * Plays a one-shot sound from start.
   * @param {string} name - Sound identifier.
   */
  play(name) {
    if (this.muted) return;
    const sound = this.sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  /**
   * Starts a looping sound.
   * @param {string} name - Sound identifier.
   */
  loop(name) {
    if (this.muted) return;
    const sound = this.sounds[name];
    if (!sound) return;

    sound.loop = true;
    sound.play().catch(() => {});
  }

  /**
   * Stops one sound and resets playback position.
   * @param {string} name - Sound identifier.
   */
  stop(name) {
    const sound = this.sounds[name];
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;
  }

  /**
   * Sets global mute state and stores it in localStorage.
   * @param {boolean} value - Desired mute state.
   */
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

  /**
   * Toggles global mute state.
   */
  toggleMute() {
    this.setMuted(!this.muted);
  }

  /**
   * @returns {boolean} True when muted.
   */
  isMuted() {
    return this.muted;
  }
}
