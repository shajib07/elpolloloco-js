class Endboss extends Enemy {
  constructor(x, y) {
    super(x, y, 220, 280)
    this.speed = 0.8;
    this.enemyType = "boss";

    this.walkFrames = [
      "assets/img/boss/walk-1.png",
      "assets/img/boss/walk-2.png",
      "assets/img/boss/walk-3.png",
      "assets/img/boss/walk-4.png",
    ].map((path) => {
      const image = new Image();
      image.src = path;
      return image;
    });

    this.walkAnimation = new SpriteAnimation(this.walkFrames, 14)
    
    this.maxHealth = 100;
    this.health = 100;
    this.lastHitAt = 0;
    this.hitCooldownMs = 250;

    this.canvasActivationX = 900;
  }

  update(playerX) {
    if (this.isDead) {
      return;
    }

    // basic behavior: move only when player is near
    const shouldMove = playerX > 1200;
    if (shouldMove) {
      this.x -= this.speed;
    }

    this.walkAnimation.update()
  }

  draw(context) {
    const frame = this.walkAnimation.getCurrentFrame();
    if (this.isImageReady(frame)) {
      context.drawImage(frame, this.x, this.y, this.width, this.height);
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

    if (this.health === 0) {
      this.isDead = true;
    }
  }

  isActive() {
    return this.x < this.canvasActivationX;
  }
}
