// ==========================================
// 1. GAME DATA (WORDS & QUESTIONS)
// ==========================================
const phonicsData = [
    { word: "CAT", choices: ["A", "CAT", "D"] },
    { word: "DOG", choices: ["DOG", "O", "G"] },
    { word: "SUN", choices: ["S", "U", "SUN"] },
    { word: "BALL", choices: ["B", "BALL", "L"] },
    { word: "BAT", choices: ["BAT", "A", "T"] }
];

let currentQuestionIndex = 0;
let isVoiceEngineUnlocked = false;

// ==========================================
// 2. VOICE ENGINE FUNCTIONS
// ==========================================
function speakWord(text) {
    if ('speechSynthesis' in window) {
        // Stop any current speech before talking
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Sweet, clear tablet configurations
        utterance.rate = 0.85;  
        utterance.pitch = 1.25; 
        utterance.volume = 1.0; 

        // Match clean system voice
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

// Helper to safely unlock Android/iOS audio context
function forceUnlockMobileAudio() {
    if (!isVoiceEngineUnlocked) {
        const silentSpeech = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(silentSpeech);
        isVoiceEngineUnlocked = true;
    }
}

// ==========================================
// 3. CORE GAME LOGIC
// ==========================================
function loadQuestion() {
    const currentData = phonicsData[currentQuestionIndex];
    
    // Set visual layout word text
    document.getElementById('word-display').textContent = currentData.word;
    
    // Setup option choices on target elements
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((button, index) => {
        button.textContent = currentData.choices[index];
        button.className = "choice-btn"; // Clears color tracking classes
    });

    // Try reading layout automatically (Works perfectly post-unlock click)
    speakWord(`Can you find the word ${currentData.word}?`);
}

// Master execution route for interface button taps
function handleChoiceClick(selectedButton) {
    // 1. Instantly trip the APK system engine to let speech bypass restrictions
    forceUnlockMobileAudio();

    const choiceText = selectedButton.textContent;
    const currentData = phonicsData[currentQuestionIndex];

    if (choiceText === currentData.word) {
        // Correct Action
        selectedButton.classList.add('correct');
        speakWord("Great job! That is correct!");
        
        if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }

        // Loop forward after 2 second pause
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < phonicsData.length) {
                loadQuestion();
            } else {
                speakWord("You completed the game! Let's play again!");
                currentQuestionIndex = 0;
                loadQuestion();
            }
        }, 2000);

    } else {
        // Incorrect Action
        selectedButton.classList.add('incorrect');
        speakWord("Oops! Try again!");
    }
}

// ==========================================
// 4. INITIALIZE ENTRY
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    loadQuestion();
    
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            if (currentQuestionIndex === 0) {
                loadQuestion();
            }
        };
    }
});
