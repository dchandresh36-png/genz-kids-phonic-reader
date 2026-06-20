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
        window.speechSynthesis.cancel(); // Stop any overlapping voices

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Clear child-style tablet reading configuration
        utterance.rate = 0.85;  
        utterance.pitch = 1.25; 
        utterance.volume = 1.0; 

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
    
    // Setup option choices on target buttons
    currentData.choices.forEach((choice, index) => {
        const button = document.getElementById(`btn-${index}`);
        if (button) {
            button.textContent = choice;
            button.className = "choice-btn"; // Clears color tracking classes
        }
    });

    // Try reading layout automatically
    speakWord(`Can you find the word ${currentData.word}?`);
}

function handleChoiceClick(index) {
    // Instantly unlock voice on APK mobile wrapper
    forceUnlockMobileAudio();

    const currentData = phonicsData[currentQuestionIndex];
    const selectedButton = document.getElementById(`btn-${index}`);
    const choiceText = selectedButton.textContent;

    if (choiceText === currentData.word) {
        selectedButton.classList.add('correct');
        speakWord("Great job! That is correct!");

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
        selectedButton.classList.add('incorrect');
        speakWord("Oops! Try again!");
    }
}

// ==========================================
// 4. INITIALIZE APP AND LISTENERS
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // Attach click triggers directly to buttons to bypass APK inline restrictions
    for (let i = 0; i < 3; i++) {
        const button = document.getElementById(`btn-${i}`);
        if (button) {
            button.addEventListener('click', () => handleChoiceClick(i));
        }
    }

    loadQuestion();
    
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            if (currentQuestionIndex === 0) {
                loadQuestion();
            }
        };
    }
});
