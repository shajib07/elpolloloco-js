class SpriteAnimation {
  constructor(
    frames,
    framesPerSprite = ANIMATION.DEFAULT_FRAMES_PER_SPRITE,
  ) {
    this.frames = frames;
    this.framesPerSprite = framesPerSprite;

    this.currentFrameIndex = 0;
    this.frameCounter = 0;
  }

  update() {
    this.frameCounter++;
    if (this.frameCounter < this.framesPerSprite) {
      return;
    }

    this.frameCounter = 0;
    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
  }

  getCurrentFrame() {
    return this.frames[this.currentFrameIndex];
  }

  reset() {
    this.currentFrameIndex = 0;
    this.frameCounter = 0;
  }
}
