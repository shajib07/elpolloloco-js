/**
 * Base class for drawable objects that can move and change facing direction.
 */
class MovableObject extends DrawableObject {
  /**
   * @param {number} x - X position in world space.
   * @param {number} y - Y position in world space.
   * @param {number} width - Object width in pixels.
   * @param {number} height - Object height in pixels.
   */
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.speed = 0;
    this.facingLeft = false;
  }
}
