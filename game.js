// game.js

// ---------------------
// Global Variables and Default Settings
// ---------------------
const WINDOW_TITLE = "Idk";

// Default modifiable settings (can be adjusted via the code builder)
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

// Default player data
let playerData = {
  currency: 0,
  owned_skins: ["default"],
  equipped_skin: "default",
  owned_cosmetics: [],
  equipped_cosmetic: [] // Up to 2 cosmetics may be equipped
};

// Game state can be: "main-menu", "code-builder", "shop", "skins", "in-game"
let gameState = "main-menu";

// ---------------------
// Local Storage Functions
// ---------------------
function loadPlayerData() {
  const data = localStorage.getItem("playerData");
  if (data) {
    try {
      playerData = JSON.parse(data);
      // Ensure equipped_cosmetic is an array.
      if (!Array.isArray(playerData.equipped_cosmetic)) {
        playerData.equipped_cosmetic = [playerData.equipped_cosmetic];
      }
    } catch (e) {
      console.error("Error parsing playerData:", e);
    }
  }
}

function savePlayerData() {
  localStorage.setItem("playerData", JSON.stringify(playerData));
}

function loadSettings() {
  const data = localStorage.getItem("gameSettings");
  if (data) {
    try {
      settings = JSON.parse(data);
    } catch (e) {
      console.error("Error parsing settings:", e);
    }
  }
}

function saveSettings() {
  localStorage.setItem("gameSettings", JSON.stringify(settings));
}

// ---------------------
// Canvas Setup
// ---------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------------------
// Input Handling
// ---------------------
let keysDown = {};

window.addEventListener("keydown", (e) => {
  keysDown[e.key] = true;
});

window.addEventListener("keyup", (e) => {
  delete keysDown[e.key];
});

// ---------------------
// Utility Functions
// ---------------------
function getSkinColor(skin) {
  if (skin === "green") return "#00FF00";
  if (skin === "red") return "#FF0000";
  if (skin === "blue") return "#0000FF";
  return "#000000";
}

// ---------------------
// State Manager & Menu Functions
// ---------------------
function setState(newState) {
  gameState = newState;
  lastTime = performance.now();
}

// Main Menu – rendered on the canvas.
function renderMainMenu() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "30px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(WINDOW_TITLE, canvas.width / 2, 80);
  
  const options = ["Start Game", "Code Builder", "Import Settings", "Shop", "Skins"];
  ctx.font = "24px sans-serif";
  options.forEach((option, i) => {
    let y = 150 + i * 50;
    ctx.fillStyle = "#444";
    ctx.fillRect(canvas.width / 2 - 100, y - 30, 200, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText(option, canvas.width / 2, y);
  });
}

// Check if mouse click is inside a rectangle
function isInside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// ---------------------
// Code Builder Screen
// ---------------------
function renderCodeBuilder() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Edit Settings & Click SAVE", canvas.width / 2, 40);
  
  // We'll list all modifiable settings as text inputs.
  // (Since HTML inputs are not available on canvas directly, we simulate them.)
  let startY = 100;
  let gap = 40;
  Object.keys(settings).forEach((key, index) => {
    let y = startY + index * gap;
    ctx.textAlign = "left";
    ctx.fillText(`${key}:`, canvas.width / 2 - 150, y);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(canvas.width / 2 - 50, y - 20, 100, 30);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(String(settings[key]), canvas.width / 2, y);
  });
  
  // Render a SAVE button
  ctx.fillStyle = "#0a0";
  let btnX = canvas.width / 2 - 50;
  let btnY = startY + Object.keys(settings).length * gap + 20;
  ctx.fillRect(btnX, btnY, 100, 40);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText("SAVE", canvas.width / 2, btnY + 28);
}

// Code Builder: click handling for updating settings
function handleCodeBuilderClick(x, y) {
  // We'll use simple detection:
  let startY = 100;
  let gap = 40;
  let inputRects = {};
  Object.keys(settings).forEach((key) => {
    inputRects[key] = { x: canvas.width / 2 - 50, y: startY, w: 100, h: 30 };
    startY += gap;
  });
  // Check if the click is inside the save button.
  let btnRect = { x: canvas.width / 2 - 50, y: startY + 20, w: 100, h: 40 };
  if (isInside(x, y, btnRect)) {
    // For this demo, we simply save current settings (they remain unchanged).
    saveSettings();
    setState("main-menu");
  }
  // (For a full implementation, you would add a mechanism to let you type values.)
}

