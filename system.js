// ==================== SYSTEMS.JS ====================
import { 
    gameData, 
    dungeonBosses, 
    dungeonLevels,
    dungeonWeapons,
    dungeonArmors,
    rankData,
    tokenExchangeRecipes,
    miningTools,
    exchangeRecipes,
    secretFishPool,
    rods,
    baits,
    pets,
    fishingSpots,
    depthGear,
    leaderboardNPCs,
    miningSkillTree
} from './data.js';
import { 
    getActivePets, 
    hasActivePet, 
    addToAquarium,
    showFishingResult,
    showAutoSellNotification
} from './fishing.js';

// ==================== DOM ELEMENTS (akan di-set dari UI) ====================
let showNotification = (message, type) => {
    console.log(`[${type}] ${message}`);
};
let updateUI = () => {};
let loadBackpack = () => {};
let loadSellItems = () => {};
let loadExchange = () => {};
let loadTokenExchange = () => {};
let loadDungeonCharacter = () => {};
let loadDungeonLevels = () => {};
let loadMiningMain = () => {};
let loadMiningShop = () => {};
let loadMiningSkillTree = () => {};
let loadMiningExchange = () => {};
let updateMiningStats = () => {};

// ==================== SET FUNCTIONS ====================
export function setSystemsFunctions(fns) {
    showNotification = fns.showNotification || showNotification;
    updateUI = fns.updateUI || updateUI;
    loadBackpack = fns.loadBackpack || loadBackpack;
    loadSellItems = fns.loadSellItems || loadSellItems;
    loadExchange = fns.loadExchange || loadExchange;
    loadTokenExchange = fns.loadTokenExchange || loadTokenExchange;
    loadDungeonCharacter = fns.loadDungeonCharacter || loadDungeonCharacter;
    loadDungeonLevels = fns.loadDungeonLevels || loadDungeonLevels;
    loadMiningMain = fns.loadMiningMain || loadMiningMain;
    loadMiningShop = fns.loadMiningShop || loadMiningShop;
    loadMiningSkillTree = fns.loadMiningSkillTree || loadMiningSkillTree;
    loadMiningExchange = fns.loadMiningExchange || loadMiningExchange;
    updateMiningStats = fns.updateMiningStats || updateMiningStats;
}

// ==================== CHECK DUNGEON UNLOCK ====================
export function checkDungeonUnlock() {
    const hasGhostShip = gameData.depthGear.ghostShip === true;
    const hasOneRing = gameData.specialItems.oneRing === true;
    
    gameData.dungeon.unlocked = hasGhostShip && hasOneRing;
    
    const dungeonBtn = document.getElementById('dungeon-menu-btn');
    if (dungeonBtn) {
        if (gameData.dungeon.unlocked) {
            dungeonBtn.disabled = false;
            dungeonBtn.style.background = 'linear-gradient(45deg, #ff0000, #ff6b6b)';
            dungeonBtn.style.cursor = 'pointer';
            dungeonBtn.title = "Masuk Dungeon";
            dungeonBtn.innerHTML = "⚔️ MASUK DUNGEON ⚔️";
        } else {
            dungeonBtn.disabled = true;
            dungeonBtn.style.background = '#666';
            dungeonBtn.style.cursor = 'not-allowed';
            dungeonBtn.title = "🔒 TERKUNCI! Butuh Ghost Ship (500💎) + One Ring (10 Secret Fish)";
            dungeonBtn.innerHTML = "🔒 DUNGEON TERKUNCI 🔒";
        }
    }
    
    return gameData.dungeon.unlocked;
}

// ==================== CHECK MINING UNLOCK ====================
export function checkMiningUnlock() {
    const hasHelm = gameData.depthGear.minerHelm === true;
    const hasFlashlight = gameData.specialItems.flashlight === true;
    
    gameData.mining.unlocked = hasHelm && hasFlashlight;
    
    const miningBtn = document.getElementById('mining-menu-btn');
    if (miningBtn) {
        if (gameData.mining.unlocked) {
            miningBtn.disabled = false;
            miningBtn.style.background = 'linear-gradient(45deg, #8B4513, #D2691E)';
            miningBtn.style.cursor = 'pointer';
            miningBtn.title = "Masuk ke area Mining!";
            miningBtn.innerHTML = "⛏️ MINING";
        } else {
            miningBtn.disabled = true;
            miningBtn.style.background = '#666';
            miningBtn.style.cursor = 'not-allowed';
            miningBtn.title = "🔒 TERKUNCI! Butuh Miner Helm (250💎) + Flashlight (1 Bitcoin)";
            miningBtn.innerHTML = "🔒 MINING TERKUNCI 🔒";
        }
    }
    
    return gameData.mining.unlocked;
}

// ==================== SWITCH TO DUNGEON ====================
export function switchToDungeon() {
    if (!checkDungeonUnlock()) {
        showNotification("🔒 DUNGEON TERKUNCI! Butuh GHOST SHIP (500💎) + ONE RING (10 Secret Fish)!", "error");
        return;
    }
    
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('dungeon-menu').style.display = 'block';
    
    loadDungeonCharacter();
    loadDungeonShop();
    loadDungeonLevels();
    loadTokenExchange();
    updateDungeonStats();
}

