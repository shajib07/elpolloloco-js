class ImageManager {
  static cache = {};

  static load(path) {
    if (!this.cache[path]) {
      const image = new Image();
      image.src = path;
      this.cache[path] = image;
    }
    return this.cache[path];
  }

  static loadMany(paths) {
    return paths.map((path) => this.load(path));
  }
}
