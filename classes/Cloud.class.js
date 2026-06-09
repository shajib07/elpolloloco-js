/**
 * Represents a decorative cloud that drifts across the desert sky.
 */
class Cloud extends DrawableObject {
  /** Cached, background-removed cloud sprite shared by every instance. */
  static sprite = null;
  /** True once sprite generation failed, so we fall back to procedural clouds. */
  static spriteFailed = false;

  /**
   * @param {number} x - Initial x position.
   * @param {number} y - Initial y position.
   * @param {number} width - Cloud width in pixels.
   * @param {number} height - Cloud height in pixels.
   * @param {number} speed - Horizontal drift speed per frame.
   */
  constructor(x, y, width = 180, height = 120, speed = 0.18) {
    super(x, y, width, height);

    this.speed = speed;
    this.baseY = y;
    this.image = ImageManager.load(IMAGE_PATHS.WORLD.CLOUDS);
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
   * Draws the cloud, preferring the clouds.png sprite and falling back to a
   * procedural cloud while the image loads or if it cannot be processed.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  draw(context) {
    const sprite = Cloud.getSprite(this.image);

    if (sprite) {
      this.drawSprite(context, sprite);
      return;
    }

    this.drawProcedural(context);
  }

  /**
   * Draws the cut-out cloud sprite at the cloud's current position.
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   * @param {HTMLCanvasElement} sprite - Background-removed cloud sprite.
   */
  drawSprite(context, sprite) {
    context.save();
    context.globalAlpha = 0.92;
    context.drawImage(sprite, this.x, this.y, this.width, this.height);
    context.restore();
  }

  /**
   * Returns the shared cloud sprite, building it once the source image loads.
   * @param {HTMLImageElement} image - Source clouds image.
   * @returns {HTMLCanvasElement|null} Cut-out sprite, or null while unavailable.
   */
  static getSprite(image) {
    if (Cloud.sprite) {
      return Cloud.sprite;
    }
    if (Cloud.spriteFailed || !this.prototype.isImageReady(image)) {
      return null;
    }

    Cloud.sprite = Cloud.buildSprite(image);
    return Cloud.sprite;
  }

  /**
   * Builds a transparent cloud sprite by flood-filling the near-white sky
   * background away from the image borders (the cloud's dark outline blocks
   * the fill, so the white cloud body is preserved), then cropping to content.
   * @param {HTMLImageElement} image - Loaded clouds image.
   * @returns {HTMLCanvasElement|null} Cropped, cut-out sprite or null on failure.
   */
  static buildSprite(image) {
    try {
      const source = Cloud.createCanvas(image.naturalWidth, image.naturalHeight);
      const sourceContext = source.getContext("2d");
      sourceContext.drawImage(image, 0, 0);
      const imageData = sourceContext.getImageData(0, 0, source.width, source.height);
      const bounds = Cloud.removeBackground(imageData);
      sourceContext.putImageData(imageData, 0, 0);
      return Cloud.cropCanvas(source, bounds);
    } catch {
      Cloud.spriteFailed = true;
      return null;
    }
  }

  /**
   * Flood-fills the connected near-white background from the borders, making it
   * transparent, and returns the bounding box of the remaining cloud pixels.
   * @param {ImageData} imageData - Pixel buffer to modify in place.
   * @returns {{minX:number,minY:number,maxX:number,maxY:number,found:boolean}}
   */
  static removeBackground(imageData) {
    const { data, width, height } = imageData;
    const visited = new Uint8Array(width * height);
    const stack = [];
    const seed = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const pixel = y * width + x;
      if (visited[pixel] || !Cloud.isBackgroundPixel(data, pixel * 4)) return;
      visited[pixel] = 1;
      stack.push(pixel);
    };

    for (let x = 0; x < width; x += 1) {
      seed(x, 0);
      seed(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
      seed(0, y);
      seed(width - 1, y);
    }

    while (stack.length) {
      const pixel = stack.pop();
      data[pixel * 4 + 3] = 0;
      const x = pixel % width;
      const y = (pixel / width) | 0;
      seed(x - 1, y);
      seed(x + 1, y);
      seed(x, y - 1);
      seed(x, y + 1);
    }

    return Cloud.measureOpaqueBounds(imageData);
  }

  /**
   * Whether a pixel looks like the bright, near-neutral sky background.
   * @param {Uint8ClampedArray} data - RGBA pixel buffer.
   * @param {number} index - Byte offset of the pixel's red channel.
   * @returns {boolean}
   */
  static isBackgroundPixel(data, index) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    return brightness > 200 && saturation < 45;
  }

  /**
   * Computes the bounding box of pixels that are still visible.
   * @param {ImageData} imageData - Pixel buffer to scan.
   * @returns {{minX:number,minY:number,maxX:number,maxY:number,found:boolean}}
   */
  static measureOpaqueBounds(imageData) {
    const { data, width, height } = imageData;
    const bounds = { minX: width, minY: height, maxX: 0, maxY: 0, found: false };

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] <= 10) continue;
        bounds.found = true;
        bounds.minX = Math.min(bounds.minX, x);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxY = Math.max(bounds.maxY, y);
      }
    }

    return bounds;
  }

  /**
   * Crops a canvas to the supplied bounds, returning the source if empty.
   * @param {HTMLCanvasElement} source - Canvas to crop.
   * @param {{minX:number,minY:number,maxX:number,maxY:number,found:boolean}} bounds - Crop region.
   * @returns {HTMLCanvasElement} Cropped cloud canvas.
   */
  static cropCanvas(source, bounds) {
    if (!bounds.found) {
      return source;
    }

    const width = bounds.maxX - bounds.minX + 1;
    const height = bounds.maxY - bounds.minY + 1;
    const cropped = Cloud.createCanvas(width, height);
    cropped
      .getContext("2d")
      .drawImage(source, bounds.minX, bounds.minY, width, height, 0, 0, width, height);
    return cropped;
  }

  /**
   * Creates an offscreen canvas of the given size.
   * @param {number} width - Canvas width.
   * @param {number} height - Canvas height.
   * @returns {HTMLCanvasElement}
   */
  static createCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Draws a soft cloud made of overlapping circles (fallback rendering).
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   */
  drawProcedural(context) {
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
