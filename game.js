// --- GAME CONFIGURATION ---
const TILE_SIZE = 40;
const MAP_SIZE = 600; // 10x10 grid
const MOVEMENT_SPEED = 200; // ms per step

// --- STATE ---
let playerX = 0;
let playerY = 0;
let isMoving = false;
let inBattle = false;
let playerHP = 30;
let enemyHP = 20;
let maxEnemyHP = 20;

const playerEl = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const battleScreen = document.getElementById('battle-screen');
const msgBox = document.getElementById('message-box');

// --- MONSTER DATABASE ---
const MONSTERS = [
    { name: "Cereza", hp: 15, img: "./Cats/cereza.png" },
    { name: "Calcifer", hp: 15, img: "./Cats/calcifer.png" },
    { name: "Merlin", hp: 15, img: "./Cats/merlin.png" },
    { name: "Axis", hp: 15, img: "./Cats/axis.png" },
    { name: "ADNU Cat", hp: 15, img: "./Cats/adnucat.png" },
    { name: "USI Cat", hp: 15, img: "./Cats/usicat.png" },
    { name: "UNC Cat", hp: 15, img: "./Cats/unccat.png" },
];

// --- MAP GENERATION ---
// Let's place some "tall grass" (darker green tiles) where monsters live
const grassCoords = [];
for (let i = 0; i < 60; i++) {
    let x = Math.floor(Math.random() * 10) * TILE_SIZE;
    let y = Math.floor(Math.random() * 10) * TILE_SIZE;
    // Don't put grass on start tile
    if (x === 0 && y === 0) continue;

    grassCoords.push({ x, y });

    const grassEl = document.createElement('div');
    grassEl.classList.add('grass');
    grassEl.style.left = x + 'px';
    grassEl.style.top = y + 'px';
    gameContainer.appendChild(grassEl);
}

// --- MOVEMENT ---
document.addEventListener('keydown', (e) => {
    if (isMoving || inBattle) return;

    let nextX = playerX;
    let nextY = playerY;

    if (e.key === 'ArrowUp') nextY -= TILE_SIZE;
    else if (e.key === 'ArrowDown') nextY += TILE_SIZE;
    else if (e.key === 'ArrowLeft') nextX -= TILE_SIZE;
    else if (e.key === 'ArrowRight') nextX += TILE_SIZE;
    else return; // Not an arrow key

    // Boundary check
    if (nextX >= 0 && nextX < MAP_SIZE && nextY >= 0 && nextY < MAP_SIZE) {
        movePlayer(nextX, nextY);
    }
});

function movePlayer(x, y) {
    isMoving = true;
    playerX = x;
    playerY = y;
    playerEl.style.left = playerX + 'px';
    playerEl.style.top = playerY + 'px';

    setTimeout(() => {
        isMoving = false;
        checkEncounter();
    }, MOVEMENT_SPEED);
}

function checkEncounter() {
    // Check if we are standing on grass
    const onGrass = grassCoords.some(coord => coord.x === playerX && coord.y === playerY);

    if (onGrass) {
        // 30% chance of encounter
        if (Math.random() < 0.3) {
            startBattle();
        }
    }
}

// --- BATTLE SYSTEM ---
function startBattle() {
    inBattle = true;

    // 1. Pick a random index from 0 to the length of the list
    const randomIndex = Math.floor(Math.random() * MONSTERS.length);
    const monster = MONSTERS[randomIndex];

    // 2. Set the game state variables to match this monster
    enemyHP = monster.hp;
    maxEnemyHP = monster.hp; // We track max HP to show accurate health

    // 3. Update the Screen Text
    document.getElementById('enemy-name').innerText = monster.name;
    document.getElementById('enemy-hp').innerText = enemyHP + "/" + maxEnemyHP;

    // 4. Update the Enemy Image
    document.getElementById('enemy-img').src = monster.img;

    // Show the screen
    msgBox.innerText = "A wild " + monster.name + " appeared!";
    battleScreen.style.display = 'flex';
}

function endBattle(won) {
    setTimeout(() => {
        inBattle = false;
        battleScreen.style.display = 'none';
        if (!won) {
            // Reset position if lost (optional)
            alert("You fainted! Respawning...");
            playerHP = 30;
            playerX = 0;
            playerY = 0;
            playerEl.style.left = '0px';
            playerEl.style.top = '0px';
        }
    }, 1500);
}

function updateBattleUI() {
    // Show current HP out of Max HP (e.g., 15/20)
    document.getElementById('enemy-hp').innerText = Math.max(0, enemyHP) + "/" + maxEnemyHP;
    document.getElementById('player-hp').innerText = Math.max(0, playerHP);
}

// --- BATTLE ACTIONS ---
// Note: We attach these to window so the HTML onclick="" can find them
window.attack = function () {
    if (!inBattle) return;

    // Player turn
    const dmg = Math.floor(Math.random() * 6) + 2; // 2-7 damage
    enemyHP -= dmg;
    msgBox.innerText = `You hit for ${dmg} damage!`;
    updateBattleUI();

    if (enemyHP <= 0) {
        msgBox.innerText = "You won!";
        endBattle(true);
    } else {
        // Enemy turn delay
        setTimeout(enemyTurn, 1000);
    }
};

window.heal = function () {
    if (!inBattle) return;

    const healAmt = 10;
    playerHP += healAmt;
    if (playerHP > 30) playerHP = 30;

    msgBox.innerText = `You recovered ${healAmt} HP!`;
    updateBattleUI();

    setTimeout(enemyTurn, 1000);
};

window.run = function () {
    if (!inBattle) return;
    msgBox.innerText = "You ran away safely!";
    endBattle(true);
};

function enemyTurn() {
    if (enemyHP <= 0) return;

    const dmg = Math.floor(Math.random() * 5) + 1; // 1-5 damage
    playerHP -= dmg;
    msgBox.innerText = `Enemy hit you for ${dmg} damage!`;
    updateBattleUI();

    if (playerHP <= 0) {
        msgBox.innerText = "You were defeated...";
        endBattle(false);
    }
}