// ---------------------
// Shop Screen
// ---------------------
const availableSkins = [
  { name: "green", cost: 100 },
  { name: "red", cost: 100 },
  { name: "blue", cost: 100 }
];
const availableCosmetics = [
  { name: "ring", cost: 100 },
  { name: "wrench", cost: 300 },
  { name: "tophat", cost: 300 }
];

function renderShop() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Shop", canvas.width / 2, 40);
  
  ctx.font = "20px sans-serif";
  ctx.fillText(`Money: $${playerData.currency}`, canvas.width / 2, 70);
  
  // Render skins and cosmetics in two columns
  let startY = 100;
  let gap = 150;
  // Skins column
  ctx.fillText("Skins", canvas.width / 4, startY);
  let skinY = startY + 30;
  availableSkins.forEach((item, i) => {
    // Only show if not owned already.
    if (!playerData.owned_skins.includes(item.name)) {
      ctx.fillStyle = "#444";
      ctx.fillRect(canvas.width / 4 - 75, skinY, 150, 50);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${item.name} ($${item.cost})`, canvas.width / 4, skinY + 32);
      skinY += gap;
    }
  });
  // Cosmetics column
  ctx.fillText("Cosmetics", canvas.width * 3 / 4, startY);
  let cosY = startY + 30;
  availableCosmetics.forEach((item, i) => {
    if (!playerData.owned_cosmetics.includes(item.name)) {
      ctx.fillStyle = "#444";
      ctx.fillRect(canvas.width * 3 / 4 - 75, cosY, 150, 50);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${item.name} ($${item.cost})`, canvas.width * 3 / 4, cosY + 32);
      cosY += gap;
    }
  });
  
  // Render Return button
  ctx.fillStyle = "#a00";
  ctx.fillRect(canvas.width - 120, canvas.height - 60, 100, 40);
  ctx.fillStyle = "#fff";
  ctx.fillText("Return", canvas.width - 70, canvas.height - 30);
}

function handleShopClick(x, y) {
  // Check if Return button
  let returnRect = { x: canvas.width - 120, y: canvas.height - 60, w: 100, h: 40 };
  if (isInside(x, y, returnRect)) {
    setState("main-menu");
    return;
  }
  // Check skins column (left quarter)
  let rectX = canvas.width / 4 - 75;
  let rectY = 100 + 30;
  let gap = 150;
  availableSkins.forEach((item) => {
    if (!playerData.owned_skins.includes(item.name)) {
      let r = { x: rectX, y: rectY, w: 150, h: 50 };
      if (isInside(x, y, r)) {
        if (playerData.currency >= item.cost) {
          playerData.currency -= item.cost;
          playerData.owned_skins.push(item.name);
          savePlayerData();
        }
      }
      rectY += gap;
    }
  });
  // Check cosmetics column (right quarter)
  rectX = canvas.width * 3 / 4 - 75;
  rectY = 100 + 30;
  availableCosmetics.forEach((item) => {
    if (!playerData.owned_cosmetics.includes(item.name)) {
      let r = { x: rectX, y: rectY, w: 150, h: 50 };
      if (isInside(x, y, r)) {
        if (playerData.currency >= item.cost) {
          playerData.currency -= item.cost;
          playerData.owned_cosmetics.push(item.name);
          savePlayerData();
        }
      }
      rectY += gap;
    }
  });
}

