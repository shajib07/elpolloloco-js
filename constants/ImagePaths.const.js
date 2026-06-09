const IMAGE_PATHS = Object.freeze({
  PLAYER: {
    IDLE: [
      ...Array.from({ length: 10 }, (_, index) =>
        `assets/img/character/1_idle/idle/I-${index + 1}.png`,
      ),
      ...Array.from({ length: 10 }, (_, index) =>
        `assets/img/character/1_idle/long_idle/I-${index + 11}.png`,
      ),
    ],
    WALK: Array.from({ length: 6 }, (_, index) =>
      `assets/img/character/2_walk/W-${index + 21}.png`,
    ),
    JUMP: Array.from({ length: 9 }, (_, index) =>
      `assets/img/character/3_jump/J-${index + 31}.png`,
    ),
    HURT: Array.from({ length: 3 }, (_, index) =>
      `assets/img/character/4_hurt/H-${index + 41}.png`,
    ),
    DEAD: Array.from({ length: 7 }, (_, index) =>
      `assets/img/character/5_dead/D-${index + 51}.png`,
    ),
  },
  ENEMIES: {
    CHICKEN_NORMAL_WALK: [
      "assets/img/enemies/chicken-normal-walk-1.png",
      "assets/img/enemies/chicken-normal-walk-2.png",
      "assets/img/enemies/chicken-normal-walk-3.png",
    ],
    CHICKEN_WALK: [
      "assets/img/enemies/chicken-walk-1.png",
      "assets/img/enemies/chicken-walk-2.png",
      "assets/img/enemies/chicken-walk-3.png",
    ],
    CHICKEN_DEAD: "assets/img/enemies/chicken-dead.png",
    CHICKEN_NORMAL_DEAD: "assets/img/enemies/chicken-normal-dead.png",
    BOSS: {
      WALK: [
        "assets/img/boss/1_walk/G1.png",
        "assets/img/boss/1_walk/G2.png",
        "assets/img/boss/1_walk/G3.png",
        "assets/img/boss/1_walk/G4.png",
      ],
      ALERT: [
        "assets/img/boss/2_alert/G5.png",
        "assets/img/boss/2_alert/G6.png",
        "assets/img/boss/2_alert/G7.png",
        "assets/img/boss/2_alert/G8.png",
        "assets/img/boss/2_alert/G9.png",
        "assets/img/boss/2_alert/G10.png",
        "assets/img/boss/2_alert/G11.png",
        "assets/img/boss/2_alert/G12.png",
      ],
      ATTACK: [
        "assets/img/boss/3_attack/G13.png",
        "assets/img/boss/3_attack/G14.png",
        "assets/img/boss/3_attack/G15.png",
        "assets/img/boss/3_attack/G16.png",
        "assets/img/boss/3_attack/G17.png",
        "assets/img/boss/3_attack/G18.png",
        "assets/img/boss/3_attack/G19.png",
        "assets/img/boss/3_attack/G20.png",
      ],
      HURT: [
        "assets/img/boss/4_hurt/G21.png",
        "assets/img/boss/4_hurt/G22.png",
        "assets/img/boss/4_hurt/G23.png",
      ],
      DEAD: [
        "assets/img/boss/5_dead/G24.png",
        "assets/img/boss/5_dead/G25.png",
        "assets/img/boss/5_dead/G26.png",
      ],
    },
  },

  ITEMS: {
    COIN: "assets/img/coins/coin-1.png",
    BOTTLE_GROUND: "assets/img/bottles/bottle-ground-1.png",
    BOTTLE_THROW: "assets/img/bottles/throw-1.png",
  },

  WORLD: {
    BACKGROUND: "assets/img/background/desert.png",
    CLOUDS: "assets/img/background/clouds.png",
  },

  SCREENS: {
    WIN: "assets/img/screens/you-win.png",
    LOSE: "assets/img/screens/you-lost.png",
  },
});
