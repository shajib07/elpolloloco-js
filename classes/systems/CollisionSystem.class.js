/**
 * Handles all gameplay collision checks and collision outcomes.
 */
class CollisionSystem {
  /**
   * @param {Game} game - Active game instance.
   */
  constructor(game) {
    this.game = game;
  }

  /**
   * Axis-aligned rectangle overlap test.
   * @param {{x:number,y:number,width:number,height:number}} a
   * @param {{x:number,y:number,width:number,height:number}} b
   * @returns {boolean}
   */
  areRectsOverlapping(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Checks whether player hits enemy from above within stomp tolerance.
   * @param {{x:number,y:number,width:number,height:number}} playerBounds
   * @param {{x:number,y:number,width:number,height:number}} enemyBounds
   * @returns {boolean}
   */
  isStompHit(playerBounds, enemyBounds) {
    const playerBottom = playerBounds.y + playerBounds.height;
    const enemyTop = enemyBounds.y;
    const stompWindow = 18;

    return playerBottom <= enemyTop + stompWindow;
  }

  /**
   * Resolves collisions between player and regular enemies.
   */
  checkPlayerEnemyCollisions() {
    const playerBounds = this.game.player.getBounds();
    this.game.enemies.forEach((enemy) =>
      this.handlePlayerEnemyCollision(enemy, playerBounds),
    );
  }

  /**
   * Handles one enemy collision against the player's current bounds.
   * @param {Enemy} enemy - Enemy to test.
   * @param {{x:number,y:number,width:number,height:number}} playerBounds - Player collision box.
   */
  handlePlayerEnemyCollision(enemy, playerBounds) {
    if (enemy.isDead) return;

    const enemyBounds = enemy.getBounds();
    if (!this.areRectsOverlapping(playerBounds, enemyBounds)) return;

    if (this.tryHandleStomp(enemy, playerBounds, enemyBounds)) return;

    this.damagePlayerFromEnemy();
  }

  /**
   * Tries to resolve a stomp attack against an enemy.
   * @param {Enemy} enemy - Enemy to test.
   * @param {{x:number,y:number,width:number,height:number}} playerBounds - Player collision box.
   * @param {{x:number,y:number,width:number,height:number}} enemyBounds - Enemy collision box.
   * @returns {boolean} True when the stomp was handled.
   */
  tryHandleStomp(enemy, playerBounds, enemyBounds) {
    if (!this.canBeStomped(enemy)) return false;
    if (!this.isStompHit(playerBounds, enemyBounds)) return false;
    if (!this.game.player.isFalling()) return false;

    enemy.kill();
    this.game.player.bounceAfterStomp();
    this.game.playSound("CHICKEN_DEAD");
    return true;
  }

  /**
   * Checks whether an enemy can be stomped.
   * @param {Enemy} enemy - Enemy to inspect.
   * @returns {boolean}
   */
  canBeStomped(enemy) {
    return enemy.enemyType === "small" || enemy.enemyType === "normal";
  }

  /**
   * Applies regular enemy damage to the player.
   */
  damagePlayerFromEnemy() {
    this.game.player.takeHit(COMBAT.ENEMY_DAMAGE);
    this.game.playSound("PLAYER_HIT");
  }

  /**
   * Resolves collision between player and endboss with cooldown.
   */
  checkPlayerBossCollision() {
    if (!this.shouldCheckBossCollision()) return;

    const playerBounds = this.game.player.getBounds();
    const bossBounds = this.game.endboss.getBounds();
    if (!this.areRectsOverlapping(playerBounds, bossBounds)) return;

    const now = Date.now();
    if (this.isBossHitOnCooldown(now)) return;

    this.applyBossContactDamage(now);
  }

  /**
   * Checks whether the boss fight is currently active.
   * @returns {boolean}
   */
  shouldCheckBossCollision() {
    return this.game.isBossFightActive && !this.game.endboss.isDead;
  }

  /**
   * Checks whether the boss damage cooldown is still active.
   * @param {number} now - Current timestamp in milliseconds.
   * @returns {boolean}
   */
  isBossHitOnCooldown(now) {
    return now - this.game.lastBossHitAt < this.game.bossHitCooldownMs;
  }

  /**
   * Applies contact damage from the boss to the player.
   * @param {number} now - Current timestamp in milliseconds.
   */
  applyBossContactDamage(now) {
    this.game.player.takeHit(COMBAT.BOSS_DAMAGE);
    this.game.player.applyKnockback(this.game.endboss.x, this.game.world.width);
    this.game.endboss.requestAttack(now);
    this.game.playSound("PLAYER_HIT");
    this.game.lastBossHitAt = now;
  }

  /**
   * Resolves player collisions with coin collectibles.
   */
  checkCoinCollisions() {
    this.checkCollectibleCollisions(this.game.coins, (coin) => {
      coin.collect();
      this.game.collectedCoins += 1;
      this.game.playSound("COIN");
    });
  }

  /**
   * Resolves player collisions with bottle collectibles.
   */
  checkBottleCollisions() {
    this.checkCollectibleCollisions(this.game.bottles, (bottle) => {
      bottle.collect();
      this.game.collectedBottles += 1;
      this.game.playSound("BOTTLE_COLLECT");
    });
  }

  /**
   * Checks all collectible collisions against the player.
   * @param {Array<{isCollected:boolean,getBounds:() => {x:number,y:number,width:number,height:number}}>} items - Collectibles to test.
   * @param {(item: any) => void} onCollect - Callback invoked when an item is collected.
   */
  checkCollectibleCollisions(items, onCollect) {
    const playerBounds = this.game.player.getBounds();
    items.forEach((item) => {
      if (item.isCollected) return;
      if (!this.areRectsOverlapping(playerBounds, item.getBounds())) return;
      onCollect(item);
    });
  }

  /**
   * Resolves thrown bottle collisions against enemies and endboss.
   */
  checkThrowableEnemyCollisions() {
    this.game.throwables.forEach((throwable) =>
      this.handleThrowableEnemyCollision(throwable),
    );
  }

  /**
   * Handles collisions for one thrown bottle.
   * @param {ThrowableBottle} throwable - Active thrown bottle.
   */
  handleThrowableEnemyCollision(throwable) {
    if (throwable.isFinished) return;
    if (this.tryHitBossWithThrowable(throwable)) return;
    this.tryHitEnemyWithThrowable(throwable);
  }

  /**
   * Tries to apply thrown-bottle damage to the boss.
   * @param {ThrowableBottle} throwable - Active thrown bottle.
   * @returns {boolean} True when the boss was hit.
   */
  tryHitBossWithThrowable(throwable) {
    if (!this.shouldCheckBossCollision()) return false;

    const hitsBoss = this.areRectsOverlapping(
      throwable.getBounds(),
      this.game.endboss.getBounds(),
    );
    if (!hitsBoss) return false;

    this.applyThrowableHitToBoss(throwable);
    return true;
  }

  /**
   * Applies thrown-bottle damage to the boss.
   * @param {ThrowableBottle} throwable - Active thrown bottle.
   */
  applyThrowableHitToBoss(throwable) {
    this.game.endboss.takeHit(COMBAT.BOTTLE_DAMAGE);
    this.game.endboss.applyKnockback(throwable.x, this.game.world.width);
    throwable.isFinished = true;
    this.game.playSound("BOTTLE_BREAK");
  }

  /**
   * Tries to apply thrown-bottle damage to a regular enemy.
   * @param {ThrowableBottle} throwable - Active thrown bottle.
   */
  tryHitEnemyWithThrowable(throwable) {
    const bottleBounds = throwable.getBounds();
    this.game.enemies.forEach((enemy) => {
      if (!this.canThrowableHitEnemy(enemy)) return;
      if (!this.areRectsOverlapping(bottleBounds, enemy.getBounds())) return;

      enemy.kill();
      throwable.isFinished = true;
      this.game.playSound("BOTTLE_BREAK");
    });
  }

  /**
   * Checks whether a thrown bottle can hit the given enemy.
   * @param {Enemy} enemy - Enemy to inspect.
   * @returns {boolean}
   */
  canThrowableHitEnemy(enemy) {
    return !enemy.isDead && enemy.enemyType === "normal";
  }
}
