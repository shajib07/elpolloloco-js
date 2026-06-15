/**
 * Represents the controllable player character.
 */
class Player extends MovableObject {
  /**
   * Creates a player with movement, animation and health state.
   */
  constructor() {
    super(80, 210, 180, 270);
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
    this.hurtFrames = ImageManager.loadMany(IMAGE_PATHS.PLAYER.HURT);
    this.deadFrames = ImageManager.loadMany(IMAGE_PATHS.PLAYER.DEAD);
    this.idleAnimation = new SpriteAnimation(this.idleFrames, 12);
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 8);
    this.jumpAnimation = new SpriteAnimation(this.jumpFrames, 10);
    this.hurtAnimation = new SpriteAnimation(this.hurtFrames, 12, false);
    this.deadAnimation = new SpriteAnimation(this.deadFrames, 10, false);
  }

  /**
   * Initializes gravity and jump physics values.
   */
  setupPhysics() {
    this.floorY = 420;
    this.groundY = this.floorY - this.height;
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravity = 0.55;
    this.jumpStrength = -11.8;
    this.jumpArcBoost = 2.2;
    this.airAcceleration = 0.28;
    this.airFriction = 0.94;
    this.maxAirSpeed = 4.2;
    this.isOnGround = true;
  }

  /**
   * Initializes health and hit cooldown values.
   */
  setupHealth() {
    this.maxHealth = 100;
    this.health = 100;
    this.lastHitAt = 0;
    this.hitCooldownMs = 1100;
    this.isDead = false;
  }

  /**
   * Updates player position based on pressed keys.
   * @param {Object.<string, boolean>} keys - Current keyboard state.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  update(keys, worldWidth) {
    if (this.isDead) {
      this.getCurrentAnimation().update();
      return;
    }

    this.handleJumpInput(keys);
    this.handleHorizontalMovement(keys);
    this.applyGravity();
    this.updateAnimationState(keys);
    this.clampWithinWorld(worldWidth);
    this.getCurrentAnimation().update();
  }

  /**
   * Switches between movement and hit/death animations based on player state.
   * @param {Object.<string, boolean>} keys - Current keyboard state.
   */
  updateAnimationState(keys) {
    if (this.isDead) {
      this.setAnimation("dead");
      return;
    }

    if (this.currentAnimation === "hurt" && !this.hurtAnimation.isFinished) {
      return;
    }

    if (!this.isOnGround) {
      this.setAnimation("jump");
      return;
    }
    const isMoving = keys.ArrowLeft || keys.ArrowRight;
    isMoving ? this.setAnimation("walk") : this.setAnimation("idle");
  }

  /**
   * Starts a jump when the jump key is pressed and the player is on the ground.
   * @param {Object.<string, boolean>} keys - Current keyboard state.
   */
  handleJumpInput(keys) {
    if (!keys.Space || !this.isOnGround) return;
    const jumpDirection = this.getJumpDirection(keys);
    this.velocityX = jumpDirection * this.jumpArcBoost;
    this.velocityY = this.jumpStrength;
    this.isOnGround = false;
    if (!window.currentGameInstance) return;
    window.currentGameInstance.playSound("JUMP");
  }

  /**
   * Returns the horizontal direction used for the initial jump arc.
   * @param {Object.<string, boolean>} keys - Current keyboard state.
   * @returns {number} -1 for left, 1 for right.
   */
  getJumpDirection(keys) {
    if (keys.ArrowLeft && !keys.ArrowRight) {
      return -1;
    }

    if (keys.ArrowRight && !keys.ArrowLeft) {
      return 1;
    }

    return this.facingLeft ? -1 : 1;
  }

  /**
   * Moves the player left or right based on the pressed arrow keys.
   * @param {Object.<string, boolean>} keys - Current keyboard state.
   */
  handleHorizontalMovement(keys) {
    if (!this.isOnGround) {
      this.handleAirMovement(keys);
      return;
    }

    this.velocityX = 0;

    if (keys.ArrowLeft) {
      this.x -= this.speed;
      this.facingLeft = true;
    }
    if (!keys.ArrowRight) return;
    this.x += this.speed;
    this.facingLeft = false;
  }

  /**
   * Applies lighter horizontal control while the player is airborne.
   * @param {Object.<string, boolean>} keys - Current keyboard state.
   */
  handleAirMovement(keys) {
    if (keys.ArrowLeft) {
      this.velocityX -= this.airAcceleration;
      this.facingLeft = true;
    }

    if (keys.ArrowRight) {
      this.velocityX += this.airAcceleration;
      this.facingLeft = false;
    }

    if (!keys.ArrowLeft && !keys.ArrowRight) {
      this.velocityX *= this.airFriction;
    }

    this.velocityX = Math.max(
      -this.maxAirSpeed,
      Math.min(this.velocityX, this.maxAirSpeed),
    );
    this.x += this.velocityX;
  }

  /**
   * Keeps the player inside the horizontal world bounds.
   * @param {number} worldWidth - Horizontal world boundary.
   */
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
      this.velocityX = 0;
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

    if (this.currentAnimation === "hurt") {
      return this.hurtAnimation;
    }

    if (this.currentAnimation === "dead") {
      return this.deadAnimation;
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

  /**
   * Draws the player mirrored to face left.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   * @param {HTMLImageElement} frame - Current animation frame.
   */
  drawFacingLeft(context, frame) {
    context.save();
    context.translate(this.x, this.y + this.height / 2);
    context.scale(-1, 1);
    context.drawImage(frame, -this.width / 2, -this.height / 2, this.width, this.height);
    context.restore();
  }

  /**
   * Draws the player facing right.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   * @param {HTMLImageElement} frame - Current animation frame.
   */
  drawFacingRight(context, frame) {
    context.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  /**
   * Switches animation and resets frame index on change.
   * @param {"idle"|"walk"|"jump"|"hurt"|"dead"} nextAnimation - Target animation key.
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
    if (this.isDead) {
      return;
    }

    const now = Date.now();
    const isCooldownActive = now - this.lastHitAt < this.hitCooldownMs;

    if (isCooldownActive) {
      return;
    }

    this.health = Math.max(0, this.health - damage);
    this.lastHitAt = now;

    if (this.health === 0) {
      this.isDead = true;
      this.velocityX = 0;
      this.velocityY = 0;
      this.isOnGround = true;
      this.y = this.groundY;
      this.setAnimation("dead");
      return;
    }

    this.setAnimation("hurt");
  }

  /**
   * Returns a tighter collision box around the visible character body.
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x + 24,
      y: this.y + 100,
      width: this.width - 48,
      height: this.height - 100,
    };
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

  /**
   * Returns whether the player is currently allowed to throw a bottle.
   * @returns {boolean}
   */
  canThrowBottle() {
    return !this.isDead;
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
   * @param {number} [distance=30] - Horizontal knockback distance.
   */
  applyKnockback(fromX, worldWidth, distance = 30) {
    if (this.x < fromX) {
      this.x -= distance;
    } else {
      this.x += distance;
    }

    const maxX = worldWidth - this.width;
    this.x = Math.max(0, Math.min(this.x, maxX));
  }
}
