class Endboss extends Enemy {
  constructor(x, y) {
    super(x, y, 220, 280);
    this.speed = 0.8;
    this.enemyType = "boss";

    this.minX = 1500;
    this.maxX = 2200;

    this.walkFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.BOSS_WALK);
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 14);

    this.maxHealth = 100;
    this.health = 100;
    this.lastHitAt = 0;
    this.hitCooldownMs = 250;
    this.isHurt = false;
    this.hurtAt = 0;
    this.hurtDurationMs = 200;

    this.canvasActivationX = 900;
  }

  update(playerX) {
    if (this.isDead) {
      return;
    }

    if (this.isHurt && Date.now() - this.hurtAt > this.hurtDurationMs) {
      this.isHurt = false;
    }

    // basic behavior: move only when player is near
    let targetX = playerX;

    if (playerX < this.minX) {
      targetX = this.minX;
    } else if (playerX > this.maxX) {
      targetX = this.maxX;
    }

    const distanceToTarget = targetX - this.x;
    if (Math.abs(distanceToTarget) > 20) {
      if (distanceToTarget < 0) {
        this.x -= this.speed;
        this.facingLeft = true;
      } else {
        this.x += this.speed;
        this.facingLeft = false;
      }
    }

    this.walkAnimation.update();
  }

draw(context) {
  const frame = this.walkAnimation.getCurrentFrame();

  if (this.isImageReady(frame)) {
    if (!this.facingLeft) {
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
    } else {
      context.drawImage(frame, this.x, this.y, this.width, this.height);
    }

    if (this.isHurt) {
      context.save();
      context.globalAlpha = 0.25;
      context.fillStyle = "#ff0000";
      context.fillRect(this.x, this.y, this.width, this.height);
      context.restore();
    }
  }
}

  takeHit(damage) {
    const now = Date.now();
    const isCooldown = now - this.lastHitAt < this.hitCooldownMs;

    if (isCooldown || this.isDead) {
      return;
    }

    this.health = Math.max(0, this.health - damage);
    this.lastHitAt = now;
    this.isHurt = true;
    this.hurtAt = now;

    if (this.health === 0) {
      this.isDead = true;
    }
  }

applyKnockback(fromX) {
  const knockbackDistance = 25;

  if (this.x < fromX) {
    this.x -= knockbackDistance;
    this.facingLeft = true;
  } else {
    this.x += knockbackDistance;
    this.facingLeft = false;
  }

  this.x = Math.max(this.minX, Math.min(this.x, this.maxX));
}

  isActive() {
    return this.x < this.canvasActivationX;
  }
}
