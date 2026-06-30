// ==================== UI.JS ====================
import { 
    gameData, 
    fishingSpots, 
    rods, 
    baits, 
    potions,
    depthGear,
    depthLevels,
    weather,
    pets,
    gachaRods,
    mysteryBoxes,
    cryptoGacha,
    illuvatarGacha,
    secretFishPool,
    skillTree,
    gamepassLevels,
    rankData,
    exchangeRecipes,
    miningTools,
    miningSkillTree,
    getVillageUpgrades,
    currentSpot,
    currentDepth,
    isFishing,
    currentPullHandler,
    autoSellSettings,
    caughtSecretSpots
} from './data.js';

import {
    startFishing,
    finishFishing,
    getRandomFish,
    calculateTotalLuck,
    getActivePets,
    hasActivePet,
    addToAquarium,
    loadBackpack,
    loadSellItems,
    sellSelectedFish,
    sellAllFish,
    toggleFavoriteFish,
    updateQuestProgress,
    completeQuest,
    showFishingResult,
    showAutoSellNotification,
    setFishingDomElements,
    setNotificationFunction,
    setUIFunctions
} from './fishing.js';

import {
    checkDungeonUnlock,
    checkMiningUnlock,
    switchToDungeon,
    switchToMining,
    switchToMain,
    switchToMainFromMining,
    loadDungeonCharacter,
    loadDungeonShop,
    loadDungeonLevels,
    loadTokenExchange,
    updateDungeonStats,
    selectDungeonFish,
    buyDungeonWeapon,
    buyDungeonArmor,
    enterDungeonLevel,
    playerAttack,
    fleeBattle,
    startRankBattle,
    selectFishForBattle,
    loadRankBattle,
    startMining,
    buyMiningTool,
    equipMiningTool,
    upgradeMiningSkill,
    exchangeMiningItems
} from './systems.js';

// ==================== DOM ELEMENTS ====================
let coinsElement, diamondsElement, expElement, levelElement, fishBtn, gachaBtn;
let backpackItems, shopItems, sellItems, sellTotal, sellBtn, sellAllBtn;
let resultModal, gachaModal, exchangeModal, rankModal, dungeonModal, battleModal, miningModal, miningResultModal;
let resultTitle, resultContent, gachaTitle, gachaContent, miningResultContent;
let minigameIndicator, miningMinigameIndicator;

