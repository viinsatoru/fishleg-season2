// ==================== FISHING.JS ====================
import { 
    gameData, 
    fishingSpots, 
    rods, 
    baits, 
    depthLevels, 
    weather,
    pets,
    gachaRods,
    quests,
    caughtSecretSpots,
    autoSellSettings,
    currentSpot,
    currentDepth,
    isFishing,
    currentPullHandler,
    getAllFishes,
    getVillageUpgrades
} from './data.js';

// ==================== DOM ELEMENTS (akan di-set dari UI) ====================
let coinsElement, diamondsElement, expElement, levelElement, fishBtn, gachaBtn;
let backpackItems, shopItems, sellItems, sellTotal, sellBtn, sellAllBtn;
let resultModal, gachaModal, exchangeModal, rankModal, dungeonModal, battleModal, miningModal, miningResultModal;
let resultTitle, resultContent, gachaTitle, gachaContent, miningResultContent;
let minigameIndicator, miningMinigameIndicator;

// ==================== SET DOM ELEMENTS ====================
export function setFishingDomElements(elements) {
    coinsElement = elements.coinsElement;
    diamondsElement = elements.diamondsElement;
    expElement = elements.expElement;
    levelElement = elements.levelElement;
    fishBtn = elements.fishBtn;
    gachaBtn = elements.gachaBtn;
    backpackItems = elements.backpackItems;
    shopItems = elements.shopItems;
    sellItems = elements.sellItems;
    sellTotal = elements.sellTotal;
    sellBtn = elements.sellBtn;
    sellAllBtn = elements.sellAllBtn;
    resultModal = elements.resultModal;
    gachaModal = elements.gachaModal;
    exchangeModal = elements.exchangeModal;
    rankModal = elements.rankModal;
    dungeonModal = elements.dungeonModal;
    battleModal = elements.battleModal;
    miningModal = elements.miningModal;
    miningResultModal = elements.miningResultModal;
    resultTitle = elements.resultTitle;
    resultContent = elements.resultContent;
    gachaTitle = elements.gachaTitle;
    gachaContent = elements.gachaContent;
    miningResultContent = elements.miningResultContent;
    minigameIndicator = elements.minigameIndicator;
    miningMinigameIndicator = elements.miningMinigameIndicator;
}

// ==================== GET ACTIVE PETS ====================
export function getActivePets() {
    const activePets = [];
    const slots = gameData.skills.animalLovers?.unlocked ? 2 : 1;
    
    if (Array.isArray(gameData.pets.active)) {
        for (let i = 0; i < Math.min(slots, gameData.pets.active.length); i++) {
            const petId = gameData.pets.active[i];
            const pet = pets.find(p => p.id === petId);
            if (pet) activePets.push(pet);
        }
    } else if (gameData.pets.active) {
        const pet = pets.find(p => p.id === gameData.pets.active);
        if (pet) activePets.push(pet);
    }
    
    return activePets;
}

export function hasActivePet(petId) {
    const activePets = getActivePets();
    return activePets.some(pet => pet.id === petId);
}

// ==================== CALCULATE TOTAL LUCK ====================
export function calculateTotalLuck() {
    const currentRod = rods.find(r => r.id === gameData.currentRod) || rods[0];
    const currentBait = baits.find(b => b.id === gameData.currentBait) || baits[0];
    const currentDepthData = depthLevels[currentDepth] || depthLevels.surface;
    
    let totalLuck = Number(currentRod.luck) * Number(currentBait.luck);
    
    const equippedGachaRod = gameData.gachaStats.rodsObtained.length > 0 ? 
        Math.max(...gameData.gachaStats.rodsObtained.map(id => 
            gachaRods.find(r => r.id === id)?.luck || 1
        )) : 1;
    totalLuck *= equippedGachaRod;
    
    totalLuck *= (1 + Number(gameData.village.hutLevel) * 0.1);
    
    const activePets = getActivePets();
    for (const pet of activePets) {
        if (pet.effect.type === "luck_multiplier") {
            totalLuck *= Number(pet.effect.value);
        }
    }
    
    totalLuck *= (1 + (Number(gameData.skills.lucky.level) * 100) / 100);
    
    if (gameData.activePotions.length > 0) {
        totalLuck *= Number(gameData.activePotions[0].multiplier);
    }
    
    totalLuck *= weather.effects[weather.current].luck;
    totalLuck *= currentDepthData.luckMultiplier;
    
    return totalLuck;
}