// ---------------------
// Skins & Cosmetics Screen
// ---------------------
function renderSkinsCosmetics() {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Inventory", canvas.width / 2, 40);
  
  // Render equipped skin and cosmetics information
  ctx.font = "20px sans-serif";
  ctx.fillText(`Equipped Skin: ${playerData.equipped_skin}`, canvas.width / 2, 70);
  ctx.fillText(`Equipped Cosmetics: ${playerData.equipped_cosmetic.join(", ")}`, canvas.width / 2, 100);
  
  ctx.fillText("Click an item to toggle equip/unequip", canvas.width / 2, 130);
  
  // Render list (we simply show all owned skins and cosmetics below)
  let allItems = {
    skins: playerData.owned_skins,
    cosmetics: playerData.owned_cosmetics
  };
  let startY = 150;
  let gap = 50;
  Object.keys(allItems).forEach((category) => {
    ctx.fillStyle = "#aaa";
    ctx.fillText(category.toUpperCase(), canvas.width / 2, startY);
    startY += 30;
    allItems[category].forEach((item) => {
      ctx.fillStyle = "#444";
      ctx.fillRect(canvas.width / 2 - 100, startY, 200, 40);
      ctx.fillStyle = "#fff";
      ctx.fillText(item, canvas.width / 2, startY + 27);
      startY += gap;
    });
    startY += 20;
  });
  
  // Render Return button
  ctx.fillStyle = "#a00";
  ctx.fillRect(canvas.width - 120, canvas.height - 60, 100, 40);
  ctx.fillStyle = "#fff";
  ctx.fillText("Return", canvas.width - 70, canvas.height - 30);
}

function handleSkinsCosmeticsClick(x, y) {
  // For simplicity, clicking Return returns to main menu.
  let returnRect = { x: canvas.width - 120, y: canvas.height - 60, w: 100, h: 40 };
  if (isInside(x, y, returnRect)) {
    setState("main-menu");
  }
}

// ---------------------
// In-Game (Dungeon) Implementation
// ---------------------

// For our simplified version, we simulate a grid dungeon.
let dungeon = {
  cols: 60,
  rows: 40,
  tileSize: BASE_TILE_SIZE,
  grid: []
};

function generateDungeon() {
  dungeon.grid = [];
  for (let j = 0; j < dungeon.rows; j++) {
    let row = [];
    for (let i = 0; i < dungeon.cols; i++) {
      // For simplicity, let 0 be wall and 1 be floor.
      row.push(Math.random() < 0.2 ? 0 : 1);
    }
    dungeon.grid.push(row);
  }
}

function drawDungeon() {
  for (let j = 0; j < dungeon.rows; j++) {
    for (let i = 0; i < dungeon.cols; i++) {
      if (dungeon.grid[j][i] === 1) {
        ctx.fillStyle = "#555";
      } else {
        ctx.fillStyle = "#222";
      }
      ctx.fillRect(i * dungeon.tileSize, j * dungeon.tileSize, dungeon.tileSize, dungeon.tileSize);
    }
  }
}

// Simple player for in-game state
let gamePlayer = {
  x: 5,
  y: 5,
  width: 20,
  height: 20
};

let floor = 1;
let elevatorCountdown = 0;
let floorCompleted = false;
let skillCheckActive = false;
let skillCheck = {
  cursorPos: 0,
  targetX: 0,
  success: false
};

// A simple update for the in-game state.
function updateGame(dt) {
  // Move player with arrow keys (for demonstration)
  if ("ArrowUp" in keysDown || "w" in keysDown) gamePlayer.y -= 100 * dt;
  if ("ArrowDown" in keysDown || "s" in keysDown) gamePlayer.y += 100 * dt;
  if ("ArrowLeft" in keysDown || "a" in keysDown) gamePlayer.x -= 100 * dt;
  if ("ArrowRight" in keysDown || "d" in keysDown) gamePlayer.x += 100 * dt;
  
  // Boundaries
  gamePlayer.x = Math.max(0, Math.min(canvas.width, gamePlayer.x));
  gamePlayer.y = Math.max(0, Math.min(canvas.height, gamePlayer.y));
  
  // For demonstration, if player reaches right edge, consider floor completed.
  if (gamePlayer.x > canvas.width - 50 && !floorCompleted) {
    floorCompleted = true;
    // Reward: $8 base or $12 if ring equipped.
    let reward = 8;
    if (playerData.equipped_cosmetic.includes("ring")) reward = 12;
    playerData.currency += reward;
    savePlayerData();
    // Start elevator countdown (for demonstration, 5 seconds)
    elevatorCountdown = 5;
  }
  
  if (elevatorCountdown > 0) {
    elevatorCountdown -= dt;
    if (elevatorCountdown <= 0) {
      floor++;
      floorCompleted = false;
      // Regenerate dungeon and reposition player
      generateDungeon();
      gamePlayer.x = 5;
      gamePlayer.y = 5;
    }
  }
}

