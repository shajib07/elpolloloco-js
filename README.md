# El Pollo Loco - Jump and Run Game

A browser-based 2D jump-and-run game built with vanilla JavaScript and HTML5 Canvas, following an object-oriented architecture and clean-code checklist standards.

## Project Overview

This project recreates a classic "El Pollo Loco" style experience:

- Landing page with game entry and instructions modal
- Side-scrolling world with camera follow
- Playable character with movement, jump, throw, hit and health logic
- Multiple enemy types plus an endboss fight
- Collectibles (coins and bottles) with live HUD status bars
- Win/Lose end screens with in-game restart (no page reload)
- Sound effects with mute toggle and persistent mute state (`localStorage`)
- Impressum page and favicon

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6 classes)
- HTML Canvas API
- Browser audio (`Audio`)

## Controls

- `ArrowLeft` / `ArrowRight`: Move
- `Space`: Jump
- `D`: Throw bottle
- UI buttons:
  - `Start Game`
  - `How to Play`
  - `Back to Home`
  - `Restart`
  - `Sound: On/Off`

## Architecture

The game is organized into focused modules:

- `classes/base/`
  - `DrawableObject`, `MovableObject`, `Enemy`
- `classes/helpers/`
  - `ImageManager`, `SpriteAnimation`
- `classes/systems/`
  - `CollisionSystem`, `AudioManager`
- `classes/ui/`
  - `HUD`
- `classes/`
  - `Player`, `Chicken`, `ChickenNormal`, `Endboss`, `Bottle`, `Coin`, `ThrowableBottle`, `World`, `Game`
- `constants/`
  - World, combat, input, screen, image path, audio path, animation constants
- entry files:
  - `index.html`, `style.css`, `script.js`

## Run Locally

Because assets are loaded from relative paths, run with a local web server (recommended), for example:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000`

## Deploy with FileZilla

Upload the full project contents to your web root:

- `index.html`
- `impressum.html`
- `style.css`
- `script.js`
- `classes/`
- `constants/`
- `assets/`

Notes:

- Keep relative folder structure unchanged.
- `.gitignore` may be uploaded, but it is optional and has no runtime effect.
- Do not upload `.git/`, `node_modules/`, or OS/editor junk files.

