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
    kitchenKeysUsed: false, // Legacy fallback
    upperCabinetUnlocked: false,
    lowerCabinetUnlocked: false,
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
    entranceDoorOpen: false,

    // Phone / audio states
    hasDeadboltKey: false,
    locksRemaining: 3,
    callDeclinedCount: 0,
    isPhoneRinging: false,

    // Drag and Drop
    activeDragItem: null,
    entranceDoorKeyUsed: false,

    // Audio
    phoneRingtone: new Audio('../Sound/cellphone-ringing.mp3'),

    // Time
    currentTimeMinutes: 8 * 60 + 23 // Starts at 08:23
};

// Configure ringtone
gameState.phoneRingtone.loop = true;
gameState.phoneRingtone.volume = 0.3;

// Shared cabinet / door sounds
const cabinetOpenSound = new Audio('../Sound/cabinet-door-open.mp3');
const cabinetCloseSound = new Audio('../Sound/cabinet-door-close.mp3');
const paperSound = new Audio('../Sound/paper.mp3');
const keysSound = new Audio('../Sound/keys.mp3');
const winningSound = new Audio('../Sound/winning.mp3');
const correctSound = new Audio('../Sound/correct.mp3');
const wrongSound = new Audio('../Sound/wrong.mp3');

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
    // Fixed 4-digit code
    targetCode = [3, 7, 1, 9];

    // Start a timer to advance time by 1 game minute every 40 real seconds
    setInterval(() => {
        advanceTime(1);
    }, 40000);

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

function showText(speaker, text, action = null, options = null) {
    dialogueQueue.push({ speaker, text, action, options });
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
    const optionsContainer = document.getElementById('dialogue-options');
    const arrowEl = container ? container.querySelector('.dialogue-arrow') : null;

    if (container && speakerEl && textEl) {
        speakerEl.innerText = current.speaker;
        textEl.innerText = current.text;
        container.classList.remove('hidden');
        document.getElementById('game-container').classList.add('dialogue-active');

        if (current.options && current.options.length > 0) {
            container.classList.add('has-options');
            if (arrowEl) arrowEl.classList.add('hidden');
            if (optionsContainer) {
                optionsContainer.innerHTML = '';
                current.options.forEach((opt, index) => {
                    const btn = document.createElement('button');
                    btn.className = 'dialogue-option-btn';
                    btn.innerText = opt.text;
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        handleDialogueOption(index);
                    };
                    optionsContainer.appendChild(btn);
                });
                optionsContainer.classList.remove('hidden');
            }
        } else {
            container.classList.remove('has-options');
            if (arrowEl) arrowEl.classList.remove('hidden');
            if (optionsContainer) {
                optionsContainer.classList.add('hidden');
            }
        }
    }
    if (current.action && typeof current.action === 'function') {
        current.action();
    }
}