// ==================== SHOW NOTIFICATION ====================
export function showNotification(message, type = "info") {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.log(`[${type}] ${message}`);
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.background = type === 'success' ? '#4CAF50' : type === 'error' ? '#FF6B6B' : '#2196F3';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.margin = '10px';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    notification.style.animation = 'slideIn 0.3s ease';
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (container.contains(notification)) container.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== UPDATE UI ====================
export function updateUI() {
    if (coinsElement) coinsElement.textContent = gameData.coins;
    if (diamondsElement) diamondsElement.textContent = gameData.diamonds;
    if (levelElement) levelElement.textContent = gameData.level;
    if (expElement) expElement.textContent = `${gameData.exp}/${gameData.level * 100}`;
    
    if (gachaBtn) gachaBtn.disabled = Number(gameData.coins) < 500;
    
    updateWeatherDisplay();
    updateLuckDisplay();
}

// ==================== UPDATE WEATHER DISPLAY ====================
export function updateWeatherDisplay() {
    const weatherDisplay = document.getElementById('weather-display');
    if (!weatherDisplay) return;
    const currentWeather = weather.effects[weather.current];
    weatherDisplay.innerHTML = `${currentWeather.icon} ${currentWeather.text}`;
    weatherDisplay.style.color = currentWeather.color;
}

// ==================== UPDATE LUCK DISPLAY ====================
export function updateLuckDisplay() {
    const luckDisplay = document.getElementById('luck-display');
    if (!luckDisplay) return;
    
    const totalLuck = calculateTotalLuck();
    const activePets = getActivePets();
    const currentDepthData = depthLevels[currentDepth];
    const currentWeather = weather.effects[weather.current];
    
    let petBonusText = '';
    if (activePets.length > 0) {
        petBonusText = activePets.map(pet => {
            if (pet.effect.type === 'perfect_chance') return '🐓 Perfect Catch';
            if (pet.effect.type === 'auto_fish') return '🤖 Auto-fish';
            if (pet.effect.type === 'double_chance') return '🦨 Double Chance';
            if (pet.effect.type === 'gacha_multiplier') return '🦄 2x Gacha Luck';
            if (pet.effect.type === 'rank_bonus') return '🦖 +10% Rank';
            return pet.description;
        }).join(', ');
    }
    
    luckDisplay.innerHTML = `
        <div style="text-align: center; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px; margin: 15px 0;">
            <h4 style="color: #FFD700; margin-bottom: 10px;">🎯 Total Luck: ${totalLuck.toFixed(1)}x</h4>
            <div style="font-size: 0.9rem; text-align: left;">
                <div>🎣 Rod: ${rods.find(r => r.id === gameData.currentRod)?.name || 'Unknown'} (${rods.find(r => r.id === gameData.currentRod)?.luck || 1}x)</div>
                <div>🪱 Bait: ${baits.find(b => b.id === gameData.currentBait)?.name || 'Unknown'} (${baits.find(b => b.id === gameData.currentBait)?.luck || 1}x)</div>
                <div>🏠 Hut: +${gameData.village.hutLevel * 10}%</div>
                ${activePets.length > 0 ? `<div>🐕 Pet(s): ${petBonusText}</div>` : ''}
                <div>🍀 Lucky Skill: +${gameData.skills.lucky.level * 100}%</div>
                ${gameData.skills.expert ? `<div>📚 Expert Skill: +${gameData.skills.expert.level * 10} EXP Gamepass</div>` : ''}
                ${gameData.skills.penawar ? `<div>💰 Penawar Skill: +${gameData.skills.penawar.level * 10}% Harga Jual</div>` : ''}
                ${gameData.activePotions.length > 0 ? 
                    `<div>🧪 Potion: ${gameData.activePotions[0].name} (${gameData.activePotions[0].multiplier}x)</div>` : ''}
                <div>🌤️ Weather: ${currentWeather.text} (${currentWeather.luck}x)</div>
                <div>📍 Depth: ${currentDepthData.name} (${currentDepthData.luckMultiplier}x luck)</div>
            </div>
        </div>
    `;
}

// ==================== CREATE SPOT BUTTONS ====================
export function createSpotButtons() {
    const spotContainer = document.getElementById('spot-buttons');
    if (!spotContainer) return;
    
    spotContainer.innerHTML = '';
    
    fishingSpots.forEach(spot => {
        const spotBtn = document.createElement('button');
        spotBtn.className = 'spot-btn';
        spotBtn.setAttribute('data-spot', spot.id);
        spotBtn.textContent = spot.name;
        spotBtn.style.background = spot.id === currentSpot ? '#FFD700' : spot.color;
        spotBtn.style.color = spot.id === currentSpot ? '#000' : '#fff';
        spotBtn.style.padding = '8px 16px';
        spotBtn.style.border = 'none';
        spotBtn.style.borderRadius = '20px';
        spotBtn.style.margin = '5px';
        spotBtn.style.cursor = 'pointer';
        spotBtn.style.fontWeight = 'bold';
        
        if (spot.id === 7) {
            spotBtn.style.animation = 'pulse 2s infinite';
            spotBtn.style.boxShadow = '0 0 15px #00ffff';
        }
        if (spot.id === 8) {
            spotBtn.style.animation = 'valinorPulse 2s infinite';
            spotBtn.style.boxShadow = '0 0 15px #FFD700';
        }
        
        spotBtn.addEventListener('click', () => switchFishingSpot(spot.id));
        spotContainer.appendChild(spotBtn);
    });
}

// ==================== SWITCH FISHING SPOT ====================
export function switchFishingSpot(spotId) {
    currentSpot = spotId;
    const spot = fishingSpots[spotId];
    
    document.body.style.background = spot.background;
    updateSpotButtons();
    updateSpotDisplay();
    createFishAnimation();
    
    if (spotId === 8 && !hasActivePet(7)) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'unicorn-warning';
        warningDiv.textContent = "⚠️ Tanpa Unicorn, kamu tidak akan dapat ikan secret/special di Valinor!";
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !document.querySelector('.unicorn-warning')) {
            mainContent.prepend(warningDiv);
            setTimeout(() => {
                if (warningDiv.parentNode) warningDiv.remove();
            }, 5000);
        }
    }
    
    showNotification(`🎣 Pindah ke ${spot.name}`, "success");
}

// ==================== UPDATE SPOT BUTTONS ====================
export function updateSpotButtons() {
    const spotButtons = document.querySelectorAll('.spot-btn');
    spotButtons.forEach(btn => {
        const spotId = parseInt(btn.getAttribute('data-spot'));
        if (spotId === currentSpot) {
            btn.style.background = '#FFD700';
            btn.style.color = '#000';
        } else {
            btn.style.background = fishingSpots[spotId].color;
            btn.style.color = '#fff';
        }
    });
}

// ==================== UPDATE SPOT DISPLAY ====================
export function updateSpotDisplay() {
    const spotDisplay = document.getElementById('spot-display');
    if (!spotDisplay) return;
    const spot = fishingSpots[currentSpot];
    spotDisplay.innerHTML = `<span style="color: white; font-weight: bold;">📍 ${spot.name}</span>`;
}

