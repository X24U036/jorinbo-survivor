// ■■■ 緊急修復：カーソル表示 ■■■
document.body.style.cursor = 'default';

// ■■■ 要素の取得 ■■■
const homeScreen = document.getElementById('home-screen');
const weaponShopScreen = document.getElementById('weapon-shop-screen');
const playerShopScreen = document.getElementById('player-shop-screen');
const skillShopScreen = document.getElementById('skill-shop-screen');
const waveShopScreen = document.getElementById('wave-shop-screen');

const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameClearScreen = document.getElementById('game-clear-screen');
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');

const totalCoinsDisplay = document.getElementById('total-coins');
const weaponShopCoinsDisplay = document.getElementById('weapon-shop-coins');
const playerShopCoinsDisplay = document.getElementById('player-shop-coins');
const skillShopCoinsDisplay = document.getElementById('skill-shop-coins');
const waveShopCoinsDisplay = document.getElementById('wave-shop-coins');
const gameCoinsDisplay = document.getElementById('game-coins');

const weaponShopItemsContainer = document.getElementById('weapon-shop-items');
const playerShopItemsContainer = document.getElementById('player-shop-items');
const skillItemsContainer = document.getElementById('skill-items-container');
const waveShopItemsContainer = document.getElementById('wave-shop-items');

const waveDisplay = document.getElementById('wave-display');
const nextWaveNum = document.getElementById('next-wave-num');
const timerText = document.getElementById('timer');
const hpDisplay = document.getElementById('hp-display');
const enemyCountText = document.getElementById('enemy-count');
const bossHud = document.getElementById('boss-hud');
const bossHpBar = document.getElementById('boss-hp-bar');
const bossAttackName = document.getElementById('boss-attack-name');
const waveModal = document.getElementById('wave-modal');
const waveTitle = document.getElementById('wave-title');
const usernameInput = document.getElementById('username-input');

const bombGaugeBar = document.getElementById('bomb-gauge-bar');
const gameSkillName = document.getElementById('game-skill-name');
const currentEquipName = document.getElementById('current-equip-name');

const resultWave = document.getElementById('result-wave');
const resultCoins = document.getElementById('result-coins');
const clearCoins = document.getElementById('clear-coins');

// Buttons
const btnBattle = document.getElementById('btn-battle');
const btnWeapon = document.getElementById('btn-weapon');
const btnPlayer = document.getElementById('btn-player');
const btnSkillShop = document.getElementById('btn-skill-shop');
const btnBackWeapon = document.getElementById('btn-back-weapon');
const btnBackPlayer = document.getElementById('btn-back-player');
const btnBackSkill = document.getElementById('btn-back-skill');
const btnReset = document.getElementById('btn-reset');
const btnNextWave = document.getElementById('btn-next-wave');
const btnRetry = document.getElementById('btn-retry');
const btnReturnHome = document.getElementById('btn-return-home');
const btnClearHome = document.getElementById('btn-clear-home');

// Audio（ダミー）
function playSound(el, vol = 0.5) {}

// ■■■ セーブデータ管理 ■■■
function getDefaultData() {
    return {
        coins: 0,
        name: "HERO",
        upgrade: {
            damage: 1,
            fireRate: 1,
            count: 1,
            bulletSize: 1,
            speed: 1,
            maxHp: 1
        },
        skills: {
            owned: ['sphere'],
            equipped: 'sphere',
            levels: {
                sphere: 1,
                bomb: 1,
                energy: 1,
                satellite: 1
            }
        }
    };
}

let gameData = getDefaultData();

try {
    const json = localStorage.getItem('neonSurvivorData');

    if (json) {
        const saved = JSON.parse(json);

        if (saved && saved.upgrade) {
            gameData = saved;

            if (!gameData.upgrade.count) {
                gameData.upgrade.count = 1;
            }

            if (!gameData.upgrade.maxHp) {
                gameData.upgrade.maxHp = 1;
            }

            if (!gameData.upgrade.bulletSize) {
                gameData.upgrade.bulletSize = 1;
            }

            if (!gameData.skills) {
                gameData.skills = {
                    owned: ['sphere'],
                    equipped: 'sphere',
                    levels: {
                        sphere: 1,
                        bomb: 1,
                        energy: 1,
                        satellite: 1
                    }
                };
            }

            if (!gameData.skills.levels.energy) {
                gameData.skills.levels.energy = 1;
            }

            if (!gameData.skills.levels.satellite) {
                gameData.skills.levels.satellite = 1;
            }
        } else {
            localStorage.removeItem('neonSurvivorData');
        }
    }
} catch (e) {
    localStorage.removeItem('neonSurvivorData');
    gameData = getDefaultData();
}

function saveData() {
    localStorage.setItem(
        'neonSurvivorData',
        JSON.stringify(gameData)
    );

    updateCoinDisplays();
}

function updateCoinDisplays() {
    if (totalCoinsDisplay) {
        totalCoinsDisplay.textContent = gameData.coins;
    }

    if (weaponShopCoinsDisplay) {
        weaponShopCoinsDisplay.textContent = gameData.coins;
    }

    if (playerShopCoinsDisplay) {
        playerShopCoinsDisplay.textContent = gameData.coins;
    }

    if (skillShopCoinsDisplay) {
        skillShopCoinsDisplay.textContent = gameData.coins;
    }

    if (waveShopCoinsDisplay) {
        waveShopCoinsDisplay.textContent = gameData.coins;
    }
}

// ■■■ ゲーム内変数 ■■■
let currentWave = 1;
let waveTimeLeft = 60;
let enemiesRemaining = 0;
let sessionCoins = 0;
let isBossPhase = false;
let bossMaxHp = 0;
let isGameOver = false;

let playerMaxHp = 10;
let playerCurrentHp = 10;
let lastDamageTime = 0;

let bombCooldown = 30000;
let lastBombTime = -30000;

let playerX = window.innerWidth / 2;
let playerY = window.innerHeight / 2;
let mouseX = playerX;
let mouseY = playerY;

let animationFrameId = null;
let lastShotTime = 0;
let windowTimerInterval = null;

const bossImages = [
    'boss1.png',
    'boss2.png',
    'boss3.png',
    'boss4.png'
];

let enemies = [];
let bullets = [];
let hearts = [];
let enemyBullets = [];
let involuteBullets = [];
let bossAttackTimers = [];

updateCoinDisplays();

if (gameData.name && usernameInput) {
    usernameInput.value = gameData.name;
}

// ■■■ マウス操作 ■■■
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// ■■■ スキル発動（Spaceキー）■■■
document.addEventListener('keydown', (e) => {
    if (isGameOver) {
        return;
    }

    if (e.code === 'Space') {
        attemptSkill();
    }
});

