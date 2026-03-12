class HUD {
  constructor(context, canvas) {
    this.context = context;
    this.canvas = canvas;

    this.healthBarImages = this.loadBarImages("health");
    this.coinBarImages = this.loadBarImages("coins");
    this.bottleBarImages = this.loadBarImages("bottles");
    this.endbossBarImages = this.loadBarImages("endboss");

    this.layout = {
      health: { x: 20, y: 20, w: 200, h: 50 },
      coins: { x: 20, y: 70, w: 200, h: 50 },
      bottles: { x: 20, y: 120, w: 200, h: 50 },
      endboss: { x: this.canvas.width - 240, y: 30, w: 200, h: 50 },
    };
  }

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

  getHealthBarLevel(playerHealth) {
    if (playerHealth >= 100) return 100;
    if (playerHealth >= 80) return 80;
    if (playerHealth >= 60) return 60;
    if (playerHealth >= 40) return 40;
    if (playerHealth >= 20) return 20;
    return 0;
  }

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

  getEndbossBarLevel(endbossHealth) {
    if (endbossHealth >= 100) return 100;
    if (endbossHealth >= 80) return 80;
    if (endbossHealth >= 60) return 60;
    if (endbossHealth >= 40) return 40;
    if (endbossHealth >= 20) return 20;
    return 0;
  }

  drawHealthBar(playerHealth) {
    const level = this.getHealthBarLevel(playerHealth);
    const image = this.healthBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      const layout = this.layout.health;
      this.context.drawImage(image, layout.x, layout.y, layout.w, layout.h);
    }
  }

  drawCoinBar(collectedCoins, maxCoins) {
    const level = this.getCoinBarLevel(collectedCoins, maxCoins);
    const image = this.coinBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      this.context.drawImage(image, 20, 70, 200, 50);
      const layout = this.layout.coins;
      this.context.drawImage(image, layout.x, layout.y, layout.w, layout.h);
    }
  }

  drawBottleBar(collectedBottles, maxBottles) {
    const level = this.getBottleBarLevel(collectedBottles, maxBottles);
    const image = this.bottleBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      const layout = this.layout.bottles;
      this.context.drawImage(image, layout.x, layout.y, layout.w, layout.h);
    }
  }

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
