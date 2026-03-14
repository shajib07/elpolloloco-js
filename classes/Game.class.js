/**
 * Controls game loop, updates and rendering.
 */
class Game {
  /**
   * @param {HTMLCanvasElement} canvas - Main game canvas.
   * @param {Object.<string, boolean>} keys - Shared keyboard state object.
   * @param {(result: "win"|"lose") => void} onGameOver - End-of-game callback.
   */
  constructor(canvas, keys, onGameOver) {
    this.setupCore(canvas, keys, onGameOver);
    this.setupWorldSystems();
    this.setupEntities();
    this.setupCollections();
    this.setupCombatState();
    this.setupAudio();
  }

  setupCore(canvas, keys, onGameOver) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.keys = keys;
    this.onGameOver = onGameOver;
    this.animationFrameId = null;
    this.player = new Player();
    this.isGameOver = false;
    this.isGameWon = false;
  }

  setupWorldSystems() {
    this.world = new World(this.canvas);
    this.hud = new HUD(this.context, this.canvas);
    this.collisionSystem = new CollisionSystem(this);
    this.loseScreenImage = ImageManager.load(IMAGE_PATHS.SCREENS.LOSE);
    this.winScreenImage = ImageManager.load(IMAGE_PATHS.SCREENS.WIN);
  }

  setupEntities() {
    this.enemies = [new Chicken(620, 360), new ChickenNormal(980, 340)];
    this.endboss = new Endboss(1800, 150);
    this.isBossFightActive = false;
  }

  setupCollections() {
    this.coins = this.createCoins();
    this.collectedCoins = 0;
    this.maxCoins = this.coins.length;
    this.bottles = this.createBottles();
    this.collectedBottles = 0;
    this.maxBottles = this.bottles.length;
    this.throwables = [];
  }

  setupCombatState() {
    this.lastThrowAt = 0;
    this.throwCooldownMs = 350;
    this.lastBossHitAt = 0;
    this.bossHitCooldownMs = 800;
  }

  setupAudio() {
    this.audio = new AudioManager();
    this.audio.loadDefaultGameSounds();
  }

  createCoins() {
    return [
      new Coin(500, 300),
      new Coin(750, 260),
      new Coin(980, 220),
      new Coin(1250, 280),
      new Coin(1600, 240),
    ];
  }

  createBottles() {
    const bottlePositions = [630, 900, 1180, 1460, 1720, 1980];
    return bottlePositions.map((x) => new Bottle(x, 342));
  }

  /**
   * Starts the animation loop once and plays start sound.
   */
  start() {
    if (this.animationFrameId !== null) return;
    this.playSound("GAME_START");
    this.loop();
  }

  /**
   * Stops the running animation loop.
   */
  stop() {
    if (this.animationFrameId === null) return;
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  loop() {
    this.update();
    this.render();

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  /**
   * Runs one game-tick update for world, collisions and win/lose checks.
   */
  update() {
    if (this.isGameOver) return;
    this.updateWorldState();
    this.updateEnemiesState();
    this.runCollisionChecks();
    this.updateThrowingState();
    this.updateGameResultState();
  }

  updateWorldState() {
    this.player.update(this.keys, this.world.width);
    this.world.updateCamera(this.player.x);
    this.updateBossFightState();
  }

  updateEnemiesState() {
    this.enemies.forEach((enemy) => enemy.update());
    this.recycleEnemies();
    if (!this.isBossFightActive) return;
    this.endboss.update(this.player.x);
  }

  runCollisionChecks() {
    this.collisionSystem.checkPlayerEnemyCollisions();
    this.collisionSystem.checkPlayerBossCollision();
    this.collisionSystem.checkCoinCollisions();
    this.collisionSystem.checkBottleCollisions();
    this.collisionSystem.checkThrowableEnemyCollisions();
  }

  updateThrowingState() {
    this.handleThrowInput();
    this.updateThrowables();
  }

  updateGameResultState() {
    this.checkGameWin();
    this.checkGameOver();
  }

  /**
   * Draws world objects, HUD and end overlays.
   */
  render() {
    this.renderWorldScene();
    this.renderHud();
    this.renderEndOverlay();
  }

  renderWorldScene() {
    this.world.clear();
    this.world.beginRender();
    this.world.drawBackground();
    this.drawWorldObjects();
    this.world.endRender();
  }

  drawWorldObjects() {
    this.player.draw(this.context);
    this.enemies.forEach((enemy) => enemy.draw(this.context));
    this.coins.forEach((coin) => coin.draw(this.context));
    this.bottles.forEach((bottle) => bottle.draw(this.context));
    this.throwables.forEach((bottle) => bottle.draw(this.context));
    this.endboss.draw(this.context);
  }

  renderHud() {
    this.hud.drawEndbossBar(this.isBossFightActive, this.endboss);
    this.hud.drawBottleBar(this.collectedBottles, this.maxBottles);
    this.hud.drawCoinBar(this.collectedCoins, this.maxCoins);
    this.hud.drawHealthBar(this.player.health);
  }

  renderEndOverlay() {
    if (this.isGameWon) {
      this.drawWinScreen();
      return;
    }
    if (!this.isGameOver) return;
    this.drawLoseScreen();
  }

  recycleEnemies() {
    this.enemies.forEach((enemy) => {
      if (!enemy.isOutOfScreen(this.world.cameraX)) {
        return;
      }

      const randomOffset = 200 + Math.random() * 300;
      enemy.reset(this.world.cameraX + this.canvas.width + randomOffset);
    });
  }

  updateBossFightState() {
    if (this.isBossFightActive) {
      return;
    }
    this.isBossFightActive = this.player.x >= this.endboss.canvasActivationX;
    if (this.isBossFightActive) {
      this.playSound("BOSS_APPROACH");
    }
  }

  /**
   * Triggers win state after endboss defeat.
   */
  checkGameWin() {
    if (!this.shouldTriggerWin()) return;
    this.playSound("GAME_WIN");
    this.isGameWon = true;
    this.isGameOver = true;
    this.triggerGameOverCallback("win");
  }

  shouldTriggerWin() {
    if (this.isGameWon || this.isGameOver) return false;
    return this.endboss.isDead;
  }

  /**
   * Triggers lose state when player health reaches zero.
   */
  checkGameOver() {
    if (!this.shouldTriggerLose()) return;
    this.isGameOver = true;
    this.playSound("PLAYER_DEAD");
    this.triggerGameOverCallback("lose");
  }

  shouldTriggerLose() {
    if (this.player.health > 0) return false;
    return !this.isGameOver;
  }

  triggerGameOverCallback(result) {
    if (typeof this.onGameOver !== "function") return;
    this.onGameOver(result);
  }

  drawLoseScreen() {
    if (!this.isDrawableImage(this.loseScreenImage)) return;
    this.drawFullScreenImage(this.loseScreenImage);
  }

  isOver() {
    return this.isGameOver;
  }

  /**
   * Processes throw input, cooldown and bottle inventory.
   */
  handleThrowInput() {
    const now = Date.now();
    if (!this.canThrowBottle(now)) return;
    const origin = this.player.getThrowOrigin();
    this.spawnThrowableBottle(origin);
    this.collectedBottles -= 1;
    this.lastThrowAt = now;
  }

  /**
   * Validates whether bottle throw is currently allowed.
   * @param {number} now - Current timestamp in milliseconds.
   * @returns {boolean}
   */
  canThrowBottle(now) {
    if (!this.keys.KeyD) return false;
    if (this.collectedBottles <= 0) return false;
    return now - this.lastThrowAt >= this.throwCooldownMs;
  }

  spawnThrowableBottle(origin) {
    const bottle = new ThrowableBottle(origin.x, origin.y, origin.facingLeft);
    this.throwables.push(bottle);
  }

  updateThrowables() {
    this.throwables.forEach((bottle) => bottle.update(this.world.width));
    this.throwables = this.throwables.filter((bottle) => !bottle.isFinished);
  }

  drawWinScreen() {
    if (this.isDrawableImage(this.winScreenImage)) {
      this.drawFullScreenImage(this.winScreenImage);
    }
  }

  isDrawableImage(image) {
    return image.complete && image.naturalWidth > 0;
  }

  drawFullScreenImage(image) {
    this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Plays a one-shot sound by registered sound name.
   * @param {string} name - Sound identifier.
   */
  playSound(name) {
    this.audio.play(name);
  }

  /**
   * Toggles global game audio mute state.
   */
  toggleMute() {
    this.audio.toggleMute();
  }

  /**
   * @returns {boolean} True when audio is muted.
   */
  isMuted() {
    return this.audio.isMuted();
  }
}