function attemptSkill() {
    const now = Date.now();

    if (now - lastBombTime >= bombCooldown) {
        if (gameData.skills.equipped === 'sphere') {
            triggerInvoluteSphere();
        } else if (gameData.skills.equipped === 'bomb') {
            triggerBomb();
        } else if (gameData.skills.equipped === 'energy') {
            triggerHighEnergyCircle();
        } else if (gameData.skills.equipped === 'satellite') {
            triggerSatellite();
        }

        lastBombTime = now;
    }
}

// ■■■ メニュー操作 ■■■
btnBattle.addEventListener('click', () => {
    if (usernameInput) {
        gameData.name = usernameInput.value;
    }

    saveData();

    homeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    gameClearScreen.classList.add('hidden');

    document.body.style.cursor = 'none';

    currentWave = 1;
    sessionCoins = 0;
    lastBombTime = -30000;

    if (gameCoinsDisplay) {
        gameCoinsDisplay.textContent = 0;
    }

    const skillNames = {
        sphere: "インボリュート",
        bomb: "ボム",
        energy: "ハイエナジー",
        satellite: "サテライト"
    };

    if (gameSkillName) {
        gameSkillName.textContent =
            skillNames[gameData.skills.equipped] || "SKILL";
    }

    const hpLevel = gameData.upgrade.maxHp || 1;

    playerMaxHp = 10 + (hpLevel - 1) * 5;
    playerCurrentHp = playerMaxHp;

    updateHpDisplay();
    startWaveSequence();
});

btnWeapon.addEventListener('click', () => {
    openWeaponShop();
});

btnPlayer.addEventListener('click', () => {
    openPlayerShop();
});

btnSkillShop.addEventListener('click', () => {
    openSkillShop();
});

btnBackWeapon.addEventListener('click', () => {
    weaponShopScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
});

btnBackPlayer.addEventListener('click', () => {
    playerShopScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
});

btnBackSkill.addEventListener('click', () => {
    skillShopScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
});

btnReset.addEventListener('click', () => {
    if (
        confirm(
            "【警告】\n現在のデータを全て削除してリセットしますか？"
        )
    ) {
        localStorage.removeItem('neonSurvivorData');
        location.reload();
    }
});

btnRetry.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');

    currentWave = 1;
    sessionCoins = 0;
    lastBombTime = -30000;

    gameCoinsDisplay.textContent = 0;
    document.body.style.cursor = 'none';

    const hpLevel = gameData.upgrade.maxHp || 1;

    playerMaxHp = 10 + (hpLevel - 1) * 5;
    playerCurrentHp = playerMaxHp;

    updateHpDisplay();
    startWaveSequence();
});

btnReturnHome.addEventListener('click', () => {
    location.reload();
});

btnClearHome.addEventListener('click', () => {
    location.reload();
});

btnNextWave.addEventListener('click', () => {
    waveShopScreen.classList.add('hidden');
    document.body.style.cursor = 'none';

    currentWave++;

    startWaveSequence();
});

// ■■■ ショップシステム ■■■
function renderWeaponItems(container) {
    container.innerHTML = '';

    createShopItem(
        container,
        "連射速度",
        "発射間隔短縮",
        "fireRate",
        "weapon"
    );

    createShopItem(
        container,
        "攻撃力",
        "威力アップ",
        "damage",
        "weapon"
    );

    createShopItem(
        container,
        "同時発射数",
        "弾数アップ",
        "count",
        "weapon"
    );

    createShopItem(
        container,
        "弾サイズ",
        "巨大化",
        "bulletSize",
        "weapon"
    );
}

function renderPlayerItems(container) {
    container.innerHTML = '';

    createShopItem(
        container,
        "移動速度",
        "スピードアップ",
        "speed",
        "player"
    );

    createShopItem(
        container,
        "最大体力",
        "HP上限アップ",
        "maxHp",
        "player"
    );
}

// ■■■ スキルショップ ■■■
function renderSkillItems() {
    skillItemsContainer.innerHTML = '';

    const skillNames = {
        sphere: "インボリュート",
        bomb: "ボム",
        energy: "ハイエナジー",
        satellite: "サテライト"
    };

    currentEquipName.textContent =
        skillNames[gameData.skills.equipped];

    const skillList = [
        {
            id: 'sphere',
            name: 'インボリュート',
            cost: 0,
            desc: '回転する弾で広範囲攻撃'
        },
        {
            id: 'bomb',
            name: 'ボム',
            cost: 50,
            desc: '画面全体攻撃＆弾消し'
        },
        {
            id: 'energy',
            name: 'ハイエナジー',
            cost: 150,
            desc: '画面全体に広がる衝撃波'
        },
        {
            id: 'satellite',
            name: 'サテライト',
            cost: 300,
            desc: '宇宙からの自動狙撃'
        }
    ];

    skillList.forEach(skill => {
        const isOwned =
            gameData.skills.owned.includes(skill.id);

        const isEquipped =
            gameData.skills.equipped === skill.id;

        const level =
            gameData.skills.levels[skill.id] || 1;

        const upgradeCost =
            Math.floor(1 + (level * level * 2));

        const itemDiv =
            document.createElement('div');

        itemDiv.classList.add('shop-item');

        let html =
            `<h3>${skill.name}</h3>` +
            `<p>${skill.desc}</p>`;

        if (isOwned) {
            html +=
                `<div class="lvl-display">` +
                `Lv.${level}` +
                `</div>`;

            if (isEquipped) {
                html +=
                    `<button class="equip-btn" disabled>` +
                    `装備中` +
                    `</button>`;
            } else {
                html +=
                    `<button class="equip-btn" ` +
                    `id="equip-${skill.id}">` +
                    `装備する` +
                    `</button>`;
            }

            html +=
                `<button class="buy-btn" ` +
                `id="upgrade-${skill.id}">` +
                `強化 (${upgradeCost}G)` +
                `</button>`;

            html +=
                `<button class="item-reset-btn" ` +
                `id="reset-skill-${skill.id}">` +
                `Lvリセット` +
                `</button>`;
        } else {
            html +=
                `<button class="buy-btn" ` +
                `id="buy-skill-${skill.id}">` +
                `購入 (${skill.cost}G)` +
                `</button>`;
        }

        itemDiv.innerHTML = html;
        skillItemsContainer.appendChild(itemDiv);

        if (!isOwned) {
            const buyBtn = itemDiv.querySelector(
                `#buy-skill-${skill.id}`
            );

            if (gameData.coins < skill.cost) {
                buyBtn.disabled = true;
            }

            buyBtn.addEventListener('click', () => {
                if (gameData.coins >= skill.cost) {
                    gameData.coins -= skill.cost;
                    gameData.skills.owned.push(skill.id);

                    saveData();
                    renderSkillItems();
                }
            });
        } else {
            if (!isEquipped) {
                const equipBtn = itemDiv.querySelector(
                    `#equip-${skill.id}`
                );

                equipBtn.addEventListener('click', () => {
                    gameData.skills.equipped = skill.id;

                    saveData();
                    renderSkillItems();
                });
            }

            const upBtn = itemDiv.querySelector(
                `#upgrade-${skill.id}`
            );

            if (gameData.coins < upgradeCost) {
                upBtn.disabled = true;
            }

            upBtn.addEventListener('click', () => {
                if (gameData.coins >= upgradeCost) {
                    gameData.coins -= upgradeCost;
                    gameData.skills.levels[skill.id]++;

                    saveData();
                    renderSkillItems();
                }
            });

            const resetBtn = itemDiv.querySelector(
                `#reset-skill-${skill.id}`
            );

            if (level <= 1) {
                resetBtn.disabled = true;
                resetBtn.style.opacity = 0.3;
            }

            resetBtn.addEventListener('click', () => {
                if (level > 1) {
                    let refundAmount = 0;

                    for (
                        let l = level - 1;
                        l >= 1;
                        l--
                    ) {
                        refundAmount += Math.floor(
                            1 + (l * l * 2)
                        );
                    }

                    if (
                        confirm(
                            `${skill.name}をLv.1にリセットしますか？\n` +
                            `消費した ${refundAmount}G が戻ります。`
                        )
                    ) {
                        gameData.coins += refundAmount;
                        gameData.skills.levels[skill.id] = 1;

                        saveData();
                        renderSkillItems();
                    }
                }
            });
        }
    });
}

