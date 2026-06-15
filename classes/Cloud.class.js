/**
 * Represents a soft, background-style cloud drifting across the desert sky.
 */
class Cloud extends DrawableObject {
  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   * @param {number} width - Cloud width in pixels.
   * @param {number} height - Cloud height in pixels.
   * @param {number} speed - Horizontal drift speed per frame.
   * @param {"wide"|"tall"|"small"} variant - Shape variant based on the reference background.
   */
  constructor(x, y, width = 220, height = 90, speed = 0.18, variant = "wide") {
    super(x, y, width, height);

    this.height = Math.max(this.height, this.width / 4.2);
    this.speed = speed;
    this.baseY = y;
    this.variant = variant;
  }

  /**
   * Moves the cloud left and respawns it once it leaves the world view.
   * @param {number} worldWidth - Horizontal world boundary.
   */
  update(worldWidth) {
    this.x -= this.speed;

    if (this.x + this.width >= -120) {
      return;
    }

    this.x = worldWidth + 120 + Math.random() * 260;
    this.y = this.baseY + Math.random() * 20 - 10;
  }

  /**
   * Draws the cloud using the soft translucent style from the desert background.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    context.save();
    context.globalAlpha = 0.82;
    this.createCloudPath(context);
    context.fillStyle = this.createCloudGradient(context);
    context.fill();
    context.restore();
  }

  /**
   * Creates the cloud fill gradient.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   * @returns {CanvasGradient}
   */
  createCloudGradient(context) {
    const gradient = context.createLinearGradient(0, this.y, 0, this.y + this.height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.92)");
    gradient.addColorStop(0.58, "rgba(219, 238, 244, 0.72)");
    gradient.addColorStop(1, "rgba(89, 180, 207, 0.25)");
    return gradient;
  }

  /**
   * Selects the path that matches this cloud's variant.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  createCloudPath(context) {
    if (this.variant === "tall") {
      this.createTallCloudPath(context);
      return;
    }

    if (this.variant === "small") {
      this.createSmallCloudPath(context);
      return;
    }

    this.createWideCloudPath(context);
  }

  /**
   * Draws a wide cloud with a large center dome.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  createWideCloudPath(context) {
    const { x, y, width: w, height: h } = this;

    context.beginPath();
    context.moveTo(x + w * 0.02, y + h * 0.84);
    context.quadraticCurveTo(x + w * 0.13, y + h * 0.58, x + w * 0.30, y + h * 0.62);
    context.bezierCurveTo(x + w * 0.25, y + h * 0.30, x + w * 0.38, y + h * 0.08, x + w * 0.56, y + h * 0.12);
    context.bezierCurveTo(x + w * 0.70, y + h * 0.13, x + w * 0.78, y + h * 0.31, x + w * 0.76, y + h * 0.48);
    context.bezierCurveTo(x + w * 0.88, y + h * 0.31, x + w * 1.00, y + h * 0.49, x + w * 0.98, y + h * 0.74);
    context.quadraticCurveTo(x + w * 0.72, y + h * 0.86, x + w * 0.02, y + h * 0.84);
    context.closePath();
  }

  /**
   * Draws a taller cloud like the large left reference cloud.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  createTallCloudPath(context) {
    const { x, y, width: w, height: h } = this;

    context.beginPath();
    context.moveTo(x, y + h * 0.88);
    context.quadraticCurveTo(x + w * 0.10, y + h * 0.62, x + w * 0.26, y + h * 0.66);
    context.bezierCurveTo(x + w * 0.18, y + h * 0.32, x + w * 0.35, y + h * 0.08, x + w * 0.54, y + h * 0.16);
    context.bezierCurveTo(x + w * 0.72, y + h * 0.24, x + w * 0.75, y + h * 0.50, x + w * 0.68, y + h * 0.66);
    context.bezierCurveTo(x + w * 0.82, y + h * 0.56, x + w * 0.95, y + h * 0.66, x + w, y + h * 0.88);
    context.lineTo(x, y + h * 0.88);
    context.closePath();
  }

  /**
   * Draws a compact cloud with a small leading puff.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  createSmallCloudPath(context) {
    const { x, y, width: w, height: h } = this;

    context.beginPath();
    context.moveTo(x + w * 0.02, y + h * 0.84);
    context.quadraticCurveTo(x + w * 0.10, y + h * 0.70, x + w * 0.22, y + h * 0.72);
    context.bezierCurveTo(x + w * 0.20, y + h * 0.46, x + w * 0.38, y + h * 0.38, x + w * 0.48, y + h * 0.54);
    context.bezierCurveTo(x + w * 0.45, y + h * 0.16, x + w * 0.74, y + h * 0.12, x + w * 0.72, y + h * 0.58);
    context.bezierCurveTo(x + w * 0.86, y + h * 0.48, x + w * 0.96, y + h * 0.62, x + w * 0.98, y + h * 0.84);
    context.quadraticCurveTo(x + w * 0.64, y + h * 0.88, x + w * 0.02, y + h * 0.84);
    context.closePath();
  }
}