// ==================== GET RANDOM FISH ====================
export function getRandomFish() {
    const currentSpotData = fishingSpots[currentSpot];
    if (!currentSpotData) return fishingSpots[0].fishes[0];
    
    if (currentSpot === 8) {
        if (!gameData.depthGear.crownOfSilmarillion) {
            showNotification("❌ Butuh Crown of Silmarillion untuk memancing di Valinor! Beli di Depth Gear!", "error");
            return null;
        }
        
        if (!hasActivePet(7)) {
            showNotification("⚠️ Tanpa Unicorn, kamu hanya dapat ikan biasa di Valinor!", "info");
        }
    }
    
    if (currentSpot === 6) {
        if (!gameData.depthGear.maskOfSatoshi) {
            showNotification("❌ Butuh Mask of Satoshi untuk memancing di Crypto spot!", "error");
            return null;
        }
    }
    
    if (currentSpot === 7) {
        if (!gameData.depthGear.turtleHat) {
            showNotification("❌ Butuh Turtle Hat untuk memancing di Atlantis!", "error");
            return null;
        }
    }
    
    const currentRod = rods.find(r => r.id === gameData.currentRod) || rods[0];
    const currentBait = baits.find(b => b.id === gameData.currentBait) || baits[0];
    const currentDepthData = depthLevels[currentDepth] || depthLevels.surface;
    
    let totalLuck = Number(currentRod.luck) * Number(currentBait.luck);
    
    const equippedGachaRod = gameData.gachaStats.rodsObtained.length > 0 ? 
        Math.max(...gameData.gachaStats.rodsObtained.map(id => 
            gachaRods.find(r => r.id === id)?.luck || 1
        )) : 1;
    totalLuck *= equippedGachaRod;
    
    totalLuck *= (1 + Number(gameData.village.hutLevel) * 0.1);
    
    const activePets = getActivePets();
    for (const pet of activePets) {
        if (pet.effect.type === "luck_multiplier") {
            totalLuck *= Number(pet.effect.value);
        }
    }
    
    totalLuck *= (1 + (Number(gameData.skills.lucky.level) * 100) / 100);
    
    if (gameData.activePotions.length > 0) {
        totalLuck *= Number(gameData.activePotions[0].multiplier);
    }
    
    totalLuck *= weather.effects[weather.current].luck;
    totalLuck *= currentDepthData.luckMultiplier;
    
    const luckBonus = Math.min(totalLuck, 10);
    
    let availableFishes = [...currentSpotData.fishes];
    if (currentSpot === 8 && !hasActivePet(7)) {
        availableFishes = availableFishes.filter(fish => 
            fish.rarity === 'legendary' || fish.rarity === 'mythical'
        );
    }
    
    const weightedFishes = availableFishes.map(fish => {
        let finalChance = fish.chance;
        
        if (fish.rarity === "basic") {
            finalChance = Math.max(fish.chance / (1 + luckBonus * 0.1 * currentDepthData.rareBonus), 5);
        } 
        else if (fish.rarity === "legendary") {
            finalChance = fish.chance * (1 + luckBonus * 0.3 * currentDepthData.rareBonus);
        }
        else if (fish.rarity === "mythical") {
            finalChance = fish.chance * (1 + luckBonus * 0.5 * currentDepthData.rareBonus);
        }
        else if (fish.rarity === "secret") {
            finalChance = fish.chance * (1 + luckBonus * 0.8 * currentDepthData.rareBonus);
        }
        else if (fish.rarity === "special") {
            finalChance = fish.chance * (1 + luckBonus * 1.5 * currentDepthData.rareBonus);
        }
        
        return { ...fish, finalChance: Math.max(finalChance, 0.1) };
    });
    
    let totalChance = weightedFishes.reduce((sum, fish) => sum + fish.finalChance, 0);
    if (totalChance <= 0) return availableFishes[0];
    
    const random = Math.random() * totalChance;
    let cumulativeChance = 0;
    
    for (const fish of weightedFishes) {
        cumulativeChance += fish.finalChance;
        if (random <= cumulativeChance) {
            return { ...fish };
        }
    }
    
    return { ...availableFishes[0] };
}