function openWeaponShop() {
    homeScreen.classList.add('hidden');
    weaponShopScreen.classList.remove('hidden');

    renderWeaponItems(
        weaponShopItemsContainer
    );
}

function openPlayerShop() {
    homeScreen.classList.add('hidden');
    playerShopScreen.classList.remove('hidden');

    renderPlayerItems(
        playerShopItemsContainer
    );
}

function openSkillShop() {
    homeScreen.classList.add('hidden');
    skillShopScreen.classList.remove('hidden');

    renderSkillItems();
}

function openWaveShop() {
    document.body.style.cursor = 'default';

    waveShopScreen.classList.remove('hidden');

    nextWaveNum.textContent =
        currentWave + 1;

    updateCoinDisplays();

    waveShopItemsContainer.innerHTML = '';

    createShopItem(
        waveShopItemsContainer,
        "連射速度",
        "発射間隔短縮",
        "fireRate",
        "wave"
    );

    createShopItem(
        waveShopItemsContainer,
        "攻撃力",
        "威力アップ",
        "damage",
        "wave"
    );

    createShopItem(
        waveShopItemsContainer,
        "同時発射数",
        "弾数アップ",
        "count",
        "wave"
    );

    createShopItem(
        waveShopItemsContainer,
        "弾サイズ",
        "巨大化",
        "bulletSize",
        "wave"
    );

    createShopItem(
        waveShopItemsContainer,
        "移動速度",
        "スピードアップ",
        "speed",
        "wave"
    );

    createShopItem(
        waveShopItemsContainer,
        "最大体力",
        "HP上限アップ",
        "maxHp",
        "wave"
    );
}

function createShopItem(
    container,
    name,
    desc,
    key,
    shopType
) {
    const level =
        gameData.upgrade[key] || 1;

    const cost =
        Math.floor(1 + (level * level * 2));

    const itemDiv =
        document.createElement('div');

    itemDiv.classList.add('shop-item');

    itemDiv.innerHTML = `
        <h3>${name}</h3>
        <p>${desc}</p>
        <div class="lvl-display">
            Lv.${level}
        </div>
        <button
            class="buy-btn"
            id="buy-${key}-${shopType}"
        >
            強化 (${cost}G)
        </button>
        <button
            class="item-reset-btn"
            id="reset-${key}-${shopType}"
        >
            Lvリセット
        </button>
    `;

    container.appendChild(itemDiv);

    const buyBtn = itemDiv.querySelector(
        `#buy-${key}-${shopType}`
    );

    if (gameData.coins < cost) {
        buyBtn.disabled = true;
        buyBtn.textContent = "資金不足";
    }

    buyBtn.addEventListener('click', () => {
        if (gameData.coins >= cost) {
            gameData.coins -= cost;
            gameData.upgrade[key]++;

            playSound();
            saveData();

            if (shopType === 'weapon') {
                renderWeaponItems(container);
            } else if (shopType === 'player') {
                renderPlayerItems(container);
            } else {
                openWaveShop();
            }

            if (key === 'maxHp') {
                playerMaxHp =
                    10 +
                    (gameData.upgrade.maxHp - 1) *
                    5;

                playerCurrentHp =
                    playerMaxHp;

                updateHpDisplay();
            }
        }
    });

    const resetBtn = itemDiv.querySelector(
        `#reset-${key}-${shopType}`
    );

    if (level <= 1) {
        resetBtn.disabled = true;
        resetBtn.style.opacity = 0.3;
    }

    resetBtn.addEventListener('click', () => {
        if (level > 1) {
            let refundAmount = 0;

            for (
                let l = level - 1;
                l >= 1;
                l--
            ) {
                const paidCost =
                    Math.floor(
                        1 + (l * l * 2)
                    );

                refundAmount += paidCost;
            }

            if (
                confirm(
                    `${name}をLv.1にリセットしますか？\n` +
                    `消費した ${refundAmount}G が戻ります。`
                )
            ) {
                gameData.coins += refundAmount;
                gameData.upgrade[key] = 1;

                saveData();
                playSound();

                if (shopType === 'weapon') {
                    renderWeaponItems(container);
                } else if (shopType === 'player') {
                    renderPlayerItems(container);
                } else {
                    openWaveShop();
                }

                if (key === 'maxHp') {
                    playerMaxHp = 10;

                    if (
                        playerCurrentHp >
                        playerMaxHp
                    ) {
                        playerCurrentHp =
                            playerMaxHp;
                    }

                    updateHpDisplay();
                }
            }
        }
    });
}

function getPlayerStats() {
    let dmg =
        gameData.upgrade.damage || 1;

    let rate =
        gameData.upgrade.fireRate || 1;

    let spd =
        gameData.upgrade.speed || 1;

    let cnt =
        gameData.upgrade.count || 1;

    let sizeLevel =
        gameData.upgrade.bulletSize || 1;

    let bSize =
        10 + (sizeLevel - 1) * 4;

    return {
        shotInterval:
            Math.max(
                100,
                500 - (rate - 1) * 40
            ),

        damage: dmg,

        moveSpeed:
            0.08 + (spd - 1) * 0.01,

        bulletCount: cnt,
        bulletSize: bSize
    };
}

