// ===========================================
// 于倫部落格 - 遊戲頁面專用版本
// ===========================================

class GamesPage {
    constructor() {
        // 防止重複初始化
        if (window.gamesPageLoaded) return;
        window.gamesPageLoaded = true;
        
        this.init();
    }

    init() {
        this.createGameSection();
        this.bindEvents();
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showToast('🎮 歡迎來到小遊戲樂園！準備好挑戰了嗎？');
        }, 500);
    }

    createGameSection() {
        const gameHTML = `
        <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
            <div class="games-intro rainbow-border" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 2rem; margin-bottom: 3rem; text-align: center;">
                <h2 style="color: #7ed6df; margin-bottom: 1rem; font-size: 1.8rem;">🎯 遊戲規則</h2>
                <p style="color: #888; font-size: 1.1rem; line-height: 1.6;">
                    這裡有四個有趣的小遊戲等著你！<br>
                    每個遊戲都會記錄你的最佳成績，快來挑戰吧！
                </p>
            </div>
            
            <div class="games-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                <!-- 猜數字遊戲 -->
                <div class="game-card breathing-rgb" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 2rem;">
                    <h3 style="color: #7ed6df; margin-bottom: 1rem; font-size: 1.5rem;">🔢 智力猜數字</h3>
                    <p style="color: #888; margin-bottom: 1.5rem; line-height: 1.5;">
                        我想了一個1-100的數字，你能用最少次數猜中嗎？<br>
                        <small style="color: #666;">提示：我會告訴你是大了還是小了～</small>
                    </p>
                    <div class="guess-game">
                        <input type="number" id="guessInput" placeholder="輸入你的猜測 (1-100)" min="1" max="100"
                               style="width: 100%; padding: 1rem; border-radius: 8px; border: 2px solid rgba(126,214,223,0.3); 
                                      background: rgba(24,28,36,0.8); color: white; margin-bottom: 1rem; font-size: 1rem;">
                        <button id="guessBtn" class="game-btn rainbow-border" 
                                style="width: 100%; padding: 1rem; border: none; border-radius: 8px; 
                                       background: linear-gradient(45deg, #7ed6df, #e056fd); color: white; cursor: pointer; 
                                       font-weight: bold; font-size: 1rem; transition: all 0.3s ease;">
                            🎯 開始猜測！
                        </button>
                        <div id="guessResult" style="margin-top: 1rem; text-align: center; color: #7ed6df; font-size: 1.1rem; min-height: 24px;"></div>
                        <div id="guessCount" style="margin-top: 0.5rem; text-align: center; color: #888; min-height: 20px;"></div>
                        <div id="guessBest" style="margin-top: 0.5rem; text-align: center; color: #f39c12; font-size: 0.9rem;"></div>
                    </div>
                </div>

                <!-- 記憶力測試 -->
                <div class="game-card floating-lights" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 2rem;">
                    <h3 style="color: #e056fd; margin-bottom: 1rem; font-size: 1.5rem;">🧠 超級記憶力</h3>
                    <p style="color: #888; margin-bottom: 1.5rem; line-height: 1.5;">
                        記住方塊亮起的順序，然後按相同順序點擊<br>
                        <small style="color: #666;">考驗你的記憶力和反應速度！</small>
                    </p>
                    <div class="memory-game">
                        <div class="memory-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 1.5rem;">
                            <div class="memory-btn" data-index="0" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                            <div class="memory-btn" data-index="1" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                            <div class="memory-btn" data-index="2" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                            <div class="memory-btn" data-index="3" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                            <div class="memory-btn" data-index="4" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                            <div class="memory-btn" data-index="5" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                            <div class="memory-btn" data-index="6" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                            <div class="memory-btn" data-index="7" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                            <div class="memory-btn" data-index="8" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid rgba(126,214,223,0.3);"></div>
                        </div>
                        <button id="memoryStart" class="game-btn breathing-rgb" 
                                style="width: 100%; padding: 1rem; border: none; border-radius: 8px; 
                                       background: linear-gradient(45deg, #e056fd, #7ed6df); color: white; cursor: pointer; 
                                       font-weight: bold; font-size: 1rem;">
                            🚀 開始記憶挑戰
                        </button>
                        <div id="memoryResult" style="margin-top: 1rem; text-align: center; color: #e056fd; font-size: 1.1rem; min-height: 24px;"></div>
                        <div id="memoryLevel" style="margin-top: 0.5rem; text-align: center; color: #888; min-height: 20px;"></div>
                        <div id="memoryBest" style="margin-top: 0.5rem; text-align: center; color: #f39c12; font-size: 0.9rem;"></div>
                    </div>
                </div>

                <!-- 幸運轉盤 -->
                <div class="game-card diamond-shine" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 2rem;">
                    <h3 style="color: #f39c12; margin-bottom: 1rem; font-size: 1.5rem;">🎰 幸運轉盤</h3>
                    <p style="color: #888; margin-bottom: 1.5rem; line-height: 1.5;">
                        轉動轉盤，看看今天的運氣如何！<br>
                        <small style="color: #666;">每天都有不同的驚喜等著你～</small>
                    </p>
                    <div class="wheel-game" style="text-align: center;">
                        <div id="wheelDisplay" style="font-size: 4rem; margin: 1.5rem 0; height: 80px; display: flex; align-items: center; justify-content: center;">
                            🎯
                        </div>
                        <button id="spinWheel" class="game-btn sparkle-effect" 
                                style="width: 100%; padding: 1rem; border: none; border-radius: 8px; 
                                       background: linear-gradient(45deg, #f39c12, #e74c3c); color: white; cursor: pointer; 
                                       font-weight: bold; font-size: 1rem;">
                            ✨ 轉動幸運轉盤
                        </button>
                        <div id="wheelResult" style="margin-top: 1rem; text-align: center; color: #f39c12; font-size: 1.1rem; min-height: 24px;"></div>
                        <div id="wheelStats" style="margin-top: 0.5rem; text-align: center; color: #888; font-size: 0.9rem;"></div>
                    </div>
                </div>

                <!-- 每日簽到 -->
                <div class="game-card neon-glow" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 2rem;">
                    <h3 style="color: #2ecc71; margin-bottom: 1rem; font-size: 1.5rem;">📅 每日簽到</h3>
                    <p style="color: #888; margin-bottom: 1.5rem; line-height: 1.5;">
                        每天來報到一次，累積你的連續簽到天數！<br>
                        <small style="color: #666;">堅持就是勝利，加油！</small>
                    </p>
                    <div class="checkin-game" style="text-align: center;">
                        <div id="checkinDisplay" style="font-size: 2rem; margin: 1rem 0; color: #2ecc71;">
                            📋 點擊下方按鈕簽到
                        </div>
                        <button id="checkinBtn" class="game-btn white-pulse-border" 
                                style="width: 100%; padding: 1rem; border: none; border-radius: 8px; 
                                       background: linear-gradient(45deg, #2ecc71, #27ae60); color: white; cursor: pointer; 
                                       font-weight: bold; font-size: 1rem;">
                            ✅ 今日簽到
                        </button>
                        <div id="checkinResult" style="margin-top: 1rem; text-align: center; color: #2ecc71; font-size: 1.1rem; min-height: 24px;"></div>
                        <div id="checkinStreak" style="margin-top: 0.5rem; text-align: center; color: #888;"></div>
                    </div>
                </div>
            </div>
        </div>
        `;

        // 插入遊戲區塊
        const container = document.getElementById('games-container');
        if (container) {
            container.innerHTML = gameHTML;
        }
    }

    bindEvents() {
        // 猜數字遊戲
        this.initGuessGame();
        
        // 記憶力測試
        this.initMemoryGame();
        
        // 幸運轉盤
        this.initWheelGame();
        
        // 每日簽到
        this.initCheckinGame();
    }

    // 猜數字遊戲邏輯
    initGuessGame() {
        let targetNumber = Math.floor(Math.random() * 100) + 1;
        let guessCount = 0;
        let minRange = 1;
        let maxRange = 100;
        let guessHistory = [];
        const bestScore = localStorage.getItem('guessGameBest') || '未挑戰';
        
        const guessInput = document.getElementById('guessInput');
        const guessBtn = document.getElementById('guessBtn');
        const guessResult = document.getElementById('guessResult');
        const guessCountDiv = document.getElementById('guessCount');
        const guessBest = document.getElementById('guessBest');
        
        if (guessBest) {
            guessBest.textContent = `最佳成績: ${bestScore === '未挑戰' ? bestScore : bestScore + ' 次'}`;
        }
        
        function updateRangeHint() {
            if (guessHistory.length > 0) {
                const lastGuess = guessHistory[guessHistory.length - 1];
                const historyText = guessHistory.length > 3 ? 
                    `最近猜測: ${guessHistory.slice(-3).join(', ')}...` : 
                    `猜測記錄: ${guessHistory.join(', ')}`;
                
                guessCountDiv.innerHTML = `
                    <div style="margin-bottom: 0.5rem;">第 ${guessCount} 次嘗試 | 範圍: ${minRange}~${maxRange}</div>
                    <div style="font-size: 0.9rem; color: #666;">${historyText}</div>
                `;
            } else {
                guessCountDiv.innerHTML = `範圍: ${minRange}~${maxRange}`;
            }
        }
        
        function makeGuess() {
            const guess = parseInt(guessInput.value);
            guessCount++;
            
            if (isNaN(guess) || guess < 1 || guess > 100) {
                guessResult.innerHTML = '❌ 請輸入1-100之間的數字！';
                return;
            }
            
            guessHistory.push(guess);
            
            if (guess === targetNumber) {
                guessResult.innerHTML = `🎉 恭喜答對了！數字就是 ${targetNumber}`;
                guessBtn.textContent = '🔄 再來一局';
                guessInput.disabled = true;
                
                // 更新最佳成績
                if (bestScore === '未挑戰' || guessCount < parseInt(bestScore)) {
                    localStorage.setItem('guessGameBest', guessCount.toString());
                    guessBest.textContent = `🏆 新紀錄: ${guessCount} 次！`;
                    guessBest.style.color = '#f39c12';
                }
                
                guessCountDiv.innerHTML = `🎊 完成！共 ${guessCount} 次嘗試<br><small>猜測過程: ${guessHistory.join(' → ')}</small>`;
                
                this.showToast(`🎊 太棒了！你用了 ${guessCount} 次就猜中了！`);
                
                // 重置遊戲
                setTimeout(() => {
                    targetNumber = Math.floor(Math.random() * 100) + 1;
                    guessCount = 0;
                    minRange = 1;
                    maxRange = 100;
                    guessHistory = [];
                    guessInput.disabled = false;
                    guessInput.value = '';
                    guessBtn.textContent = '🎯 開始猜測！';
                    guessResult.innerHTML = '';
                    updateRangeHint();
                }, 3000);
                
            } else if (guess < targetNumber) {
                minRange = Math.max(minRange, guess + 1);
                guessResult.innerHTML = `📈 太小了！數字比 ${guess} 大`;
                updateRangeHint();
            } else {
                maxRange = Math.min(maxRange, guess - 1);
                guessResult.innerHTML = `📉 太大了！數字比 ${guess} 小`;
                updateRangeHint();
            }
            
            guessInput.value = '';
            guessInput.focus();
        }
        
        // 初始化顯示
        updateRangeHint();
        
        if (guessBtn) {
            guessBtn.addEventListener('click', makeGuess.bind(this));
        }
        
        if (guessInput) {
            guessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    makeGuess.call(this);
                }
            });
        }
    }

    // 記憶力測試邏輯
    initMemoryGame() {
        let sequence = [];
        let playerSequence = [];
        let level = 1;
        let isPlaying = false;
        const bestLevel = localStorage.getItem('memoryGameBest') || '0';
        
        const memoryBtns = document.querySelectorAll('.memory-btn');
        const startBtn = document.getElementById('memoryStart');
        const resultDiv = document.getElementById('memoryResult');
        const levelDiv = document.getElementById('memoryLevel');
        const bestDiv = document.getElementById('memoryBest');
        
        if (bestDiv) {
            bestDiv.textContent = `最高等級: ${bestLevel}`;
        }
        
        function startGame() {
            if (isPlaying) return;
            
            isPlaying = true;
            level = 1;
            sequence = [];
            playerSequence = [];
            
            startBtn.textContent = '遊戲進行中...';
            startBtn.disabled = true;
            resultDiv.innerHTML = '👀 仔細觀察順序！';
            
            nextLevel();
        }
        
        function nextLevel() {
            playerSequence = [];
            sequence.push(Math.floor(Math.random() * 9));
            
            levelDiv.innerHTML = `等級 ${level} - 記住 ${sequence.length} 個順序`;
            
            playSequence();
        }
        
        function playSequence() {
            let i = 0;
            const interval = setInterval(() => {
                if (i < sequence.length) {
                    flashButton(sequence[i]);
                    i++;
                } else {
                    clearInterval(interval);
                    resultDiv.innerHTML = '✋ 現在輪到你了！';
                }
            }, 600);
        }
        
        function flashButton(index) {
            const btn = memoryBtns[index];
            if (btn) {
                btn.style.background = 'linear-gradient(45deg, #7ed6df, #e056fd)';
                btn.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    btn.style.background = 'rgba(255,255,255,0.1)';
                    btn.style.transform = 'scale(1)';
                }, 300);
            }
        }
        
        function checkSequence() {
            if (playerSequence.length === sequence.length) {
                if (JSON.stringify(playerSequence) === JSON.stringify(sequence)) {
                    level++;
                    resultDiv.innerHTML = '🎉 正確！準備下一關...';
                    
                    // 更新最佳成績
                    if (level - 1 > parseInt(bestLevel)) {
                        localStorage.setItem('memoryGameBest', (level - 1).toString());
                        bestDiv.textContent = `🏆 新紀錄: 等級 ${level - 1}！`;
                        bestDiv.style.color = '#f39c12';
                    }
                    
                    setTimeout(nextLevel, 1500);
                } else {
                    gameOver();
                }
            }
        }
        
        function gameOver() {
            isPlaying = false;
            resultDiv.innerHTML = `💥 遊戲結束！到達等級 ${level - 1}`;
            startBtn.textContent = '🔄 重新開始';
            startBtn.disabled = false;
            
            this.showToast(`🧠 記憶力挑戰結束！你到達了等級 ${level - 1}`);
        }
        
        if (startBtn) {
            startBtn.addEventListener('click', startGame.bind(this));
        }
        
        memoryBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (!isPlaying || playerSequence.length >= sequence.length) return;
                
                playerSequence.push(index);
                flashButton(index);
                checkSequence.call(this);
            });
        });
    }

    // 幸運轉盤邏輯
    initWheelGame() {
        const prizes = ['🎁', '💎', '🏆', '🌟', '❤️', '🎊', '🔥', '✨'];
        const wheelDisplay = document.getElementById('wheelDisplay');
        const spinBtn = document.getElementById('spinWheel');
        const resultDiv = document.getElementById('wheelResult');
        const statsDiv = document.getElementById('wheelStats');
        
        let spinCount = parseInt(localStorage.getItem('wheelSpinCount') || '0');
        let isSpinning = false;
        
        if (statsDiv) {
            statsDiv.textContent = `總轉動次數: ${spinCount}`;
        }
        
        function spin() {
            if (isSpinning) return; // 防止重複點擊
            
            isSpinning = true;
            spinBtn.disabled = true;
            spinBtn.textContent = '轉動中...';
            resultDiv.innerHTML = '';
            
            let currentIndex = 0;
            let spinTime = 0;
            const maxSpinTime = 3000; // 3秒後停止
            const intervalTime = 80;
            
            const interval = setInterval(() => {
                wheelDisplay.textContent = prizes[currentIndex];
                currentIndex = (currentIndex + 1) % prizes.length;
                spinTime += intervalTime;
                
                // 3秒後停止轉動
                if (spinTime >= maxSpinTime) {
                    clearInterval(interval);
                    
                    const finalPrize = prizes[Math.floor(Math.random() * prizes.length)];
                    wheelDisplay.textContent = finalPrize;
                    
                    resultDiv.innerHTML = `🎉 恭喜獲得: ${finalPrize}`;
                    
                    spinCount++;
                    localStorage.setItem('wheelSpinCount', spinCount.toString());
                    statsDiv.textContent = `總轉動次數: ${spinCount}`;
                    
                    // 重新啟用按鈕
                    setTimeout(() => {
                        isSpinning = false;
                        spinBtn.disabled = false;
                        spinBtn.textContent = '✨ 再轉一次';
                    }, 500);
                    
                    this.showToast(`🎰 幸運轉盤結果: ${finalPrize}`);
                }
            }, intervalTime);
        }
        
        if (spinBtn) {
            spinBtn.addEventListener('click', spin.bind(this));
        }
    }

    // 每日簽到邏輯
    initCheckinGame() {
        const checkinBtn = document.getElementById('checkinBtn');
        const resultDiv = document.getElementById('checkinResult');
        const streakDiv = document.getElementById('checkinStreak');
        const displayDiv = document.getElementById('checkinDisplay');
        
        const today = new Date().toDateString();
        const lastCheckin = localStorage.getItem('lastCheckin');
        const streak = parseInt(localStorage.getItem('checkinStreak') || '0');
        
        if (streakDiv) {
            streakDiv.textContent = `連續簽到: ${streak} 天`;
        }
        
        if (lastCheckin === today) {
            checkinBtn.textContent = '✅ 今日已簽到';
            checkinBtn.disabled = true;
            resultDiv.innerHTML = '😊 今天已經簽到過了！';
            displayDiv.textContent = '💯 已完成今日簽到';
        }
        
        function checkin() {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            let newStreak = 1;
            if (lastCheckin === yesterday.toDateString()) {
                newStreak = streak + 1;
            }
            
            localStorage.setItem('lastCheckin', today);
            localStorage.setItem('checkinStreak', newStreak.toString());
            
            checkinBtn.textContent = '✅ 簽到成功';
            checkinBtn.disabled = true;
            resultDiv.innerHTML = '🎊 簽到成功！明天記得再來哦～';
            streakDiv.textContent = `連續簽到: ${newStreak} 天`;
            displayDiv.textContent = '🎯 簽到完成！';
            
            this.showToast(`📅 簽到成功！連續 ${newStreak} 天`);
        }
        
        if (checkinBtn && !checkinBtn.disabled) {
            checkinBtn.addEventListener('click', checkin.bind(this));
        }
    }

    // 顯示提示訊息
    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(30, 35, 45, 0.95);
            color: white;
            padding: 1rem 2rem;
            border-radius: 25px;
            border: 2px solid transparent;
            background-image: linear-gradient(rgba(30, 35, 45, 0.95), rgba(30, 35, 45, 0.95)), 
                              linear-gradient(45deg, #7ed6df, #e056fd);
            background-origin: border-box;
            background-clip: padding-box, border-box;
            z-index: 10000;
            font-size: 0.9rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            animation: slideInDown 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// 初始化遊戲頁面
document.addEventListener('DOMContentLoaded', () => {
    new GamesPage();
});

// 如果 DOM 已經載入完成
if (document.readyState !== 'loading') {
    new GamesPage();
}
