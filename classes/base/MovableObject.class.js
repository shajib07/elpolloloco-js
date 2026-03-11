class MovableObject extends DrawableObject {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.speed = 0;
    this.facingLeft = false;
  }
}
