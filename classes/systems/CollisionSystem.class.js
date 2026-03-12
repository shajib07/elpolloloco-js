class CollisionSystem {
  constructor(game) {
    this.game = game;
  }

  areRectsOverlapping(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  isStompHit(playerBounds, enemyBounds) {
    const playerBottom = playerBounds.y + playerBounds.height;
    const enemyTop = enemyBounds.y;
    const stompWindow = 18;

    return playerBottom <= enemyTop + stompWindow;
  }

  checkPlayerEnemyCollisions() {
    const playerBounds = this.game.player.getBounds();

    this.game.enemies.forEach((enemy) => {
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
        this.game.player.isFalling()
      ) {
        enemy.kill();
        this.game.player.bounceAfterStomp();
        return;
      }

      this.game.player.takeHit(COMBAT.ENEMY_DAMAGE);
    });
  }

  checkPlayerBossCollision() {
    if (!this.game.isBossFightActive) {
      return;
    }

    if (this.game.endboss.isDead) {
      return;
    }

    const playerBounds = this.game.player.getBounds();
    const bossBounds = this.game.endboss.getBounds();
    const isColliding = this.areRectsOverlapping(playerBounds, bossBounds);

    if (!isColliding) {
      return;
    }

    const now = Date.now();
    const isOnCooldown =
      now - this.game.lastBossHitAt < this.game.bossHitCooldownMs;

    if (isOnCooldown) {
      return;
    }

    this.game.player.takeHit(COMBAT.BOSS_DAMAGE);
    this.game.player.applyKnockback(
      this.game.endboss.x,
      this.game.world.width,
    );
    this.game.lastBossHitAt = now;
  }

  checkCoinCollisions() {
    const playerBounds = this.game.player.getBounds();

    this.game.coins.forEach((coin) => {
      if (coin.isCollected) {
        return;
      }

      const coinBounds = coin.getBounds();
      const isColliding = this.areRectsOverlapping(playerBounds, coinBounds);

      if (isColliding) {
        coin.collect();
        this.game.collectedCoins += 1;
      }
    });
  }

  checkBottleCollisions() {
    const playerBounds = this.game.player.getBounds();

    this.game.bottles.forEach((bottle) => {
      if (bottle.isCollected) {
        return;
      }

      const bottleBounds = bottle.getBounds();
      const isColliding = this.areRectsOverlapping(playerBounds, bottleBounds);

      if (isColliding) {
        bottle.collect();
        this.game.collectedBottles += 1;
      }
    });
  }

  checkThrowableEnemyCollisions() {
    this.game.throwables.forEach((throwable) => {
      if (throwable.isFinished) {
        return;
      }

      if (this.game.isBossFightActive && !this.game.endboss.isDead) {
        const bottleBounds = throwable.getBounds();
        const bossBounds = this.game.endboss.getBounds();
        const hitsBoss = this.areRectsOverlapping(bottleBounds, bossBounds);

        if (hitsBoss) {
          this.game.endboss.takeHit(COMBAT.BOTTLE_DAMAGE);
          this.game.endboss.applyKnockback(throwable.x, this.game.world.width);
          throwable.isFinished = true;
          return;
        }
      }

      const bottleBounds = throwable.getBounds();

      this.game.enemies.forEach((enemy) => {
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
}