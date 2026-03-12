class Endboss extends Enemy {
  constructor(x, y) {
    super(x, y, 220, 280);
    this.speed = 2.5;
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
    this.patrolTargetX = this.maxX;
    this.canvasActivationX = 900;
  }

  update(playerX) {
    if (this.isDead) {
      return;
    }

    if (this.isHurt && Date.now() - this.hurtAt > this.hurtDurationMs) {
      this.isHurt = false;
    }

    const distanceToPlayer = playerX - this.x;

    if (Math.abs(distanceToPlayer) > 20) {
      if (distanceToPlayer < 0) {
        this.x -= this.speed;
      } else {
        this.x += this.speed;
      }
    }

    this.facingLeft = playerX < this.x;

    this.walkAnimation.update();
  }

  draw(context) {
    const frame = this.walkAnimation.getCurrentFrame();

    if (!this.isImageReady(frame)) {
      return;
    }

    const drawHurtOverlay = () => {
      if (!this.isHurt) {
        return;
      }

      context.save();
      context.globalAlpha = 0.25;
      context.fillStyle = "#ff0000";
      context.fillRect(0, 0, this.width, this.height);
      context.restore();
    };

    if (!this.facingLeft) {
      context.save();
      context.translate(this.x + this.width / 2, this.y + this.height / 2);
      context.scale(-1, 1);

      context.drawImage(
        frame,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height,
      );

      if (this.isHurt) {
        context.save();
        context.globalAlpha = 0.25;
        context.fillStyle = "#ff0000";
        context.fillRect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height,
        );
        context.restore();
      }

      context.restore();
      return;
    }

    context.drawImage(frame, this.x, this.y, this.width, this.height);

    if (this.isHurt) {
      context.save();
      context.globalAlpha = 0.25;
      context.fillStyle = "#ff0000";
      context.fillRect(this.x, this.y, this.width, this.height);
      context.restore();
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

  isActive() {
    return this.x < this.canvasActivationX;
  }
}
