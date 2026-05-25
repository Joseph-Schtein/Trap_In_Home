// Add phone audio tracking to your global game state
const gameState = {
    currentScene: 'bedroom',
    inventory: [],
    selectedItem: null,

    // States
    wardrobeOpen: false,
    kitchenDrawerOpen: false,
    hasDeadboltKey: false,
    locksRemaining: 3,

    // Audio Reference
    phoneRingtone: new Audio('../Sound/freesound_community-cellphone-ringing-6475.mp3')
};

// Configure the ringtone properties
gameState.phoneRingtone.loop = true;

// Override the window loading sequence
window.onload = () => {
    // Note: Browsers require a click on the document before audio can play
    showOpeningModal();
};

function showOpeningModal() {
    // Show a splash message so browser allows the sound to trigger on click
    showText("System", "Click anywhere to wake up...");

    // Listen for the absolute first interaction to start the atmospheric audio
    document.body.addEventListener('click', startIntroSequence, { once: true });
}

function startIntroSequence() {
    // Wait a second before playing the ringtone and starting the sequence
    setTimeout(() => {
        // Play the phone calling sound loop
        gameState.phoneRingtone.play().catch(error => {
            console.log("Audio playback prevented by browser policies:", error);
        });

        // Display the initial narrative reaction hook
        showText("Self", "*Groan*... My head hurts. What is that piercing noise? Is my cell phone ringing somewhere in the room?");

        // Highlight the dresser or phone hotspot by adding a temporary visual cue if desired
        document.getElementById('bedroom-phone-hotspot').classList.add('pulse-glow');
    }, 1000);
}

// Update the interaction behavior inside your router
function interact(target) {
    switch (target) {
        case 'alarm_clock':
            showText("Self", "The digital display is completely blank. The power must have cut out during the night.");
            break;

        case 'bedroom_dresser':
            // If the phone is ringing, clicking here answers it
            if (!gameState.phoneRingtone.paused) {
                gameState.phoneRingtone.pause(); // Stop the calling sound
                gameState.phoneRingtone.currentTime = 0;

                document.getElementById('bedroom-phone-hotspot').classList.remove('pulse-glow');
                addItem("Spouse's Phone");

                // Advance straight into the story dialog sequence
                triggerPhoneDialogue();
            } else {
                showText("Self", "Just empty charging bricks and stray loose change on the surface.");
            }
            break;

        case 'wardrobe':
            if (!gameState.wardrobeOpen) {
                gameState.wardrobeOpen = true;
                document.getElementById('wardrobe-open').classList.remove('hidden');
                showText("Self", "I pulled back the wardrobe doors. Looks like a heavy security lockbox is sitting on the bottom shelf.");
            } else {
                showText("Self", "The lockbox dials won't budge without an access combination.");
            }
            break;

        // Keep other interactions intact...
    }
}