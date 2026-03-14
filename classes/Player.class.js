/**
 * Represents the controllable player character.
 */
class Player extends MovableObject {
  /**
   * Creates a player with movement, animation and health state.
   */
  constructor() {
    super(80, 300, 90, 120);
    this.speed = 4;
    this.currentAnimation = "idle";
    this.setupAnimations();
    this.setupPhysics();
    this.setupHealth();
  }

  /**
   * Loads all player sprite sheets and animations.
   */
  setupAnimations() {
    this.idleFrames = ImageManager.loadMany(IMAGE_PATHS.PLAYER.IDLE);
    this.walkFrames = ImageManager.loadMany(IMAGE_PATHS.PLAYER.WALK);
    this.jumpFrames = ImageManager.loadMany(IMAGE_PATHS.PLAYER.JUMP);
    this.idleAnimation = new SpriteAnimation(this.idleFrames, 12);
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 12);
    this.jumpAnimation = new SpriteAnimation(this.jumpFrames, 12);
  }

  /**
   * Initializes gravity and jump physics values.
   */
  setupPhysics() {
    this.groundY = 300;
    this.velocityY = 0;
    this.gravity = 0.8;
    this.jumpStrength = -14;
    this.isOnGround = true;
  }

  /**
   * Initializes health and hit cooldown values.
   */
  setupHealth() {
    this.maxHealth = 100;
    this.health = 100;
    this.lastHitAt = 0;
    this.hitCooldownMs = 800;
  }

  /**
   * Updates player position based on pressed keys.
   * @param {Object.<string, boolean>} keys - Current keyboard state.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  update(keys, worldWidth) {
    this.updateAnimationState(keys);
    this.handleJumpInput(keys);
    this.handleHorizontalMovement(keys);
    this.applyGravity();
    this.clampWithinWorld(worldWidth);
    this.getCurrentAnimation().update();
  }

  updateAnimationState(keys) {
    if (!this.isOnGround) {
      this.setAnimation("jump");
      return;
    }
    const isMoving = keys.ArrowLeft || keys.ArrowRight;
    isMoving ? this.setAnimation("walk") : this.setAnimation("idle");
  }

  handleJumpInput(keys) {
    if (!keys.Space || !this.isOnGround) return;
    this.velocityY = this.jumpStrength;
    this.isOnGround = false;
    if (!window.currentGameInstance) return;
    window.currentGameInstance.playSound("JUMP");
  }

  handleHorizontalMovement(keys) {
    if (keys.ArrowLeft) {
      this.x -= this.speed;
      this.facingLeft = true;
    }
    if (!keys.ArrowRight) return;
    this.x += this.speed;
    this.facingLeft = false;
  }

  clampWithinWorld(worldWidth) {
    const maxX = worldWidth - this.width;
    this.x = Math.max(0, Math.min(this.x, maxX));
  }

  /**
   * Applies gravity and snaps player to ground level.
   */
  applyGravity() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      this.isOnGround = true;
    }
  }

  /**
   * Returns the currently active animation object.
   * @returns {SpriteAnimation}
   */
  getCurrentAnimation() {
    if (this.currentAnimation === "jump") {
      return this.jumpAnimation;
    }

    if (this.currentAnimation === "walk") {
      return this.walkAnimation;
    }

    return this.idleAnimation;
  }

  /**
   * Draws the player on the canvas.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    const animation = this.getCurrentAnimation();
    const frame = animation.getCurrentFrame();
    if (!this.isImageReady(frame)) return;
    if (this.facingLeft) {
      this.drawFacingLeft(context, frame);
      return;
    }
    this.drawFacingRight(context, frame);
  }

  drawFacingLeft(context, frame) {
    context.save();
    context.translate(this.x, this.y + this.height / 2);
    context.scale(-1, 1);
    context.drawImage(frame, -this.width / 2, -this.height / 2, this.width, this.height);
    context.restore();
  }

  drawFacingRight(context, frame) {
    context.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  /**
   * Switches animation and resets frame index on change.
   * @param {"idle"|"walk"|"jump"} nextAnimation - Target animation key.
   */
  setAnimation(nextAnimation) {
    if (this.currentAnimation === nextAnimation) {
      return;
    }

    this.currentAnimation = nextAnimation;
    this.getCurrentAnimation().reset();
  }

  /**
   * Applies damage if hit cooldown has expired.
   * @param {number} damage - Damage amount.
   */
  takeHit(damage) {
    const now = Date.now();
    const isCooldownActive = now - this.lastHitAt < this.hitCooldownMs;

    if (isCooldownActive) {
      return;
    }

    this.health = Math.max(0, this.health - damage);
    this.lastHitAt = now;
  }

  /**
   * @returns {boolean} True while moving downward.
   */
  isFalling() {
    return this.velocityY > 0;
  }

  /**
   * Triggers a short upward bounce after stomping an enemy.
   */
  bounceAfterStomp() {
    this.velocityY = this.jumpStrength * 0.6;
    this.isOnGround = false;
  }

  canThrowBottle() {
    return true;
  }

  /**
   * Returns spawn position and direction for a thrown bottle.
   * @returns {{x:number,y:number,facingLeft:boolean}}
   */
  getThrowOrigin() {
    return {
      x: this.facingLeft ? this.x : this.x + this.width,
      y: this.y + this.height * 0.45,
      facingLeft: this.facingLeft,
    };
  }

  /**
   * Pushes player away from hit source and clamps to world bounds.
   * @param {number} fromX - X position of hit source.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  applyKnockback(fromX, worldWidth) {
    const knockbackDistance = 30;

    if (this.x < fromX) {
      this.x -= knockbackDistance;
    } else {
      this.x += knockbackDistance;
    }

    const maxX = worldWidth - this.width;
    this.x = Math.max(0, Math.min(this.x, maxX));
  }
}
