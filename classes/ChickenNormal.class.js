class ChickenNormal extends Enemy {
  constructor(x, y) {
    super(x,y, 80, 80)
    this.speed = 1.1;
    this.isDead = false;
    this.enemyType = "normal";
    this.walkFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.CHICKEN_NORAML_WALK)
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 16)
    this.deadImage = ImageManager.load(IMAGE_PATHS.ENEMIES.CHICKEN_NORMAL_DEAD)
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
      showDeadImage();
      return;
    }

    const frame = this.walkAnimation.getCurrentFrame();
    if (this.isImageReady(frame)) {
      context.drawImage(frame, this.x, this.y, this.width, this.height);
    }
  }

  showDeadImage() {
    if (this.isImageReady(this.deadImage)) {
      context.drawImage(
        this.deadImage,
        this.x,
        this.y,
        this.width,
        this.height,
      );
    }
  }
}
