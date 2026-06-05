// =============================================================================
// game-core.js — Shared game engine
// Handles: gameState, navigation, dialogue, inventory, audio, combo lock
// DO NOT put room-specific logic here. Use bedroom.js / livingroom.js / etc.
// =============================================================================

// ---------------------------------------------------------------------------
// Global Game State
// ---------------------------------------------------------------------------
const gameState = {
    currentScene: 'bedroom',
    inventory: [],
    selectedItem: null,

    // Bedroom states
    wardrobeOpen: false,
    dresserUnlocked: false,
    clothesChanged: false,

    // Kitchen states
    kitchenDrawerOpen: false,
    fruitsBowlClicked: false,
    kitchenKeysFound: false,
    upperCabinetOpen: false,
    lowerCabinetOpen: false,

    // Living room states
    tvDrawersOpen: false,
    tvDrawersOpenedOnce: false,
    glassCabinetOpen: false,
    glassCabinetOpenedOnce: false,

    // Entrance states
    hallwayTableOpen: false,
    hallwayTableOpenedOnce: false,

    // Phone / audio states
    hasDeadboltKey: false,
    locksRemaining: 3,
    callDeclinedCount: 0,
    isPhoneRinging: false,

    // Audio
    phoneRingtone: new Audio('../Sound/freesound_community-cellphone-ringing-6475.mp3'),
    
    // Time
    currentTimeMinutes: 8 * 60 + 23 // Starts at 08:23
};

// Configure ringtone
gameState.phoneRingtone.loop = true;
gameState.phoneRingtone.volume = 0.3;

// ---------------------------------------------------------------------------
// Interact Handler Registry
// Each room file registers its own cases here, e.g.:
//   interactHandlers['phone'] = () => { ... };
// ---------------------------------------------------------------------------
const interactHandlers = {};

// ---------------------------------------------------------------------------
// Combination Lock State (shared — the lock UI lives in index.html)
// ---------------------------------------------------------------------------
let lockCode = [0, 0, 0, 0];
let targetCode = [0, 0, 0, 0]; // populated in window.onload

// ---------------------------------------------------------------------------
// Boot Sequence
// ---------------------------------------------------------------------------
window.onload = () => {
    // Generate random 4-digit code
    targetCode = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
    ];

    showOpeningModal();
};

function showOpeningModal() {
    showText("System", "Click anywhere to wake up...");
    document.body.addEventListener('click', startIntroSequence, { once: true });
}

function startIntroSequence() {
    showText("Self", "Wow, I slept so good. I didn't even hear my spouse leave for their flight.");
    showText("Self", "Wait, what time is it? I hope I'm not late for the meeting!");
    showText("Self", "*Groan*... What is that piercing noise? Is my cell phone ringing somewhere in the room?", () => {
        gameState.isPhoneRinging = true;
        gameState.phoneRingtone.play().catch(error => {
            console.log("Audio playback prevented by browser policies:", error);
        });
        document.getElementById('scene-bedroom').style.backgroundImage =
            "url('../pictures/Bedroom/Bedroom%20phone%20call.png')";
        document.getElementById('bedroom-phone-hotspot').classList.add('pulse-glow');
    });
}

// ---------------------------------------------------------------------------
// Interact Router — dispatches to room-specific handlers
// ---------------------------------------------------------------------------
function interact(target) {
    if (target !== 'phone' && (!gameState.inventory.includes("My Phone") || gameState.isPhoneRinging)) {
        showText("Self", "I should find my phone first, that ringing is driving me crazy!");
        return;
    }

    if (interactHandlers[target]) {
        interactHandlers[target]();
    } else {
        console.warn(`No interact handler registered for target: "${target}"`);
    }
}

