/**
 * Controls game loop, updates and rendering.
 */
class Game {
  constructor(canvas, keys, onGameOver) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.keys = keys;
    this.player = new Player();
    this.animationFrameId = null;

    this.world = new World(canvas);

    this.enemies = [new Chicken(620, 360), new ChickenNormal(980, 340)];

    this.healthBarImages = this.loadHealthBarImages();

    this.onGameOver = onGameOver;
    this.isGameOver = false;

    this.loseScreenImage = new Image();
    this.loseScreenImage.src = "assets/img/screens/you-lost.png";

    this.coins = [new Coin(500, 300)];
    this.collectedCoins = 0;

    this.maxCoins = this.coins.length;
    this.coinBarImages = this.loadCoinBarImages();

    this.bottles = [new Bottle(630, 342)];
    this.collectedBottles = 0;

    this.maxBottles = this.bottles.length;
    this.bottleBarImages = this.loadBottleBarImages();

    this.throwables = [];
    this.lastThrowAt = 0;
    this.throwCooldownMs = 350;

    this.endboss = new Endboss(1800, 150);
    this.endbossBarImages = this.loadEndbossBarImages();

    this.isGameWon = false;

    this.winScreenImage = new Image();
    this.winScreenImage.src = "assets/img/screens/you-win.png";
  }

  start() {
    console.log("start");
    if (this.animationFrameId !== null) {
      return;
    }

    this.loop();
  }

  stop() {
    console.log("stop");
    if (this.animationFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  loop() {
    this.update();
    this.render();

    console.log("loop ++");
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    this.player.update(this.keys, this.world.width);
    this.world.updateCamera(this.player.x);

    this.enemies.forEach((enemy) => enemy.update());
    this.recycleEnemies();
    this.endboss.update(this.player.x);
    this.checkPlayerEnemyCollisions();
    this.checkCoinCollisions();
    this.checkBottleCollisions();

    this.handleThrowInput();
    this.updateThrowables();
    this.checkThrowableEnemyCollisions();
    this.checkGameWin();

    this.checkGameOver();
  }

  render() {
    this.world.clear();
    this.world.beginRender();
    this.world.drawBackground();
    this.world.drawGround();

    this.player.draw(this.context);
    this.enemies.forEach((enemy) => enemy.draw(this.context));
    this.coins.forEach((coin) => coin.draw(this.context));
    this.bottles.forEach((bottle) => bottle.draw(this.context));
    this.throwables.forEach((bottle) => bottle.draw(this.context));
    this.endboss.draw(this.context);

    this.world.endRender();

    this.drawEndbossBar();
    this.drawBottleBar();
    this.drawCoinBar();
    this.drawHealthBar();

    if (this.isGameWon) {
      this.drawWinScreen();
      return;
    }

    if (this.isGameOver) {
      this.drawLoseScreen();
    }
  }

  recycleEnemies() {
    this.enemies.forEach((enemy) => {
      if (!enemy.isOutOfScreen(this.world.cameraX)) {
        return;
      }

      const randomOffset = 200 + Math.random() * 300;
      enemy.reset(this.world.cameraX + this.canvas.width + randomOffset);
    });
  }

  checkPlayerEnemyCollisions() {
    const playerBounds = this.player.getBounds();

    this.enemies.forEach((enemy) => {
      if (enemy.isDead) {
        return;
      }

      const enemyBounds = enemy.getBounds();
      const isColliding = this.areRectsOverlapping(playerBounds, enemyBounds);

      if (!isColliding) {
        return;
      }

      const canBeStomped = enemy.enemyType === "small" || enemy.enemyType === "normal";

      if (
        canBeStomped &&
        this.isStompHit(playerBounds, enemyBounds) &&
        this.player.isFalling()
      ) {
        enemy.kill();
        this.player.bounceAfterStomp();
        console.log("after bounceAfgter");
        return;
      }

      console.log("before takehit");
      this.player.takeHit(20);
    });
  }

  isStompHit(playerBounds, enemyBounds) {
    const playerBottom = playerBounds.y + playerBounds.height;
    const enemyTop = enemyBounds.y;
    const stompWindow = 18;

    return playerBottom <= enemyTop + stompWindow;
  }

  areRectsOverlapping(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  checkCoinCollisions() {
    const playerBounds = this.player.getBounds();

    this.coins.forEach((coin) => {
      if (coin.isCollected) {
        return;
      }

      const coinBounds = coin.getBounds();
      const isColliding = this.areRectsOverlapping(playerBounds, coinBounds);

      if (isColliding) {
        coin.collect();
        this.collectedCoins += 1;
      }
    });
  }

  checkBottleCollisions() {
    const playerBounds = this.player.getBounds();

    this.bottles.forEach((bottle) => {
      if (bottle.isCollected) {
        return;
      }

      const bottleBounds = bottle.getBounds();
      const isColliding = this.areRectsOverlapping(playerBounds, bottleBounds);

      if (isColliding) {
        bottle.collect();
        this.collectedBottles += 1;
      }
    });
  }

  loadHealthBarImages() {
    const levels = [0, 20, 40, 60, 80, 100];
    const images = {};

    levels.forEach((level) => {
      const image = new Image();
      image.src = `assets/img/statusbars/health/${level}.png`;
      images[level] = image;
    });

    return images;
  }

  loadBottleBarImages() {
    const levels = [0, 20, 40, 60, 80, 100];
    const images = {};

    levels.forEach((level) => {
      const image = new Image();
      image.src = `assets/img/statusbars/bottles/${level}.png`;
      images[level] = image;
    });

    return images;
  }

  getBottleBarLevel() {
    if (this.maxBottles === 0) {
      return 0;
    }

    const percent = (this.collectedBottles / this.maxBottles) * 100;

    if (percent >= 100) return 100;
    if (percent >= 80) return 80;
    if (percent >= 60) return 60;
    if (percent >= 40) return 40;
    if (percent >= 20) return 20;
    return 0;
  }

  drawBottleBar() {
    const level = this.getBottleBarLevel();
    const image = this.bottleBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      this.context.drawImage(image, 20, 120, 200, 50);
      return;
    }

    this.context.fillStyle = "#ffffff";
    this.context.font = "20px Arial";
    this.context.fillText(`Bottles: ${this.collectedBottles}`, 20, 140);
  }

  getHealthBarLevel() {
    if (this.player.health >= 100) return 100;
    if (this.player.health >= 80) return 80;
    if (this.player.health >= 60) return 60;
    if (this.player.health >= 40) return 40;
    if (this.player.health >= 20) return 20;
    return 0;
  }

  drawHealthBar() {
    const level = this.getHealthBarLevel();
    const image = this.healthBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      this.context.drawImage(image, 20, 20, 200, 50);
      return;
    }
  }

  checkGameWin() {
    if (this.isGameWon || this.isGameOver) {
      return;
    }

    if (!this.endboss.isDead) {
      return;
    }

    this.isGameWon = true;
    this.isGameOver = true;

    if (typeof this.onGameOver === "function") {
      this.onGameOver("win");
    }
  }

  checkGameOver() {
    if (this.player.health > 0 || this.isGameOver) {
      return;
    }

    this.isGameOver = true;

    if (typeof this.onGameOver === "function") {
      this.onGameOver("lose");
    }
  }

  drawLoseScreen() {
    if (
      this.loseScreenImage.complete &&
      this.loseScreenImage.naturalWidth > 0
    ) {
      this.context.drawImage(
        this.loseScreenImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
      return;
    }
  }

  isOver() {
    return this.isGameOver;
  }

  loadCoinBarImages() {
    const levels = [0, 20, 40, 60, 80, 100];
    const images = {};

    levels.forEach((level) => {
      const image = new Image();
      image.src = `assets/img/statusbars/coins/${level}.png`;
      images[level] = image;
    });

    return images;
  }

  getCoinBarLevel() {
    if (this.maxCoins === 0) {
      return 0;
    }

    const percent = (this.collectedCoins / this.maxCoins) * 100;

    if (percent >= 100) return 100;
    if (percent >= 80) return 80;
    if (percent >= 60) return 60;
    if (percent >= 40) return 40;
    if (percent >= 20) return 20;
    return 0;
  }

  drawCoinBar() {
    const level = this.getCoinBarLevel();
    const image = this.coinBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      this.context.drawImage(image, 20, 70, 200, 50);
      return;
    }

    this.context.fillStyle = "#ffffff";
    this.context.font = "20px Arial";
    this.context.fillText(`Coins: ${this.collectedCoins}`, 20, 85);
  }

  handleThrowInput() {
    if (!this.keys.KeyD) {
      return;
    }

    const now = Date.now();
    const isOnCooldown = now - this.lastThrowAt < this.throwCooldownMs;

    if (isOnCooldown) {
      return;
    }

    if (this.collectedBottles <= 0) {
      return;
    }

    const origin = this.player.getThrowOrigin();
    const bottle = new ThrowableBottle(origin.x, origin.y, origin.facingLeft);

    this.throwables.push(bottle);
    this.collectedBottles -= 1;
    this.lastThrowAt = now;
  }

  updateThrowables() {
    this.throwables.forEach((bottle) => bottle.update(this.world.width));
    this.throwables = this.throwables.filter((bottle) => !bottle.isFinished);
  }

  checkThrowableEnemyCollisions() {
    this.throwables.forEach((throwable) => {
      if (throwable.isFinished) {
        return;
      }

      if (!this.endboss.isDead) {
        const bottleBounds = throwable.getBounds();
        const bossBounds = this.endboss.getBounds();
        const hitsBoss = this.areRectsOverlapping(bottleBounds, bossBounds);

        if (hitsBoss) {
          this.endboss.takeHit(20);
          throwable.isFinished = true;
          return;
        }
      }

      const bottleBounds = throwable.getBounds();

      this.enemies.forEach((enemy) => {
        if (enemy.isDead) {
          return;
        }

        if (enemy.enemyType !== "normal") return;

        const enemyBounds = enemy.getBounds();
        const isColliding = this.areRectsOverlapping(bottleBounds, enemyBounds);

        if (!isColliding) {
          return;
        }

        enemy.kill();
        throwable.isFinished = true;
      });
    });
  }

  loadEndbossBarImages() {
    const levels = [0, 20, 40, 60, 80, 100];
    const images = {};

    levels.forEach((level) => {
      const image = new Image();
      image.src = `assets/img/statusbars/endboss/${level}.png`;
      images[level] = image;
    });

    return images;
  }

  getEndbossBarLevel() {
    if (this.endboss.health >= 100) return 100;
    if (this.endboss.health >= 80) return 80;
    if (this.endboss.health >= 60) return 60;
    if (this.endboss.health >= 40) return 40;
    if (this.endboss.health >= 20) return 20;
    return 0;
  }

  drawEndbossBar() {
    const shouldShow = this.endboss.x < 1050 && !this.endboss.isDead;
    if (!shouldShow) {
      return;
    }

    const level = this.getEndbossBarLevel();
    const image = this.endbossBarImages[level];

    if (image && image.complete && image.naturalWidth > 0) {
      this.context.drawImage(image, this.canvas.width - 240, 20, 200, 50);
    }
  }

  drawWinScreen() {
    if (this.winScreenImage.complete && this.winScreenImage.naturalWidth > 0) {
      this.context.drawImage(
        this.winScreenImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
      return;
    }

    this.context.fillStyle = "rgba(0, 0, 0, 0.55)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = "#ffffff";
    this.context.font = "42px Arial";
    this.context.fillText("You Win!", 250, 240);
  }
}
