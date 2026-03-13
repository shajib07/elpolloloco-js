/**
 * Represents the controllable player character.
 */
class Player extends MovableObject {
  constructor() {
    super(80, 300, 90, 120);
    this.speed = 4;

    this.idleFrames = ImageManager.loadMany(IMAGE_PATHS.PLAYER.IDLE);
    this.walkFrames = ImageManager.loadMany(IMAGE_PATHS.PLAYER.WALK);
    this.jumpFrames = ImageManager.loadMany(IMAGE_PATHS.PLAYER.JUMP);
    this.idleAnimation = new SpriteAnimation(this.idleFrames, 12);
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 12);
    this.jumpAnimation = new SpriteAnimation(this.jumpFrames, 12);

    this.currentAnimation = "idle";

    // fields for physics
    this.groundY = 300;
    this.velocityY = 0;
    this.gravity = 0.8;
    this.jumpStrength = -14;
    this.isOnGround = true;

    // health fields
    this.maxHealth = 100;
    this.health = 100;
    this.lastHitAt = 0;
    this.hitCooldownMs = 800;
  }

  /**
   * Updates player position based on pressed keys.
   * @param {Object} keys
   * @param {number} canvasWidth
   */
  update(keys, worldWidth) {
    const isMoving = keys.ArrowLeft || keys.ArrowRight;

    if (!this.isOnGround) {
      this.setAnimation("jump");
    } else {
      isMoving ? this.setAnimation("walk") : this.setAnimation("idle");
    }

    if (keys.Space && this.isOnGround) {
      this.velocityY = this.jumpStrength;
      this.isOnGround = false;
      if (window.currentGameInstance) {
        window.currentGameInstance.playSound("JUMP");
      }
    }

    if (keys.ArrowLeft) {
      this.x -= this.speed;
      this.facingLeft = true;
    }

    if (keys.ArrowRight) {
      this.x += this.speed;
      this.facingLeft = false;
    }

    this.applyGravity();

    const maxX = worldWidth - this.width;
    this.x = Math.max(0, Math.min(this.x, maxX));

    this.getCurrentAnimation().update();
  }

  applyGravity() {
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      this.isOnGround = true;
    }
  }

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
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    const animation = this.getCurrentAnimation();
    const frame = animation.getCurrentFrame();

    if (!this.isImageReady(frame)) return;

    if (this.facingLeft) {
      context.save();
      context.translate(this.x, this.y + this.height / 2);
      context.scale(-1, 1);
      context.drawImage(
        frame,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
      );
      context.restore();
      return;
    }

    context.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  setAnimation(nextAnimation) {
    if (this.currentAnimation === nextAnimation) {
      return;
    }

    this.currentAnimation = nextAnimation;
    this.getCurrentAnimation().reset();
  }

  takeHit(damage) {
    const now = Date.now();
    const isCooldownActive = now - this.lastHitAt < this.hitCooldownMs;

    if (isCooldownActive) {
      return;
    }

    this.health = Math.max(0, this.health - damage);
    this.lastHitAt = now;
  }

  isFalling() {
    return this.velocityY > 0;
  }

  bounceAfterStomp() {
    this.velocityY = this.jumpStrength * 0.6;
    this.isOnGround = false;
  }

  canThrowBottle() {
    return true;
  }

  getThrowOrigin() {
    return {
      x: this.facingLeft ? this.x : this.x + this.width,
      y: this.y + this.height * 0.45,
      facingLeft: this.facingLeft,
    };
  }

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
