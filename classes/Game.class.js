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
    this.hud = new HUD(this.context, this.canvas);
    this.collisionSystem = new CollisionSystem(this);

    this.enemies = [new Chicken(620, 360), new ChickenNormal(980, 340)];

    this.onGameOver = onGameOver;
    this.isGameOver = false;

    this.loseScreenImage = ImageManager.load(IMAGE_PATHS.SCREENS.LOSE);
    this.winScreenImage = ImageManager.load(IMAGE_PATHS.SCREENS.WIN);

    this.coins = [
      new Coin(500, 300),
      new Coin(750, 260),
      new Coin(980, 220),
      new Coin(1250, 280),
      new Coin(1600, 240),
    ];
    this.collectedCoins = 0;

    this.maxCoins = this.coins.length;

    const bottlePositions = [630, 900, 1180, 1460, 1720, 1980];
    this.bottles = bottlePositions.map((x) => new Bottle(x, 342));

    this.collectedBottles = 0;
    this.maxBottles = this.bottles.length;

    this.throwables = [];
    this.lastThrowAt = 0;
    this.throwCooldownMs = 350;

    this.endboss = new Endboss(1800, 150);

    this.isGameWon = false;
    this.isBossFightActive = false;

    this.lastBossHitAt = 0;
    this.bossHitCooldownMs = 800;
  }

  start() {
    if (this.animationFrameId !== null) {
      return;
    }

    this.loop();
  }

  stop() {
    if (this.animationFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  loop() {
    this.update();
    this.render();

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  update() {
    if (this.isGameOver) {
      return;
    }

    this.player.update(this.keys, this.world.width);
    this.world.updateCamera(this.player.x);
    this.updateBossFightState();

    this.enemies.forEach((enemy) => enemy.update());
    this.recycleEnemies();

    if (this.isBossFightActive) {
      this.endboss.update(this.player.x);
    }

    this.checkPlayerEnemyCollisions();
    this.checkPlayerBossCollision();
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

    this.hud.drawEndbossBar(this.isBossFightActive, this.endboss);
    this.hud.drawBottleBar(this.collectedBottles, this.maxBottles);
    this.hud.drawCoinBar(this.collectedCoins, this.maxCoins);
    this.hud.drawHealthBar(this.player.health);

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

      const canBeStomped =
        enemy.enemyType === "small" || enemy.enemyType === "normal";

      if (
        canBeStomped &&
        this.isStompHit(playerBounds, enemyBounds) &&
        this.player.isFalling()
      ) {
        enemy.kill();
        this.player.bounceAfterStomp();
        return;
      }

      this.player.takeHit(COMBAT.ENEMY_DAMAGE);
    });
  }

  checkPlayerBossCollision() {
    if (!this.isBossFightActive) {
      return;
    }

    if (this.endboss.isDead) {
      return;
    }

    const playerBounds = this.player.getBounds();
    const bossBounds = this.endboss.getBounds();
    const isColliding = this.areRectsOverlapping(playerBounds, bossBounds);

    if (!isColliding) {
      return;
    }

    const now = Date.now();
    const isOnCooldown = now - this.lastBossHitAt < this.bossHitCooldownMs;

    if (isOnCooldown) {
      return;
    }

    this.player.takeHit(COMBAT.BOSS_DAMAGE);
    this.player.applyKnockback(this.endboss.x, this.world.width);
    this.lastBossHitAt = now;
  }

  isStompHit(playerBounds, enemyBounds) {
    const playerBottom = playerBounds.y + playerBounds.height;
    const enemyTop = enemyBounds.y;
    const stompWindow = 18;

    return playerBottom <= enemyTop + stompWindow;
  }

  updateBossFightState() {
    if (this.isBossFightActive) {
      return;
    }
    this.isBossFightActive = this.player.x >= this.endboss.canvasActivationX;
  }

  checkCoinCollisions() {
    const playerBounds = this.player.getBounds();

    this.coins.forEach((coin) => {
      if (coin.isCollected) {
        return;
      }

      const coinBounds = coin.getBounds();
      const isColliding = this.collisionSystem.areRectsOverlapping(playerBounds, coinBounds);

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
      const isColliding = this.collisionSystem.areRectsOverlapping(playerBounds, bottleBounds);

      if (isColliding) {
        bottle.collect();
        this.collectedBottles += 1;
      }
    });
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

      if (this.isBossFightActive && !this.endboss.isDead) {
        const bottleBounds = throwable.getBounds();
        const bossBounds = this.endboss.getBounds();
        const hitsBoss = this.collisionSystem.areRectsOverlapping(bottleBounds, bossBounds);

        if (hitsBoss) {
          this.endboss.takeHit(COMBAT.BOTTLE_DAMAGE);
          this.endboss.applyKnockback(throwable.x);
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
        const isColliding = this.collisionSystem.areRectsOverlapping(bottleBounds, enemyBounds);

        if (!isColliding) {
          return;
        }

        enemy.kill();
        throwable.isFinished = true;
      });
    });
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
