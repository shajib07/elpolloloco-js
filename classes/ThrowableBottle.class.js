/**
 * Represents a bottle thrown by the player.
 */
class ThrowableBottle extends MovableObject {
  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   * @param {boolean} facingLeft - True when the throw should travel left.
   */
  constructor(x, y, facingLeft) {
    super(x, y, 48, 48);
    this.facingLeft = facingLeft;
    this.speed = 8;
    this.isFinished = false;
    this.image = ImageManager.load(IMAGE_PATHS.ITEMS.BOTTLE_THROW);
  }

  /**
   * Advances the bottle until it leaves the world or hits a target.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  update(worldWidth) {
    this.x += this.facingLeft ? -this.speed : this.speed;
    if (this.x + this.width < 0 || this.x > worldWidth) {
      this.isFinished = true;
    }
  }

  /**
   * Draws the thrown bottle if it is still active.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    if (this.isFinished) {
      return;
    }

    if (this.isImageReady(this.image)) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  /**
   * Returns a tighter collision box for hit detection.
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x + 8,
      y: this.y + 6,
      width: this.width - 16,
      height: this.height - 12,
    };
  }
}
