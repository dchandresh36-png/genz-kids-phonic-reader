// --- App State Variables ---
let currentTargetIndex = 0; 
let alphabetList = [];
let currentAudio = null;
let currentProgress = 0;

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
    'I': { word: 'Igloo', emoji: '⛺' },
    'J': { word: 'Jug', emoji: '𫖖' },
    'K': { word: 'Kite', emoji: '🪁' },
    'L': { word: 'Lion', emoji: '🦁' },
    'M': { word: 'Mango', emoji: '🥭' },
    'N': { word: 'Nose', emoji: '👃' },
    'O': { word: 'Orange', emoji: '🍊' },
    'P': { word: 'Parrot', emoji: '🦜' },
    'Q': { word: 'Queen', emoji: '👸' },
    'R': { word: 'Rat', emoji: '🐀' },
    'S': { word: 'Snake', emoji: '🐍' },
    'T': { word: 'Train', emoji: '🚂' },
    'U': { word: 'Umbrella', emoji: '☂' },
    'V': { word: 'Vegetables', emoji: '🥦' },
    'W': { word: 'Watch', emoji: '⌚' },
    'X': { word: 'Xylophone', emoji: '🪘' },
    'Y': { word: 'Yellow', emoji: '💛' },
    'Z': { word: 'Zebra', emoji: '🦓' }
};

// Generates an A-Z array structure and shuffles the list cleanly
function initializeAlphabet() {
    alphabetList = [];
    for (let i = 65; i <= 90; i++) {
        alphabetList.push(String.fromCharCode(i));
    }
    alphabetList.sort(function() { return Math.random() - 0.5; });
}

// --- 🔊 Automated Sweet Tablet Voice Engine ---
function readQuestionAloud(textToSpeak) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Clears any frozen overlapping speech tracks

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        const voices = window.speechSynthesis.getVoices();
        
        // Match natural device/Google child-friendly voice pipelines
        let sweetVoice = voices.find(voice => 
            voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Natural'))
        ) || voices.find(voice => voice.lang.startsWith('en'));

        if (sweetVoice) {
            utterance.voice = sweetVoice;
        }

        utterance.rate = 0.85;  // Patient reading speed for kids
        utterance.pitch = 1.15; // Bright, joyful high tone setup

        window.speechSynthesis.speak(utterance);
    }
}

// Warm up local TTS profiles immediately upon mobile WebView compilation
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// --- Core Audio Engine Drivers ---

function playMyVoice(letterName) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(letterName.toLowerCase() + ".aac");
    currentAudio.play().catch(function(error) { console.log("Audio play blocked:", error); });
}

function playFeedbackSound(type) {
    let feedbackAudio = new Audio(type + ".aac");
    feedbackAudio.play().catch(function(error) { console.log("Audio play blocked:", error); });
}

// --- Falling Paper Confetti Effect Layout ---
function createConfettiShower() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    for (let i = 0; i < 40; i++) {
        const piece = document.createElement('div');
        piece.style.position = 'fixed';
        piece.style.width = (Math.random() * 8 + 6) + 'px';
        piece.style.height = (Math.random() * 15 + 10) + 'px';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.left = (Math.random() * 100) + 'vw';
        piece.style.top = '-20px';
        piece.style.zIndex = '9999';
        piece.style.borderRadius = '2px';
        piece.style.opacity = Math.random();
        
        piece.style.transition = 'transform 2s linear, top 2s linear';
        document.body.appendChild(piece);

        (function(p) {
            setTimeout(function() {
                p.style.top = '110vh';
                p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg) translateX(' + (Math.random() * 50 - 25) + 'px)';
            }, 50);
            setTimeout(function() { p.remove(); }, 2100);
        })(piece);
    }
}

function updateProgressBar() {
    currentProgress = (currentTargetIndex / 26) * 100;
    if (progressIndicator) {
        progressIndicator.style.width = currentProgress + '%';
    }
}

