/**
 * Represents a decorative cloud that drifts across the desert sky.
 */
class Cloud extends DrawableObject {
  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   * @param {number} width - Cloud width in pixels.
   * @param {number} height - Cloud height in pixels.
   * @param {number} speed - Horizontal drift speed per frame.
   */
  constructor(x, y, width = 180, height = 80, speed = 0.18) {
    super(x, y, width, height);

    this.speed = speed;
    this.baseY = y;
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
   * Draws a soft cloud made of overlapping circles.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    context.save();
    context.globalAlpha = 0.9;
    context.fillStyle = "#f7fbff";
    context.shadowColor = "rgba(255, 255, 255, 0.25)";
    context.shadowBlur = 10;
    context.beginPath();
    context.arc(
      this.x + this.width * 0.24,
      this.y + this.height * 0.55,
      this.height * 0.24,
      0,
      Math.PI * 2,
    );
    context.arc(
      this.x + this.width * 0.44,
      this.y + this.height * 0.34,
      this.height * 0.3,
      0,
      Math.PI * 2,
    );
    context.arc(
      this.x + this.width * 0.67,
      this.y + this.height * 0.5,
      this.height * 0.25,
      0,
      Math.PI * 2,
    );
    context.arc(
      this.x + this.width * 0.84,
      this.y + this.height * 0.62,
      this.height * 0.17,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.restore();
  }
}
