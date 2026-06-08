/**
 * Represents the smaller chicken enemy.
 */
class Chicken extends Enemy {
  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   */
  constructor(x, y) {
    super(x, y, 60, 60);
    this.speed = 1.5;
    this.enemyType = "small";

    this.walkFrames = ImageManager.loadMany(IMAGE_PATHS.ENEMIES.CHICKEN_WALK);
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 14);
    this.deadImage = ImageManager.load(IMAGE_PATHS.ENEMIES.CHICKEN_DEAD);
  }

  /**
   * Moves the chicken left until it dies.
   */
  update() {
    if (this.isDead) {
      return;
    }

    this.x -= this.speed;
    this.walkAnimation.update();
  }

  /**
   * Draws the chicken in its current state.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    if (this.isDead) {
      this.drawDead(context);
      return;
    }
    this.drawWalking(context);
  }

  /**
   * Draws the dead chicken sprite.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  drawDead(context) {
    if (!this.isImageReady(this.deadImage)) return;
    context.drawImage(this.deadImage, this.x, this.y, this.width, this.height);
  }

  /**
   * Draws the active walking animation.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  drawWalking(context) {
    const frame = this.walkAnimation.getCurrentFrame();
    if (!this.isImageReady(frame)) return;
    context.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  /**
   * Returns a tighter collision box around the visible chicken body.
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x + 7,
      y: this.y + 5,
      width: this.width - 14,
      height: this.height - 11,
    };
  }
}
