// game.js

// ---------------------
// Global Variables and Default Settings
// ---------------------
const WINDOW_TITLE = "Dungeon Machine Collector";

// Game settings – these could be modified using your own in-game settings menu and then saved to localStorage.
let settings = {
  TARGET_WIDTH: 60,
  CURSOR_WIDTH: 4,
  CURSOR_SPEED: 600,
  MOVE_DELAY: 100,
  ELEVATOR_SIZE: 6,
  ELEVATOR_COUNTDOWN_TIME: 30,
  FLOORS_PER_ADD: 7,
  BASE_ROOM_COUNT: 8,
  BASE_MACHINE_COUNT: 4,
  EXTRA_AMOUNT: 1
};

// Player data (default values)
let playerData = {
  currency: 0,
  owned_skins: ["default"],
  equipped_skin: "default",
  owned_cosmetics: [],
  equipped_cosmetic: []   // Array to allow up to 2 cosmetics
};

// Try to load player data from localStorage
function loadPlayerData() {
  let data = localStorage.getItem("playerData");
  if (data) {
    try {
      playerData = JSON.parse(data);
    } catch(e) {
      console.error("Error parsing player data:", e);
    }
  }
}

// Save player data to localStorage
function savePlayerData() {
  localStorage.setItem("playerData", JSON.stringify(playerData));
}

// ---------------------
// Basic Game Variables
// ---------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let lastTime = 0;
let keysDown = {};

// ---------------------
// Input Handling
// ---------------------
window.addEventListener("keydown", function (e) {
  keysDown[e.key] = true;
});

window.addEventListener("keyup", function (e) {
  delete keysDown[e.key];
});

// ---------------------
// Game State and Objects
// ---------------------

// Create a simple player object with position
let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  speed: settings.CURSOR_SPEED / 100, // For movement calculations (adjust as needed)
  width: 20,
  height: 20
};

// For demonstration, a dummy function that updates the player
function updatePlayer(dt) {
  // Basic movement: arrow keys or WASD
  if ("ArrowUp" in keysDown || "w" in keysDown) {
    player.y -= player.speed * dt;
  }
  if ("ArrowDown" in keysDown || "s" in keysDown) {
    player.y += player.speed * dt;
  }
  if ("ArrowLeft" in keysDown || "a" in keysDown) {
    player.x -= player.speed * dt;
  }
  if ("ArrowRight" in keysDown || "d" in keysDown) {
    player.x += player.speed * dt;
  }
  // Add boundaries so the player doesn't leave the canvas
  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));
}

// ---------------------
// Rendering Functions
// ---------------------
function render() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Render a simple background or dungeon tiles here (placeholder)
  // ...
  
  // Render the player
  ctx.fillStyle = getSkinColor(playerData.equipped_skin);
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.width / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Render cosmetics on the player's head:
  // The ring is drawn around the player. (Already handled below if equipped)
  if (playerData.equipped_cosmetic.includes("ring")) {
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.width / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Render tophat on top of the player's head if equipped.
  if (playerData.equipped_cosmetic.includes("tophat")) {
    const hatWidth = player.width * 1.5;
    const hatHeight = player.width * 0.8;
    const hatX = player.x - hatWidth / 2;
    const hatY = player.y - player.width / 2 - hatHeight;
    ctx.fillStyle = "#000";
    ctx.fillRect(hatX, hatY, hatWidth, hatHeight);
    // Draw a brim
    const brimWidth = hatWidth * 1.2;
    const brimHeight = 4;
    const brimX = player.x - brimWidth / 2;
    const brimY = hatY + hatHeight - 2;
    ctx.fillRect(brimX, brimY, brimWidth, brimHeight);
  }
}

// A helper to return a color for a given skin name.
function getSkinColor(skin) {
  if (skin === "green") return GREEN;
  if (skin === "red") return RED;
  if (skin === "blue") return BLUE;
  return PLAYER_COLOR;
}

// Colors used in JS (using same values as in your Python code)
const PLAYER_COLOR = "#000000";
const GREEN = "#00FF00";
const RED = "#FF0000";
const BLUE = "#0000FF";
const GOLD = "#D4AF37";

// ---------------------
// Main Game Loop
// ---------------------
function mainLoop(timestamp) {
  let dt = (timestamp - lastTime) / 1000; // Delta time in seconds
  lastTime = timestamp;
  
  updatePlayer(dt);
  render();
  
  requestAnimationFrame(mainLoop);
}

// ---------------------
// Initialize and Start Game
// ---------------------
loadPlayerData();
savePlayerData();  // Save defaults if necessary
requestAnimationFrame(mainLoop);
