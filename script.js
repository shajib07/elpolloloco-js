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
const orientationHint = document.getElementById("orientationHint");
const touchControlButtons = Array.from(
  document.querySelectorAll("[data-control-key]"),
);
const portraitHintQuery = window.matchMedia(
  "(max-width: 1100px) and (orientation: portrait)",
);

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
}

init();

/**
 * Initializes UI state and input bindings.
 */
function init() {
  setScreen(SCREEN.HOME);
  bindUiEvents();
  bindKeyboardEvents();
  bindTouchEvents();
  bindResponsiveEvents();
  updateOrientationHintState();
  updateMuteButtonLabel();
}

/**
 * Registers the UI button handlers.
 */
function bindUiEvents() {
  startButton.addEventListener("click", handleStartClick);
  infoButton.addEventListener("click", openInfoModal);
  closeModalButton.addEventListener("click", closeInfoModal);
  infoModal.addEventListener("click", closeModalOnBackdrop);
  backButton.addEventListener("click", showHomeScreen);
  muteButton.addEventListener("click", handleMuteToggle);
  restartButton.addEventListener("click", handleRestartClick);
}

/**
 * Registers the keyboard handlers used by the game.
 */
function bindKeyboardEvents() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
}

/**
 * Registers the mobile touch button handlers.
 */
function bindTouchEvents() {
  touchControlButtons.forEach((button) => {
    button.addEventListener("pointerdown", handleTouchControlDown);
    button.addEventListener("pointerup", handleTouchControlEnd);
    button.addEventListener("pointercancel", handleTouchControlEnd);
    button.addEventListener("lostpointercapture", handleTouchControlEnd);
    button.addEventListener("contextmenu", preventTouchContextMenu);
  });
}

/**
 * Registers viewport listeners for the rotation hint.
 */
function bindResponsiveEvents() {
  window.addEventListener("resize", updateOrientationHintState);
  window.addEventListener("orientationchange", updateOrientationHintState);

  if (typeof portraitHintQuery.addEventListener === "function") {
    portraitHintQuery.addEventListener("change", updateOrientationHintState);
  } else {
    portraitHintQuery.addListener(updateOrientationHintState);
  }
}

/**
 * Tracks pressed keys and suppresses browser scrolling for game controls.
 * @param {KeyboardEvent} event - Native keyboard event.
 */
function handleKeyDown(event) {
  if (event.code in keys) {
    event.preventDefault();
    keys[event.code] = true;
  }
}

/**
 * Releases pressed keys when the user lifts a control key.
 * @param {KeyboardEvent} event - Native keyboard event.
 */
function handleKeyUp(event) {
  if (event.code in keys) {
    event.preventDefault();
    keys[event.code] = false;
  }
}

/**
 * Starts a new game session and switches to the game screen.
 */
function handleStartClick() {
  releaseAllControls();
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

/**
 * Opens the how-to-play dialog.
 */
function openInfoModal() {
  infoModal.classList.remove("hidden");
  infoModal.setAttribute("aria-hidden", "false");
}

/**
 * Closes the how-to-play dialog.
 */
function closeInfoModal() {
  infoModal.classList.add("hidden");
  infoModal.setAttribute("aria-hidden", "true");
}

/**
 * Closes the modal when the user clicks the backdrop area.
 * @param {MouseEvent} event - Native mouse event.
 */
function closeModalOnBackdrop(event) {
  if (event.target === infoModal) {
    closeInfoModal();
  }
}

/**
 * Returns from game screen to landing page and resets runtime instance.
 */
function showHomeScreen() {
  releaseAllControls();
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
  releaseAllControls();
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
  releaseAllControls();
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
 * Updates the accessibility state of the rotation hint.
 */
function updateOrientationHintState() {
  if (!orientationHint) {
    return;
  }

  const shouldShowHint = portraitHintQuery.matches;
  orientationHint.setAttribute("aria-hidden", String(!shouldShowHint));
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

/**
 * Updates a control state entry in the shared input map.
 * @param {keyof typeof DEFAULT_KEYS} controlKey - Input key to change.
 * @param {boolean} pressed - Whether the control is currently active.
 */
function setControlState(controlKey, pressed) {
  if (!(controlKey in keys)) {
    return;
  }

  keys[controlKey] = pressed;
}

/**
 * Releases every keyboard and touch control in the shared input map.
 */
function releaseAllControls() {
  Object.keys(keys).forEach((key) => {
    keys[key] = false;
  });
}

/**
 * Activates a mobile control when the user presses a touch button.
 * @param {PointerEvent} event - Native pointer event.
 */
function handleTouchControlDown(event) {
  const button = event.currentTarget;
  const controlKey = button?.dataset.controlKey;

  if (!controlKey) {
    return;
  }

  event.preventDefault();
  setControlState(controlKey, true);

  if (typeof button.setPointerCapture !== "function") {
    return;
  }

  try {
    button.setPointerCapture(event.pointerId);
  } catch {
    // Ignore capture failures and keep the button responsive.
  }
}

/**
 * Releases a mobile control when the touch interaction ends.
 * @param {PointerEvent} event - Native pointer event.
 */
function handleTouchControlEnd(event) {
  const button = event.currentTarget;
  const controlKey = button?.dataset.controlKey;

  if (!controlKey) {
    return;
  }

  event.preventDefault();
  setControlState(controlKey, false);

  if (typeof button.releasePointerCapture !== "function") {
    return;
  }

  try {
    button.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore capture failures and keep the button responsive.
  }
}

/**
 * Prevents the long-press context menu on touch controls.
 * @param {MouseEvent} event - Native mouse event.
 */
function preventTouchContextMenu(event) {
  event.preventDefault();
}