function handleDialogueOption(index) {
    if (dialogueQueue.length === 0) return;
    const current = dialogueQueue[0];
    if (current.options && current.options[index]) {
        const opt = current.options[index];
        if (opt.action && typeof opt.action === 'function') {
            opt.action();
        }
    }
    advanceDialogue();
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
        if (container.classList.contains('has-options')) return;
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

    // Reveal the paper in the living room once all 4 digits are collected
    const allDigits = [`${targetCode[0]}`, `${targetCode[1]}`, `${targetCode[2]}`, `${targetCode[3]}`];
    if (allDigits.every(d => gameState.inventory.includes(d))) {
        const paperImg = document.getElementById('living-room-paper');
        const paperHotspot = document.getElementById('paper-hotspot');
        if (paperImg) paperImg.style.display = 'block';
        if (paperHotspot) paperHotspot.style.display = 'block';
    }

    const slots = document.getElementById('inventory-slots');
    if (slots) {
        const itemEl = document.createElement('div');
        itemEl.className = 'inv-item';
        itemEl.setAttribute('data-item-name', itemName);

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
            imgEl.src = "../pictures/keys/KitchenKey.png";
            imgEl.alt = itemName;
            imgEl.style.width = "100%";
            imgEl.style.height = "100%";
            imgEl.style.objectFit = "contain";
            itemEl.appendChild(imgEl);
        } else if (itemName === "Entrance Door Key") {
            const imgEl = document.createElement('img');
            imgEl.src = "../pictures/keys/entranceDoorKey.png";
            imgEl.alt = itemName;
            imgEl.style.width = "100%";
            imgEl.style.height = "100%";
            imgEl.style.objectFit = "contain";
            itemEl.appendChild(imgEl);
        } else if (itemName === "Living Room Key") {
            const imgEl = document.createElement('img');
            imgEl.src = "../pictures/keys/Livingroom.png";
            imgEl.alt = itemName;
            imgEl.style.width = "100%";
            imgEl.style.height = "100%";
            imgEl.style.objectFit = "contain";
            itemEl.appendChild(imgEl);
        } else if (itemName === "Paper") {
            const imgEl = document.createElement('img');
            imgEl.src = "../pictures/papers/pile.png";
            imgEl.alt = itemName;
            imgEl.style.width = "100%";
            imgEl.style.height = "100%";
            imgEl.style.objectFit = "contain";
            itemEl.appendChild(imgEl);
            itemEl.onclick = (e) => { e.stopPropagation(); openImagePreview('../pictures/papers/papers.png'); };
            slots.appendChild(itemEl);
            return;
        } else {
            itemEl.innerText = itemName;
        }

        itemEl.onclick = (e) => showInventoryOptions(e, itemName);
        slots.appendChild(itemEl);
    }
}

function removeItem(itemName) {
    const index = gameState.inventory.indexOf(itemName);
    if (index > -1) {
        gameState.inventory.splice(index, 1);
    }
    const slots = document.getElementById('inventory-slots');
    if (slots) {
        const children = Array.from(slots.children);
        for (let i = 0; i < children.length; i++) {
            if (children[i].getAttribute('data-item-name') === itemName) {
                slots.removeChild(children[i]);
                break;
            }
        }
    }
}

function showInventoryOptions(e, itemName) {
    if (gameState.activeDragItem === itemName) {
        e.stopPropagation();
        return;
    }
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
    } else if (itemName === "Entrance Door Key") {
        showText("Self", "The key to the front door.");
    } else if (itemName === "Living Room Key") {
        showText("Self", "A key for the living room.");
    } else if (itemName === "Paper") {
        openImagePreview('../pictures/papers/papers.png');
    } else {
        showText("Self", `I examined the ${itemName}.`);
    }
}

function openImagePreview(src) {
    const modal = document.getElementById('image-preview-modal');
    const img = document.getElementById('image-preview-img');
    if (modal && img) {
        img.src = src;
        modal.classList.remove('hidden');
        paperSound.cloneNode().play();
    }
}

function closeImagePreview() {
    const modal = document.getElementById('image-preview-modal');
    if (modal) modal.classList.add('hidden');
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
    } else if (itemName === "Kitchen Keys" || itemName === "Living Room Key" || itemName === "Entrance Door Key") {
        gameState.activeDragItem = itemName;
        // Find the element and highlight it
        const slots = document.getElementById('inventory-slots');
        if (slots) {
            Array.from(slots.children).forEach(child => {
                if (child.getAttribute('data-item-name') === itemName) {
                    child.classList.add('dragging-ready');
                } else {
                    child.classList.remove('dragging-ready');
                }
            });
        }
    } else {
        showText("Self", `I tried to use the ${itemName}, but nothing happened.`);
    }
}

// ---------------------------------------------------------------------------
// Drag and Drop Logic for Items
// ---------------------------------------------------------------------------
let dragGhost = null;

// Prevent native browser drag-and-drop to avoid conflicting ghost images
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('.inv-item')) {
        e.preventDefault();
    }
});