// ==================== CREATE DEPTH BUTTONS ====================
export function createDepthButtons() {
    const depthContainer = document.getElementById('depth-buttons');
    if (!depthContainer) return;
    
    depthContainer.innerHTML = '';
    
    Object.entries(depthLevels).forEach(([key, depth]) => {
        const depthBtn = document.createElement('button');
        depthBtn.className = 'depth-btn';
        depthBtn.setAttribute('data-depth', key);
        depthBtn.textContent = `${depth.icon} ${depth.name}`;
        
        const hasRequiredGear = checkDepthGear(key);
        
        if (!hasRequiredGear && depth.requiredGear) {
            depthBtn.classList.add('locked');
            depthBtn.title = `🔒 ${depth.description}`;
        }
        
        if (key === currentDepth) {
            depthBtn.classList.add('active');
        }
        
        depthBtn.addEventListener('click', () => switchDepth(key));
        depthContainer.appendChild(depthBtn);
    });
}

// ==================== CHECK DEPTH GEAR ====================
export function checkDepthGear(depthKey) {
    const depth = depthLevels[depthKey];
    if (!depth.requiredGear) return true;
    
    return depth.requiredGear.some(gearId => gameData.depthGear[gearId] === true);
}

// ==================== SWITCH DEPTH ====================
export function switchDepth(depthKey) {
    const depth = depthLevels[depthKey];
    
    if (!checkDepthGear(depthKey)) {
        showNotification(`🔒 ${depth.description}`, "error");
        return;
    }
    
    currentDepth = depthKey;
    createDepthButtons();
    updateLuckDisplay();
    showNotification(`📍 Pindah ke kedalaman ${depth.name}`, "success");
}

// ==================== CREATE FISH ANIMATION ====================
export function createFishAnimation() {
    const fishDisplay = document.getElementById('fish-display');
    if (!fishDisplay) return;
    
    fishDisplay.innerHTML = '';
    const currentSpotData = fishingSpots[currentSpot];
    
    for (let i = 0; i < 8; i++) {
        const fish = document.createElement('div');
        const fishData = currentSpotData.fishes[i % currentSpotData.fishes.length];
        fish.className = `fish`;
        
        let fishColor = '#87CEEB';
        if (fishData.rarity === 'legendary') fishColor = '#FFD700';
        if (fishData.rarity === 'mythical') fishColor = '#FF69B4';
        if (fishData.rarity === 'secret') fishColor = '#00FFFF';
        if (fishData.rarity === 'special') fishColor = '#FF00FF';
        
        fish.style.color = fishColor;
        fish.style.position = 'absolute';
        fish.style.fontSize = '1.5rem';
        
        let fishClass = '';
        if (fishData.id === 800) fishClass = 'fish-angel-dog';
        else if (fishData.id === 801) fishClass = 'fish-swangod';
        else if (fishData.id === 802) fishClass = 'fish-birdfeather';
        else if (fishData.id === 803) fishClass = 'fish-dugong';
        else if (fishData.id === 804) fishClass = 'fish-elvish';
        else if (fishData.id === 805) fishClass = 'fish-butterfly';
        
        fish.className += ` ${fishClass}`;
        
        const top = Math.random() * 150 + 50;
        const delay = Math.random() * 15;
        const speed = 8 + Math.random() * 12;
        
        fish.style.top = `${top}px`;
        fish.style.animation = `swim ${speed}s infinite linear`;
        fish.style.animationDelay = `${delay}s`;
        fish.textContent = fishData.emoji;
        
        fishDisplay.appendChild(fish);
    }
}

