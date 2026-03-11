class Enemy extends MovableObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.isDead = false;
    this.deadAt = 0;
    this.deadDisplayMs = 350;
  }

  kill() {
    if (this.isDead) {
      return;
    }

    this.isDead = true;
    this.deadAt = Date.now();
  }

  isOutOfScreen(cameraX) {
    if (this.isDead) {
      return Date.now() - this.deadAt > this.deadDisplayMs;
    }
    return this.x + this.width < cameraX;
  }

  reset(newX) {
    this.x = newX;
    this.isDead = false;
    this.deadAt = 0;
  }
}
