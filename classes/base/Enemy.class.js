/**
 * Base class for enemies with shared death and recycle behavior.
 */
class Enemy extends MovableObject {
  /**
   * @param {number} x - X position in world space.
   * @param {number} y - Y position in world space.
   * @param {number} width - Enemy width in pixels.
   * @param {number} height - Enemy height in pixels.
   */
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.isDead = false;
    this.deadAt = 0;
    this.deadDisplayMs = 350;
  }

  /**
   * Marks enemy as dead and stores timestamp for death display timing.
   */
  kill() {
    if (this.isDead) {
      return;
    }

    this.isDead = true;
    this.deadAt = Date.now();
  }

  /**
   * Checks if enemy can be recycled after leaving visible world.
   * @param {number} cameraX - Current camera x offset.
   * @returns {boolean}
   */
  isOutOfScreen(cameraX) {
    if (this.isDead) {
      return Date.now() - this.deadAt > this.deadDisplayMs;
    }
    return this.x + this.width < cameraX;
  }

  /**
   * Resets enemy state and moves it to a new x position.
   * @param {number} newX - New spawn x position.
   */
  reset(newX) {
    this.x = newX;
    this.isDead = false;
    this.deadAt = 0;
  }
}