// ==================== LOAD SHOP ====================
export function loadShop(category) {
    if (!shopItems) return;
    
    shopItems.innerHTML = '';
    
    let items = [];
    if (category === 'rods') {
        items = rods.filter(rod => {
            if (rod.special) return rod.unlocked;
            if (rod.id === 12) return rod.unlocked || rod.owned;
            if (rod.id === 20) return rod.owned;
            if (rod.id === 14) return rod.unlocked || rod.owned;
            return true;
        });
    }
    else if (category === 'baits') {
        items = baits.filter(bait => {
            if (bait.id === 9) return bait.owned;
            if (bait.id === 10) return bait.unlocked || bait.owned;
            return true;
        });
    }
    else if (category === 'potions') items = potions;
    else if (category === 'upgrades') items = getVillageUpgrades();
    
    if (items.length === 0) {
        shopItems.innerHTML = '<p class="empty-message">Tidak ada item</p>';
        return;
    }
    
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        
        let isOwned = false, canAfford = false, isEquipped = false;
        
        if (category === 'potions') {
            canAfford = Number(gameData.coins) >= Number(item.price);
            isOwned = false;
        } else if (category === 'upgrades') {
            canAfford = Number(gameData.coins) >= Number(item.price);
            isOwned = item.owned || false;
        } else {
            isOwned = item.owned === true;
            if (item.currency === "diamonds") {
                canAfford = Number(gameData.diamonds) >= Number(item.price);
            } else {
                canAfford = Number(gameData.coins) >= Number(item.price);
            }
            isEquipped = category === 'rods' ? item.id === gameData.currentRod : item.id === gameData.currentBait;
        }
        
        let buttonText = 'Beli';
        let isDisabled = false;
        
        if (category === 'potions') {
            buttonText = canAfford ? 'Beli & Pakai' : 'Koin Tidak Cukup';
            isDisabled = !canAfford;
        } else if (category === 'upgrades') {
            buttonText = canAfford ? 'Beli' : 'Koin Tidak Cukup';
            isDisabled = !canAfford || isOwned;
        } else {
            if (isOwned) {
                buttonText = isEquipped ? 'Sedang Digunakan' : 'Gunakan';
                isDisabled = isEquipped;
            } else {
                if (item.special && !item.unlocked) {
                    buttonText = 'Locked (Quest)';
                    isDisabled = true;
                } else if ((item.id === 12 || item.id === 14) && !item.unlocked) {
                    buttonText = 'Locked (Exchange)';
                    isDisabled = true;
                } else if (item.id === 9 && !item.owned) {
                    buttonText = 'Locked (Quest)';
                    isDisabled = true;
                } else if (item.id === 10 && !item.unlocked) {
                    buttonText = 'Locked (Exchange)';
                    isDisabled = true;
                } else if (item.currency === "diamonds") {
                    buttonText = canAfford ? 'Beli (💎)' : 'Diamond Tidak Cukup';
                    isDisabled = !canAfford;
                } else {
                    buttonText = canAfford ? 'Beli' : 'Koin Tidak Cukup';
                    isDisabled = !canAfford;
                }
            }
        }
        
        const emoji = item.emoji || (category === 'rods' ? '🎣' : '🪱');
        const priceDisplay = item.currency === "diamonds" ? `${item.price} 💎` : (item.price > 0 ? `${item.price} 🪙` : (item.id === 0 ? 'Quest/Exchange' : 'Quest'));
        
        itemCard.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin: 5px; text-align: center;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">${emoji}</div>
                <div style="font-weight: bold; color: white; margin-bottom: 5px;">${item.name}</div>
                ${item.luck ? `<div style="color: #00ffff; font-size: 13px;">+${item.luck}x Luck</div>` : ''}
                ${item.multiplier ? `<div style="color: #4CAF50; font-size: 13px;">${item.multiplier}x Boost</div>` : ''}
                ${item.duration ? `<div style="color: #ccc; font-size: 12px;">${item.duration} menit</div>` : ''}
                <div style="color: #FFD700; margin: 10px 0; font-size: 14px;">${priceDisplay}</div>
                <button class="buy-btn" ${isDisabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
        
        const buyBtn = itemCard.querySelector('.buy-btn');
        
        if (category === 'potions' && canAfford) {
            buyBtn.addEventListener('click', () => buyPotion(item));
        } else if (category === 'upgrades' && canAfford && !isOwned) {
            buyBtn.addEventListener('click', () => buyUpgrade(item.type));
        } else if (!isOwned && canAfford && !item.special && item.id !== 12 && item.id !== 14 && item.id !== 9 && item.id !== 10) {
            if (item.currency === "diamonds") {
                buyBtn.addEventListener('click', () => buyRodWithDiamond(item));
            } else {
                buyBtn.addEventListener('click', () => buyItem(item, category));
            }
        } else if (isOwned && !isEquipped && !isDisabled) {
            buyBtn.addEventListener('click', () => equipItem(item, category));
        }
        
        shopItems.appendChild(itemCard);
    });
    
    updateLuckDisplay();
}

// ==================== BUY ITEM ====================
export function buyItem(item, category) {
    if (Number(gameData.coins) < Number(item.price)) {
        showNotification("❌ Koin tidak cukup!", "error");
        return;
    }
    
    gameData.coins = Number(gameData.coins) - Number(item.price);
    item.owned = true;
    
    if (category === 'rods') {
        equipItem(item, category);
    }
    
    showNotification(`✅ Berhasil membeli ${item.name}!`, "success");
    updateUI();
    loadShop(category);
}

