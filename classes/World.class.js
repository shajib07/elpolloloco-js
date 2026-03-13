class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");

    this.width = WORLD_CONFIG.WIDTH;
    this.height = WORLD_CONFIG.HEIGHT;

    this.cameraX = 0;
    this.backgroundImage = ImageManager.load(IMAGE_PATHS.WORLD.BACKGROUND);
  }

  updateCamera(playerX) {
    const followOffset = this.canvas.width * WORLD_CONFIG.CAMERA_FOLLOW_OFFSET;
    const targetCameraX = playerX - followOffset;
    const maxCameraX = this.width - this.canvas.width;
    this.cameraX = Math.max(0, Math.min(targetCameraX, maxCameraX));
  }

  beginRender() {
    this.context.save();
    this.context.translate(-this.cameraX, 0);
  }

  endRender() {
    this.context.restore();
  }

  drawBackground() {
    if (this.isBackgroundReady()) {
      this.context.drawImage(this.backgroundImage, 0, 0, this.width, this.canvas.height);
    }
  }

  isBackgroundReady() {
    return this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0;
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
