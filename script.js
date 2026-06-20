// --- App State Variables ---
let currentTargetIndex = 0; 
let alphabetList = [];
let isVoiceEngineUnlocked = false;

// --- DOM Elements ---
const welcomeScreen = document.getElementById('welcome-screen');
const appHeader = document.getElementById('app-header');
const gameQuestion = document.getElementById('game-question');
const progressBarContainer = document.getElementById('progress-container');
const progressIndicator = document.getElementById('progress-indicator');
const gridScreen = document.getElementById('grid-screen');
const cardScreen = document.getElementById('card-screen');
const startBtn = document.getElementById('start-btn');
const backBtn = document.getElementById('back-btn');
const bigLetter = document.getElementById('big-letter');
const wordText = document.getElementById('word-text');
const emojiDisplay = document.getElementById('emoji-display');

// --- Phonics Vocabulary Data Map ---
const vocabularyData = {
    'A': { word: 'Apple', emoji: '🍎' },
    'B': { word: 'Ball', emoji: '⚽' },
    'C': { word: 'Cat', emoji: '🐱' },
    'D': { word: 'Dog', emoji: '🐶' },
    'E': { word: 'Egg', emoji: '🥚' },
    'F': { word: 'Fish', emoji: '🐟' },
    'G': { word: 'Grapes', emoji: '🍇' },
    'H': { word: 'Hat', emoji: '👒' },
    'I': { word: 'Ice Cream', emoji: '🍦' },
    'J': { word: 'Juice', emoji: '🧃' }
};

const alphabetColors = [
    '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', 
    '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa'
];

// --- High Quality Speech Synth Controller ---
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = 0.85;  
        utterance.pitch = 1.30; 
        utterance.volume = 1.0; 

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

function forceUnlockMobileAudio() {
    if (!isVoiceEngineUnlocked) {
        const silentSpeech = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(silentSpeech);
        isVoiceEngineUnlocked = true;
    }
}

function initializeAlphabet() {
    alphabetList = Object.keys(vocabularyData);
}

function updateProgressBar() {
    if (alphabetList.length === 0) return;
    const progressPercentage = ((currentTargetIndex) / alphabetList.length) * 100;
    if (progressIndicator) progressIndicator.style.width = progressPercentage + '%';
}

function loadGamePage() {
    if (currentTargetIndex >= alphabetList.length) {
        speakText("Fantastic job! You finished the game!");
        if (appHeader) appHeader.classList.add('hidden');
        if (gridScreen) gridScreen.classList.add('hidden');
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        return;
    }

    const targetLetter = alphabetList[currentTargetIndex];
    if (gameQuestion) gameQuestion.textContent = "Where is the alphabet " + targetLetter + "?";
    
    // Only speaks if the audio context has already been activated via interaction
    if (isVoiceEngineUnlocked) {
        speakText("Where is the alphabet " + targetLetter + "?");
    }

    if (gridScreen) gridScreen.innerHTML = '';

    let currentChoices = [...alphabetList];
    currentChoices.sort(function() { return 0.5 - Math.random(); });

    currentChoices.forEach(function(letter, index) {
        const button = document.createElement('button');
        button.className = 'grid-cell';
        button.textContent = letter;
        button.style.backgroundColor = alphabetColors[index % alphabetColors.length];

        button.addEventListener('click', function() {
            forceUnlockMobileAudio(); 

            if (letter === targetLetter) {
                selectLetterCard(letter);
            } else {
                speakText("Wrong! Try again!");
                button.style.transform = "translateX(5px)";
                setTimeout(function() { button.style.transform = ""; }, 100);
            }
        });
        if (gridScreen) gridScreen.appendChild(button);
    });

    updateProgressBar();
}

function selectLetterCard(letter) {
    if (gridScreen) gridScreen.classList.add('hidden');
    if (cardScreen) cardScreen.classList.remove('hidden');

    const data = vocabularyData[letter];
    if (bigLetter) bigLetter.textContent = letter;
    if (emojiDisplay) emojiDisplay.textContent = data.emoji;
    if (wordText) wordText.textContent = data.word;

    speakText("Correct! " + letter + " is for " + data.word);
}

// --- Interaction Element Triggers ---
if (startBtn) {
    startBtn.addEventListener('click', function() {
        forceUnlockMobileAudio(); // Secure permission loop instantly
        currentTargetIndex = 0; 
        initializeAlphabet(); 
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (appHeader) appHeader.classList.remove('hidden');
        if (progressBarContainer) progressBarContainer.classList.remove('hidden');
        if (gridScreen) gridScreen.classList.remove('hidden');
        
        loadGamePage();
        // Read clearly now that user action context is validated
        const targetLetter = alphabetList[currentTargetIndex];
        speakText("Where is the alphabet " + targetLetter + "?");
    });
}

if (backBtn) {
    backBtn.addEventListener('click', function() {
        forceUnlockMobileAudio();
        currentTargetIndex++;
        
        if (cardScreen) cardScreen.classList.add('hidden');
        if (gridScreen) gridScreen.classList.remove('hidden');
        
        loadGamePage();
    });
}