// ==================== BUY ROD WITH DIAMOND ====================
export function buyRodWithDiamond(rod) {
    if (Number(gameData.diamonds) < Number(rod.price)) {
        showNotification("❌ Diamond tidak cukup!", "error");
        return;
    }
    
    gameData.diamonds = Number(gameData.diamonds) - Number(rod.price);
    rod.owned = true;
    
    showNotification(`✅ Berhasil membeli ${rod.name}!`, "success");
    updateUI();
    loadShop('rods');
}

// ==================== EQUIP ITEM ====================
export function equipItem(item, category) {
    if (category === 'rods') {
        gameData.currentRod = item.id;
    } else if (category === 'baits') {
        gameData.currentBait = item.id;
    }
    
    showNotification(`🎣 Menggunakan ${item.name}!`, "success");
    loadShop(category);
    updateLuckDisplay();
}

// ==================== BUY POTION ====================
export function buyPotion(potion) {
    if (Number(gameData.coins) < Number(potion.price)) {
        showNotification("❌ Koin tidak cukup!", "error");
        return;
    }
    
    gameData.coins = Number(gameData.coins) - Number(potion.price);
    gameData.activePotions.push({ ...potion, startTime: Date.now() });
    
    showNotification(`🧪 Menggunakan ${potion.name}!`, "success");
    updatePotionDisplay();
    updateUI();
    loadShop('potions');
    updateLuckDisplay();
}

// ==================== BUY UPGRADE ====================
export function buyUpgrade(upgradeType) {
    const upgrades = getVillageUpgrades();
    const upgrade = upgrades.find(u => u.type === upgradeType);
    
    if (!upgrade || Number(gameData.coins) < Number(upgrade.price)) {
        showNotification("❌ Koin tidak cukup!", "error");
        return;
    }
    
    gameData.coins = Number(gameData.coins) - Number(upgrade.price);
    
    switch(upgradeType) {
        case 'hut':
            gameData.village.hutLevel = Number(gameData.village.hutLevel) + 1;
            showNotification(`🏠 Fishing Hut upgraded to level ${gameData.village.hutLevel}!`, "success");
            break;
        case 'assistant':
            if (gameData.village.assistants < 3) {
                gameData.village.assistants = Number(gameData.village.assistants) + 1;
                showNotification(`👥 Assistant hired! Total: ${gameData.village.assistants}`, "success");
            }
            break;
    }
    
    updateUI();
    loadShop('upgrades');
    loadVillage();
    updateLuckDisplay();
}

// ==================== UPDATE POTION DISPLAY ====================
export function updatePotionDisplay() {
    const activeEffects = document.getElementById('active-effects');
    if (!activeEffects) return;
    
    activeEffects.innerHTML = '';
    gameData.activePotions.forEach(potion => {
        const effectItem = document.createElement('div');
        effectItem.className = 'effect-item';
        effectItem.style.background = 'rgba(255,215,0,0.3)';
        effectItem.style.padding = '8px 15px';
        effectItem.style.borderRadius = '15px';
        effectItem.style.margin = '5px';
        effectItem.style.display = 'flex';
        effectItem.style.justifyContent = 'space-between';
        effectItem.style.border = '1px solid gold';
        effectItem.innerHTML = `<div>${potion.emoji} ${potion.name}</div><div>${potion.duration}m</div>`;
        activeEffects.appendChild(effectItem);
    });
}

// ==================== LOAD VILLAGE ====================
export function loadVillage() {
    const assistantCount = document.getElementById('assistant-count');
    const hutLevel = document.getElementById('hut-level');
    
    if (assistantCount) assistantCount.textContent = gameData.village.assistants;
    if (hutLevel) hutLevel.textContent = gameData.village.hutLevel;
}