// ==================== SWITCH TO MAIN ====================
export function switchToMain() {
    document.getElementById('dungeon-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

// ==================== SWITCH TO MINING ====================
export function switchToMining() {
    if (!checkMiningUnlock()) {
        showNotification("🔒 MINING TERKUNCI! Butuh Miner Helm (250💎) + Flashlight (1 Bitcoin)!", "error");
        return;
    }
    
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('mining-menu').style.display = 'block';
    
    loadMiningMain();
    loadMiningShop();
    loadMiningSkillTree();
    loadMiningExchange();
    updateMiningStats();
}

// ==================== SWITCH TO MAIN FROM MINING ====================
export function switchToMainFromMining() {
    document.getElementById('mining-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

// ==================== UPDATE DUNGEON STATS ====================
export function updateDungeonStats() {
    const fishIndex = gameData.dungeon.fishEquipment.equippedFish;
    const selectedFishSpan = document.getElementById('dungeon-selected-fish');
    const attackSpan = document.getElementById('dungeon-attack');
    const defenseSpan = document.getElementById('dungeon-defense');
    const tokenSpan = document.getElementById('dungeon-tokens');
    const tokenDisplaySpan = document.getElementById('dungeon-tokens-display');
    
    if (!selectedFishSpan || !attackSpan || !defenseSpan) return;
    
    if (fishIndex !== null && gameData.backpack[fishIndex]) {
        const fish = gameData.backpack[fishIndex];
        const weapon = dungeonWeapons.find(w => w.id === gameData.dungeon.fishEquipment.weapon);
        const armor = dungeonArmors.find(a => a.id === gameData.dungeon.fishEquipment.armor);
        
        selectedFishSpan.textContent = `${fish.emoji} ${fish.name}`;
        attackSpan.textContent = weapon ? weapon.attack : 0;
        defenseSpan.textContent = armor ? armor.defense : 0;
        
        const equippedWeapon = document.getElementById('equipped-weapon');
        const equippedArmor = document.getElementById('equipped-armor');
        
        if (equippedWeapon) {
            equippedWeapon.innerHTML = weapon ? 
                `<span style="color: #ff6b6b;">${weapon.emoji} ${weapon.name} (+${weapon.attack} ATK)</span>` : 
                '<span>Belum ada senjata</span>';
        }
        
        if (equippedArmor) {
            equippedArmor.innerHTML = armor ? 
                `<span style="color: #4CAF50;">${armor.emoji} ${armor.name} (+${armor.defense} DEF)</span>` : 
                '<span>Belum ada armor</span>';
        }
    } else {
        selectedFishSpan.textContent = 'Belum dipilih';
        attackSpan.textContent = '0';
        defenseSpan.textContent = '0';
    }
    
    const tokens = gameData.secretTokens || 0;
    if (tokenSpan) tokenSpan.textContent = tokens;
    if (tokenDisplaySpan) tokenDisplaySpan.textContent = tokens;
}

// ==================== LOAD DUNGEON CHARACTER ====================
export function loadDungeonCharacter() {
    const charContainer = document.getElementById('dungeon-character-list');
    if (!charContainer) return;
    
    const secretFish = gameData.backpack.filter(fish => 
        fish.rarity === 'secret' || fish.rarity === 'special'
    );
    
    if (secretFish.length === 0) {
        charContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🐟</div>
                <h3 style="color: #FFD700;">Tidak ada ikan Secret!</h3>
                <p style="color: #ccc;">Kamu butuh ikan Secret untuk bertarung di dungeon</p>
                <p style="color: #00ffff;">Dapatkan ikan Secret dari memancing di spot khusus atau Gacha!</p>
            </div>
        `;
        return;
    }
    
    const equippedFishIndex = gameData.dungeon.fishEquipment.equippedFish;
    
    let fishHTML = '';
    secretFish.forEach((fish, idx) => {
        const fishIndex = gameData.backpack.findIndex(f => f === fish);
        const isSelected = fishIndex === equippedFishIndex;
        const hp = Math.floor(Number(fish.price) / 10);
        
        fishHTML += `
            <div onclick="window.selectDungeonFish(${fishIndex})" 
                 style="background: ${isSelected ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)'}; 
                        padding: 15px; border-radius: 8px; margin: 10px; cursor: pointer; 
                        display: flex; align-items: center; gap: 15px; 
                        border: ${isSelected ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)'};
                        transition: all 0.3s;">
                <div style="font-size: 3rem;">${fish.emoji}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #00ffff;">${fish.name}</div>
                    <div style="color: #FFD700;">💰 ${fish.price} koin</div>
                    <div style="color: #4CAF50;">❤️ HP: ${hp}</div>
                </div>
                ${isSelected ? '<div style="color: #FFD700; font-size: 2rem;">✓</div>' : ''}
            </div>
        `;
    });
    
    charContainer.innerHTML = `
        <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 20px;">
            <h3 style="color: #FFD700; margin-bottom: 20px;">🐟 Pilih Ikan Secret untuk Bertarung</h3>
            <div style="max-height: 400px; overflow-y: auto;">
                ${fishHTML}
            </div>
        </div>
    `;
    
    updateDungeonStats();
}

// ==================== SELECT DUNGEON FISH ====================
export function selectDungeonFish(fishIndex) {
    const fish = gameData.backpack[fishIndex];
    
    if (!fish || (fish.rarity !== 'secret' && fish.rarity !== 'special')) {
        showNotification("❌ Hanya ikan Secret yang bisa dipilih untuk dungeon!", "error");
        return;
    }
    
    gameData.dungeon.fishEquipment.equippedFish = fishIndex;
    showNotification(`✅ ${fish.name} siap bertarung di dungeon!`, "success");
    
    loadDungeonCharacter();
    loadDungeonLevels();
    updateDungeonStats();
}

// ==================== LOAD DUNGEON SHOP ====================
export function loadDungeonShop() {
    const weaponContainer = document.getElementById('dungeon-weapons');
    const armorContainer = document.getElementById('dungeon-armors');
    
    if (!weaponContainer || !armorContainer) return;
    
    weaponContainer.innerHTML = '';
    dungeonWeapons.forEach(weapon => {
        const isEquipped = gameData.dungeon.fishEquipment.weapon === weapon.id;
        const canAfford = weapon.currency === "coins" ? 
            Number(gameData.coins) >= Number(weapon.price) : 
            Number(gameData.diamonds) >= Number(weapon.price);
        
        const weaponCard = document.createElement('div');
        weaponCard.className = 'item-card';
        weaponCard.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 5px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">${weapon.emoji}</div>
                <div style="font-weight: bold; color: white; margin-bottom: 5px;">${weapon.name}</div>
                <p style="color: #ccc; font-size: 0.9rem; margin-bottom: 10px;">${weapon.description}</p>
                <div style="color: #ff6b6b; font-size: 1.2rem;">⚔️ Attack: +${weapon.attack}</div>
                <div style="color: ${weapon.currency === 'diamonds' ? '#00ffff' : '#FFD700'}; margin: 10px 0;">
                    ${weapon.price} ${weapon.currency === 'diamonds' ? '💎' : '🪙'}
                </div>
                ${isEquipped ? 
                    `<button class="owned-btn" disabled style="width: 100%; padding: 8px; background: #4CAF50; border: none; border-radius: 6px; color: white;">✓ EQUIPPED</button>` :
                    `<button class="buy-weapon-btn" ${!canAfford ? 'disabled' : ''} 
                            onclick="window.buyDungeonWeapon(${weapon.id})"
                            style="width: 100%; padding: 8px; background: ${canAfford ? '#4CAF50' : '#666'}; border: none; border-radius: 6px; color: white; cursor: ${canAfford ? 'pointer' : 'not-allowed'};">
                        ${canAfford ? '🛒 BELI' : '❌ TIDAK CUKUP'}
                    </button>`
                }
            </div>
        `;
        weaponContainer.appendChild(weaponCard);
    });
    
    armorContainer.innerHTML = '';
    dungeonArmors.forEach(armor => {
        const isEquipped = gameData.dungeon.fishEquipment.armor === armor.id;
        const canAfford = armor.currency === "coins" ? 
            Number(gameData.coins) >= Number(armor.price) : 
            Number(gameData.diamonds) >= Number(armor.price);
        
        const armorCard = document.createElement('div');
        armorCard.className = 'item-card';
        armorCard.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 5px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 10px;">${armor.emoji}</div>
                <div style="font-weight: bold; color: white; margin-bottom: 5px;">${armor.name}</div>
                <p style="color: #ccc; font-size: 0.9rem; margin-bottom: 10px;">${armor.description}</p>
                <div style="color: #4CAF50; font-size: 1.2rem;">🛡️ Defense: +${armor.defense}</div>
                <div style="color: ${armor.currency === 'diamonds' ? '#00ffff' : '#FFD700'}; margin: 10px 0;">
                    ${armor.price} ${armor.currency === 'diamonds' ? '💎' : '🪙'}
                </div>
                ${isEquipped ? 
                    `<button class="owned-btn" disabled style="width: 100%; padding: 8px; background: #4CAF50; border: none; border-radius: 6px; color: white;">✓ EQUIPPED</button>` :
                    `<button class="buy-armor-btn" ${!canAfford ? 'disabled' : ''} 
                            onclick="window.buyDungeonArmor(${armor.id})"
                            style="width: 100%; padding: 8px; background: ${canAfford ? '#4CAF50' : '#666'}; border: none; border-radius: 6px; color: white; cursor: ${canAfford ? 'pointer' : 'not-allowed'};">
                        ${canAfford ? '🛒 BELI' : '❌ TIDAK CUKUP'}
                    </button>`
                }
            </div>
        `;
        armorContainer.appendChild(armorCard);
    });
    
    updateDungeonStats();
}

// ==================== BUY DUNGEON WEAPON ====================
export function buyDungeonWeapon(weaponId) {
    const weapon = dungeonWeapons.find(w => w.id === weaponId);
    if (!weapon) return;
    
    if (weapon.currency === "coins") {
        if (Number(gameData.coins) >= Number(weapon.price)) {
            gameData.coins = Number(gameData.coins) - Number(weapon.price);
        } else {
            showNotification("❌ Koin tidak cukup!", "error");
            return;
        }
    } else if (weapon.currency === "diamonds") {
        if (Number(gameData.diamonds) >= Number(weapon.price)) {
            gameData.diamonds = Number(gameData.diamonds) - Number(weapon.price);
        } else {
            showNotification("❌ Diamond tidak cukup!", "error");
            return;
        }
    } else {
        showNotification("❌ Tidak cukup resources!", "error");
        return;
    }
    
    gameData.dungeon.fishEquipment.weapon = weapon.id;
    showNotification(`✅ Berhasil membeli ${weapon.name}! Attack +${weapon.attack}`, "success");
    
    updateUI();
    loadDungeonShop();
    loadDungeonCharacter();
    updateDungeonStats();
}

// ==================== BUY DUNGEON ARMOR ====================
export function buyDungeonArmor(armorId) {
    const armor = dungeonArmors.find(a => a.id === armorId);
    if (!armor) return;
    
    if (armor.currency === "coins") {
        if (Number(gameData.coins) >= Number(armor.price)) {
            gameData.coins = Number(gameData.coins) - Number(armor.price);
        } else {
            showNotification("❌ Koin tidak cukup!", "error");
            return;
        }
    } else if (armor.currency === "diamonds") {
        if (Number(gameData.diamonds) >= Number(armor.price)) {
            gameData.diamonds = Number(gameData.diamonds) - Number(armor.price);
        } else {
            showNotification("❌ Diamond tidak cukup!", "error");
            return;
        }
    } else {
        showNotification("❌ Tidak cukup resources!", "error");
        return;
    }
    
    gameData.dungeon.fishEquipment.armor = armor.id;
    showNotification(`✅ Berhasil membeli ${armor.name}! Defense +${armor.defense}`, "success");
    
    updateUI();
    loadDungeonShop();
    loadDungeonCharacter();
    updateDungeonStats();
}

// ==================== LOAD DUNGEON LEVELS ====================
export function loadDungeonLevels() {
    const levelsContainer = document.getElementById('dungeon-levels-list');
    if (!levelsContainer) return;
    
    const equippedFish = gameData.dungeon.fishEquipment.equippedFish;
    
    if (equippedFish === null) {
        levelsContainer.innerHTML = `
            <div style="text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                <p style="color: #FF6B6B;">Pilih ikan dulu di menu Karakter!</p>
            </div>
        `;
        return;
    }
    
    let levelsHTML = '';
    
    dungeonLevels.forEach(level => {
        const progress = gameData.dungeon.dungeonProgress[level.id];
        const isCompleted = progress.completed;
        const bossesDefeated = progress.bossesDefeated.length;
        const canEnter = Number(gameData.level) >= Number(level.requiredLevel) && Number(gameData.coins) >= Number(level.entryFee);
        
        const tokenReward = level.id === 1 ? 1 : level.id === 2 ? 2 : level.id === 3 ? 3 : 5;
        
        levelsHTML += `
            <div style="background: linear-gradient(135deg, ${level.color}40, #00000080); 
                        border: 2px solid ${level.color}; border-radius: 10px; padding: 20px; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="color: ${level.color};">${level.name}</h3>
                        <p style="color: #ccc;">${level.description}</p>
                        <div style="display: flex; gap: 15px; margin-top: 10px; flex-wrap: wrap;">
                            <span style="color: #FFD700;">💰 Fee: ${level.entryFee}</span>
                            <span style="color: #00ffff;">📊 Required Level: ${level.requiredLevel}</span>
                            <span style="color: #FF00FF;">🎫 Token Reward: ${tokenReward}</span>
                        </div>
                        ${isCompleted ? 
                            '<div style="color: #4CAF50; margin-top: 10px;">✓ SELESAI</div>' : 
                            `<div style="color: #FFA500; margin-top: 10px;">⚔️ Bosses: ${bossesDefeated}/3</div>`
                        }
                    </div>
                    <button onclick="window.enterDungeonLevel(${level.id})" 
                            ${!canEnter || isCompleted ? 'disabled' : ''}
                            style="padding: 10px 20px; background: ${canEnter && !isCompleted ? '#4CAF50' : '#666'}; 
                                   border: none; border-radius: 5px; color: white; cursor: ${canEnter && !isCompleted ? 'pointer' : 'not-allowed'};">
                        ${isCompleted ? '✅ Selesai' : (canEnter ? '🎮 MASUK' : '❌ TERKUNCI')}
                    </button>
                </div>
            </div>
        `;
    });
    
    levelsContainer.innerHTML = levelsHTML;
}

// ==================== ENTER DUNGEON LEVEL ====================
export function enterDungeonLevel(levelId) {
    const level = dungeonLevels.find(l => l.id === levelId);
    
    if (!level) return;
    
    if (Number(gameData.level) < Number(level.requiredLevel)) {
        showNotification(`❌ Butuh level ${level.requiredLevel} untuk masuk!`, "error");
        return;
    }
    
    if (Number(gameData.coins) < Number(level.entryFee)) {
        showNotification(`❌ Koin tidak cukup! Butuh ${level.entryFee} koin`, "error");
        return;
    }
    
    if (gameData.dungeon.fishEquipment.equippedFish === null) {
        showNotification("❌ Pilih ikan dulu di menu Karakter!", "error");
        return;
    }
    
    gameData.coins = Number(gameData.coins) - Number(level.entryFee);
    updateUI();
    
    const bossId = level.bossIds[Math.floor(Math.random() * level.bossIds.length)];
    const boss = dungeonBosses.find(b => b.id === bossId);
    
    startDungeonBattle(level, boss);
}

// ==================== START DUNGEON BATTLE ====================
export function startDungeonBattle(level, boss) {
    const fish = gameData.backpack[gameData.dungeon.fishEquipment.equippedFish];
    if (!fish) return;
    
    const weapon = dungeonWeapons.find(w => w.id === gameData.dungeon.fishEquipment.weapon);
    const armor = dungeonArmors.find(a => a.id === gameData.dungeon.fishEquipment.armor);
    
    const playerMaxHP = Math.floor(Number(fish.price) / 10);
    const playerAttack = weapon ? Number(weapon.attack) : 0;
    const playerDefense = armor ? Number(armor.defense) : 0;
    
    gameData.dungeon.currentBattle = {
        levelId: level.id,
        boss: boss,
        playerHP: playerMaxHP,
        playerMaxHP: playerMaxHP,
        playerAttack: playerAttack,
        playerDefense: playerDefense,
        bossHP: Number(boss.hp),
        bossMaxHP: Number(boss.hp),
        bossAttack: Number(boss.attack),
        bossDefense: Number(boss.defense),
        playerTurn: true,
        fishIndex: gameData.dungeon.fishEquipment.equippedFish
    };
    
    gameData.dungeon.battleInProgress = true;
    
    showDungeonBattleModal();
}

// ==================== SHOW DUNGEON BATTLE MODAL ====================
export function showDungeonBattleModal() {
    const battle = gameData.dungeon.currentBattle;
    if (!battle) return;
    
    const battleModal = document.getElementById('battle-modal');
    const battleContent = document.getElementById('battle-content');
    
    if (!battleModal || !battleContent) return;
    
    const fish = gameData.backpack[gameData.dungeon.fishEquipment.equippedFish];
    
    battleContent.innerHTML = `
        <div style="padding: 20px;">
            <h2 style="color: #FFD700; text-align: center; margin-bottom: 30px;">⚔️ DUNGEON BATTLE ⚔️</h2>
            
            <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 30px;">
                <div style="flex: 1; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 4rem;">${fish.emoji}</div>
                    <h3 style="color: #00ffff;">${fish.name}</h3>
                    <div style="margin: 15px 0;">
                        <div style="color: #4CAF50;">❤️ HP: <span id="battle-player-hp">${battle.playerHP}</span>/${battle.playerMaxHP}</div>
                        <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; margin-top: 5px;">
                            <div id="player-hp-bar" style="width: ${(battle.playerHP/battle.playerMaxHP)*100}%; height: 100%; background: #4CAF50; border-radius: 5px;"></div>
                        </div>
                    </div>
                    <div style="color: #ff6b6b;">⚔️ Attack: ${battle.playerAttack}</div>
                    <div style="color: #4CAF50;">🛡️ Defense: ${battle.playerDefense}</div>
                </div>
                
                <div style="display: flex; align-items: center; font-size: 3rem; color: #FFD700;">VS</div>
                
                <div style="flex: 1; background: rgba(255,0,0,0.1); padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 4rem;">${battle.boss.emoji}</div>
                    <h3 style="color: #FF6B6B;">${battle.boss.name}</h3>
                    <div style="margin: 15px 0;">
                        <div style="color: #4CAF50;">❤️ HP: <span id="battle-boss-hp">${battle.bossHP}</span>/${battle.bossMaxHP}</div>
                        <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.2); border-radius: 5px; margin-top: 5px;">
                            <div id="boss-hp-bar" style="width: ${(battle.bossHP/battle.bossMaxHP)*100}%; height: 100%; background: #ff6b6b; border-radius: 5px;"></div>
                        </div>
                    </div>
                    <div style="color: #ff6b6b;">⚔️ Attack: ${battle.bossAttack}</div>
                    <div style="color: #4CAF50;">🛡️ Defense: ${battle.bossDefense}</div>
                </div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <p id="turn-indicator" style="color: #ccc;">Giliran: <span style="color: ${battle.playerTurn ? '#00ffff' : '#FF6B6B'};">${battle.playerTurn ? 'Giliranmu' : 'Giliran Boss'}</span></p>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="attack-btn" onclick="window.playerAttack()" ${!battle.playerTurn ? 'disabled' : ''}
                        style="padding: 15px 30px; background: ${battle.playerTurn ? '#ff6b6b' : '#666'}; border: none; border-radius: 25px; color: white; font-weight: bold; font-size: 1.2rem; cursor: ${battle.playerTurn ? 'pointer' : 'not-allowed'};">
                    ⚔️ ATTACK
                </button>
                <button onclick="window.fleeBattle()"
                        style="padding: 15px 30px; background: #666; border: none; border-radius: 25px; color: white; font-weight: bold; font-size: 1.2rem; cursor: pointer;">
                    🏃 FLEE
                </button>
            </div>
        </div>
    `;
    
    battleModal.style.display = 'block';
}

// ==================== PLAYER ATTACK ====================
export function playerAttack() {
    const battle = gameData.dungeon.currentBattle;
    if (!battle || !battle.playerTurn) return;
    
    let damage = Math.max(1, battle.playerAttack - battle.bossDefense + Math.floor(Math.random() * 10));
    battle.bossHP -= damage;
    
    showNotification(`💥 Kamu menyerang! Damage: ${damage}`, "info");
    
    document.getElementById('battle-boss-hp').textContent = battle.bossHP;
    const bossHPBar = document.getElementById('boss-hp-bar');
    if (bossHPBar) {
        bossHPBar.style.width = `${(battle.bossHP/battle.bossMaxHP)*100}%`;
    }
    
    if (battle.bossHP <= 0) {
        dungeonVictory();
        return;
    }
    
    battle.playerTurn = false;
    document.getElementById('turn-indicator').innerHTML = 'Giliran: <span style="color: #FF6B6B;">Giliran Boss</span>';
    document.getElementById('attack-btn').disabled = true;
    
    setTimeout(() => {
        bossAttack();
    }, 1000);
}

// ==================== BOSS ATTACK ====================
export function bossAttack() {
    const battle = gameData.dungeon.currentBattle;
    if (!battle) return;
    
    let damage = Math.max(1, battle.bossAttack - battle.playerDefense + Math.floor(Math.random() * 15));
    battle.playerHP -= damage;
    
    showNotification(`💢 Boss menyerang! Damage: ${damage}`, "error");
    
    document.getElementById('battle-player-hp').textContent = battle.playerHP;
    const playerHPBar = document.getElementById('player-hp-bar');
    if (playerHPBar) {
        playerHPBar.style.width = `${(battle.playerHP/battle.playerMaxHP)*100}%`;
    }
    
    if (battle.playerHP <= 0) {
        dungeonDefeat();
        return;
    }
    
    battle.playerTurn = true;
    document.getElementById('turn-indicator').innerHTML = 'Giliran: <span style="color: #00ffff;">Giliranmu</span>';
    document.getElementById('attack-btn').disabled = false;
}

// ==================== DUNGEON VICTORY ====================
export function dungeonVictory() {
    const battle = gameData.dungeon.currentBattle;
    if (!battle) return;
    
    gameData.dungeon.battleInProgress = false;
    
    const progress = gameData.dungeon.dungeonProgress[battle.levelId];
    if (!progress.bossesDefeated.includes(battle.boss.id)) {
        progress.bossesDefeated.push(battle.boss.id);
    }
    
    const tokenReward = battle.levelId === 1 ? 1 : battle.levelId === 2 ? 2 : battle.levelId === 3 ? 3 : 5;
    gameData.secretTokens = (gameData.secretTokens || 0) + tokenReward;
    
    showNotification(`🎉 Mengalahkan ${battle.boss.name}! Mendapatkan ${tokenReward} Secret Token!`, "success");
    
    const level = dungeonLevels.find(l => l.id === battle.levelId);
    const allBossesDefeated = level.bossIds.every(id => progress.bossesDefeated.includes(id));
    
    if (allBossesDefeated) {
        progress.completed = true;
        showNotification(`🎉 DUNGEON LEVEL ${battle.levelId} SELESAI! Total Token: ${gameData.secretTokens}`, "success");
    }
    
    document.getElementById('battle-modal').style.display = 'none';
    gameData.dungeon.currentBattle = null;
    
    updateUI();
    loadDungeonLevels();
    loadBackpack();
    updateDungeonStats();
}

// ==================== DUNGEON DEFEAT ====================
export function dungeonDefeat() {
    const battle = gameData.dungeon.currentBattle;
    if (!battle) return;
    
    gameData.dungeon.battleInProgress = false;
    
    if (battle.fishIndex !== undefined && gameData.backpack[battle.fishIndex]) {
        const fish = gameData.backpack[battle.fishIndex];
        gameData.backpack.splice(battle.fishIndex, 1);
        
        gameData.dungeon.fishEquipment.equippedFish = null;
        gameData.dungeon.fishEquipment.weapon = null;
        gameData.dungeon.fishEquipment.armor = null;
        
        showNotification(`😢 KALAH! ${fish.name} hilang dalam pertarungan!`, "error");
    } else {
        showNotification(`😢 KALAH! ${battle.boss.name} terlalu kuat!`, "error");
    }
    
    document.getElementById('battle-modal').style.display = 'none';
    gameData.dungeon.currentBattle = null;
    
    updateUI();
    loadDungeonCharacter();
    loadDungeonLevels();
    loadBackpack();
    updateDungeonStats();
}

// ==================== FLEE BATTLE ====================
export function fleeBattle() {
    gameData.dungeon.battleInProgress = false;
    gameData.dungeon.currentBattle = null;
    
    document.getElementById('battle-modal').style.display = 'none';
    showNotification("🏃 Melarikan diri dari dungeon!", "info");
}

// ==================== TOKEN EXCHANGE ====================
export function loadTokenExchange() {
    const tokenContainer = document.getElementById('token-exchange-items');
    if (!tokenContainer) return;
    
    tokenContainer.innerHTML = '';
    
    tokenExchangeRecipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'exchange-card';
        
        const canCraft = (gameData.secretTokens || 0) >= recipe.input.quantity;
        
        let outputHtml = '';
        if (recipe.output.type === 'coin') {
            outputHtml = `
                <div style="display: flex; align-items: center; gap- 10px; margin: 5px 0;">
                    <span style="font-size: 1.5rem;">💰</span>
                    <span style="color: white;">${recipe.output.quantity}x Coin</span>
                </div>
            `;
        } else if (recipe.output.type === 'diamond') {
            outputHtml = `
                <div style="display: flex; align-items: center; gap: 10px; margin: 5px 0;">
                    <span style="font-size: 1.5rem;">💎</span>
                    <span style="color: white;">${recipe.output.quantity}x Diamond</span>
                </div>
            `;
        } else if (recipe.output.type === 'secretFish') {
            outputHtml = `
                <div style="display: flex; align-items: center; gap: 10px; margin: 5px 0;">
                    <span style="font-size: 1.5rem;">🐟</span>
                    <span style="color: white;">Ikan Secret Random</span>
                </div>
            `;
        } else if (recipe.output.type === 'fish') {
            outputHtml = `
                <div style="display: flex; align-items: center; gap: 10px; margin: 5px 0;">
                    <span style="font-size: 1.5rem;">${recipe.output.emoji}</span>
                    <span style="color: white;">${recipe.output.name}</span>
                </div>
            `;
        }
        
        recipeCard.innerHTML = `
            <div style="background: rgba(255,215,0,0.1); border: 2px solid #FFD700; border-radius: 10px; padding: 15px; margin: 10px;">
                <h3 style="color: #FFD700; margin-bottom: 10px;">${recipe.name}</h3>
                <p style="color: #ccc; margin-bottom: 15px;">${recipe.description}</p>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <h4 style="color: #FF6B6B; margin-bottom: 5px;">INPUT:</h4>
                        <div style="display: flex; align-items: center; gap: 10px; margin: 5px 0;">
                            <span style="font-size: 1.5rem;">🎫</span>
                            <span style="color: white;">${recipe.input.quantity}x Secret Token</span>
                        </div>
                    </div>
                    
                    <div style="font-size: 2rem; color: #FFD700;">→</div>
                    
                    <div style="flex: 1;">
                        <h4 style="color: #4CAF50; margin-bottom: 5px;">OUTPUT:</h4>
                        ${outputHtml}
                    </div>
                </div>
                
                <button class="exchange-btn" data-recipe-id="${recipe.id}" ${!canCraft ? 'disabled' : ''}
                        style="width: 100%; margin-top: 15px; padding: 10px; background: ${canCraft ? '#4CAF50' : '#666'}; border: none; border-radius: 6px; color: white; cursor: ${canCraft ? 'pointer' : 'not-allowed'};">
                    ${canCraft ? '🔄 TUKAR' : '❌ TOKEN TIDAK CUKUP'}
                </button>
            </div>
        `;
        
        const exchangeBtn = recipeCard.querySelector('.exchange-btn');
        if (canCraft) {
            exchangeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                exchangeToken(recipe);
            });
        }
        
        tokenContainer.appendChild(recipeCard);
    });
}

// ==================== EXCHANGE TOKEN ====================
export function exchangeToken(recipe) {
    if (!recipe) return;
    
    if ((gameData.secretTokens || 0) < recipe.input.quantity) {
        showNotification("❌ Token tidak cukup!", "error");
        loadTokenExchange();
        return;
    }
    
    try {
        gameData.secretTokens = (gameData.secretTokens || 0) - recipe.input.quantity;
        
        if (recipe.output.type === "coin") {
            gameData.coins = Number(gameData.coins) + Number(recipe.output.quantity);
            showNotification(`💰 Mendapatkan ${recipe.output.quantity} Coin!`, "success");
            
        } else if (recipe.output.type === "diamond") {
            gameData.diamonds = Number(gameData.diamonds) + Number(recipe.output.quantity);
            showNotification(`💎 Mendapatkan ${recipe.output.quantity} Diamond!`, "success");
            
        } else if (recipe.output.type === "secretFish") {
            const randomIndex = Math.floor(Math.random() * secretFishPool.length);
            const secretFish = { ...secretFishPool[randomIndex] };
            
            gameData.backpack.push({
                ...secretFish,
                catchTime: Date.now(),
                perfectCatch: false,
                fromTokenExchange: true,
                uniqueId: Date.now() + Math.random()
            });
            
            addToAquarium(secretFish);
            showNotification(`🐟 Mendapatkan ${secretFish.name}!`, "success");
            
        } else if (recipe.output.type === "fish") {
            const fish = getAllFishes().find(f => f.id === recipe.output.id);
            if (fish) {
                gameData.backpack.push({
                    ...fish,
                    catchTime: Date.now(),
                    perfectCatch: false,
                    fromTokenExchange: true,
                    uniqueId: Date.now() + Math.random()
                });
                showNotification(`✅ Dapat ${fish.emoji} ${fish.name}!`, "success");
                addToAquarium(fish);
            }
        }
        
        showNotification(`✅ Token Exchange berhasil!`, "success");
        
        updateUI();
        loadBackpack();
        loadTokenExchange();
        loadSellItems();
        updateDungeonStats();
        
    } catch (error) {
        console.error("Token exchange error:", error);
        showNotification("❌ Terjadi error! Transaksi dibatalkan.", "error");
    }
}

// ==================== MINING FUNCTIONS ====================
export function startMining() {
    if (gameData.mining.isMining) return;
    
    gameData.mining.isMining = true;
    
    const rock = document.getElementById('mining-rock');
    if (rock) {
        rock.style.transform = 'scale(0.95)';
        setTimeout(() => {
            rock.style.transform = 'scale(1)';
        }, 100);
    }
    
    const hasPerfectCut = gameData.mining.skill.perfectCut.unlocked;
    
    if (!hasPerfectCut && miningMinigameIndicator) {
        miningMinigameIndicator.style.display = 'block';
        startMiningMinigame();
    }
    
    setTimeout(() => {
        if (!gameData.mining.isMining) return;
        
        const perfectCatch = hasPerfectCut ? true : (miningMinigameIndicator && miningMinigameIndicator.style.display !== 'none' ? checkMiningMinigameResult() : false);
        
        finishMining(perfectCatch);
        
    }, 1500);
}

// ==================== START MINING MINIGAME ====================
export function startMiningMinigame() {
    const needle = document.getElementById('mining-needle');
    if (needle) {
        needle.style.animation = 'needleSweep 1s infinite linear';
    }
}

// ==================== CHECK MINING MINIGAME RESULT ====================
export function checkMiningMinigameResult() {
    const needle = document.getElementById('mining-needle');
    if (!needle) return false;
    
    const needleRect = needle.getBoundingClientRect();
    const needleCenter = needleRect.left + needleRect.width / 2;
    const targetLeft = needleRect.parentElement.offsetLeft + 80;
    const targetRight = targetLeft + 40;
    
    return needleCenter >= targetLeft && needleCenter <= targetRight;
}

// ==================== FINISH MINING ====================
export function finishMining(perfectCatch = false) {
    gameData.mining.isMining = false;
    
    if (miningMinigameIndicator) {
        miningMinigameIndicator.style.display = 'none';
    }
    
    const needle = document.getElementById('mining-needle');
    if (needle) {
        needle.style.animation = 'none';
    }
    
    const currentTool = miningTools.find(t => t.id === gameData.mining.currentTool) || miningTools[0];
    const luckyLevel = gameData.mining.skill.lucky.level || 0;
    const luckMultiplier = currentTool.luck * (1 + luckyLevel);
    
    const random = Math.random() * 100;
    let itemType = '';
    let amount = 0;
    
    if (random < 50) {
        itemType = 'coin';
        amount = Math.floor((Math.random() * 400 + 100) * luckMultiplier);
        if (perfectCatch) amount *= 2;
    } else if (random < 85) {
        itemType = 'rock';
        amount = Math.floor((Math.random() * 9 + 1) * luckMultiplier);
        if (perfectCatch) amount *= 2;
    } else {
        itemType = 'diamond';
        amount = Math.floor((Math.random() * 4 + 1) * luckMultiplier);
        if (perfectCatch) amount *= 2;
    }
    
    gameData.mining.stats.totalMines++;
    if (perfectCatch) gameData.mining.stats.perfectCount++;
    
    if (itemType === 'coin') {
        gameData.coins += amount;
        gameData.mining.stats.totalCoins += amount;
        showMiningResult('💰', 'Coin', amount, perfectCatch);
    } else if (itemType === 'rock') {
        gameData.mining.rocks += amount;
        gameData.mining.stats.totalRocks += amount;
        showMiningResult('🪨', 'Rock', amount, perfectCatch);
    } else if (itemType === 'diamond') {
        gameData.diamonds += amount;
        gameData.mining.stats.totalDiamonds += amount;
        showMiningResult('💎', 'Diamond', amount, perfectCatch);
    }
    
    updateUI();
    updateMiningStats();
}

// ==================== SHOW MINING RESULT ====================
export function showMiningResult(emoji, name, amount, perfectCatch) {
    const miningResultModal = document.getElementById('mining-result-modal');
    const miningResultContent = document.getElementById('mining-result-content');
    
    if (!miningResultModal || !miningResultContent) return;
    
    miningResultContent.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 5rem; margin: 20px 0; animation: bounce 1s infinite;">${emoji}</div>
            <h3 style="color: ${perfectCatch ? '#FFD700' : '#4CAF50'}; margin-bottom: 10px;">
                ${perfectCatch ? '🎯 PERFECT!' : 'Mendapatkan:'}
            </h3>
            <p style="color: white; font-size: 1.5rem; margin-bottom: 10px;">${name}</p>
            <p style="color: #FFD700; font-size: 2rem;">+${amount}</p>
            ${perfectCatch ? '<p style="color: #FFD700;">✨ Bonus Perfect: x2!</p>' : ''}
            <button onclick="document.getElementById('mining-result-modal').style.display='none'" 
                    style="margin-top: 20px; padding: 10px 30px; background: #4CAF50; border: none; border-radius: 25px; color: white; cursor: pointer;">
                OK
            </button>
        </div>
    `;
    
    miningResultModal.style.display = 'block';
}

// ==================== BUY MINING TOOL ====================
export function buyMiningTool(tool) {
    if (Number(gameData.coins) < tool.price) {
        showNotification("❌ Koin tidak cukup!", "error");
        return;
    }
    
    gameData.coins -= tool.price;
    tool.owned = true;
    
    showNotification(`✅ Berhasil membeli ${tool.name}!`, "success");
    updateUI();
    loadMiningShop();
}

// ==================== EQUIP MINING TOOL ====================
export function equipMiningTool(toolId) {
    gameData.mining.currentTool = toolId;
    showNotification(`🔧 Menggunakan ${miningTools.find(t => t.id === toolId).name}!`, "success");
    loadMiningShop();
    loadMiningMain();
}

// ==================== UPGRADE MINING SKILL ====================
export function upgradeMiningSkill(skillKey, price, currency = 'coins') {
    if (currency === 'diamonds') {
        if (Number(gameData.diamonds) < price) {
            showNotification("❌ Diamond tidak cukup!", "error");
            return;
        }
        gameData.diamonds -= price;
    } else {
        if (Number(gameData.coins) < price) {
            showNotification("❌ Koin tidak cukup!", "error");
            return;
        }
        gameData.coins -= price;
    }
    
    if (skillKey === 'perfectCut') {
        gameData.mining.skill.perfectCut.unlocked = true;
        showNotification(`✅ Perfect Cut unlocked! Auto Perfect saat mining!`, "success");
    } else if (skillKey === 'lucky') {
        gameData.mining.skill.lucky.level = (gameData.mining.skill.lucky.level || 0) + 1;
        showNotification(`✅ Lucky Mining Skill naik ke level ${gameData.mining.skill.lucky.level}!`, "success");
    }
    
    updateUI();
    loadMiningSkillTree();
    loadMiningMain();
}

// ==================== EXCHANGE MINING ITEMS ====================
export function exchangeMiningItems(recipe) {
    const input = recipe.input;
    
    if (input.type === 'coin') {
        if (Number(gameData.coins) < input.quantity) {
            showNotification("❌ Coin tidak cukup!", "error");
            return;
        }
        gameData.coins -= input.quantity;
    } else if (input.type === 'rock') {
        if ((gameData.mining.rocks || 0) < input.quantity) {
            showNotification("❌ Rock tidak cukup!", "error");
            return;
        }
        gameData.mining.rocks -= input.quantity;
    }
    
    gameData.diamonds += recipe.output.quantity;
    
    showNotification(`✅ Berhasil menukar! Mendapatkan ${recipe.output.quantity} Diamond!`, "success");
    
    updateUI();
    updateMiningStats();
    loadMiningExchange();
}

// ==================== RANK BATTLE ====================
export function startRankBattle() {
    const currentRank = gameData.rank.current;
    const rankInfo = rankData[currentRank];
    
    if (Number(gameData.coins) < Number(rankInfo.entryFee)) {
        showNotification(`❌ Koin tidak cukup! Butuh ${rankInfo.entryFee} koin`, "error");
        return;
    }
    
    if (gameData.backpack.length === 0) {
        showNotification("❌ Tidak ada ikan untuk bertarung!", "error");
        return;
    }
    
    gameData.coins = Number(gameData.coins) - Number(rankInfo.entryFee);
    updateUI();
    
    const opponent = rankInfo.opponents[Math.floor(Math.random() * rankInfo.opponents.length)];
    showRankBattleSelection(opponent);
}

// ==================== SHOW RANK BATTLE SELECTION ====================
export function showRankBattleSelection(opponent) {
    const rankModal = document.getElementById('rank-modal');
    const rankContent = document.getElementById('rank-content');
    
    if (!rankModal || !rankContent) return;
    
    let fishOptions = '';
    gameData.backpack.forEach((fish, index) => {
        fishOptions += `
            <div onclick="window.selectFishForBattle(${index}, ${opponent.fish.price})" 
                 style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin: 5px; cursor: pointer; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(255,215,0,0.3);">
                <span style="font-size: 2rem;">${fish.emoji}</span>
                <div style="flex: 1;">
                    <div style="color: white; font-weight: bold;">${fish.name}</div>
                    <div style="color: #FFD700;">💰 ${fish.price} koin</div>
                    <div style="color: ${fish.rarity === 'basic' ? '#87CEEB' : fish.rarity === 'legendary' ? '#FFD700' : fish.rarity === 'mythical' ? '#FF69B4' : fish.rarity === 'secret' ? '#00FFFF' : '#FF00FF'}; font-size: 0.8rem;">${fish.rarity}</div>
                </div>
            </div>
        `;
    });
    
    rankContent.innerHTML = `
        <div style="padding: 20px;">
            <h3 style="color: #FFD700; text-align: center; margin-bottom: 20px;">🎣 Pilih Ikan untuk Bertarung!</h3>
            <p style="color: #ccc; text-align: center; margin-bottom: 20px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
                <strong>Lawan:</strong> ${opponent.name} ${opponent.fish.emoji} (💰 ${opponent.fish.price} koin)
            </p>
            <div style="max-height: 300px; overflow-y: auto; margin: 15px 0; padding: 5px;">
                ${fishOptions}
            </div>
            <button onclick="document.getElementById('rank-modal').style.display='none'" 
                    style="width: 100%; margin-top: 20px; padding: 10px; background: #666; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">
                ❌ BATAL
            </button>
        </div>
    `;
    
    rankModal.style.display = 'block';
    window.currentOpponent = opponent;
}

// ==================== SELECT FISH FOR BATTLE ====================
export function selectFishForBattle(fishIndex, opponentPrice) {
    const rankModal = document.getElementById('rank-modal');
    const fish = gameData.backpack[fishIndex];
    
    if (!fish) {
        showNotification("❌ Ikan tidak ditemukan!", "error");
        rankModal.style.display = 'none';
        return;
    }
    
    let fishPrice = Number(fish.price);
    if (hasActivePet(8)) {
        fishPrice = Math.floor(fishPrice * 1.1);
        showNotification("🦖 T-Rex: +10% kekuatan!", "success");
    }
    
    const priceDifference = fishPrice - Number(opponentPrice);
    let winChance = 50 + (priceDifference / 50);
    winChance = Math.min(Math.max(winChance, 10), 95);
    
    const isWin = Math.random() * 100 < winChance;
    
    if (!isWin) {
        gameData.backpack.splice(fishIndex, 1);
    }
    
    rankModal.style.display = 'none';
    processBattleResult(isWin, fish, winChance);
}

// ==================== PROCESS BATTLE RESULT ====================
export function processBattleResult(isWin, fish, winChance) {
    const currentRank = gameData.rank.current;
    const rankInfo = rankData[currentRank];
    
    gameData.rank.totalBattles = Number(gameData.rank.totalBattles) + 1;
    
    if (isWin) {
        gameData.rank.wins = Number(gameData.rank.wins) + 1;
        gameData.diamonds = Number(gameData.diamonds) + Number(rankInfo.winReward.diamonds);
        gameData.rank.exp = Number(gameData.rank.exp) + Number(rankInfo.winReward.exp);
        
        if (currentRank !== "Immortal" && Number(gameData.rank.exp) >= Number(rankInfo.maxExp)) {
            gameData.rank.exp = Number(gameData.rank.exp) - Number(rankInfo.maxExp);
            const oldRank = gameData.rank.current;
            gameData.rank.current = rankInfo.nextRank;
            gameData.rank.highestRank = gameData.rank.current;
            showNotification(`🏆 SELAMAT! Rank naik dari ${oldRank} ke ${gameData.rank.current}!`, "success");
        }
        
        const streakBonus = Math.floor(Number(gameData.rank.wins) / 10) * 0.1;
        const bonusDiamonds = Math.floor(Number(rankInfo.winReward.diamonds) * streakBonus);
        gameData.diamonds = Number(gameData.diamonds) + bonusDiamonds;
        
        showNotification(`🎉 MENANG! +${Number(rankInfo.winReward.diamonds) + bonusDiamonds} 💎 (termasuk bonus streak)`, "success");
        showNotification(`✅ Ikan ${fish.emoji} ${fish.name} kembali dengan selamat! (+${rankInfo.winReward.exp} EXP Rank)`, "success");
        
        updateLeaderboardPosition();
        
    } else {
        gameData.rank.losses = Number(gameData.rank.losses) + 1;
        gameData.rank.exp = Math.max(0, Number(gameData.rank.exp) - Number(rankInfo.lossPenalty.exp));
        
        showNotification(`😢 KALAH! Rank EXP -${rankInfo.lossPenalty.exp}`, "error");
        showNotification(`❌ Ikan ${fish.emoji} ${fish.name} hilang dalam pertarungan!`, "error");
    }
    
    updateUI();
    loadBackpack();
    loadRankBattle();
    loadSellItems();
}

// ==================== UPDATE LEADERBOARD POSITION ====================
export function updateLeaderboardPosition() {
    const playerExp = Number(gameData.rank.exp);
    let position = 0;
    
    if (playerExp > leaderboardNPCs[4].exp) {
        position = 5;
        for (let i = 4; i >= 0; i--) {
            if (playerExp > leaderboardNPCs[i].exp) {
                position = i + 1;
            } else {
                break;
            }
        }
    }
    
    gameData.rank.leaderboardPosition = position;
}

// ==================== LOAD RANK BATTLE ====================
export function loadRankBattle() {
    const rankContainer = document.getElementById('rank-battle');
    if (!rankContainer) return;
    
    const currentRank = gameData.rank.current;
    const rankInfo = rankData[currentRank];
    
    updateLeaderboardPosition();
    
    rankContainer.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; margin: 10px;">
            <h2 style="color: #FFD700; text-align: center; margin-bottom: 20px;">⚔️ RANK BATTLE</h2>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 3rem;">${rankInfo.emoji}</div>
                    <h3 style="color: ${rankInfo.color};">${currentRank}</h3>
                </div>
                <div style="text-align: center; flex: 2;">
                    <p style="color: #ccc;">Menang: ${gameData.rank.wins} | Kalah: ${gameData.rank.losses}</p>
                    <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: white;">Rank EXP</span>
                            <span style="color: #4CAF50;">${gameData.rank.exp}${rankInfo.maxExp !== Infinity ? `/${rankInfo.maxExp}` : ''}</span>
                        </div>
                        ${rankInfo.maxExp !== Infinity ? `
                        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${(Number(gameData.rank.exp)/Number(rankInfo.maxExp))*100}%; height: 100%; background: linear-gradient(to right, ${rankInfo.color}, #FFD700);"></div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="flex: 1; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; text-align: center;">
                    <p style="color: #FF6B6B;">Biaya Masuk</p>
                    <p style="color: #FFD700; font-size: 1.5rem;">${rankInfo.entryFee} 🪙</p>
                </div>
                <div style="flex: 1; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; text-align: center;">
                    <p style="color: #4CAF50;">Hadiah Menang</p>
                    <p style="color: #00ffff;">${rankInfo.winReward.diamonds} 💎 +${rankInfo.winReward.exp} EXP</p>
                </div>
            </div>
            
            <button onclick="window.startRankBattle()" class="rank-battle-btn" style="width: 100%; padding: 12px; background: #FF6B6B; border: none; border-radius: 25px; color: white; font-weight: bold; font-size: 1.2rem; cursor: pointer;">
                ⚔️ CARI LAWAN (${rankInfo.entryFee} Koin)
            </button>
            
            <div style="margin-top: 30px; background: rgba(0,0,0,0.3); border-radius: 10px; padding: 15px;">
                <h3 style="color: #FFD700; text-align: center; margin-bottom: 15px;">🏆 TOP 5 GLOBAL</h3>
                ${generateLeaderboardHTML()}
                <div style="margin-top: 15px; text-align: center; padding: 10px; background: rgba(255,215,0,0.1); border-radius: 8px;">
                    <p style="color: #FFD700;">Posisi kamu: <strong>${gameData.rank.leaderboardPosition > 0 ? `#${gameData.rank.leaderboardPosition}` : 'Tidak masuk leaderboard'}</strong></p>
                </div>
            </div>
        </div>
    `;
}

// ==================== GENERATE LEADERBOARD HTML ====================
export function generateLeaderboardHTML() {
    let html = '<div style="display: flex; flex-direction: column; gap: 8px;">';
    
    let allEntries = [...leaderboardNPCs];
    
    if (gameData.rank.leaderboardPosition > 0) {
        const playerEntry = {
            rank: gameData.rank.leaderboardPosition,
            name: "👤 Kamu",
            rankTitle: gameData.rank.current,
            exp: gameData.rank.exp,
            wins: gameData.rank.wins,
            emoji: "🎣",
            isPlayer: true
        };
        
        allEntries.splice(gameData.rank.leaderboardPosition - 1, 0, playerEntry);
        if (allEntries.length > 5) allEntries.pop();
    }
    
    allEntries.sort((a, b) => Number(b.exp) - Number(a.exp));
    
    allEntries.forEach((entry, index) => {
        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; ${entry.isPlayer ? 'border: 2px solid #FFD700;' : ''}">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.2rem; min-width: 30px;">${index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index+1}.`}</span>
                    <span style="font-size: 1.5rem;">${entry.emoji || '🎣'}</span>
                    <div>
                        <div style="font-weight: bold; color: ${entry.isPlayer ? '#FFD700' : 'white'};">${entry.name}</div>
                        <div style="font-size: 0.8rem; color: ${rankData[entry.rankTitle]?.color || '#ccc'};">${entry.rankTitle}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: #FFD700;">${Number(entry.exp).toLocaleString()} EXP</div>
                    <div style="font-size: 0.8rem; color: #ccc;">${entry.wins} wins</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}