// ==================== SHOW NOTIFICATION (Sementara, akan di-override) ====================
let showNotification = (message, type) => {
    console.log(`[${type}] ${message}`);
};

// ==================== SET NOTIFICATION FUNCTION ====================
export function setNotificationFunction(fn) {
    showNotification = fn;
}

// ==================== ADD TO AQUARIUM ====================
export function addToAquarium(fish) {
    const rarity = fish.rarity;
    if (!gameData.aquarium[rarity]) gameData.aquarium[rarity] = {};
    if (!gameData.aquarium[rarity][fish.id]) gameData.aquarium[rarity][fish.id] = 0;
    gameData.aquarium[rarity][fish.id] = Number(gameData.aquarium[rarity][fish.id]) + 1;
}

// ==================== UPDATE QUEST PROGRESS ====================
export function updateQuestProgress(fish) {
    if (fish.id === 606) {
        const quest4 = quests.find(q => q.id === 4);
        if (quest4 && !quest4.completed) {
            quest4.progress = Number(quest4.progress) + 1;
            if (quest4.progress >= quest4.target) {
                quest4.completed = true;
                completeQuest(quest4);
            }
        }
    }
    
    if (fish.rarity === "secret" || fish.rarity === "special") {
        if (fish.spot === "kuil") {
            const quest1 = quests.find(q => q.id === 1);
            if (quest1 && !quest1.completed) {
                quest1.progress = Number(quest1.progress) + 1;
                if (quest1.progress >= quest1.target) {
                    quest1.completed = true;
                    completeQuest(quest1);
                }
            }
        }
        
        if (fish.spot && !caughtSecretSpots[fish.spot]) {
            caughtSecretSpots[fish.spot] = true;
            
            const quest2 = quests.find(q => q.id === 2);
            if (quest2 && !quest2.completed) {
                quest2.progress = Object.values(caughtSecretSpots).filter(Boolean).length;
                if (quest2.progress >= quest2.target) {
                    quest2.completed = true;
                    completeQuest(quest2);
                }
            }
        }
        
        if (fish.spot === "angkasa") {
            const quest3 = quests.find(q => q.id === 3);
            if (quest3 && !quest3.completed) {
                quest3.progress = Number(quest3.progress) + 1;
                if (quest3.progress >= quest3.target) {
                    quest3.completed = true;
                    completeQuest(quest3);
                }
            }
        }
    }
}

// ==================== COMPLETE QUEST ====================
export function completeQuest(quest) {
    showNotification(`🎉 Quest "${quest.name}" selesai! Reward: ${quest.reward}`, "success");
    
    if (quest.reward === "Element Rod") {
        const elementRod = rods.find(r => r.id === 7);
        if (elementRod) {
            elementRod.unlocked = true;
            elementRod.owned = true;
            gameData.currentRod = 7;
            showNotification("🔓 Element Rod unlocked! +120x Luck!", "success");
        }
    } else if (quest.reward === "Trident Rod") {
        const tridentRod = rods.find(r => r.id === 8);
        if (tridentRod) {
            tridentRod.unlocked = true;
            tridentRod.owned = true;
            gameData.currentRod = 8;
            showNotification("🔓 Trident Rod unlocked! +200x Luck!", "success");
        }
    } else if (quest.reward === "1x1x1 Rod") {
        const oneByOneRod = rods.find(r => r.id === 11);
        if (oneByOneRod) {
            oneByOneRod.unlocked = true;
            oneByOneRod.owned = true;
            gameData.currentRod = 11;
            showNotification("🔓 1x1x1 Rod unlocked! +1111x Luck!", "success");
        }
    } else if (quest.reward === "Bitcoin Bait") {
        const bitcoinBait = baits.find(b => b.id === 9);
        if (bitcoinBait) {
            bitcoinBait.owned = true;
            showNotification("🪱 Bitcoin Bait unlocked! +10,000x Luck!", "success");
        }
    }
}

