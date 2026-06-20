// ==========================================
// 1. MOBILE APK VOICE ENGINE UNLOCKER
// ==========================================
// Mobile devices block audio until the user interacts. 
// This instantly unlocks the voice engine on the very first screen tap.
document.addEventListener('click', function unlockVoice() {
    const silentSpeech = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(silentSpeech);
    document.removeEventListener('click', unlockVoice);
}, { once: true });

// ==========================================
// 2. GAME DATA (WORDS & QUESTIONS)
// ==========================================
const phonicsData = [
    { word: "CAT", choices: ["A", "CAT", "D"] },
    { word: "DOG", choices: ["DOG", "O", "G"] },
    { word: "SUN", choices: ["S", "U", "SUN"] },
    { word: "BALL", choices: ["B", "BALL", "L"] },
    { word: "BAT", choices: ["BAT", "A", "T"] }
];

let currentQuestionIndex = 0;

// ==========================================
// 3. VOICE ENGINE FUNCTIONS
// ==========================================
function speakWord(text) {
    // Check if browser/APK supports speech
    if ('speechSynthesis' in window) {
        // Stop any ongoing speech before starting a new one
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Settings for a friendly, clear, sweet child-tablet style reading
        utterance.rate = 0.85;  // Slightly slower so kids can understand easily
        utterance.pitch = 1.25; // Slightly higher pitch for a friendly tone
        utterance.volume = 1.0; // Maximum volume

        // Find a high-quality natural voice if available
        const voices = window.speechSynthesis.getVoices();
        const sweetVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Natural') || 
            voice.name.includes('Zira')
        );
        
        if (sweetVoice) {
            utterance.voice = sweetVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}

// ==========================================
// 4. CORE GAME LOGIC
// ==========================================
function loadQuestion() {
    const currentData = phonicsData[currentQuestionIndex];
    
    // Update the visual word placeholder text on screen
    document.getElementById('word-display').textContent = currentData.word;
    
    // Set up the 3 button choices
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((button, index) => {
        button.textContent = currentData.choices[index];
        button.className = "choice-btn"; // Reset any correct/incorrect colors
    });

    // Speak the question out loud
    // Note: On the very first question of an APK, this might be silent until they tap a button!
    speakWord(`Can you find the word ${currentData.word}?`);
}

function checkAnswer(selectedButton, choice) {
    const currentData = phonicsData[currentQuestionIndex];

    if (choice === currentData.word) {
        // Correct answer styling
        selectedButton.classList.add('correct');
        speakWord("Great job! That is correct!");
        
        // Trigger confetti celebration if function exists
        if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }

        // Wait 2 seconds, then advance to next question
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < phonicsData.length) {
                loadQuestion();
            } else {
                // Game Over / Restart Loop
                speakWord("You completed the game! Let's play again!");
                currentQuestionIndex = 0;
                loadQuestion();
            }
        }, 2000);

    } else {
        // Incorrect answer styling
        selectedButton.classList.add('incorrect');
        speakWord("Oops! Try again!");
    }
}

// ==========================================
// 5. INITIALIZE THE GAME
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    loadQuestion();
    
    // Ensure voices are fully loaded in systems like Android Chrome/WebView
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            // Re-read if it was cut off during loading
            if(currentQuestionIndex === 0) {
                speakWord(`Can you find the word ${phonicsData[0].word}?`);
            }
        };
    }
});