// ---------------------------------------------------------------------------
// Time System
// ---------------------------------------------------------------------------
function advanceTime(minutes) {
    gameState.currentTimeMinutes += minutes;
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
function navigateTo(sceneId) {
    const currentSceneEl = document.getElementById('scene-' + gameState.currentScene);
    if (currentSceneEl) currentSceneEl.classList.remove('active');

    const newSceneEl = document.getElementById('scene-' + sceneId);
    if (newSceneEl) newSceneEl.classList.add('active');

    gameState.currentScene = sceneId;

    // Adjust ringtone volume — muffled when in other rooms
    if (!gameState.phoneRingtone.paused) {
        if (sceneId === 'bedroom' || gameState.inventory.includes("My Phone")) {
            gameState.phoneRingtone.volume = 0.25;
        } else {
            gameState.phoneRingtone.volume = 0.05;
        }
    }
}

// ---------------------------------------------------------------------------
// Dialogue Queue System
// ---------------------------------------------------------------------------
let dialogueQueue = [];

function showText(speaker, text, action = null) {
    dialogueQueue.push({ speaker, text, action });
    if (dialogueQueue.length === 1) {
        displayCurrentDialogue();
    }
}

function displayCurrentDialogue() {
    if (dialogueQueue.length === 0) return;
    const current = dialogueQueue[0];
    const container = document.getElementById('dialogue-container');
    const speakerEl = document.getElementById('dialogue-speaker');
    const textEl = document.getElementById('dialogue-text');
    if (container && speakerEl && textEl) {
        speakerEl.innerText = current.speaker;
        textEl.innerText = current.text;
        container.classList.remove('hidden');
        document.getElementById('game-container').classList.add('dialogue-active');
    }
    if (current.action && typeof current.action === 'function') {
        current.action();
    }
}

function advanceDialogue() {
    if (dialogueQueue.length > 0) dialogueQueue.shift();

    if (dialogueQueue.length > 0) {
        displayCurrentDialogue();
    } else {
        const container = document.getElementById('dialogue-container');
        if (container) {
            container.classList.add('hidden');
            document.getElementById('game-container').classList.remove('dialogue-active');
        }
    }
}

let introStarted = false;

// Global click listener to advance dialogue
document.addEventListener('click', function (e) {
    const container = document.getElementById('dialogue-container');
    if (container && !container.classList.contains('hidden')) {
        advanceDialogue();
        if (introStarted) {
            e.stopPropagation();
            e.preventDefault();
        } else {
            introStarted = true;
        }
    }
}, true);

// ---------------------------------------------------------------------------
// Inventory System
// ---------------------------------------------------------------------------
function addItem(itemName) {
    gameState.inventory.push(itemName);
    const slots = document.getElementById('inventory-slots');
    if (slots) {
        const itemEl = document.createElement('div');
        itemEl.className = 'inv-item';

        if (itemName === "My Phone") {
            const imgEl = document.createElement('img');
            imgEl.src = "../pictures/Phone/android.png";
            imgEl.alt = itemName;
            imgEl.style.width = "100%";
            imgEl.style.height = "100%";
            imgEl.style.objectFit = "contain";
            itemEl.appendChild(imgEl);
        } else if (itemName === "Kitchen Keys") {
            const imgEl = document.createElement('img');
            imgEl.src = "../pictures/keys/keys.png";
            imgEl.alt = itemName;
            imgEl.style.width = "100%";
            imgEl.style.height = "100%";
            imgEl.style.objectFit = "contain";
            itemEl.appendChild(imgEl);
        } else {
            itemEl.innerText = itemName;
        }

        itemEl.onclick = (e) => showInventoryOptions(e, itemName);
        slots.appendChild(itemEl);
    }
}

function showInventoryOptions(e, itemName) {
    e.stopPropagation();
    let menu = document.getElementById('inventory-context-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'inventory-context-menu';
        menu.innerHTML = `
            <button id="ctx-btn-look" class="ctx-btn">Look</button>
            <button id="ctx-btn-use" class="ctx-btn">Use</button>
        `;
        document.getElementById('game-container').appendChild(menu);

        document.addEventListener('click', (ev) => {
            if (!menu.contains(ev.target)) {
                menu.classList.add('hidden');
            }
        });
    }

    const rect = e.target.closest('.inv-item').getBoundingClientRect();
    const containerRect = document.getElementById('game-container').getBoundingClientRect();

    menu.style.left = (rect.left - containerRect.left) + 'px';
    menu.style.bottom = '80px';
    menu.style.top = 'auto';
    menu.classList.remove('hidden');

    document.getElementById('ctx-btn-look').onclick = (ev) => {
        ev.stopPropagation();
        menu.classList.add('hidden');
        lookItem(itemName);
    };

    document.getElementById('ctx-btn-use').onclick = (ev) => {
        ev.stopPropagation();
        menu.classList.add('hidden');
        useItem(itemName);
    };
}

function lookItem(itemName) {
    if (itemName === "My Phone") {
        showText("Self", "It's my smartphone. The screen is a bit smudged.");
    } else if (itemName === "Small Key") {
        showText("Self", "A small, ordinary-looking key. It looks like it could fit a door.");
    } else {
        showText("Self", `I examined the ${itemName}.`);
    }
}

function useItem(itemName) {
    if (itemName === "My Phone") {
        if (gameState.isPhoneRinging) {
            document.getElementById('incoming-call-ui').classList.remove('hidden');
        } else {
            const hours = Math.floor(gameState.currentTimeMinutes / 60);
            const minutes = gameState.currentTimeMinutes % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            showText("Self", `I used the phone to check the time. It is ${timeString}.`);
        }
    } else if (itemName === "Small Key") {
        if (gameState.currentScene === 'entrance') {
            if (!gameState.clothesChanged) {
                showText("Self", "I can't go to work with my pijama.");
                return;
            }
            if (gameState.currentTimeMinutes <= 8 * 60 + 45) {
                showText("System", "You unlocked the front door and escaped on time! You win!");
            } else {
                document.getElementById('fail-screen').classList.remove('hidden');
            }
        } else {
            showText("Self", "I can't use this here. I need to find what it unlocks.");
        }
    } else {
        showText("Self", `I tried to use the ${itemName}, but nothing happened.`);
    }
}

// ---------------------------------------------------------------------------
// Phone Call UI
// ---------------------------------------------------------------------------
function acceptCall() {
    document.getElementById('incoming-call-ui').classList.add('hidden');
    gameState.phoneRingtone.pause();
    gameState.phoneRingtone.currentTime = 0;
    gameState.isPhoneRinging = false;
    triggerPhoneDialogue();
}

function declineCall() {
    document.getElementById('incoming-call-ui').classList.add('hidden');
    gameState.phoneRingtone.pause();
    gameState.phoneRingtone.currentTime = 0;
    gameState.isPhoneRinging = false;
    gameState.callDeclinedCount++;

    if (gameState.callDeclinedCount > 3) {
        showText("Self", "Man, I am such a heavy sleeper, I could sleep through an earthquake. Let him call back.");
    } else {
        showText("Self", "Maybe I should answer him...");
    }

    setTimeout(() => {
        gameState.isPhoneRinging = true;
        gameState.phoneRingtone.play().catch(e => console.log(e));
    }, 10000);
}

function triggerPhoneDialogue() {
    if (gameState.callDeclinedCount <= 3) {
        showText("Spouse via Text", `Hey honey! I just landed. Btw, the first digit for your locked drawer is ${targetCode[0]}. I left the other digits around the house!`);
    } else {
        showText("Spouse via Text", `Wow, are you a bear hibernating? I landed. The first digit is ${targetCode[0]}. Find the rest in the other rooms!`);
    }
}

// ---------------------------------------------------------------------------
// Combination Lock UI
// ---------------------------------------------------------------------------
function changeDigit(index, delta) {
    lockCode[index] += delta;
    if (lockCode[index] > 9) lockCode[index] = 0;
    if (lockCode[index] < 0) lockCode[index] = 9;
    document.getElementById(`digit-${index}`).innerText = lockCode[index];
}

function checkLock() {
    let correct = true;
    for (let i = 0; i < 4; i++) {
        if (lockCode[i] !== targetCode[i]) {
            correct = false;
            break;
        }
    }

    if (correct) {
        gameState.dresserUnlocked = true;
        closeLock();
        if (typeof updateBedroomImages === 'function') {
            updateBedroomImages();
        } else {
            const drawerEl = document.getElementById('drawer-open');
            if (drawerEl) drawerEl.classList.remove('hidden');
        }
        showText("System", "*Click* The lock opens.");
        showText("Self", "It opened! Let's see what's inside... ah, a key!");
        if (!gameState.inventory.includes("Small Key")) {
            addItem("Small Key");
        }
    } else {
        showText("System", "The lock doesn't budge. Incorrect code.");
    }
}

function closeLock() {
    document.getElementById('combination-lock-ui').classList.add('hidden');
    document.getElementById('game-container').classList.remove('lock-active');
}
