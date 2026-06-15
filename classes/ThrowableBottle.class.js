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
    this.speed = 7.8;
    this.velocityX = this.facingLeft ? -this.speed : this.speed;
    this.velocityY = -6.8;
    this.gravity = 0.32;
    this.rotation = 0;
    this.rotationSpeed = this.facingLeft ? -0.24 : 0.24;
    this.floorY = 420;
    this.isFinished = false;
    this.image = ImageManager.load(IMAGE_PATHS.ITEMS.BOTTLE_THROW);
  }

  /**
   * Advances the bottle until it leaves the world or hits a target.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  update(worldWidth) {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.velocityY += this.gravity;
    this.rotation += this.rotationSpeed;

    const isOutOfWorld = this.x + this.width < 0 || this.x > worldWidth;
    const hasHitGround = this.y + this.height >= this.floorY;

    if (isOutOfWorld || hasHitGround) {
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

    if (!this.isImageReady(this.image)) return;

    context.save();
    context.translate(this.x + this.width / 2, this.y + this.height / 2);
    context.rotate(this.rotation);
    context.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    context.restore();
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