function selectLetterCard(letter) {
    if (bigLetter) bigLetter.innerText = letter;
    
    const letterData = vocabularyData[letter];
    if (letterData) {
        if (wordText) wordText.innerText = letterData.word;
        if (emojiDisplay) emojiDisplay.innerText = letterData.emoji;
    }
    
    if (gridScreen) gridScreen.classList.add('hidden');
    if (cardScreen) cardScreen.classList.remove('hidden');
    
    // Play "wow" appreciation immediately
    playFeedbackSound('wow');
    
    // DELAYED TIMING FIX: Waits 3.2 seconds so your 3-second "wow" file finishes perfectly
    setTimeout(function() { 
        playMyVoice(letter); 
    }, 3200);
}

// --- Dynamic 3-Choice Page Generator Loop ---
function loadGamePage() {
    if (currentTargetIndex >= 26) {
        const endText = "🏆 Game Completed! 🏆";
        if (gameQuestion) gameQuestion.innerText = endText;
        readQuestionAloud("Game Completed! Outstanding job!");
        if (progressBarContainer) progressBarContainer.classList.add('hidden');
        
        if (gridScreen) {
            gridScreen.style.display = "block";
            gridScreen.innerHTML = `
                <div style="text-align: center; padding: 20px; animation: popIn 0.5s ease;">
                    <div style="font-size: 80px; margin-bottom: 15px; animation: playfulBounce 1.5s infinite alternate;">🏆✨⭐</div>
                    <h2 style="font-size: 32px; color: #22c55e; margin: 10px 0;">Outstanding Job!</h2>
                    <p style="font-size: 18px; color: #475569; line-height: 1.6; margin-bottom: 25px;">
                        You successfully found every single alphabet! Your mom and I are incredibly proud of your hard work! 🎉
                    </p>
                    <button id="restart-btn" class="action-btn gold-btn" style="font-size: 18px; padding: 12px 30px;">Play Again 🔄</button>
                </div>
            `;
            
            document.getElementById('restart-btn').addEventListener('click', function() {
                gridScreen.style.display = "";
                currentTargetIndex = 0;
                initializeAlphabet(); 
                if (progressBarContainer) progressBarContainer.classList.remove('hidden');
                loadGamePage();
            });
        }
        return;
    }

    if (gridScreen) gridScreen.innerHTML = ''; 
    const targetLetter = alphabetList[currentTargetIndex];
    const displayString = "Where is the alphabet " + targetLetter + "?";

    if (gameQuestion) {
        gameQuestion.innerText = displayString;
    }

    // 🔊 Automatically read the current target question via device TTS engine
    setTimeout(() => {
        readQuestionAloud(displayString);
    }, 250);

    let fullList = Object.keys(vocabularyData);
    let wrongChoices = fullList.filter(function(l) { return l !== targetLetter; });
    wrongChoices.sort(function() { return Math.random() - 0.5; });
    
    let pageChoices = [targetLetter, wrongChoices[0], wrongChoices[1]];
    pageChoices.sort(function() { return Math.random() - 0.5; }); 

    const alphabetColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

    pageChoices.forEach(function(letter, index) {
        const button = document.createElement('button');
        button.innerText = letter;
        button.className = 'letter-btn';
        button.style.backgroundColor = alphabetColors[index % alphabetColors.length];

        button.addEventListener('click', function() {
            if (letter === targetLetter) {
                createConfettiShower(); 
                selectLetterCard(letter);
            } else {
                playFeedbackSound('buzzer'); 
                button.style.transform = "translateX(5px)";
                setTimeout(function() { button.style.transform = ""; }, 100);
            }
        });
        if (gridScreen) gridScreen.appendChild(button);
    });

    updateProgressBar();
}

// --- Application Flow Initialization Routing ---

if (startBtn) {
    startBtn.addEventListener('click', function() {
        currentTargetIndex = 0; 
        initializeAlphabet(); 
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (appHeader) appHeader.classList.remove('hidden');
        if (progressBarContainer) progressBarContainer.classList.remove('hidden');
        if (gridScreen) gridScreen.classList.remove('hidden');
        
        loadGamePage();
    });
}

if (backBtn) {
    backBtn.addEventListener('click', function() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        
        currentTargetIndex++;
        
        if (cardScreen) cardScreen.classList.add('hidden');
        if (gridScreen) gridScreen.classList.remove('hidden');
        
        loadGamePage();
    });
}