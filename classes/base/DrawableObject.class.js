/**
 * Base class for all renderable world objects with position and size.
 */
class DrawableObject {
  /**
   * @param {number} x - X position in world space.
   * @param {number} y - Y position in world space.
   * @param {number} width - Object width in pixels.
   * @param {number} height - Object height in pixels.
   */
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Returns axis-aligned bounding box used for collisions.
   * @returns {{x:number,y:number,width:number,height:number}}
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Checks whether an image is loaded and drawable.
   * @param {HTMLImageElement} image - Image object to validate.
   * @returns {boolean}
   */
  isImageReady(image) {
    return image && image.complete && image.naturalWidth > 0;
  }
}
