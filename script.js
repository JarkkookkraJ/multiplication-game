class MultiplicationGame {
    constructor() {
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.startTime = null;
        this.currentQuestion = null;
        this.timerInterval = null;
        this.targetCorrect = 20;
        this.highscores = this.loadHighscores();
        
        this.initializeElements();
        this.attachEventListeners();
        this.displayHighscores();
    }
    
    initializeElements() {
        // Screens
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.endScreen = document.getElementById('end-screen');
        
        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.submitBtn = document.getElementById('submit-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.saveScoreBtn = document.getElementById('save-score-btn');
        
        // Game elements
        this.num1Element = document.getElementById('num1');
        this.num2Element = document.getElementById('num2');
        this.answerInput = document.getElementById('answer-input');
        this.feedback = document.getElementById('feedback');
        
        // Stats elements
        this.correctCountElement = document.getElementById('correct-count');
        this.wrongCountElement = document.getElementById('wrong-count');
        this.timerElement = document.getElementById('timer');
        
        // End screen elements
        this.finalTimeElement = document.getElementById('final-time');
        this.totalAnsweredElement = document.getElementById('total-answered');
        this.accuracyElement = document.getElementById('accuracy');
        this.newRecordElement = document.getElementById('new-record');
        this.playerNameInput = document.getElementById('player-name');
        
        // Highscore elements
        this.highscoresList = document.getElementById('highscores-list');
    }
    
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        if (this.saveScoreBtn) {
            this.saveScoreBtn.addEventListener('click', () => this.saveHighscore());
        }
        
        if (this.playerNameInput) {
            this.playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveHighscore();
                }
            });
        }
    }
    
    loadHighscores() {
        const saved = localStorage.getItem('multiplicationHighscores');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }
    
    saveHighscores() {
        localStorage.setItem('multiplicationHighscores', JSON.stringify(this.highscores));
    }
    
    displayHighscores() {
        if (!this.highscoresList) return;
        
        this.highscoresList.innerHTML = '';
        
        if (this.highscores.length === 0) {
            this.highscoresList.innerHTML = '<li class="no-scores">No high scores yet!</li>';
            return;
        }
        
        this.highscores.forEach((score, index) => {
            const li = document.createElement('li');
            li.className = 'highscore-item';
            li.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="name">${score.name}</span>
                <span class="time">${score.timeString}</span>
                <span class="accuracy">${score.accuracy}%</span>
            `;
            this.highscoresList.appendChild(li);
        });
    }
    
    isNewRecord(totalTime) {
        if (this.highscores.length < 3) return true;
        return totalTime < this.highscores[2].time;
    }
    
    saveHighscore() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name!');
            return;
        }
        
        const totalTime = Date.now() - this.startTime;
        const minutes = Math.floor(totalTime / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const totalQuestions = this.correctAnswers + this.wrongAnswers;
        const accuracy = Math.round((this.correctAnswers / totalQuestions) * 100);
        
        const newScore = {
            name: playerName,
            time: totalTime,
            timeString: timeString,
            accuracy: accuracy,
            date: new Date().toLocaleDateString()
        };
        
        this.highscores.push(newScore);
        this.highscores.sort((a, b) => a.time - b.time);
        this.highscores = this.highscores.slice(0, 3); // Keep only top 3
        
        this.saveHighscores();
        this.displayHighscores();
        
        // Hide the name input section by adding hidden class
        this.newRecordElement.classList.add('hidden');
        
        alert(`Congratulations ${playerName}! Your score has been saved! 🎉`);
    }
    
    startGame() {
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.startTime = Date.now();
        
        this.showScreen('game');
        this.generateQuestion();
        this.startTimer();
        this.updateStats();
        
        // Focus on input
        this.answerInput.focus();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    generateQuestion() {
        const num1 = Math.floor(Math.random() * 8) + 2;
        const num2 = Math.floor(Math.random() * 8) + 2;

        this.currentQuestion = {
            num1: num1,
            num2: num2,
            answer: num1 * num2
        };
        
        this.num1Element.textContent = num1;
        this.num2Element.textContent = num2;
        this.answerInput.value = '';
        this.hideFeedback();
        
        // Focus on input
        this.answerInput.focus();
    }
    
    submitAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a number!', false);
            return;
        }
        
        if (userAnswer === this.currentQuestion.answer) {
            this.correctAnswers++;
            this.showFeedback('Correct! 🎉', true);
            
            if (this.correctAnswers >= this.targetCorrect) {
                setTimeout(() => this.endGame(), 1000);
                return;
            }
        } else {
            this.wrongAnswers++;
            this.showFeedback(
                `Wrong! ${this.currentQuestion.num1} × ${this.currentQuestion.num2} = ${this.currentQuestion.answer}`, 
                false
            );
        }
        
        this.updateStats();
        setTimeout(() => this.generateQuestion(), 1500);
    }
    
    skipQuestion() {
        this.wrongAnswers++;
        this.showFeedback(
            `Skipped! ${this.currentQuestion.num1} × ${this.currentQuestion.num2} = ${this.currentQuestion.answer}`, 
            false
        );
        this.updateStats();
        setTimeout(() => this.generateQuestion(), 1500);
    }
    
    showFeedback(message, isCorrect) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        this.feedback.classList.remove('hidden');
    }
    
    hideFeedback() {
        this.feedback.classList.add('hidden');
    }
    
    updateStats() {
        this.correctCountElement.textContent = this.correctAnswers;
        this.wrongCountElement.textContent = this.wrongAnswers;
    }
    
    endGame() {
        this.stopTimer();
        
        const totalTime = Date.now() - this.startTime;
        const minutes = Math.floor(totalTime / 60000);
        const seconds = Math.floor((totalTime % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const totalQuestions = this.correctAnswers + this.wrongAnswers;
        const accuracy = Math.round((this.correctAnswers / totalQuestions) * 100);
        
        this.finalTimeElement.textContent = timeString;
        this.totalAnsweredElement.textContent = totalQuestions;
        this.accuracyElement.textContent = accuracy;
        
        // Check if it's a new record - force it to show for first player
        const isNewRecord = this.highscores.length === 0 || this.isNewRecord(totalTime);
        
        if (isNewRecord && this.newRecordElement) {
            // Remove hidden class instead of setting display style
            this.newRecordElement.classList.remove('hidden');
            if (this.playerNameInput) {
                this.playerNameInput.value = '';
                setTimeout(() => this.playerNameInput.focus(), 100);
            }
        } else if (this.newRecordElement) {
            // Add hidden class instead of setting display style
            this.newRecordElement.classList.add('hidden');
        }
        
        this.showScreen('end');
    }
    
    restartGame() {
        this.showScreen('start');
        this.correctCountElement.textContent = '0';
        this.wrongCountElement.textContent = '0';
        this.timerElement.textContent = '00:00';
    }
    
    showScreen(screen) {
        this.startScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.endScreen.classList.add('hidden');
        
        switch(screen) {
            case 'start':
                this.startScreen.classList.remove('hidden');
                break;
            case 'game':
                this.gameScreen.classList.remove('hidden');
                break;
            case 'end':
                this.endScreen.classList.remove('hidden');
                break;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MultiplicationGame();
});