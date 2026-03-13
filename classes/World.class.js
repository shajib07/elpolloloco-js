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
      return;
    }
    this.drawFallbackBackground();
  }

  isBackgroundReady() {
    return this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0;
  }

  drawFallbackBackground() {
    this.context.fillStyle = "#1c2541";
    this.context.fillRect(0, 0, this.width, this.canvas.height);
  }

  drawGround() {
    const groundY = 420;
    const groundHeight = 60;
    this.drawGroundBase(groundY, groundHeight);
    this.drawGroundHighlight(groundY);
    this.drawGroundTexture(groundY);
    this.drawGroundPebbles(groundY);
  }

  drawGroundBase(groundY, groundHeight) {
    const gradient = this.context.createLinearGradient(0, groundY, 0, groundY + groundHeight);
    gradient.addColorStop(0, "#d9a441");
    gradient.addColorStop(1, "#a8701f");
    this.context.fillStyle = gradient;
    this.context.fillRect(0, groundY, this.width, groundHeight);
  }

  drawGroundHighlight(groundY) {
    this.context.fillStyle = "rgba(255, 235, 180, 0.35)";
    this.context.fillRect(0, groundY, this.width, 4);
  }

  drawGroundTexture(groundY) {
    this.context.strokeStyle = "rgba(120, 80, 30, 0.25)";
    this.context.lineWidth = 1;
    for (let x = 0; x < this.width; x += 36) {
      this.context.beginPath();
      this.context.moveTo(x, groundY + 14);
      this.context.lineTo(x + 12, groundY + 20);
      this.context.stroke();
    }
  }

  drawGroundPebbles(groundY) {
    this.context.fillStyle = "rgba(90, 60, 25, 0.35)";
    for (let x = 20; x < this.width; x += 80) {
      this.context.beginPath();
      this.context.arc(x, groundY + 36, 2, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
