class Chicken extends Enemy {
  constructor(x, y) {
    super(x, y, 60, 60);
    this.speed = 1.5;
    this.enemyType = "small";

    this.walkFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.CHICKEN_WALK);
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 14);
    this.deadImage = ImageManager.load(IMAGE_PATHS.ENEMIES.CHICKEN_DEAD);
  }

  update() {
    if (this.isDead) {
      return;
    }

    this.x -= this.speed;
    this.walkAnimation.update();
  }

  draw(context) {
    if (this.isDead) {
      this.drawDead(context);
      return;
    }
    this.drawWalking(context);
  }

  drawDead(context) {
    if (!this.isImageReady(this.deadImage)) return;
    context.drawImage(this.deadImage, this.x, this.y, this.width, this.height);
  }

  drawWalking(context) {
    const frame = this.walkAnimation.getCurrentFrame();
    if (!this.isImageReady(frame)) return;
    context.drawImage(frame, this.x, this.y, this.width, this.height);
  }
}
