const startButton = document.getElementById("startButton");
const infoButton = document.getElementById("infoButton");
const infoModal = document.getElementById("infoModal");
const closeModalButton = document.getElementById("closeModalButton");
const landingPage = document.querySelector(".landing-page");
const gameScreen = document.getElementById("gameScreen");
const backButton = document.getElementById("backButton");
const restartButton = document.getElementById("restartButton");
const gameCanvas = document.getElementById("gameCanvas");

let game = null;
let isGameScreenActive = false;

const keys = { ...DEFAULT_KEYS };

function setScreen(mode) {
  const isHome = mode === SCREEN.HOME;

  landingPage.classList.toggle("hidden", !isHome);
  gameScreen.classList.toggle("hidden", isHome);

  landingPage.style.display = isHome ? "grid" : "none";
  gameScreen.style.display = isHome ? "none" : "grid";
}

init();

function init() {
  bindUiEvents();
  bindKeyboardEvents();
}

function bindUiEvents() {
  startButton.addEventListener("click", handleStartClick);
  infoButton.addEventListener("click", openInfoModal);
  closeModalButton.addEventListener("click", closeInfoModal);
  infoModal.addEventListener("click", closeModalOnBackdrop);
  backButton.addEventListener("click", showHomeScreen);
  restartButton.addEventListener("click", handleRestartClick);
}

function bindKeyboardEvents() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(event) {
  if (event.code in keys) {
    keys[event.code] = true;
  }
}

function handleKeyUp(event) {
  if (event.code in keys) {
    keys[event.code] = false;
  }
}

function handleStartClick() {
  isGameScreenActive = true;
  restartButton.textContent = "Restart";
  restartButton.classList.add("button-hidden");
  setScreen(SCREEN.GAME);
  if (!game) {
    game = new Game(gameCanvas, keys, handleGameOver);
  }
  game.start();
}

function openInfoModal() {
  infoModal.classList.remove("hidden");
  infoModal.setAttribute("aria-hidden", "false");
}

function closeInfoModal() {
  infoModal.classList.add("hidden");
  infoModal.setAttribute("aria-hidden", "true");
}

function closeModalOnBackdrop(event) {
  if (event.target === infoModal) {
    closeInfoModal();
  }
}

function showHomeScreen() {
  isGameScreenActive = false;
  if (game) {
    game.stop();
    game = null;
  }
  restartButton.classList.add("button-hidden");
  setScreen(SCREEN.HOME);
  console.log("show home screnn ++");
}

function handleRestartClick() {
  if (game) {
    game.stop();
    game = null;
  }

  game = new Game(gameCanvas, keys, handleGameOver);
  game.start();
  restartButton.textContent = "Restart";
  restartButton.classList.add("button-hidden");
}

function handleGameOver(result) {
  game.stop();
  if (!isGameScreenActive) {
    return;
  }

  restartButton.textContent = result === "win" ? "Play Again" : "Try Again";
  restartButton.classList.remove("button-hidden");
}
