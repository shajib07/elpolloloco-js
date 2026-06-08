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
    this.setupDecorations();
    this.setupCollections();
    this.setupCombatState();
    this.setupAudio();
  }

  /**
   * Stores core runtime references and creates the player instance.
   * @param {HTMLCanvasElement} canvas - Main game canvas.
   * @param {Object.<string, boolean>} keys - Shared keyboard state object.
   * @param {(result: "win"|"lose") => void} onGameOver - End-of-game callback.
   */
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

  /**
   * Creates the world renderer, HUD and collision system.
   */
  setupWorldSystems() {
    this.world = new World(this.canvas);
    this.hud = new HUD(this.context, this.canvas);
    this.collisionSystem = new CollisionSystem(this);
    this.loseScreenImage = ImageManager.load(IMAGE_PATHS.SCREENS.LOSE);
    this.winScreenImage = ImageManager.load(IMAGE_PATHS.SCREENS.WIN);
  }

  /**
   * Creates the active enemies and the endboss instance.
   */
  setupEntities() {
    this.enemies = [new Chicken(620, 360), new ChickenNormal(980, 340)];
    this.endboss = new Endboss(1800, 150);
    this.isBossFightActive = false;
  }

  /**
   * Creates decorative world objects that move behind the gameplay layer.
   */
  setupDecorations() {
    this.clouds = this.createClouds();
  }

  /**
   * Initializes collectible arrays and inventory counters.
   */
  setupCollections() {
    this.coins = this.createCoins();
    this.collectedCoins = 0;
    this.maxCoins = this.coins.length;
    this.bottles = this.createBottles();
    this.collectedBottles = 0;
    this.maxBottles = this.bottles.length;
    this.throwables = [];
  }

  /**
   * Initializes cooldowns for throwables and boss contact damage.
   */
  setupCombatState() {
    this.lastThrowAt = 0;
    this.throwCooldownMs = 350;
    this.lastBossHitAt = 0;
    this.bossHitCooldownMs = 800;
  }

  /**
   * Loads the audio manager and default sounds.
   */
  setupAudio() {
    this.audio = new AudioManager();
    this.audio.loadDefaultGameSounds();
  }

  /**
   * Creates the coin collectibles for the level.
   * @returns {Coin[]}
   */
  createCoins() {
    return [
      new Coin(500, 300),
      new Coin(750, 260),
      new Coin(980, 220),
      new Coin(1250, 280),
      new Coin(1600, 240),
    ];
  }

  /**
   * Creates the bottle collectibles for the level.
   * @returns {Bottle[]}
   */
  createBottles() {
    const bottlePositions = [560, 800, 1040, 1280, 1520, 1680];
    return bottlePositions.map((x) => new Bottle(x, 342));
  }

  /**
   * Creates several drifting clouds for the sky layer.
   * @returns {Cloud[]}
   */
  createClouds() {
    return [
      new Cloud(140, 48, 200, 82, 0.45),
      new Cloud(520, 84, 170, 70, 0.62),
      new Cloud(920, 56, 210, 86, 0.38),
      new Cloud(1440, 72, 190, 78, 0.54),
      new Cloud(1900, 44, 220, 90, 0.32),
    ];
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

  /**
   * Advances the game loop by one frame.
   */
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

  /**
   * Updates the player, camera, cloud layer and boss activation state.
   */
  updateWorldState() {
    this.player.update(this.keys, this.world.width);
    this.world.updateCamera(this.player.x);
    this.updateCloudsState();
    this.updateBossFightState();
  }

  /**
   * Updates all regular enemies and the boss when active.
   */
  updateEnemiesState() {
    this.enemies.forEach((enemy) => enemy.update());
    this.recycleEnemies();
    if (!this.isBossFightActive) return;
    this.endboss.update(this.player.x, this.world.width);
  }

  /**
   * Updates drifting decorative clouds.
   */
  updateCloudsState() {
    this.clouds.forEach((cloud) => cloud.update(this.world.width));
  }

  /**
   * Runs the full collision pass for the current frame.
   */
  runCollisionChecks() {
    this.collisionSystem.checkPlayerEnemyCollisions();
    this.collisionSystem.checkPlayerBossCollision();
    this.collisionSystem.checkCoinCollisions();
    this.collisionSystem.checkBottleCollisions();
    this.collisionSystem.checkThrowableEnemyCollisions();
  }

  /**
   * Handles throw input and updates active thrown bottles.
   */
  updateThrowingState() {
    this.handleThrowInput();
    this.updateThrowables();
  }

  /**
   * Checks for win and lose conditions after the frame update.
   */
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

  /**
   * Clears and redraws the world layer.
   */
  renderWorldScene() {
    this.world.clear();
    this.world.beginRender();
    this.world.drawBackground();
    this.drawClouds();
    this.drawWorldObjects();
    this.world.endRender();
  }

  /**
   * Draws the cloud layer behind gameplay objects.
   */
  drawClouds() {
    this.clouds.forEach((cloud) => cloud.draw(this.context));
  }

  /**
   * Draws all active gameplay entities in world space.
   */
  drawWorldObjects() {
    this.player.draw(this.context);
    this.enemies.forEach((enemy) => enemy.draw(this.context));
    this.coins.forEach((coin) => coin.draw(this.context));
    this.bottles.forEach((bottle) => bottle.draw(this.context));
    this.throwables.forEach((bottle) => bottle.draw(this.context));
    this.endboss.draw(this.context);
  }

  /**
   * Draws the HUD overlay in screen space.
   */
  renderHud() {
    this.hud.drawEndbossBar(this.isBossFightActive, this.endboss);
    this.hud.drawBottleBar(this.collectedBottles, this.maxBottles);
    this.hud.drawCoinBar(this.collectedCoins, this.maxCoins);
    this.hud.drawHealthBar(this.player.health);
  }

  /**
   * Draws the win or lose overlay depending on the game state.
   */
  renderEndOverlay() {
    if (this.isGameWon) {
      this.drawWinScreen();
      return;
    }
    if (!this.isGameOver) return;
    this.drawLoseScreen();
  }

  /**
   * Recycles enemies once they leave the visible world.
   */
  recycleEnemies() {
    this.enemies.forEach((enemy) => {
      if (!enemy.isOutOfScreen(this.world.cameraX)) {
        return;
      }

      const randomOffset = 200 + Math.random() * 300;
      enemy.reset(this.world.cameraX + this.canvas.width + randomOffset);
    });
  }

  /**
   * Activates the boss fight once the player reaches the encounter point.
   */
  updateBossFightState() {
    if (this.isBossFightActive) {
      return;
    }
    if (!this.endboss.isActive(this.player.x)) return;

    this.isBossFightActive = true;
    this.endboss.activate();
    this.playSound("BOSS_APPROACH");
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

  /**
   * Checks whether the endboss defeat condition has been reached.
   * @returns {boolean}
   */
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

  /**
   * Checks whether the player has no health left and the death animation finished.
   * @returns {boolean}
   */
  shouldTriggerLose() {
    if (this.player.health > 0) return false;
    return this.player.isDead && this.player.getCurrentAnimation().isFinished;
  }

  /**
   * Notifies the caller about the game result if a callback was provided.
   * @param {"win"|"lose"} result - Final game result.
   */
  triggerGameOverCallback(result) {
    if (typeof this.onGameOver !== "function") return;
    this.onGameOver(result);
  }

  /**
   * Draws the lose overlay if the image asset is ready.
   */
  drawLoseScreen() {
    if (!this.isDrawableImage(this.loseScreenImage)) return;
    this.drawFullScreenImage(this.loseScreenImage);
  }

  /**
   * @returns {boolean} True when the game is over.
   */
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

  /**
   * Creates a new thrown bottle at the given origin point.
   * @param {{x:number,y:number,facingLeft:boolean}} origin - Throw origin data.
   */
  spawnThrowableBottle(origin) {
    const bottle = new ThrowableBottle(origin.x, origin.y, origin.facingLeft);
    this.throwables.push(bottle);
  }

  /**
   * Advances all active thrown bottles and removes finished ones.
   */
  updateThrowables() {
    this.throwables.forEach((bottle) => bottle.update(this.world.width));
    this.throwables = this.throwables.filter((bottle) => !bottle.isFinished);
  }

  /**
   * Draws the win overlay if the image asset is ready.
   */
  drawWinScreen() {
    if (this.isDrawableImage(this.winScreenImage)) {
      this.drawFullScreenImage(this.winScreenImage);
    }
  }

  /**
   * Checks whether the given image asset can be rendered.
   * @param {HTMLImageElement} image - Image to validate.
   * @returns {boolean}
   */
  isDrawableImage(image) {
    return image.complete && image.naturalWidth > 0;
  }

  /**
   * Draws a full-screen overlay image on the canvas.
   * @param {HTMLImageElement} image - Image to render.
   */
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
