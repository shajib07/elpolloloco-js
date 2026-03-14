/**
 * Represents the endboss enemy with chase, damage and hurt states.
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
    this.setupAnimation();
    this.setupCombat();
    this.setupBossState();
  }

  setupMovement() {
    this.speed = 2.5;
    this.minX = 1500;
    this.maxX = 2200;
  }

  setupAnimation() {
    this.walkFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.BOSS_WALK);
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 14);
  }

  setupCombat() {
    this.maxHealth = 100;
    this.health = 100;
    this.lastHitAt = 0;
    this.hitCooldownMs = 250;
    this.isHurt = false;
    this.hurtAt = 0;
    this.hurtDurationMs = 200;
  }

  setupBossState() {
    this.patrolTargetX = this.maxX;
    this.canvasActivationX = 900;
  }

  /**
   * Updates boss movement, facing and animation each frame.
   * @param {number} playerX - Current player x position.
   */
  update(playerX) {
    if (this.isDead) return;
    this.updateHurtState();
    this.moveTowardsPlayer(playerX);
    this.facingLeft = playerX < this.x;
    this.walkAnimation.update();
  }

  updateHurtState() {
    if (!this.isHurt) return;
    if (Date.now() - this.hurtAt <= this.hurtDurationMs) return;
    this.isHurt = false;
  }

  moveTowardsPlayer(playerX) {
    const distanceToPlayer = playerX - this.x;
    if (Math.abs(distanceToPlayer) <= 20) return;

    if (distanceToPlayer < 0) {
      this.x -= this.speed;
      return;
    }
    this.x += this.speed;
  }

  /**
   * Draws the boss with optional hurt overlay.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    const frame = this.walkAnimation.getCurrentFrame();
    if (!this.isImageReady(frame)) return;
    if (this.facingLeft) {
      this.drawFacingLeft(context, frame);
      return;
    }
    this.drawFacingRight(context, frame);
  }

  drawFacingLeft(context, frame) {
    context.drawImage(frame, this.x, this.y, this.width, this.height);
    this.drawHurtOverlay(context, this.x, this.y, this.width, this.height);
  }

  drawFacingRight(context, frame) {
    context.save();
    context.translate(this.x + this.width / 2, this.y + this.height / 2);
    context.scale(-1, 1);
    context.drawImage(frame, -this.width / 2, -this.height / 2, this.width, this.height);
    this.drawHurtOverlay(context, -this.width / 2, -this.height / 2, this.width, this.height);
    context.restore();
  }

  drawHurtOverlay(context, x, y, width, height) {
    if (!this.isHurt) return;

    context.save();
    context.globalAlpha = 0.25;
    context.fillStyle = "#ff0000";
    context.fillRect(x, y, width, height);
    context.restore();
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

  canTakeHit(now) {
    const isCooldown = now - this.lastHitAt < this.hitCooldownMs;
    return !isCooldown && !this.isDead;
  }

  applyHitDamage(damage, now) {
    this.health = Math.max(0, this.health - damage);
    this.lastHitAt = now;
    this.isHurt = true;
    this.hurtAt = now;
    if (this.health !== 0) return;
    this.isDead = true;
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
   * @returns {boolean} True when boss reached activation area.
   */
  isActive() {
    return this.x < this.canvasActivationX;
  }
}
