const gridSize = 10;
const gameGrid = document.getElementById('game-grid');
const player = { x: 0, y: 0, hp: 100, coins: 100, equippedSword: null, chestplate: null };
let enemies = [{ x: 3, y: 3, hp: 50 }, { x: 6, y: 6, hp: 50 }];
let treasures = [{ x: 2, y: 2, type: 'sword', name: 'Iron Sword', enchantments: ['Sharpness'], durability: 10 }, { x: 7, y: 7, type: 'potion', name: 'Health Potion' }];
let inventory = [];
let level = 1;

function createGrid() {
    gameGrid.innerHTML = '';
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        gameGrid.appendChild(cell);
    }
}

function renderGrid() {
    const cells = gameGrid.children;
    for (let i = 0; i < cells.length; i++) {
        cells[i].style.backgroundColor = '#444';
    }

    const playerIndex = player.y * gridSize + player.x;
    cells[playerIndex].style.backgroundColor = '#0f0';

    enemies.forEach(enemy => {
        const enemyIndex = enemy.y * gridSize + enemy.x;
        cells[enemyIndex].style.backgroundColor = '#f00';
    });

    treasures.forEach(treasure => {
        const treasureIndex = treasure.y * gridSize + treasure.x;
        cells[treasureIndex].style.backgroundColor = '#ff0';
    });
}

function movePlayer(dx, dy) {
    player.x = Math.max(0, Math.min(gridSize - 1, player.x + dx));
    player.y = Math.max(0, Math.min(gridSize - 1, player.y + dy));

    enemies.forEach((enemy, index) => {
        if (player.x === enemy.x && player.y === enemy.y) {
            if (player.equippedSword) {
                alert(`Defeated an enemy with ${player.equippedSword.name}!`);
                player.coins += 10;
                player.equippedSword.durability -= 1;
                if (player.equippedSword.durability <= 0) {
                    alert(`${player.equippedSword.name} broke!`);
                    player.equippedSword = null;
                    document.getElementById('main-hand').innerText = '';
                }
                enemies.splice(index, 1);
            } else {
                alert('Encountered an enemy! You need a sword to defeat it.');
            }
        }
    });

    treasures.forEach((treasure, index) => {
        if (player.x === treasure.x && player.y === treasure.y) {
            alert(`Found a ${treasure.name}!`);
            inventory.push(treasure);
            treasures.splice(index, 1);
        }
    });

    if (enemies.length === 0) {
        alert('All enemies defeated! Proceeding to the next level.');
        nextLevel();
    }

    renderGrid();
    saveGame();
}

function nextLevel() {
    level++;
    player.x = 0;
    player.y = 0;
    enemies = Array.from({ length: level + 1 }, () => ({
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
        hp: 50 + level * 10
    }));
    treasures = Array.from({ length: level }, () => ({
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
        type: Math.random() > 0.5 ? 'sword' : 'potion',
        name: Math.random() > 0.5 ? 'Iron Sword' : 'Health Potion',
        enchantments: Math.random() > 0.5 ? ['Sharpness'] : [],
        durability: 10
    }));
    renderGrid();
    saveGame();
}

function openInventory() {
    const inventoryModal = document.getElementById('inventory-modal');
    const inventoryItems = document.getElementById('inventory-items');
    inventoryItems.innerHTML = inventory.map((item, index) => `<div onclick="equipItem(${index})">${item.name} ${item.enchantments ? `(${item.enchantments.join(', ')})` : ''} (Durability: ${item.durability})</div>`).join('');
    inventoryModal.style.display = 'block';
}

function closeInventory() {
    document.getElementById('inventory-modal').style.display = 'none';
}

function openShop() {
    const shopModal = document.getElementById('shop-modal');
    const shopItems = document.getElementById('shop-items');
    document.getElementById('shop-player-coins').innerText = player.coins;
    shopItems.innerHTML = `
        <div onclick="buyItem('wooden sword', 50)">Wooden Sword - 50 coins</div>
        <div onclick="buyItem('potion', 20)">Potion - 20 coins</div>
    `;
    shopModal.style.display = 'block';
}

function closeShop() {
    document.getElementById('shop-modal').style.display = 'none';
}

function openEscapeMenu() {
    document.getElementById('escape-modal').style.display = 'block';
}

function closeEscapeMenu() {
    document.getElementById('escape-modal').style.display = 'none';
}

function buyItem(type, cost) {
    if (player.coins >= cost) {
        player.coins -= cost;
        if (type === 'wooden sword') {
            inventory.push({ type: 'sword', name: 'Wooden Sword', enchantments: [], durability: 10 });
        } else if (type === 'potion') {
            inventory.push({ type: 'potion', name: 'Health Potion' });
        }
        alert(`Bought a ${type}!`);
        closeShop();
        saveGame();
    } else {
        alert('Not enough coins!');
    }
}

function equipItem(index) {
    const item = inventory[index];
    if (item.type === 'sword') {
        if (player.equippedSword) {
            inventory.push(player.equippedSword);
        }
        player.equippedSword = item;
        inventory.splice(index, 1);
        document.getElementById('main-hand').innerText = `${item.name} (${item.enchantments.join(', ')}) (Durability: ${item.durability})`;
    } else if (item.type === 'potion') {
        player.hp = Math.min(100, player.hp + 50);
        inventory.splice(index, 1);
    }
    closeInventory();
    updatePlayerInfo();
    saveGame();
}

function updatePlayerInfo() {
    document.getElementById('player-health').innerText = player.hp;
    document.getElementById('player-coins').innerText = player.coins;
}

function saveGame() {
    const gameState = {
        player,
        enemies,
        treasures,
        inventory,
        level
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGame() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        Object.assign(player, gameState.player);
        enemies = gameState.enemies;
        treasures = gameState.treasures;
        inventory = gameState.inventory;
        level = gameState.level;
    }
    createGrid();
    renderGrid();
    updatePlayerInfo();
}

function restartGame() {
    localStorage.removeItem('gameState');
    location.reload();
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
        case 'e':
            openInventory();
            break;
        case 's':
            openShop();
            break;
        case 'Escape':
            openEscapeMenu();
            break;
    }
});

document.getElementById('close-inventory').addEventListener('click', closeInventory);
document.getElementById('close-shop').addEventListener('click', closeShop);
document.getElementById('restart-game').addEventListener('click', restartGame);
document.getElementById('continue-game').addEventListener('click', closeEscapeMenu);

loadGame();