// ==================== SHOW FISHING RESULT ====================
export function showFishingResult(fish, price, perfectCatch = false) {
    if (!resultModal || !resultTitle || !resultContent) return;
    
    resultTitle.textContent = perfectCatch ? "🎯 PERFECT CATCH!" : "Ikan Tertangkap!";
    resultTitle.style.color = perfectCatch ? '#FFD700' : 'white';
    
    let rarityColor = '#87CEEB';
    switch(fish.rarity) {
        case 'legendary': rarityColor = '#FFD700'; break;
        case 'mythical': rarityColor = '#FF69B4'; break;
        case 'secret': rarityColor = '#00FFFF'; break;
        case 'special': rarityColor = '#FF00FF'; break;
    }
    
    let fishClass = '';
    if (fish.id === 800) fishClass = 'fish-angel-dog';
    else if (fish.id === 801) fishClass = 'fish-swangod';
    else if (fish.id === 802) fishClass = 'fish-birdfeather';
    else if (fish.id === 803) fishClass = 'fish-dugong';
    else if (fish.id === 804) fishClass = 'fish-elvish';
    else if (fish.id === 805) fishClass = 'fish-butterfly';
    else if (fish.id === 1000) fishClass = 'illuvatar-result-pengu';
    else if (fish.id === 1001) fishClass = 'illuvatar-result-batfish';
    else if (fish.id === 1002) fishClass = 'illuvatar-result-moyai';
    else if (fish.id === 1003) fishClass = 'illuvatar-result-trex';
    
    resultContent.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 5rem; margin: 20px 0;" class="${fishClass}">${fish.emoji}</div>
            <h3 style="color: ${rarityColor}; margin-bottom: 10px;">${fish.name}</h3>
            <p style="color: #ccc;">Rarity: <span style="color: ${rarityColor}">${fish.rarity.toUpperCase()}</span></p>
            <p style="color: #FFD700; font-size: 1.5rem;">${price} koin</p>
            ${perfectCatch ? '<p style="color: #FFD700;">🎯 Perfect Catch Bonus: +50%</p>' : ''}
            <p style="color: #4CAF50; margin-top: 20px;">✓ Ditambahkan ke backpack!</p>
        </div>
    `;
    
    resultModal.style.display = 'block';
}

// ==================== SHOW AUTO SELL NOTIFICATION ====================
export function showAutoSellNotification(fish, price) {
    showNotification(`💰 Auto-sold: ${fish.emoji} ${fish.name} for ${price} coins`, "info");
}

// ==================== FINISH FISHING ====================
export function finishFishing(fish, perfectCatch = false) {
    isFishing = false;
    
    const hook = document.querySelector('.hook');
    const fishingLine = document.querySelector('.fishing-line');
    
    if (hook && fishingLine) {
        hook.style.top = '150px';
        fishingLine.style.height = '150px';
    }
    
    let priceMultiplier = 1;
    if (perfectCatch) {
        priceMultiplier = 1.5;
        showNotification("🎯 PERFECT CATCH! +50% Bonus", "success");
    }
    
    const finalPrice = Math.floor(Number(fish.price) * priceMultiplier);
    
    let totalCoins = finalPrice;
    const activePets = getActivePets();
    for (const pet of activePets) {
        if (pet.effect.type === "coin_bonus") {
            totalCoins += Number(pet.effect.value);
            showNotification(`💰 Pet bonus: +${pet.effect.value} koin!`, "success");
        }
        if (pet.effect.type === "diamond_chance") {
            if (Math.random() * 100 < Number(pet.effect.value)) {
                gameData.diamonds = Number(gameData.diamonds) + Number(pet.effect.diamond_amount);
                showNotification(`💎 Pet bonus: +${pet.effect.diamond_amount} diamond!`, "success");
            }
        }
    }
    
    gameData.backpack.push({
        ...fish,
        catchTime: Date.now(),
        perfectCatch: perfectCatch,
        finalValue: totalCoins,
        depth: currentDepth,
        uniqueId: Date.now() + Math.random()
    });
    
    gameData.totalFishCaught = Number(gameData.totalFishCaught) + 1;
    
    let expGained = 10;
    if (gameData.skills.expert && gameData.skills.expert.level > 0) {
        const expertBonus = gameData.skills.expert.level * 10;
        expGained += expertBonus;
        showNotification(`📚 Expert Skill: +${expertBonus} EXP Gamepass!`, "info");
    }
    gameData.exp = Number(gameData.exp) + expGained;
    checkLevelUp();
    
    if (gameData.gamepass.owned) {
        for (const pet of activePets) {
            if (pet.effect.type === "exp_bonus") {
                addGamepassExp(pet.effect.value);
            }
        }
    }
    
    if (gameData.skills.cast.level > 0) {
        const doubleChance = Number(gameData.skills.cast.level) * 5;
        if (Math.random() * 100 < doubleChance) {
            gameData.backpack.push({
                ...fish,
                catchTime: Date.now(),
                perfectCatch: perfectCatch,
                finalValue: totalCoins,
                doubleCatch: true,
                depth: currentDepth,
                uniqueId: Date.now() + Math.random()
            });
            showNotification(`✨ Skill Cast: Dapat ikan double!`, "success");
            
            gameData.exp = Number(gameData.exp) + expGained;
            if (gameData.gamepass.owned) {
                for (const pet of activePets) {
                    if (pet.effect.type === "exp_bonus") {
                        addGamepassExp(pet.effect.value);
                    }
                }
            }
        }
    }
    
    updateQuestProgress(fish);
    
    if (autoSellSettings[fish.rarity]) {
        gameData.coins = Number(gameData.coins) + totalCoins;
        gameData.backpack.pop();
        showAutoSellNotification(fish, totalCoins);
    } else {
        showFishingResult(fish, totalCoins, perfectCatch);
    }
    
    addToAquarium(fish);
    
    if (fishBtn) {
        fishBtn.textContent = "🎣 Mancing!";
        fishBtn.style.background = 'linear-gradient(to right, #ff8a00, #e52e71)';
        fishBtn.disabled = false;
    }
    
    updateUI();
    loadBackpack();
    loadSellItems();
}

// ==================== CHECK LEVEL UP ====================
export function checkLevelUp() {
    const expNeeded = Number(gameData.level) * 100;
    if (Number(gameData.exp) >= expNeeded) {
        gameData.exp = Number(gameData.exp) - expNeeded;
        gameData.level = Number(gameData.level) + 1;
        showNotification(`🎉 Level Up! Sekarang level ${gameData.level}!`, "success");
    }
    if (expElement) expElement.textContent = `${gameData.exp}/${gameData.level * 100}`;
}

// ==================== START FISHING ====================
export function startFishing() {
    if (isFishing) return;
    
    if (currentSpot === 6 && !gameData.depthGear.maskOfSatoshi) {
        showNotification("❌ Beli Mask of Satoshi dulu di Depth Gear untuk mancing di Crypto!", "error");
        return;
    }
    
    if (currentSpot === 7 && !gameData.depthGear.turtleHat) {
        showNotification("❌ Beli Turtle Hat dulu di Depth Gear untuk mancing di Atlantis!", "error");
        return;
    }
    
    if (currentSpot === 8 && !gameData.depthGear.crownOfSilmarillion) {
        showNotification("❌ Beli Crown of Silmarillion dulu di Depth Gear untuk mancing di Valinor!", "error");
        return;
    }
    
    isFishing = true;
    fishBtn.disabled = true;
    fishBtn.textContent = "🎣 Casting...";
    
    const hook = document.querySelector('.hook');
    const fishingLine = document.querySelector('.fishing-line');
    
    if (hook && fishingLine) {
        hook.style.top = '200px';
        fishingLine.style.height = '200px';
    }
    
    setTimeout(() => {
        if (!isFishing) return;
        
        const hasPerfectPet = hasActivePet(3);
        
        if (!hasPerfectPet && minigameIndicator) {
            minigameIndicator.style.display = 'block';
            startMinigame();
        }
        
        if (fishBtn) {
            fishBtn.textContent = "TARIK!";
            fishBtn.style.background = '#FF6B6B';
            fishBtn.disabled = false;
        }
        
        const autoCatchTimer = setTimeout(() => {
            if (isFishing) {
                const perfectCatch = hasPerfectPet ? true : false;
                const fish = getRandomFish();
                if (fish) {
                    finishFishing(fish, perfectCatch);
                    
                    if (hasActivePet(6) && Math.random() * 100 < 10) {
                        finishFishing({ ...fish }, perfectCatch);
                        showNotification("🦨 Racoon: Dapat ikan double!", "success");
                    }
                }
                cleanupFishing();
            }
        }, 3000);
        
        currentPullHandler = function() {
            clearTimeout(autoCatchTimer);
            const perfectCatch = hasPerfectPet ? true : (minigameIndicator && minigameIndicator.style.display !== 'none' ? checkMinigameResult() : false);
            const caughtFish = getRandomFish();
            if (caughtFish) {
                finishFishing(caughtFish, perfectCatch);
                
                if (hasActivePet(6) && Math.random() * 100 < 10) {
                    finishFishing({ ...caughtFish }, perfectCatch);
                    showNotification("🦨 Racoon: Dapat ikan double!", "success");
                }
            }
            cleanupFishing();
        };
        
        if (fishBtn) {
            fishBtn.addEventListener('click', currentPullHandler);
        }
        
    }, 2000);
}

// ==================== START MINIGAME ====================
export function startMinigame() {
    const needle = document.querySelector('.indicator-needle');
    if (needle) {
        needle.style.animation = 'needleSweep 1.5s infinite linear';
    }
}

// ==================== CHECK MINIGAME RESULT ====================
export function checkMinigameResult() {
    const needle = document.querySelector('.indicator-needle');
    const target = document.querySelector('.indicator-target');
    
    if (!needle || !target) return false;
    
    const needleRect = needle.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    const needleCenter = needleRect.left + needleRect.width / 2;
    const targetLeft = targetRect.left;
    const targetRight = targetRect.right;
    
    return needleCenter >= targetLeft && needleCenter <= targetRight;
}

// ==================== CLEANUP FISHING ====================
export function cleanupFishing() {
    if (currentPullHandler && fishBtn) {
        fishBtn.removeEventListener('click', currentPullHandler);
        currentPullHandler = null;
    }
    
    if (minigameIndicator) {
        minigameIndicator.style.display = 'none';
    }
    
    const needle = document.querySelector('.indicator-needle');
    if (needle) {
        needle.style.animation = 'none';
    }
}

// ==================== ADD GAMEPASS EXP ====================
export function addGamepassExp(amount) {
    if (!gameData.gamepass.owned) return;
    if (gameData.gamepass.level >= 40) return;
    
    gameData.gamepass.exp = Number(gameData.gamepass.exp) + Number(amount);
    
    const currentLevelReq = gamepassLevels.find(l => l.level === gameData.gamepass.level)?.expRequired || Infinity;
    
    while (Number(gameData.gamepass.exp) >= currentLevelReq && gameData.gamepass.level < 40) {
        gameData.gamepass.exp = Number(gameData.gamepass.exp) - currentLevelReq;
        gameData.gamepass.level++;
        showNotification(`🎁 Gamepass Level ${gameData.gamepass.level} tercapai!`, "success");
    }
}

// ==================== UPDATE UI (Sementara) ====================
let updateUI = () => {};
let loadBackpack = () => {};
let loadSellItems = () => {};

// ==================== SET UI FUNCTIONS ====================
export function setUIFunctions(uiFns) {
    updateUI = uiFns.updateUI;
    loadBackpack = uiFns.loadBackpack;
    loadSellItems = uiFns.loadSellItems;
}
