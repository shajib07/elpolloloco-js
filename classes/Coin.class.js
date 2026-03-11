class Coin extends DrawableObject {
  constructor(x, y) {
    super(x, y, 64, 64);
    this.isCollected = false;

    this.image = ImageManager.load(IMAGE_PATHS.ITEMS.COIN)
  }

  draw(context) {
    if (this.isCollected) {
      return;
    }

    if (this.isImageReady(this.image)) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  collect() {
    this.isCollected = true;
  }
}
