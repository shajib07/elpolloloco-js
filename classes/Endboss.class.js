/**
 * Represents the endboss enemy with chase, damage and state-specific animations.
 */
class Endboss extends Enemy {
  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   */
  constructor(x, y) {
    super(x, y, 220, 280);
    this.enemyType = "boss";
    this.setupMovement();
    this.setupAnimations();
    this.setupCombat();
    this.setupState();
  }

  /**
   * Configures movement speed and the boss fight activation point.
   */
  setupMovement() {
    this.speed = 2.5;
    this.activationX = WORLD_CONFIG.WIDTH - 960;
    this.attackRange = 150;
    this.chaseStopDistance = 20;
  }

  /**
   * Loads the boss sprite sequences for the different states.
   */
  setupAnimations() {
    this.walkFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.BOSS.WALK);
    this.alertFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.BOSS.ALERT);
    this.attackFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.BOSS.ATTACK);
    this.hurtFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.BOSS.HURT);
    this.deadFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.BOSS.DEAD);

    this.walkAnimation = new SpriteAnimation(this.walkFrames, 10);
    this.alertAnimation = new SpriteAnimation(this.alertFrames, 8, false);
    this.attackAnimation = new SpriteAnimation(this.attackFrames, 8, false);
    this.hurtAnimation = new SpriteAnimation(this.hurtFrames, 7, false);
    this.deadAnimation = new SpriteAnimation(this.deadFrames, 10, false);
  }

  /**
   * Initializes boss health and combat cooldowns.
   */
  setupCombat() {
    this.maxHealth = 100;
    this.health = 100;
    this.lastHitAt = 0;
    this.hitCooldownMs = 250;
    this.lastAttackAt = 0;
    this.attackCooldownMs = 1100;
  }

  /**
   * Initializes the boss state machine.
   */
  setupState() {
    this.state = "idle";
    this.stateStartedAt = 0;
    this.isEncounterActive = false;
    this.alertDurationMs = 1200;
    this.attackDurationMs = 1000;
    this.hurtDurationMs = 500;
    this.isHurt = false;
  }

  /**
   * Marks the boss encounter as active and starts the alert animation.
   */
  activate() {
    if (this.isEncounterActive) {
      return;
    }

    this.isEncounterActive = true;
    this.setState("alert");
  }

  /**
   * Updates boss movement, facing and animation each frame.
   * @param {number} playerX - Current player x position.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  update(playerX, worldWidth = WORLD_CONFIG.WIDTH) {
    if (this.state === "dead") {
      this.deadAnimation.update();
      this.facingLeft = playerX < this.x;
      return;
    }

    if (!this.isEncounterActive) {
      this.facingLeft = playerX < this.x;
      return;
    }

    const now = Date.now();

    if (this.state === "alert") {
      this.alertAnimation.update();
      if (this.hasStateExpired(now, this.alertDurationMs)) {
        this.setState("walk", now);
      }
      this.facingLeft = playerX < this.x;
      return;
    }

    if (this.state === "hurt") {
      this.hurtAnimation.update();
      if (this.hasStateExpired(now, this.hurtDurationMs)) {
        this.setState("walk", now);
      }
      this.facingLeft = playerX < this.x;
      return;
    }

    if (this.state === "attack") {
      this.attackAnimation.update();
      if (this.hasStateExpired(now, this.attackDurationMs)) {
        this.setState("walk", now);
      }
      this.facingLeft = playerX < this.x;
      return;
    }

    if (this.shouldStartAttack(playerX, now)) {
      this.requestAttack(now);
      this.attackAnimation.update();
      this.facingLeft = playerX < this.x;
      return;
    }

    this.moveTowardsPlayer(playerX, worldWidth);
    this.walkAnimation.update();
    this.facingLeft = playerX < this.x;
  }

  /**
   * Checks whether the current state has run for at least the given duration.
   * @param {number} now - Current timestamp in milliseconds.
   * @param {number} durationMs - State duration in milliseconds.
   * @returns {boolean}
   */
  hasStateExpired(now, durationMs) {
    return now - this.stateStartedAt >= durationMs;
  }

  /**
   * Moves the boss toward the player while keeping it inside the full world range.
   * @param {number} playerX - Current player x position.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  moveTowardsPlayer(playerX, worldWidth = WORLD_CONFIG.WIDTH) {
    const distanceToPlayer = playerX - this.x;
    if (Math.abs(distanceToPlayer) <= this.chaseStopDistance) {
      return;
    }

    if (distanceToPlayer < 0) {
      this.x -= this.speed;
    } else {
      this.x += this.speed;
    }

    this.clampWithinWorld(worldWidth);
  }

  /**
   * Checks whether the boss should start an attack animation.
   * @param {number} playerX - Current player x position.
   * @param {number} now - Current timestamp in milliseconds.
   * @returns {boolean}
   */
  shouldStartAttack(playerX, now) {
    const isInRange = Math.abs(playerX - this.x) <= this.attackRange;
    const canAttackAgain = now - this.lastAttackAt >= this.attackCooldownMs;
    return isInRange && canAttackAgain;
  }

  /**
   * Starts the attack animation if the boss is allowed to attack.
   * @param {number} now - Current timestamp in milliseconds.
   * @returns {boolean} True when the attack started.
   */
  requestAttack(now = Date.now()) {
    if (this.state !== "walk") {
      return false;
    }

    if (now - this.lastAttackAt < this.attackCooldownMs) {
      return false;
    }

    this.lastAttackAt = now;
    this.setState("attack", now);
    return true;
  }

  /**
   * Draws the boss using the current state animation frame.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    const frame = this.getCurrentAnimation().getCurrentFrame();
    if (!this.isImageReady(frame)) return;
    if (this.facingLeft) {
      this.drawFacingLeft(context, frame);
      return;
    }
    this.drawFacingRight(context, frame);
  }

  /**
   * Returns the animation that matches the active boss state.
   * @returns {SpriteAnimation}
   */
  getCurrentAnimation() {
    switch (this.state) {
      case "alert":
        return this.alertAnimation;
      case "attack":
        return this.attackAnimation;
      case "hurt":
        return this.hurtAnimation;
      case "dead":
        return this.deadAnimation;
      case "walk":
      default:
        return this.walkAnimation;
    }
  }

  /**
   * Draws the boss facing left.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   * @param {HTMLImageElement} frame - Current animation frame.
   */
  drawFacingLeft(context, frame) {
    context.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  /**
   * Draws the boss facing right.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   * @param {HTMLImageElement} frame - Current animation frame.
   */
  drawFacingRight(context, frame) {
    context.save();
    context.translate(this.x + this.width / 2, this.y + this.height / 2);
    context.scale(-1, 1);
    context.drawImage(frame, -this.width / 2, -this.height / 2, this.width, this.height);
    context.restore();
  }

  /**
   * Returns a tighter collision box around the visible boss body.
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x + 16,
      y: this.y + 49,
      width: this.width - 23,
      height: this.height - 71,
    };
  }

  /**
   * Applies damage to boss when cooldown allows it.
   * @param {number} damage - Damage amount.
   */
  takeHit(damage) {
    const now = Date.now();
    if (!this.canTakeHit(now)) return;
    this.applyHitDamage(damage, now);
  }

  /**
   * Checks whether the boss can currently take damage.
   * @param {number} now - Current timestamp in milliseconds.
   * @returns {boolean}
   */
  canTakeHit(now) {
    const isCooldown = now - this.lastHitAt < this.hitCooldownMs;
    return !isCooldown && !this.isDead;
  }

  /**
   * Applies boss damage and switches to the hurt or dead state.
   * @param {number} damage - Damage amount.
   * @param {number} now - Current timestamp in milliseconds.
   */
  applyHitDamage(damage, now) {
    this.health = Math.max(0, this.health - damage);
    this.lastHitAt = now;

    if (this.health === 0) {
      this.setState("dead", now);
      return;
    }

    this.setState("hurt", now);
  }

  /**
   * Sets the active boss state and resets the matching animation.
   * @param {"idle"|"walk"|"alert"|"attack"|"hurt"|"dead"} nextState - Target boss state.
   * @param {number} [now=Date.now()] - Current timestamp in milliseconds.
   */
  setState(nextState, now = Date.now()) {
    if (this.state === nextState) {
      return;
    }

    this.state = nextState;
    this.stateStartedAt = now;
    this.isHurt = nextState === "hurt";
    this.isDead = nextState === "dead";

    if (this.isDead) {
      this.deadAt = now;
    }

    this.getCurrentAnimation().reset();
  }

  /**
   * Keeps the boss inside the world boundaries.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  clampWithinWorld(worldWidth = WORLD_CONFIG.WIDTH) {
    const maxX = worldWidth - this.width;
    this.x = Math.max(0, Math.min(this.x, maxX));
  }

  /**
   * Applies horizontal knockback and clamps boss to world limits.
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

  /**
   * Checks whether the boss fight should be active for the current player position.
   * @param {number} playerX - Current player x position.
   * @returns {boolean} True when the player has reached the boss fight area.
   */
  isActive(playerX) {
    return playerX >= this.activationX;
  }
}
