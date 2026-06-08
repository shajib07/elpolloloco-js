/**
 * Loads and caches images so sprite sheets are reused instead of reloaded.
 */
class ImageManager {
  static cache = {};

  /**
   * Loads a single image and caches it by path.
   * @param {string} path - Image asset path.
   * @returns {HTMLImageElement}
   */
  static load(path) {
    if (!this.cache[path]) {
      const image = new Image();
      image.src = path;
      this.cache[path] = image;
    }
    return this.cache[path];
  }

  /**
   * Loads multiple images and returns them in the same order as the input paths.
   * @param {string[]} paths - Image asset paths.
   * @returns {HTMLImageElement[]}
   */
  static loadMany(paths) {
    return paths.map((path) => this.load(path));
  }
}
