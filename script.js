const startButton = document.getElementById("startButton");
const infoButton = document.getElementById("infoButton");
const infoModal = document.getElementById("infoModal");
const closeModalButton = document.getElementById("closeModalButton");
const landingPage = document.querySelector(".landing-page");
const gameScreen = document.getElementById("gameScreen");
const backButton = document.getElementById("backButton");
const muteButton = document.getElementById("muteButton");
const restartButton = document.getElementById("restartButton");
const gameCanvas = document.getElementById("gameCanvas");

let game = null;
let isGameScreenActive = false;

const keys = { ...DEFAULT_KEYS };

/**
 * Switches between landing and game screens.
 * @param {string} mode - Target screen value from SCREEN constants.
 */
function setScreen(mode) {
  const isHome = mode === SCREEN.HOME;

  landingPage.classList.toggle("hidden", !isHome);
  gameScreen.classList.toggle("hidden", isHome);

  landingPage.style.display = isHome ? "grid" : "none";
  gameScreen.style.display = isHome ? "none" : "grid";
}

init();

/**
 * Initializes UI state and input bindings.
 */
function init() {
  setScreen(SCREEN.HOME);
  bindUiEvents();
  bindKeyboardEvents();
  updateMuteButtonLabel();
}

function bindUiEvents() {
  startButton.addEventListener("click", handleStartClick);
  infoButton.addEventListener("click", openInfoModal);
  closeModalButton.addEventListener("click", closeInfoModal);
  infoModal.addEventListener("click", closeModalOnBackdrop);
  backButton.addEventListener("click", showHomeScreen);
  muteButton.addEventListener("click", handleMuteToggle);
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

/**
 * Starts a new game session and switches to the game screen.
 */
function handleStartClick() {
  isGameScreenActive = true;
  restartButton.textContent = "Restart";
  restartButton.classList.add("button-hidden");
  setScreen(SCREEN.GAME);
  if (!game) {
    game = new Game(gameCanvas, keys, handleGameOver);
    window.currentGameInstance = game;
  }
  updateMuteButtonLabel();
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

/**
 * Returns from game screen to landing page and resets runtime instance.
 */
function showHomeScreen() {
  isGameScreenActive = false;
  if (game) {
    game.stop();
    game = null;
  }
  window.currentGameInstance = null;
  restartButton.classList.add("button-hidden");
  updateMuteButtonLabel();
  setScreen(SCREEN.HOME);
}

/**
 * Recreates game instance and starts a fresh run.
 */
function handleRestartClick() {
  if (game) {
    game.stop();
    game = null;
  }

  game = new Game(gameCanvas, keys, handleGameOver);
  window.currentGameInstance = game;
  updateMuteButtonLabel();
  game.start();
  restartButton.textContent = "Restart";
  restartButton.classList.add("button-hidden");
}

/**
 * Handles game-over callback and shows the restart action.
 * @param {"win"|"lose"} result - Final game result.
 */
function handleGameOver(result) {
  if (game) {
    game.stop();
  }
  if (!isGameScreenActive) {
    return;
  }

  restartButton.textContent = result === "win" ? "Play Again" : "Try Again";
  restartButton.classList.remove("button-hidden");
}

/**
 * Toggles mute state and updates button label.
 */
function handleMuteToggle() {
  if (game) {
    game.toggleMute();
    updateMuteButtonLabel();
    return;
  }

  const isMuted = localStorage.getItem("muted") === "true";
  localStorage.setItem("muted", String(!isMuted));
  updateMuteButtonLabel();
}

/**
 * Synchronizes mute button text with current mute state.
 */
function updateMuteButtonLabel() {
  const isMuted = game
    ? game.isMuted()
    : localStorage.getItem("muted") === "true";

  muteButton.textContent = isMuted ? "Sound: Off" : "Sound: On";
}
