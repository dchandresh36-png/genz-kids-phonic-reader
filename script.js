// Alphabet dataset structure matching your game requirements
const phonicsData = [
    { word: "A", choices: ["B", "A", "F"] },
    { word: "B", choices: ["B", "E", "M"] },
    { word: "C", choices: ["S", "O", "C"] },
    { word: "D", choices: ["D", "P", "Q"] },
    { word: "E", choices: ["X", "E", "Z"] }
];

let currentQuestionIndex = 0;
let isVoiceEngineUnlocked = false;

// Custom mobile-ready sound speaker
function speakWord(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stops previous track from jamming up
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Fine-tuned settings for clean, high-quality kids sound profile
        utterance.rate = 0.85;  
        utterance.pitch = 1.30; 
        utterance.volume = 1.0; 

        // Pulls highest fidelity audio engine available on current device
        const voices = window.speechSynthesis.getVoices();
        const sweetVoice = voices.find(voice => 
            voice.name.includes('Natural') || 
            voice.name.includes('Google') || 
            voice.name.includes('Zira') ||
            voice.name.includes('en-US')
        );
        
        if (sweetVoice) {
            utterance.voice = sweetVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}

// Activates background permission for mobile audio engines during user click events
function forceUnlockMobileAudio() {
    if (!isVoiceEngineUnlocked) {
        const silentSpeech = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(silentSpeech);
        isVoiceEngineUnlocked = true;
    }
}

// Updates display fields and loads content text cleanly
function loadQuestion() {
    const currentData = phonicsData[currentQuestionIndex];
    document.getElementById('word-display').textContent = currentData.word;
    
    for (let i = 0; i < 3; i++) {
        const button = document.getElementById(`btn-${i}`);
        if (button) {
            button.textContent = currentData.choices[i];
            button.className = "choice-btn"; // Wipes old validation feedback indicators
        }
    }
    speakWord(currentData.word);
}

// Action routing based on target button clicked
function handleChoiceClick(index) {
    forceUnlockMobileAudio();

    const currentData = phonicsData[currentQuestionIndex];
    const selectedButton = document.getElementById(`btn-${index}`);
    const choiceText = selectedButton.textContent;

    if (choiceText === currentData.word) {
        selectedButton.classList.add('correct');
        
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < phonicsData.length) {
                loadQuestion();
            } else {
                currentQuestionIndex = 0; // loops back to beginning seamlessly
                loadQuestion();
            }
        }, 1200);
    } else {
        selectedButton.classList.add('incorrect');
    }
}

// Hooks listeners into buttons programmatically to remain compliant with older webviews
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 0; i < 3; i++) {
        const button = document.getElementById(`btn-${i}`);
        if (button) {
            button.addEventListener('click', () => handleChoiceClick(i));
        }
    }
    
    loadQuestion();

    // Safe fallback initialization routine for slower tablet speech platforms
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            loadQuestion();
        };
    }
});