// ==================== LOAD DEPTH GEAR SHOP ====================
export function loadDepthGearShop() {
    const gearContainer = document.getElementById('depth-gear-items');
    if (!gearContainer) return;
    
    gearContainer.innerHTML = '';
    
    depthGear.forEach(gear => {
        const isOwned = gameData.depthGear[gear.id] === true;
        const canAfford = gear.currency === "coins" ? 
            Number(gameData.coins) >= Number(gear.price) : 
            Number(gameData.diamonds) >= Number(gear.price);
        
        const gearCard = document.createElement('div');
        gearCard.className = 'item-card';
        
        const isGhostShip = gear.id === "ghostShip";
        const isCrown = gear.id === "crownOfSilmarillion";
        const isMinerHelm = gear.id === "minerHelm";
        
        gearCard.innerHTML = `
            <div style="background: ${isGhostShip ? 'rgba(128,0,128,0.3)' : isCrown ? 'rgba(255,215,0,0.3)' : isMinerHelm ? 'rgba(139,69,19,0.3)' : 'rgba(255,255,255,0.05)'}; 
                        padding: 15px; border-radius: 8px; margin: 5px; text-align: center;
                        ${isGhostShip ? 'border: 2px solid #9400D3;' : isCrown ? 'border: 2px solid #FFD700;' : isMinerHelm ? 'border: 2px solid #8B4513;' : ''}">
                <div style="font-size: 3rem; margin-bottom: 10px;">${gear.emoji}</div>
                <div style="font-weight: bold; color: ${isGhostShip ? '#FF00FF' : isCrown ? '#FFD700' : isMinerHelm ? '#D2691E' : 'white'}; margin-bottom: 5px;">${gear.name}</div>
                <p style="color: #ccc; font-size: 0.9rem; margin-bottom: 10px;">${gear.description}</p>
                ${isGhostShip ? '<p style="color: #FFD700; font-size: 0.8rem;">✨ WAJIB untuk buka dungeon!</p>' : ''}
                ${isCrown ? '<p style="color: #FFD700; font-size: 0.8rem;">👑 WAJIB untuk buka Valinor!</p>' : ''}
                ${isMinerHelm ? '<p style="color: #FFD700; font-size: 0.8rem;">⛏️ WAJIB untuk buka Mining!</p>' : ''}
                <div style="color: ${gear.currency === 'diamonds' ? '#00ffff' : '#FFD700'}; margin: 10px 0;">
                    ${gear.price} ${gear.currency === 'diamonds' ? '💎' : '🪙'}
                </div>
                ${isOwned ? 
                    `<button class="owned-btn" disabled style="width: 100%; padding: 8px; background: #4CAF50; border: none; border-radius: 6px; color: white;">✓ DIMILIKI</button>` :
                    `<button class="buy-gear-btn" ${!canAfford ? 'disabled' : ''} 
                            data-gear-id="${gear.id}"
                            style="width: 100%; padding: 8px; background: ${canAfford ? '#4CAF50' : '#666'}; border: none; border-radius: 6px; color: white; cursor: ${canAfford ? 'pointer' : 'not-allowed'};">
                        ${canAfford ? '🛒 BELI' : '❌ TIDAK CUKUP'}
                    </button>`
                }
            </div>
        `;
        
        const buyBtn = gearCard.querySelector('.buy-gear-btn');
        if (buyBtn && !isOwned && canAfford) {
            buyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                buyDepthGear(gear);
            });
        }
        
        gearContainer.appendChild(gearCard);
    });
}

// ==================== BUY DEPTH GEAR ====================
export function buyDepthGear(gear) {
    if (!gear) return;
    
    let cost = Number(gear.price);
    let currentCoins = Number(gameData.coins);
    let currentDiamonds = Number(gameData.diamonds);
    
    if (gear.currency === "coins") {
        if (currentCoins >= cost) {
            gameData.coins = currentCoins - cost;
        } else {
            showNotification("❌ Koin tidak cukup!", "error");
            return;
        }
    } else if (gear.currency === "diamonds") {
        if (currentDiamonds >= cost) {
            gameData.diamonds = currentDiamonds - cost;
        } else {
            showNotification("❌ Diamond tidak cukup!", "error");
            return;
        }
    } else {
        showNotification("❌ Currency tidak valid!", "error");
        return;
    }
    
    gameData.depthGear[gear.id] = true;
    showNotification(`✅ Berhasil membeli ${gear.name}!`, "success");
    
    updateUI();
    loadDepthGearShop();
    createDepthButtons();
    checkDungeonUnlock();
    checkMiningUnlock();
    
    if (gear.id === "ghostShip") {
        showNotification("👻 Ghost Ship didapatkan! Sekarang cari One Ring di Exchange!", "success");
    }
    if (gear.id === "crownOfSilmarillion") {
        showNotification("👑 Crown of Silmarillion didapatkan! Sekarang cari Unicorn untuk memancing di Valinor!", "success");
    }
    if (gear.id === "minerHelm") {
        showNotification("🪖 Miner Helm didapatkan! Sekarang cari Flashlight di Exchange untuk buka Mining!", "success");
    }
}

