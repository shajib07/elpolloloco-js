class ChickenNormal extends Enemy {
  constructor(x, y) {
    super(x,y, 80, 80)
    this.speed = 1.1;
    this.isDead = false;

    this.walkFrames = [
      "assets/img/enemies/chicken-normal-walk-1.png",
      "assets/img/enemies/chicken-normal-walk-2.png",
      "assets/img/enemies/chicken-normal-walk-3.png",
    ].map((path) => {
      const image = new Image();
      image.src = path;
      return image;
    });

    this.walkAnimation = new SpriteAnimation(this.walkFrames, 16)
    this.enemyType = "normal";

    this.deadImage = new Image();
    this.deadImage.src = "assets/img/enemies/chicken-normal-dead.png";
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