document.addEventListener('pointerdown', (e) => {
    if (!gameState.activeDragItem) return;
    
    // Check if we clicked on the active drag item
    const invItem = e.target.closest('.inv-item');
    if (invItem && invItem.getAttribute('data-item-name') === gameState.activeDragItem) {
        e.preventDefault(); // Prevent default browser drag or scrolling
        
        // Create ghost
        dragGhost = document.createElement('img');
        dragGhost.className = 'drag-ghost';
        
        // Get the image source from the inventory item
        const img = invItem.querySelector('img');
        if (img) {
            dragGhost.src = img.src;
        } else {
            // Fallback for text items
            return; 
        }
        
        document.body.appendChild(dragGhost);
        dragGhost.style.left = e.clientX + 'px';
        dragGhost.style.top = e.clientY + 'px';
    }
}, { passive: false });

document.addEventListener('pointermove', (e) => {
    if (dragGhost) {
        dragGhost.style.left = e.clientX + 'px';
        dragGhost.style.top = e.clientY + 'px';
    }
});

document.addEventListener('pointerup', (e) => {
    if (dragGhost) {
        // Find what we dropped it on
        dragGhost.style.display = 'none'; // hide ghost so elementFromPoint works
        const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
        dragGhost.style.display = '';
        
        if (elemBelow && elemBelow.classList.contains('hotspot')) {
            const onclickAttr = elemBelow.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/interact\(['"]([^'"]+)['"]\)/);
                if (match) {
                    const targetId = match[1];
                    handleItemDrop(gameState.activeDragItem, targetId);
                }
            }
        } else {
            showText("Self", "I can't use this here.");
        }
        
        // Cleanup drag state
        dragGhost.remove();
        dragGhost = null;
        gameState.activeDragItem = null;
        
        // Remove highlight
        const slots = document.getElementById('inventory-slots');
        if (slots) {
            Array.from(slots.children).forEach(child => child.classList.remove('dragging-ready'));
        }
    }
});

function handleItemDrop(itemName, targetId) {
    if (itemName === "Kitchen Keys") {
        if (targetId === "island_drawers") {
            if (!gameState.upperCabinetUnlocked) {
                gameState.upperCabinetUnlocked = true;
                showText("Self", "I used the keys to unlock the upper cabinet.");
                if (gameState.lowerCabinetUnlocked) removeItem(itemName);
                interact(targetId);
            } else {
                showText("Self", "This cabinet is already unlocked.");
            }
        } else if (targetId === "oven") {
            if (!gameState.lowerCabinetUnlocked) {
                gameState.lowerCabinetUnlocked = true;
                showText("Self", "I used the keys to unlock the lower cabinet.");
                if (gameState.upperCabinetUnlocked) removeItem(itemName);
                interact(targetId);
            } else {
                showText("Self", "This cabinet is already unlocked.");
            }
        } else {
            showText("Self", "These keys don't fit here.");
        }
    } else if (itemName === "Entrance Door Key") {
        if (targetId === "front_door") {
            gameState.entranceDoorKeyUsed = true;
            interact(targetId);
        } else {
            showText("Self", "This key doesn't fit here.");
        }
    } else if (itemName === "Living Room Key") {
        // Curve ball key - doesn't fit anything
        showText("Self", "This key doesn't seem to fit anywhere. Did someone leave it here as a joke?");
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
        showText("Spouse via Text", `Hey honey! I just landed. Btw, one of the digits for your locked drawer is ${targetCode[0]}. I left the others around the house!`);
    } else {
        showText("Spouse via Text", `Wow, are you a bear hibernating? I landed. Here's one of the digits: ${targetCode[0]}. Find the rest in the other rooms!`);
    }
    if (!gameState.inventory.includes(`Note: ${targetCode[0]}`)) {
        addItem(`${targetCode[0]}`);
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
        correctSound.play();
        gameState.dresserUnlocked = true;
        closeLock();
        if (typeof updateBedroomImages === 'function') {
            updateBedroomImages();
        } else {
            const drawerEl = document.getElementById('drawer-open');
            if (drawerEl) drawerEl.classList.remove('hidden');
        }
        showText("System", "*Click* The lock opens.");
        showText("Self", "It opened! Let's see what's inside... ah, just some jewelry like David said.");
    } else {
        wrongSound.play();
        showText("System", "The lock doesn't budge. Incorrect code.");
    }
}

function closeLock() {
    document.getElementById('combination-lock-ui').classList.add('hidden');
    document.getElementById('game-container').classList.remove('lock-active');
}