function renderGame() {
  // Clear canvas.
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw dungeon
  drawDungeon();
  
  // Draw player.
  ctx.fillStyle = getSkinColor(playerData.equipped_skin);
  ctx.beginPath();
  ctx.arc(gamePlayer.x, gamePlayer.y, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw cosmetics on player.
  if (playerData.equipped_cosmetic.includes("ring")) {
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(gamePlayer.x, gamePlayer.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (playerData.equipped_cosmetic.includes("tophat")) {
    const hatWidth = 15;
    const hatHeight = 8;
    const hatX = gamePlayer.x - hatWidth / 2;
    const hatY = gamePlayer.y - 10 - hatHeight;
    ctx.fillStyle = "#000";
    ctx.fillRect(hatX, hatY, hatWidth, hatHeight);
    const brimWidth = hatWidth * 1.2;
    const brimX = gamePlayer.x - brimWidth / 2;
    const brimY = hatY + hatHeight - 2;
    ctx.fillRect(brimX, brimY, brimWidth, 3);
  }
  
  // Draw floor number and currency
  ctx.fillStyle = "#fff";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Floor: ${floor}`, 10, 20);
  ctx.fillText(`Money: $${playerData.currency}`, 10, 40);
  
  // Draw elevator countdown if active.
  if (elevatorCountdown > 0) {
    ctx.textAlign = "center";
    ctx.fillText(`Elevator leaves in ${Math.ceil(elevatorCountdown)}s`, canvas.width / 2, 20);
  }
}

// ---------------------
// State Manager – handle mouse clicks for different states
// ---------------------
canvas.addEventListener("click", function(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  if (gameState === "main-menu") {
    // Detect which option by dividing the menu area.
    let options = ["Start Game", "Code Builder", "Import Settings", "Shop", "Skins"];
    options.forEach((option, i) => {
      let y = 150 + i * 50;
      let btnRect = { x: canvas.width / 2 - 100, y: y - 30, w: 200, h: 40 };
      if (isInside(mouseX, mouseY, btnRect)) {
        // Change state accordingly.
        if (option === "Start Game") {
          // Initialize in-game state.
          generateDungeon();
          gamePlayer.x = canvas.width / 2;
          gamePlayer.y = canvas.height / 2;
          floor = 1;
          elevatorCountdown = 0;
          floorCompleted = false;
          setState("in-game");
        } else if (option === "Code Builder") {
          setState("code-builder");
        } else if (option === "Import Settings") {
          // For simplicity, prompt for settings JSON string.
          let s = prompt("Paste settings JSON:");
          if (s) {
            try {
              let newSettings = JSON.parse(s);
              settings = Object.assign(settings, newSettings);
              saveSettings();
            } catch (e) {
              alert("Invalid JSON");
            }
          }
          setState("main-menu");
        } else if (option === "Shop") {
          setState("shop");
        } else if (option === "Skins") {
          setState("skins");
        }
      }
    });
  } else if (gameState === "code-builder") {
    handleCodeBuilderClick(mouseX, mouseY);
  } else if (gameState === "shop") {
    handleShopClick(mouseX, mouseY);
  } else if (gameState === "skins") {
    handleSkinsCosmeticsClick(mouseX, mouseY);
  }
});

// Helper for detecting if a point is in a rectangle.
function isInside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// ---------------------
// Main Loop and State Manager
// ---------------------
let lastTime = performance.now();

function update(dt) {
  if (gameState === "in-game") {
    updateGame(dt);
  }
  // (Other states are static or use mouse clicks, so no per-frame update needed.)
}

function render() {
  if (gameState === "main-menu") {
    renderMainMenu();
  } else if (gameState === "code-builder") {
    renderCodeBuilder();
  } else if (gameState === "shop") {
    renderShop();
  } else if (gameState === "skins") {
    renderSkinsCosmetics();
  } else if (gameState === "in-game") {
    renderGame();
  }
}

function loop(timestamp) {
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

// ---------------------
// Start the Game
// ---------------------
loadPlayerData();
loadSettings();
savePlayerData();
saveSettings();
requestAnimationFrame(loop);