// ==================== LOAD PET SHOP ====================
export function loadPetShop() {
    const petContainer = document.getElementById('pet-shop-items');
    if (!petContainer) return;
    
    petContainer.innerHTML = '';
    
    pets.forEach(pet => {
        const isOwned = gameData.pets.owned.includes(pet.id);
        const isActive = hasActivePet(pet.id);
        const canAfford = pet.currency === "coins" ? 
            Number(gameData.coins) >= Number(pet.price) : 
            Number(gameData.diamonds) >= Number(pet.price);
        
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        petCard.setAttribute('data-pet', pet.id === 5 ? 'robot' : pet.id === 6 ? 'racoon' : pet.id === 7 ? 'unicorn' : pet.id === 8 ? 'trex' : '');
        
        petCard.innerHTML = `
            <div style="text-align: center; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">${pet.emoji}</div>
                <h3 style="color: white; margin-bottom: 5px;">${pet.name}</h3>
                <p style="color: #ccc; font-size: 0.9rem; margin-bottom: 10px;">${pet.description}</p>
                <p style="color: ${pet.currency === 'diamonds' ? '#00ffff' : '#ffd700'}; margin-bottom: 15px;">
                    ${pet.price} ${pet.currency === 'diamonds' ? '💎' : '🪙'}
                </p>
                ${isOwned ? 
                    `<button class="pet-activate-btn" ${isActive ? 'disabled' : ''}
                            style="width: 100%; padding: 8px; background: ${isActive ? '#666' : '#4CAF50'}; border: none; border-radius: 6px; color: white; cursor: ${isActive ? 'not-allowed' : 'pointer'};">
                        ${isActive ? '✓ ACTIVE' : '🔓 ACTIVATE'}
                    </button>` :
                    `<button class="pet-buy-btn" ${!canAfford ? 'disabled' : ''}
                            style="width: 100%; padding: 8px; background: ${canAfford ? '#4CAF50' : '#666'}; border: none; border-radius: 6px; color: white; cursor: ${canAfford ? 'pointer' : 'not-allowed'};">
                        ${canAfford ? '🛒 BELI' : '❌ TIDAK CUKUP'}
                    </button>`
                }
            </div>
        `;
        
        const btn = petCard.querySelector('.pet-buy-btn, .pet-activate-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (isOwned) {
                    activatePet(pet.id);
                } else if (canAfford) {
                    buyPet(pet);
                }
            });
        }
        
        petContainer.appendChild(petCard);
    });
}

// ==================== BUY PET ====================
export function buyPet(pet) {
    if (pet.currency === "coins") {
        if (Number(gameData.coins) >= Number(pet.price)) {
            gameData.coins = Number(gameData.coins) - Number(pet.price);
        } else {
            showNotification("❌ Koin tidak cukup!", "error");
            return;
        }
    } else if (pet.currency === "diamonds") {
        if (Number(gameData.diamonds) >= Number(pet.price)) {
            gameData.diamonds = Number(gameData.diamonds) - Number(pet.price);
        } else {
            showNotification("❌ Diamond tidak cukup!", "error");
            return;
        }
    } else {
        showNotification("❌ Tidak cukup resources!", "error");
        return;
    }
    
    gameData.pets.owned.push(pet.id);
    showNotification(`✅ Berhasil membeli ${pet.name}!`, "success");
    updateUI();
    loadPetShop();
}

// ==================== ACTIVATE PET ====================
export function activatePet(petId) {
    const slots = gameData.skills.animalLovers?.unlocked ? 2 : 1;
    
    if (!Array.isArray(gameData.pets.active)) {
        if (gameData.pets.active) {
            gameData.pets.active = [gameData.pets.active];
        } else {
            gameData.pets.active = [];
        }
    }
    
    if (gameData.pets.active.includes(petId)) {
        gameData.pets.active = gameData.pets.active.filter(id => id !== petId);
        showNotification(`❌ ${pets.find(p => p.id === petId).name} dinonaktifkan!`, "info");
    } else {
        if (gameData.pets.active.length >= slots) {
            showNotification(`❌ Slot pet penuh! (max ${slots})`, "error");
            return;
        }
        gameData.pets.active.push(petId);
        showNotification(`✨ ${pets.find(p => p.id === petId).name} aktif!`, "success");
    }
    
    loadPetShop();
    updateLuckDisplay();
}

// ==================== LOAD SKILL TREE ====================
export function loadSkillTree() {
    const skillContainer = document.getElementById('skill-tree');
    if (!skillContainer) return;
    
    skillContainer.innerHTML = '';
    skillContainer.style.display = 'flex';
    skillContainer.style.flexWrap = 'wrap';
    skillContainer.style.justifyContent = 'center';
    
    const luckySkill = createSkillCard('lucky', skillTree.lucky);
    const castSkill = createSkillCard('cast', skillTree.cast);
    const expertSkill = createSkillCard('expert', skillTree.expert);
    const penawarSkill = createSkillCard('penawar', skillTree.penawar);
    const animalLoversSkill = createSkillCard('animalLovers', skillTree.animalLovers);
    
    skillContainer.appendChild(luckySkill);
    skillContainer.appendChild(castSkill);
    skillContainer.appendChild(expertSkill);
    skillContainer.appendChild(penawarSkill);
    skillContainer.appendChild(animalLoversSkill);
}

