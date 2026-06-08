/**
 * Cycles through a list of frames at a fixed cadence.
 */
class SpriteAnimation {
  /**
   * @param {HTMLImageElement[]} frames - Ordered sprite frames.
   * @param {number} [framesPerSprite=ANIMATION.DEFAULT_FRAMES_PER_SPRITE] - Frame count before advancing.
   * @param {boolean} [loop=true] - Whether the animation should wrap back to the first frame.
   */
  constructor(
    frames,
    framesPerSprite = ANIMATION.DEFAULT_FRAMES_PER_SPRITE,
    loop = true,
  ) {
    this.frames = frames;
    this.framesPerSprite = framesPerSprite;
    this.loop = loop;

    this.currentFrameIndex = 0;
    this.frameCounter = 0;
    this.isFinished = false;
  }

  /**
   * Advances the animation counter and wraps around when needed.
   */
  update() {
    if (this.isFinished) {
      return;
    }

    this.frameCounter++;
    if (this.frameCounter < this.framesPerSprite) {
      return;
    }

    this.frameCounter = 0;
    if (this.currentFrameIndex >= this.frames.length - 1) {
      if (!this.loop) {
        this.isFinished = true;
        return;
      }

      this.currentFrameIndex = 0;
      return;
    }

    this.currentFrameIndex++;
  }

  /**
   * Returns the current frame in the animation cycle.
   * @returns {HTMLImageElement}
   */
  getCurrentFrame() {
    return this.frames[this.currentFrameIndex];
  }

  /**
   * Resets the animation back to its first frame.
   */
  reset() {
    this.currentFrameIndex = 0;
    this.frameCounter = 0;
    this.isFinished = false;
  }
}
