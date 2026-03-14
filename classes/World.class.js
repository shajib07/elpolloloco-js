/**
 * Manages world dimensions, camera offset and world rendering helpers.
 */
class World {
  /**
   * @param {HTMLCanvasElement} canvas - Main game canvas.
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    this.width = WORLD_CONFIG.WIDTH;
    this.height = WORLD_CONFIG.HEIGHT;

    this.cameraX = 0;
    this.backgroundImage = ImageManager.load(IMAGE_PATHS.WORLD.BACKGROUND);
  }

  /**
   * Updates camera x offset to follow player within world bounds.
   * @param {number} playerX - Current player x position.
   */
  updateCamera(playerX) {
    const followOffset = this.canvas.width * WORLD_CONFIG.CAMERA_FOLLOW_OFFSET;
    const targetCameraX = playerX - followOffset;
    const maxCameraX = this.width - this.canvas.width;
    this.cameraX = Math.max(0, Math.min(targetCameraX, maxCameraX));
  }

  /**
   * Starts world-space rendering with camera translation.
   */
  beginRender() {
    this.context.save();
    this.context.translate(-this.cameraX, 0);
  }

  /**
   * Restores canvas state after world-space rendering.
   */
  endRender() {
    this.context.restore();
  }

  /**
   * Draws the world background image if available.
   */
  drawBackground() {
    if (this.isBackgroundReady()) {
      this.context.drawImage(this.backgroundImage, 0, 0, this.width, this.canvas.height);
    }
  }

  /**
   * @returns {boolean} True when background image is fully loaded.
   */
  isBackgroundReady() {
    return this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0;
  }

  /**
   * Clears current canvas frame.
   */
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