// ■■■ ゲームループ関連 ■■■
function startWaveSequence() {
    isBossPhase = false;

    clearBossAttackTimers();

    if (bossHud) {
        bossHud.classList.add('hidden');
    }

    if (bossAttackName) {
        bossAttackName.textContent =
            '攻撃準備中...';
    }

    enemies.forEach(e => {
        e.element.remove();
    });

    bullets.forEach(b => {
        b.element.remove();
    });

    enemyBullets.forEach(b => {
        b.element.remove();
    });

    involuteBullets.forEach(b => {
        b.element.remove();
    });

    hearts.forEach(h => {
        h.element.remove();
    });

    enemies = [];
    bullets = [];
    enemyBullets = [];
    involuteBullets = [];
    hearts = [];

    waveDisplay.textContent = currentWave;

    waveTimeLeft =
        30 + Math.floor(currentWave * 5);

    timerText.textContent =
        waveTimeLeft;

    waveModal.classList.remove('hidden');

    waveTitle.textContent =
        `WAVE ${currentWave}`;

    setTimeout(() => {
        waveModal.classList.add('hidden');
        startBattle();
    }, 2000);
}

function startBattle() {
    isGameOver = false;

    playSound();
    spawnWaveEnemies();

    if (animationFrameId) {
        cancelAnimationFrame(
            animationFrameId
        );
    }

    gameLoop();

    clearInterval(
        windowTimerInterval
    );

    windowTimerInterval =
        setInterval(() => {
            if (isGameOver) {
                return;
            }

            waveTimeLeft--;

            timerText.textContent =
                waveTimeLeft;

            if (waveTimeLeft <= 0) {
                gameOver("時間切れ");
            }
        }, 1000);
}

function gameLoop() {
    if (isGameOver) {
        return;
    }

    const stats =
        getPlayerStats();

    if (
        !isNaN(mouseX) &&
        !isNaN(mouseY)
    ) {
        playerX +=
            (mouseX - playerX) *
            stats.moveSpeed;

        playerY +=
            (mouseY - playerY) *
            stats.moveSpeed;
    }

    player.style.left =
        playerX + 'px';

    player.style.top =
        playerY + 'px';

    const now = Date.now();

    if (
        now - lastShotTime >
        stats.shotInterval
    ) {
        fireBullet(
            stats.damage,
            stats.bulletCount,
            stats.bulletSize
        );

        lastShotTime = now;
    }

    updateBombGauge(now);
    updateBullets();
    updateInvoluteBullets();
    updateEnemyBullets();
    updateEnemies();
    updateHearts();

    animationFrameId =
        requestAnimationFrame(
            gameLoop
        );
}

// ■■■ インボリュート ■■■
function triggerInvoluteSphere() {
    playSound();

    const level =
        gameData.skills.levels.sphere;

    const sphereCount =
        6 + (level - 1) * 2;

    for (
        let i = 0;
        i < sphereCount;
        i++
    ) {
        const el =
            document.createElement('div');

        el.classList.add(
            'involute-bullet'
        );

        gameArea.appendChild(el);

        const startAngle =
            (Math.PI * 2 / sphereCount) *
            i;

        involuteBullets.push({
            element: el,
            angle: startAngle,
            radius: 0,
            active: true
        });
    }
}

// ■■■ ボム ■■■
function triggerBomb() {
    playSound();

    const effect =
        document.createElement('div');

    effect.classList.add(
        'bomb-effect'
    );

    gameArea.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 1000);

    const level =
        gameData.skills.levels.bomb;

    const damage =
        100 + (level - 1) * 50;

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {
        damageEnemy(
            enemies[i],
            damage
        );
    }

    enemyBullets.forEach(b => {
        b.element.remove();
    });

    enemyBullets = [];
}

// ■■■ ハイエナジーサークル ■■■
function triggerHighEnergyCircle() {
    playSound();

    const level =
        gameData.skills.levels.energy;

    const maxDim = Math.max(
        window.innerWidth,
        window.innerHeight
    );

    const radius = maxDim;

    const damage =
        20 + (level - 1) * 10;

    const el =
        document.createElement('div');

    el.classList.add(
        'energy-circle'
    );

    el.style.width =
        radius * 2 + 'px';

    el.style.height =
        radius * 2 + 'px';

    el.style.left =
        playerX + 'px';

    el.style.top =
        playerY + 'px';

    gameArea.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 600);

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {
        const e = enemies[i];

        damageEnemy(
            e,
            damage
        );
    }
}

// ■■■ サテライトキャノン ■■■
function triggerSatellite() {
    playSound();

    const level =
        gameData.skills.levels.satellite;

    const beamCount =
        2 + Math.floor(level / 2);

    const damage =
        30 + (level - 1) * 15;

    if (enemies.length > 0) {
        for (
            let i = 0;
            i < beamCount;
            i++
        ) {
            const target =
                enemies[
                    Math.floor(
                        Math.random() *
                        enemies.length
                    )
                ];

            const el =
                document.createElement('div');

            el.classList.add(
                'satellite-beam'
            );

            el.style.left =
                target.x + 30 + 'px';

            el.style.bottom =
                window.innerHeight -
                target.y +
                'px';

            gameArea.appendChild(el);

            setTimeout(() => {
                el.remove();
            }, 500);

            damageEnemy(
                target,
                damage
            );
        }
    }
}

function updateInvoluteBullets() {
    const expandSpeed = 5;
    const rotationSpeed = 0.1;
    const maxRadius = 1000;

    for (
        let i =
            involuteBullets.length - 1;
        i >= 0;
        i--
    ) {
        const b =
            involuteBullets[i];

        b.radius += expandSpeed;
        b.angle += rotationSpeed;

        const bx =
            playerX +
            Math.cos(b.angle) *
            b.radius;

        const by =
            playerY +
            Math.sin(b.angle) *
            b.radius;

        b.element.style.left =
            bx + 'px';

        b.element.style.top =
            by + 'px';

        if (b.radius > maxRadius) {
            b.element.remove();

            involuteBullets.splice(
                i,
                1
            );

            continue;
        }

        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {
            const e = enemies[j];

            const dx = bx - e.x;
            const dy = by - e.y;

            const dist = Math.sqrt(
                dx * dx + dy * dy
            );

            if (dist < 60) {
                damageEnemy(e, 5);

                const hitEffect =
                    document.createElement(
                        'div'
                    );

                hitEffect.style.position =
                    'absolute';

                hitEffect.style.left =
                    e.x + 'px';

                hitEffect.style.top =
                    e.y + 'px';

                hitEffect.style.width =
                    '20px';

                hitEffect.style.height =
                    '20px';

                hitEffect.style.background =
                    '#fff';

                hitEffect.style.borderRadius =
                    '50%';

                hitEffect.style.zIndex =
                    '99';

                hitEffect.style.pointerEvents =
                    'none';

                gameArea.appendChild(
                    hitEffect
                );

                setTimeout(() => {
                    hitEffect.remove();
                }, 100);
            }
        }
    }
}