// ==================== CREATE SKILL CARD ====================
export function createSkillCard(skillKey, skillData) {
    let currentLevel, isUnlocked;
    
    if (skillKey === 'animalLovers') {
        isUnlocked = gameData.skills.animalLovers?.unlocked || false;
        currentLevel = isUnlocked ? 1 : 0;
    } else {
        currentLevel = gameData.skills[skillKey]?.level || 0;
    }
    
    const maxLevel = skillData.maxLevel;
    const nextPrice = skillData.currency === 'diamonds' ? 
        skillData.basePrice : 
        Math.floor(Number(skillData.basePrice) * Math.pow(Number(skillData.priceMultiplier || 1), currentLevel));
    
    const canUpgrade = currentLevel < maxLevel && (
        skillData.currency === 'diamonds' ? 
            Number(gameData.diamonds) >= nextPrice : 
            Number(gameData.coins) >= nextPrice
    );
    
    let bonusText = '';
    if (skillKey === 'lucky') bonusText = `+${currentLevel * 100}% Luck`;
    else if (skillKey === 'cast') bonusText = `+${currentLevel * 5}% Double Chance`;
    else if (skillKey === 'expert') bonusText = `+${currentLevel * 10} EXP Gamepass`;
    else if (skillKey === 'penawar') bonusText = `+${currentLevel * 10}% Harga Jual`;
    else if (skillKey === 'animalLovers') bonusText = isUnlocked ? '2 Pet Slots' : '1 Pet Slot';
    
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.setAttribute('data-skill', skillKey);
    
    card.innerHTML = `
        <div style="text-align: center; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; width: 250px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">${skillData.emoji}</div>
            <h3 style="color: #FFD700; margin-bottom: 5px;">${skillData.name}</h3>
            <p style="color: #ccc; font-size: 0.9rem; margin-bottom: 15px;">${skillData.description}</p>
            
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #fff;">Level ${currentLevel}/${maxLevel}</span>
                    <span style="color: #4CAF50;">${bonusText}</span>
                </div>
                ${skillKey !== 'animalLovers' ? `
                <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${(currentLevel/maxLevel)*100}%; height: 100%; background: linear-gradient(to right, #4CAF50, #8BC34A);"></div>
                </div>
                ` : ''}
            </div>
            
            ${currentLevel < maxLevel ? `
                <p style="color: ${skillData.currency === 'diamonds' ? '#00ffff' : '#FFD700'}; margin-bottom: 10px;">
                    Harga: ${nextPrice} ${skillData.currency === 'diamonds' ? '💎' : '🪙'}
                </p>
                <button class="upgrade-skill-btn" ${!canUpgrade ? 'disabled' : ''}
                        style="width: 100%; padding: 8px; background: ${canUpgrade ? '#4CAF50' : '#666'}; border: none; border-radius: 6px; color: white; cursor: ${canUpgrade ? 'pointer' : 'not-allowed'};">
                    ${canUpgrade ? '⬆️ UPGRADE' : '❌ TIDAK CUKUP'}
                </button>
            ` : '<p style="color: gold;">✨ MAX LEVEL</p>'}
        </div>
    `;
    
    const upgradeBtn = card.querySelector('.upgrade-skill-btn');
    if (upgradeBtn && canUpgrade) {
        upgradeBtn.addEventListener('click', () => upgradeSkill(skillKey, nextPrice, skillData.currency));
    }
    
    return card;
}

// ==================== UPGRADE SKILL ====================
export function upgradeSkill(skillKey, price, currency = 'coins') {
    if (currency === 'diamonds') {
        if (Number(gameData.diamonds) < price) {
            showNotification("❌ Diamond tidak cukup!", "error");
            return;
        }
        gameData.diamonds = Number(gameData.diamonds) - price;
    } else {
        if (Number(gameData.coins) < price) {
            showNotification("❌ Koin tidak cukup!", "error");
            return;
        }
        gameData.coins = Number(gameData.coins) - price;
    }
    
    if (skillKey === 'animalLovers') {
        gameData.skills.animalLovers = { unlocked: true };
        showNotification(`✅ Animal Lovers unlocked! Sekarang bisa pakai 2 pet!`, "success");
        
        if (!Array.isArray(gameData.pets.active)) {
            if (gameData.pets.active) {
                gameData.pets.active = [gameData.pets.active];
            } else {
                gameData.pets.active = [];
            }
        }
    } else {
        gameData.skills[skillKey].level = (gameData.skills[skillKey]?.level || 0) + 1;
        showNotification(`✅ ${skillKey === 'lucky' ? 'Lucky' : skillKey === 'cast' ? 'Cast' : skillKey === 'expert' ? 'Expert' : 'Penawar'} Skill naik ke level ${gameData.skills[skillKey].level}!`, "success");
    }
    
    updateUI();
    loadSkillTree();
    updateLuckDisplay();
    loadPetShop();
}
