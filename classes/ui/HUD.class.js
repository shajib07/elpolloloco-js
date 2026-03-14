/**
 * Draws all status bars (player, collectibles and endboss).
 */
class HUD {
  /**
   * @param {CanvasRenderingContext2D} context - Canvas 2D context.
   * @param {HTMLCanvasElement} canvas - Main game canvas.
   */
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;
    this.loadImages();
    this.layout = this.createLayout();
  }

  /**
   * Loads image sets for each status bar group.
   */
  loadImages() {
    this.healthBarImages = this.loadBarImages("health");
    this.coinBarImages = this.loadBarImages("coins");
    this.bottleBarImages = this.loadBarImages("bottles");
    this.endbossBarImages = this.loadBarImages("endboss");
  }

  /**
   * Creates fixed positions for all HUD bars.
   * @returns {Object}
   */
  createLayout() {
    return {
      health: { x: 20, y: 20, w: 200, h: 50 },
      coins: { x: 20, y: 70, w: 200, h: 50 },
      bottles: { x: 20, y: 120, w: 200, h: 50 },
      endboss: { x: this.canvas.width - 240, y: 30, w: 200, h: 50 },
    };
  }

  /**
   * Loads all level images (0..100) for one statusbar folder.
   * @param {string} folderName - Statusbar folder name.
   * @returns {Object.<number, HTMLImageElement>}
   */
  loadBarImages(folderName) {
    const levels = [0, 20, 40, 60, 80, 100];
    const images = {};

    levels.forEach((level) => {
      images[level] = ImageManager.load(
        `assets/img/statusbars/${folderName}/${level}.png`,
      );
    });

    return images;
  }

  /**
   * @param {number} playerHealth
   * @returns {0|20|40|60|80|100}
   */
  getHealthBarLevel(playerHealth) {
    if (playerHealth >= 100) return 100;
    if (playerHealth >= 80) return 80;
    if (playerHealth >= 60) return 60;
    if (playerHealth >= 40) return 40;
    if (playerHealth >= 20) return 20;
    return 0;
  }

  /**
   * @param {number} collectedCoins
   * @param {number} maxCoins
   * @returns {0|20|40|60|80|100}
   */
  getCoinBarLevel(collectedCoins, maxCoins) {
    if (maxCoins === 0) {
      return 0;
    }

    const percent = (collectedCoins / maxCoins) * 100;
    if (percent >= 100) return 100;
    if (percent >= 80) return 80;
    if (percent >= 60) return 60;
    if (percent >= 40) return 40;
    if (percent >= 20) return 20;
    return 0;
  }

  /**
   * @param {number} collectedBottles
   * @param {number} maxBottles
   * @returns {0|20|40|60|80|100}
   */
  getBottleBarLevel(collectedBottles, maxBottles) {
    if (maxBottles === 0) {
      return 0;
    }

    const percent = (collectedBottles / maxBottles) * 100;
    if (percent >= 100) return 100;
    if (percent >= 80) return 80;
    if (percent >= 60) return 60;
    if (percent >= 40) return 40;
    if (percent >= 20) return 20;
    return 0;
  }

  /**
   * @param {number} endbossHealth
   * @returns {0|20|40|60|80|100}
   */
  getEndbossBarLevel(endbossHealth) {
    if (endbossHealth >= 100) return 100;
    if (endbossHealth >= 80) return 80;
    if (endbossHealth >= 60) return 60;
    if (endbossHealth >= 40) return 40;
    if (endbossHealth >= 20) return 20;
    return 0;
  }

  /**
   * Draws player health status bar.
   * @param {number} playerHealth
   */
  drawHealthBar(playerHealth) {
    const level = this.getHealthBarLevel(playerHealth);
    const image = this.healthBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      const layout = this.layout.health;
      this.context.drawImage(image, layout.x, layout.y, layout.w, layout.h);
    }
  }

  /**
   * Draws collected coin progress bar.
   * @param {number} collectedCoins
   * @param {number} maxCoins
   */
  drawCoinBar(collectedCoins, maxCoins) {
    const level = this.getCoinBarLevel(collectedCoins, maxCoins);
    const image = this.coinBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      this.context.drawImage(image, 20, 70, 200, 50);
      const layout = this.layout.coins;
      this.context.drawImage(image, layout.x, layout.y, layout.w, layout.h);
    }
  }

  /**
   * Draws collected bottle progress bar.
   * @param {number} collectedBottles
   * @param {number} maxBottles
   */
  drawBottleBar(collectedBottles, maxBottles) {
    const level = this.getBottleBarLevel(collectedBottles, maxBottles);
    const image = this.bottleBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      const layout = this.layout.bottles;
      this.context.drawImage(image, layout.x, layout.y, layout.w, layout.h);
    }
  }

  /**
   * Draws endboss health bar while boss fight is active.
   * @param {boolean} isBossFightActive
   * @param {{isDead:boolean, health:number}} endboss
   */
  drawEndbossBar(isBossFightActive, endboss) {
    if (!isBossFightActive || endboss.isDead) {
      return;
    }

    const level = this.getEndbossBarLevel(endboss.health);
    const image = this.endbossBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      const layout = this.layout.endboss;
      this.context.drawImage(image, layout.x, layout.y, layout.w, layout.h);
    }
  }
}
