class ThrowableBottle extends MovableObject {

  constructor(x, y, facingLeft) {
    super(x, y, 48, 48);
    this.facingLeft = facingLeft
    this.speed = 8;
    this.isFinished = false;

    this.image = ImageManager.load(IMAGE_PATHS.ITEMS.BOTTLE_THROW)
  }

  update(worldWidth) {
    this.x += this.facingLeft ? -this.speed : this.speed;

    if (this.x + this.width < 0 || this.x > worldWidth) {
      this.isFinished = true;
    }
  }

  draw(context) {
    if (this.isFinished) {
      return;
    }

    if (this.isImageReady(this.image)) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}
