/**
 * Represents a collectible coin.
 */
class Coin extends DrawableObject {
  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   */
  constructor(x, y) {
    super(x, y, 64, 64);
    this.isCollected = false;

    this.image = ImageManager.load(IMAGE_PATHS.ITEMS.COIN);
  }

  /**
   * Draws the coin if it has not been collected yet.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    if (this.isCollected) {
      return;
    }

    if (this.isImageReady(this.image)) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  /**
   * Returns a tighter collision box for pickup checks.
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x + 20,
      y: this.y + 21,
      width: this.width - 40,
      height: this.height - 41,
    };
  }

  /**
   * Marks the coin as collected.
   */
  collect() {
    this.isCollected = true;
  }
}