function updateBombGauge(now) {
    const elapsed =
        now - lastBombTime;

    let percentage =
        (elapsed / bombCooldown) *
        100;

    if (percentage > 100) {
        percentage = 100;
    }

    if (bombGaugeBar) {
        bombGaugeBar.style.width =
            `${percentage}%`;

        bombGaugeBar.style.background =
            percentage >= 100
                ? '#ffff00'
                : 'linear-gradient(90deg, #00ffff, #0099ff)';
    }
}

// ■■■ 通常敵の出現 ■■■
function spawnWaveEnemies() {
    let count =
        5 +
        Math.floor(currentWave * 3);

    if (count > 100) {
        count = 100;
    }

    enemiesRemaining = count;

    if (enemyCountText) {
        enemyCountText.textContent =
            enemiesRemaining;
    }

    for (
        let i = 0;
        i < count;
        i++
    ) {
        const rand = Math.random();

        if (rand < 0.2) {
            spawnEnemy('golem');
        } else if (rand < 0.4) {
            spawnEnemy('shooter');
        } else {
            spawnEnemy('minion');
        }
    }
}

// ■■■ 敵の生成 ■■■
function spawnEnemy(type) {
    const el =
        document.createElement('div');

    el.classList.add('enemy');

    const hpBar =
        document.createElement('div');

    hpBar.classList.add(
        'mini-hp-bar'
    );

    const hpFill =
        document.createElement('div');

    hpFill.classList.add(
        'mini-hp-fill'
    );

    hpBar.appendChild(hpFill);
    el.appendChild(hpBar);

    let ex;
    let ey;

    if (Math.random() < 0.5) {
        ex =
            Math.random() < 0.5
                ? -50
                : window.innerWidth + 50;

        ey =
            Math.random() *
            window.innerHeight;
    } else {
        ex =
            Math.random() *
            window.innerWidth;

        ey =
            Math.random() < 0.5
                ? -50
                : window.innerHeight + 50;
    }

    let hp;
    let speed;
    let coinDrop;
    let jumpOffset;

    if (type === 'minion') {
        el.classList.add(
            'enemy-minion'
        );

        hp =
            2 +
            Math.floor(
                currentWave * 1.5
            );

        speed =
            1.5 +
            currentWave * 0.1;

        coinDrop =
            Math.floor(
                Math.random() * 2
            );

        jumpOffset =
            Math.floor(
                Math.random() * 60
            );
    } else if (type === 'shooter') {
        el.classList.add(
            'enemy-shooter'
        );

        hp =
            3 +
            Math.floor(
                currentWave * 1.2
            );

        speed = 1.2;

        coinDrop =
            Math.floor(
                Math.random() * 3
            ) + 1;

        jumpOffset = 0;
    } else if (type === 'golem') {
        el.classList.add(
            'enemy-golem'
        );

        hp =
            15 +
            currentWave * 5;

        speed = 0.6;

        coinDrop =
            Math.floor(
                Math.random() * 4
            ) + 1;

        jumpOffset = 0;
    } else {
        el.classList.add(
            'enemy-boss'
        );

        const imgIndex =
            Math.floor(
                Math.random() *
                bossImages.length
            );

        el.style.backgroundImage =
            `url('${bossImages[imgIndex]}')`;

        hp =
            50 +
            currentWave * 30;

        speed = 0.8;
        bossMaxHp = hp;

        updateBossHpBar(hp);

        coinDrop = 5;
        hpBar.style.display = 'none';
        jumpOffset = 0;
    }

    el.style.left = ex + 'px';
    el.style.top = ey + 'px';

    if (gameArea) {
        gameArea.appendChild(el);
    }

    enemies.push({
        element: el,
        hpFill: hpFill,

        x: ex,
        y: ey,

        hp: hp,
        maxHp: hp,

        type: type,
        speed: speed,
        coinDrop: coinDrop,

        jumpTimer: jumpOffset,

        lastAttackTime:
            type === 'boss'
                ? Date.now()
                : 0,

        lastBossPattern: null
    });
}

