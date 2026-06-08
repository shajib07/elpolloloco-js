/**
 * Represents a bottle collectible on the ground.
 */
class Bottle extends DrawableObject {
  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   */
  constructor(x, y) {
    super(x, y, 58, 88);
    this.isCollected = false;

    this.image = ImageManager.load(IMAGE_PATHS.ITEMS.BOTTLE_GROUND);
  }

  /**
   * Draws the bottle if it has not been collected yet.
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
      x: this.x + 26,
      y: this.y + 17,
      width: this.width - 36,
      height: this.height - 27,
    };
  }

  /**
   * Marks the bottle as collected.
   */
  collect() {
    this.isCollected = true;
  }
}
