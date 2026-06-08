/**
 * Represents the larger chicken enemy.
 */
class ChickenNormal extends Enemy {
  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   */
  constructor(x, y) {
    super(x, y, 80, 80);
    this.speed = 1.1;
    this.enemyType = "normal";
    this.walkFrames = ImageManager.loadMany(
      IMAGE_PATHS.ENEMIES.CHICKEN_NORMAL_WALK,
    );
    this.walkAnimation = new SpriteAnimation(this.walkFrames, 16);
    this.deadImage = ImageManager.load(IMAGE_PATHS.ENEMIES.CHICKEN_NORMAL_DEAD);
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
      this.showDeadImage(context);
      return;
    }

    const frame = this.walkAnimation.getCurrentFrame();
    if (this.isImageReady(frame)) {
      context.drawImage(frame, this.x, this.y, this.width, this.height);
    }
  }

  /**
   * Draws the dead chicken sprite.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  showDeadImage(context) {
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

  /**
   * Returns a tighter collision box around the visible chicken body.
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x + 2,
      y: this.y + 5,
      width: this.width - 4,
      height: this.height - 13,
    };
  }
}