// ■■■ プレイヤーの通常攻撃 ■■■
function fireBullet(
    damage,
    count,
    size
) {
    if (enemies.length === 0) {
        return;
    }

    let closest = null;
    let minDist = Infinity;

    enemies.forEach(e => {
        const d = Math.sqrt(
            (e.x - playerX) ** 2 +
            (e.y - playerY) ** 2
        );

        if (d < minDist) {
            minDist = d;
            closest = e;
        }
    });

    if (
        closest &&
        minDist < 600
    ) {
        const baseAngle =
            Math.atan2(
                closest.y - playerY,
                closest.x - playerX
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {
            const el =
                document.createElement('div');

            el.classList.add('bullet');

            el.style.width =
                size + 'px';

            el.style.height =
                size + 'px';

            el.style.left =
                playerX + 'px';

            el.style.top =
                playerY + 'px';

            gameArea.appendChild(el);

            let offset = 0;

            if (count > 1) {
                const spread = 0.3;

                offset =
                    -spread / 2 +
                    (
                        spread /
                        (count - 1)
                    ) *
                    i;
            }

            const angle =
                baseAngle + offset;

            bullets.push({
                element: el,
                x: playerX,
                y: playerY,

                vx:
                    Math.cos(angle) * 8,

                vy:
                    Math.sin(angle) * 8,

                damage: damage
            });
        }

        playSound();
    }
}

// ■■■ 遠距離敵の弾 ■■■
function enemyFireBullet(enemy) {
    const el =
        document.createElement('div');

    el.classList.add(
        'enemy-bullet'
    );

    el.style.left =
        enemy.x + 'px';

    el.style.top =
        enemy.y + 'px';

    gameArea.appendChild(el);

    const angle =
        Math.atan2(
            playerY - enemy.y,
            playerX - enemy.x
        );

    const vx =
        Math.cos(angle) * 5;

    const vy =
        Math.sin(angle) * 5;

    enemyBullets.push({
        element: el,

        x: enemy.x,
        y: enemy.y,

        vx: vx,
        vy: vy,

        damage: 2
    });
}

// ■■■ ゴーレムの弾 ■■■
function golemFireBullet(enemy) {
    const el =
        document.createElement('div');

    el.classList.add(
        'enemy-bullet'
    );

    el.style.width = '60px';
    el.style.height = '60px';
    el.style.backgroundColor = '#555';

    el.style.boxShadow =
        '0 0 10px #aaa';

    el.style.left =
        enemy.x + 'px';

    el.style.top =
        enemy.y + 'px';

    gameArea.appendChild(el);

    const angle =
        Math.atan2(
            playerY - enemy.y,
            playerX - enemy.x
        );

    const vx =
        Math.cos(angle) * 4;

    const vy =
        Math.sin(angle) * 4;

    enemyBullets.push({
        element: el,

        x: enemy.x,
        y: enemy.y,

        vx: vx,
        vy: vy,

        damage: 4
    });
}

// ■■■ ボスのランダム攻撃 ■■■
function getBossAttackStats() {
    return {
        speed: Math.min(
            6.2,
            3.5 + currentWave * 0.13
        ),

        damage: Math.min(
            6,
            2 +
            Math.floor(
                (currentWave - 1) / 4
            )
        )
    };
}

function isBossAlive(boss) {
    return (
        !isGameOver &&
        isBossPhase &&
        enemies.includes(boss)
    );
}

function clearBossAttackTimers() {
    bossAttackTimers.forEach(
        timerId => {
            clearTimeout(timerId);
        }
    );

    bossAttackTimers = [];
}

function scheduleBossAttack(
    boss,
    callback,
    delay
) {
    const timerId =
        setTimeout(() => {
            if (isBossAlive(boss)) {
                callback();
            }
        }, delay);

    bossAttackTimers.push(
        timerId
    );
}

function showBossAttackName(name) {
    if (!bossAttackName) {
        return;
    }

    bossAttackName.textContent =
        name;

    bossAttackName.classList.remove(
        'is-changing'
    );

    void bossAttackName.offsetWidth;

    bossAttackName.classList.add(
        'is-changing'
    );
}

function createBossBullet(
    boss,
    angle,
    speed,
    damage,
    options = {}
) {
    if (!isBossAlive(boss)) {
        return;
    }

    const el =
        document.createElement('div');

    const size =
        options.size || 24;

    el.classList.add(
        'boss-fire'
    );

    if (options.className) {
        el.classList.add(
            options.className
        );
    }

    el.style.width =
        size + 'px';

    el.style.height =
        size + 'px';

    el.style.left =
        boss.x + 'px';

    el.style.top =
        boss.y + 'px';

    gameArea.appendChild(el);

    enemyBullets.push({
        element: el,

        x: boss.x,
        y: boss.y,

        vx:
            Math.cos(angle) *
            speed,

        vy:
            Math.sin(angle) *
            speed,

        damage: damage,

        curve:
            options.curve || 0,

        hitRadius:
            size * 0.45,

        createdAt:
            performance.now(),

        lifetime:
            options.lifetime || 7000
    });
}

// 1. 扇状攻撃
function bossAttackFan(boss) {
    const stats =
        getBossAttackStats();

    const baseAngle =
        Math.atan2(
            playerY - boss.y,
            playerX - boss.x
        );

    const count =
        Math.min(
            13,
            7 +
            Math.floor(
                currentWave / 3
            )
        );

    const spread = 1.45;

    for (
        let i = 0;
        i < count;
        i++
    ) {
        const offset =
            count === 1
                ? 0
                : -spread / 2 +
                  (
                      spread /
                      (count - 1)
                  ) *
                  i;

        createBossBullet(
            boss,
            baseAngle + offset,
            stats.speed,
            stats.damage,
            {
                className:
                    'boss-fire-fan',

                size: 22
            }
        );
    }
}

// 2. 円形攻撃
function bossAttackCircle(boss) {
    const stats =
        getBossAttackStats();

    const count =
        Math.min(
            24,
            12 +
            Math.floor(
                currentWave / 2
            )
        );

    const startAngle =
        Math.random() *
        Math.PI *
        2;

    for (
        let i = 0;
        i < count;
        i++
    ) {
        const angle =
            startAngle +
            (
                Math.PI *
                2 /
                count
            ) *
            i;

        createBossBullet(
            boss,
            angle,
            stats.speed * 0.78,
            stats.damage,
            {
                className:
                    'boss-fire-circle',

                size: 20
            }
        );
    }
}

// 3. 二重らせん攻撃
function bossAttackSpiral(boss) {
    const stats =
        getBossAttackStats();

    const steps =
        Math.min(
            18,
            10 +
            Math.floor(
                currentWave / 2
            )
        );

    const stepDelay =
        Math.max(
            70,
            115 - currentWave * 2
        );

    const startAngle =
        Math.random() *
        Math.PI *
        2;

    for (
        let i = 0;
        i < steps;
        i++
    ) {
        scheduleBossAttack(
            boss,
            () => {
                const angle =
                    startAngle +
                    i * 0.43;

                createBossBullet(
                    boss,
                    angle,
                    stats.speed * 0.88,
                    stats.damage,
                    {
                        className:
                            'boss-fire-spiral',

                        size: 18,
                        curve: 0.004
                    }
                );

                createBossBullet(
                    boss,
                    angle + Math.PI,
                    stats.speed * 0.88,
                    stats.damage,
                    {
                        className:
                            'boss-fire-spiral',

                        size: 18,
                        curve: -0.004
                    }
                );
            },
            i * stepDelay
        );
    }
}

// 4. 回転十字攻撃
function bossAttackRotatingCross(boss) {
    const stats =
        getBossAttackStats();

    const volleys =
        currentWave >= 10
            ? 4
            : 3;

    const startAngle =
        Math.random() *
        Math.PI *
        2;

    for (
        let volley = 0;
        volley < volleys;
        volley++
    ) {
        scheduleBossAttack(
            boss,
            () => {
                for (
                    let arm = 0;
                    arm < 4;
                    arm++
                ) {
                    const angle =
                        startAngle +
                        volley * 0.24 +
                        arm *
                        (Math.PI / 2);

                    createBossBullet(
                        boss,
                        angle,
                        stats.speed * 0.95,
                        stats.damage,
                        {
                            className:
                                'boss-fire-cross',

                            size: 22
                        }
                    );
                }
            },
            volley * 180
        );
    }
}

// 5. 狙い撃ち3連射
function bossAttackTripleAim(boss) {
    const stats =
        getBossAttackStats();

    for (
        let volley = 0;
        volley < 3;
        volley++
    ) {
        scheduleBossAttack(
            boss,
            () => {
                const baseAngle =
                    Math.atan2(
                        playerY - boss.y,
                        playerX - boss.x
                    );

                [
                    -0.16,
                    0,
                    0.16
                ].forEach(offset => {
                    createBossBullet(
                        boss,
                        baseAngle + offset,
                        stats.speed * 1.15,
                        stats.damage,
                        {
                            className:
                                'boss-fire-aim',

                            size: 19
                        }
                    );
                });
            },
            volley * 250
        );
    }
}

// ■■■ ボス攻撃をランダム選択 ■■■
function bossFireAttack(boss) {
    const patterns = [
        {
            id: 'fan',
            name: '扇状攻撃',
            run: bossAttackFan
        },
        {
            id: 'circle',
            name: '円形攻撃',
            run: bossAttackCircle
        },
        {
            id: 'cross',
            name: '回転十字攻撃',
            run: bossAttackRotatingCross
        },
        {
            id: 'aim',
            name: '狙い撃ち3連射',
            run: bossAttackTripleAim
        }
    ];

    // WAVE3以降は二重らせん攻撃も追加
    if (currentWave >= 3) {
        patterns.push({
            id: 'spiral',
            name: '二重らせん攻撃',
            run: bossAttackSpiral
        });
    }

    // 同じ攻撃が連続しないようにする
    const selectablePatterns =
        patterns.filter(pattern => {
            return (
                pattern.id !==
                boss.lastBossPattern
            );
        });

    const selected =
        selectablePatterns[
            Math.floor(
                Math.random() *
                selectablePatterns.length
            )
        ];

    boss.lastBossPattern =
        selected.id;

    showBossAttackName(
        selected.name
    );

    selected.run(boss);
}

// ■■■ プレイヤー弾の更新 ■■■
function updateBullets() {
    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {
        const b = bullets[i];

        b.x += b.vx;
        b.y += b.vy;

        b.element.style.left =
            b.x + 'px';

        b.element.style.top =
            b.y + 'px';

        if (
            b.x < 0 ||
            b.x > window.innerWidth ||
            b.y < 0 ||
            b.y > window.innerHeight
        ) {
            b.element.remove();

            bullets.splice(
                i,
                1
            );

            continue;
        }

        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {
            const e = enemies[j];

            const dist = Math.sqrt(
                (b.x - e.x) ** 2 +
                (b.y - e.y) ** 2
            );

            let hitR = 30;

            if (e.type === 'boss') {
                hitR = 70;
            }

            if (e.type === 'golem') {
                hitR = 40;
            }

            if (dist < hitR) {
                damageEnemy(
                    e,
                    b.damage
                );

                b.element.remove();

                bullets.splice(
                    i,
                    1
                );

                break;
            }
        }
    }
}

// ■■■ 敵弾の更新 ■■■
function updateEnemyBullets() {
    const now =
        performance.now();

    for (
        let i = enemyBullets.length - 1;
        i >= 0;
        i--
    ) {
        const b =
            enemyBullets[i];

        // curveが設定された弾は進行方向を少しずつ曲げる
        if (b.curve) {
            const cos =
                Math.cos(b.curve);

            const sin =
                Math.sin(b.curve);

            const nextVx =
                b.vx * cos -
                b.vy * sin;

            const nextVy =
                b.vx * sin +
                b.vy * cos;

            b.vx = nextVx;
            b.vy = nextVy;
        }

        b.x += b.vx;
        b.y += b.vy;

        b.element.style.left =
            b.x + 'px';

        b.element.style.top =
            b.y + 'px';

        const expired =
            b.createdAt &&
            now - b.createdAt >
            b.lifetime;

        if (
            expired ||
            b.x < -80 ||
            b.x >
                window.innerWidth + 80 ||
            b.y < -80 ||
            b.y >
                window.innerHeight + 80
        ) {
            b.element.remove();

            enemyBullets.splice(
                i,
                1
            );

            continue;
        }

        const dist = Math.sqrt(
            (b.x - playerX) ** 2 +
            (b.y - playerY) ** 2
        );

        let bulletRadius =
            b.hitRadius || 20;

        if (
            !b.hitRadius &&
            b.element.style.width ===
                '60px'
        ) {
            bulletRadius = 40;
        }

        if (dist < bulletRadius) {
            takePlayerDamage(
                b.damage
            );

            b.element.remove();

            enemyBullets.splice(
                i,
                1
            );
        }
    }
}

// ■■■ 敵の移動と攻撃 ■■■
function updateEnemies() {
    const now = Date.now();

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {
        const e = enemies[i];

        let moveSpeed = e.speed;

        if (e.type === 'minion') {
            e.jumpTimer++;

            const cycle =
                e.jumpTimer % 60;

            if (cycle > 40) {
                moveSpeed =
                    e.speed * 3.0;

                e.element.style.transform =
                    'translate(-50%, -50%) scale(1.2)';
            } else {
                moveSpeed = 0;

                e.element.style.transform =
                    'translate(-50%, -50%) scale(0.9, 0.8)';
            }
        } else if (
            e.type === 'shooter'
        ) {
            const dist = Math.sqrt(
                (playerX - e.x) ** 2 +
                (playerY - e.y) ** 2
            );

            if (dist < 300) {
                moveSpeed = 0;
            }

            if (
                now -
                e.lastAttackTime >
                2000
            ) {
                enemyFireBullet(e);
                e.lastAttackTime = now;
            }

            e.element.style.transform =
                'translate(-50%, -50%)';
        } else if (
            e.type === 'golem'
        ) {
            const dist = Math.sqrt(
                (playerX - e.x) ** 2 +
                (playerY - e.y) ** 2
            );

            if (
                dist < 400 &&
                now -
                e.lastAttackTime >
                3000
            ) {
                golemFireBullet(e);
                e.lastAttackTime = now;
            }

            e.element.style.transform =
                'translate(-50%, -50%)';
        } else {
            const bossAttackInterval =
                Math.max(
                    2200,
                    3200 -
                    currentWave * 50
                );

            if (
                now -
                e.lastAttackTime >
                bossAttackInterval
            ) {
                bossFireAttack(e);
                e.lastAttackTime = now;
            }

            e.element.style.transform =
                'translate(-50%, -50%)';
        }

        const angle = Math.atan2(
            playerY - e.y,
            playerX - e.x
        );

        e.x +=
            Math.cos(angle) *
            moveSpeed;

        e.y +=
            Math.sin(angle) *
            moveSpeed;

        e.element.style.left =
            e.x + 'px';

        e.element.style.top =
            e.y + 'px';

        const contactRadius =
            e.type === 'boss'
                ? 80
                : 40;

        const playerDistance =
            Math.sqrt(
                (playerX - e.x) ** 2 +
                (playerY - e.y) ** 2
            );

        if (
            playerDistance <
            contactRadius
        ) {
            if (
                now -
                lastDamageTime >
                1000
            ) {
                takePlayerDamage(
                    1 +
                    Math.floor(
                        currentWave / 3
                    )
                );

                lastDamageTime = now;
            }
        }
    }
}

// ■■■ プレイヤーのダメージ処理 ■■■
function takePlayerDamage(dmg) {
    playerCurrentHp -= dmg;

    updateHpDisplay();
    playSound();

    gameArea.classList.remove(
        'screen-shake'
    );

    void gameArea.offsetWidth;

    gameArea.classList.add(
        'screen-shake'
    );

    if (playerCurrentHp <= 0) {
        gameOver("体力ゼロ");
    }
}

function updateHpDisplay() {
    if (hpDisplay) {
        hpDisplay.textContent =
            `${playerCurrentHp}/${playerMaxHp}`;
    }
}

// ■■■ 敵へのダメージ処理 ■■■
function damageEnemy(e, dmg) {
    e.hp -= dmg;

    showDamageText(
        e.x,
        e.y,
        dmg
    );

    playSound();

    if (e.hpFill) {
        let p =
            (e.hp / e.maxHp) *
            100;

        if (p < 0) {
            p = 0;
        }

        e.hpFill.style.width =
            `${p}%`;
    }

    if (e.type === 'boss') {
        updateBossHpBar(e.hp);
    }

    if (e.hp <= 0) {
        killEnemy(e);
    }
}

// ■■■ 敵撃破処理 ■■■
function killEnemy(e) {
    playSound();

    sessionCoins +=
        e.coinDrop;

    if (gameCoinsDisplay) {
        gameCoinsDisplay.textContent =
            sessionCoins;
    }

    gameData.coins +=
        e.coinDrop;

    saveData();

    if (e.coinDrop > 0) {
        showCoinText(
            e.x,
            e.y,
            e.coinDrop
        );
    }

    if (
        e.type === 'boss' ||
        Math.random() < 0.1
    ) {
        spawnHeart(
            e.x,
            e.y
        );
    }

    e.element.remove();

    const idx =
        enemies.indexOf(e);

    if (idx > -1) {
        enemies.splice(
            idx,
            1
        );
    }

    if (e.type === 'boss') {
        waveClear();
    } else {
        enemiesRemaining--;

        if (enemyCountText) {
            enemyCountText.textContent =
                enemiesRemaining;
        }

        if (
            enemiesRemaining <= 0 &&
            !isBossPhase
        ) {
            spawnBoss();
        }
    }
}

// ■■■ 回復アイテム生成 ■■■
function spawnHeart(x, y) {
    const el =
        document.createElement('div');

    el.classList.add(
        'heart-item'
    );

    el.style.left = x + 'px';
    el.style.top = y + 'px';

    gameArea.appendChild(el);

    hearts.push({
        element: el,
        x: x,
        y: y
    });
}

function updateHearts() {
    for (
        let i = hearts.length - 1;
        i >= 0;
        i--
    ) {
        const h = hearts[i];

        const dist = Math.sqrt(
            (playerX - h.x) ** 2 +
            (playerY - h.y) ** 2
        );

        if (dist < 40) {
            playerCurrentHp =
                Math.min(
                    playerCurrentHp + 3,
                    playerMaxHp
                );

            updateHpDisplay();
            playSound();

            showDamageText(
                playerX,
                playerY - 30,
                "♥"
            );

            h.element.remove();

            hearts.splice(
                i,
                1
            );
        }
    }
}

// ■■■ ボス出現 ■■■
function spawnBoss() {
    isBossPhase = true;

    if (bossHud) {
        bossHud.classList.remove(
            'hidden'
        );
    }

    if (bossAttackName) {
        bossAttackName.textContent =
            '攻撃準備中...';
    }

    playSound();
    spawnEnemy('boss');

    if (enemyCountText) {
        enemyCountText.textContent =
            "BOSS";
    }
}

// ■■■ WAVEクリア ■■■
function waveClear() {
    clearBossAttackTimers();

    if (currentWave >= 20) {
        gameClear();
        return;
    }

    playSound();

    clearInterval(
        windowTimerInterval
    );

    cancelAnimationFrame(
        animationFrameId
    );

    openWaveShop();
}

// ■■■ ゲームクリア ■■■
function gameClear() {
    clearBossAttackTimers();

    playSound();

    clearInterval(
        windowTimerInterval
    );

    cancelAnimationFrame(
        animationFrameId
    );

    document.body.style.cursor =
        'default';

    if (gameClearScreen) {
        gameClearScreen.classList.remove(
            'hidden'
        );

        if (clearCoins) {
            clearCoins.textContent =
                sessionCoins;
        }
    } else {
        alert(
            "GAME CLEAR!! CONGRATULATIONS!!"
        );

        location.reload();
    }
}

// ■■■ ゲームオーバー ■■■
function gameOver(reason) {
    isGameOver = true;

    clearBossAttackTimers();

    clearInterval(
        windowTimerInterval
    );

    cancelAnimationFrame(
        animationFrameId
    );

    document.body.style.cursor =
        'default';

    if (gameOverScreen) {
        gameOverScreen.classList.remove(
            'hidden'
        );

        if (resultWave) {
            resultWave.textContent =
                currentWave;
        }

        if (resultCoins) {
            resultCoins.textContent =
                sessionCoins;
        }
    } else {
        alert(
            `GAME OVER\nREASON: ${reason}`
        );

        location.reload();
    }
}

// ■■■ ダメージ表示 ■■■
function showDamageText(
    x,
    y,
    txt
) {
    const el =
        document.createElement('div');

    el.classList.add(
        'damage-text'
    );

    el.textContent = txt;

    el.style.left =
        x + 'px';

    el.style.top =
        y + 'px';

    gameArea.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 800);
}

// ■■■ コイン獲得表示 ■■■
function showCoinText(
    x,
    y,
    txt
) {
    const el =
        document.createElement('div');

    el.classList.add(
        'damage-text'
    );

    el.style.color =
        '#ffd700';

    el.textContent =
        `+${txt}G`;

    el.style.left =
        x + 'px';

    el.style.top =
        y - 20 + 'px';

    el.style.zIndex =
        '101';

    gameArea.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 800);
}

// ■■■ ボスHPバー更新 ■■■
function updateBossHpBar(hp) {
    if (!bossHpBar) {
        return;
    }

    let p =
        (hp / bossMaxHp) *
        100;

    if (p < 0) {
        p = 0;
    }

    bossHpBar.style.width =
        `${p}%`;
}