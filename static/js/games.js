// ===========================================
// 于倫部落格 - 小遊戲功能
// ===========================================

class BlogGames {
    constructor() {
        this.init();
    }

    init() {
        this.createGameSection();
        this.bindEvents();
    }

    createGameSection() {
        const gameHTML = `
        <section id="games" class="games-section modern-section" style="margin-top: 3rem;">
            <h2>🎮 小遊戲時間</h2>
            <p style="text-align: center; color: #888; margin-bottom: 2rem;">
                來和于倫一起玩點小遊戲吧！放鬆一下心情～
            </p>
            
            <div class="games-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <!-- 猜數字遊戲 -->
                <div class="game-card breathing-rgb" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 1.5rem;">
                    <h3 style="color: #7ed6df; margin-bottom: 1rem;">🔢 猜數字</h3>
                    <p style="color: #888; margin-bottom: 1rem;">我想了一個1-100的數字，你能猜中嗎？</p>
                    <div class="guess-game">
                        <input type="number" id="guessInput" placeholder="輸入你的猜測" min="1" max="100"
                               style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
                                      background: rgba(30,35,45,0.8); color: white; margin-bottom: 1rem;">
                        <button id="guessBtn" class="game-btn" style="width: 100%; padding: 0.8rem; border: none; border-radius: 8px; 
                                background: linear-gradient(45deg, #7ed6df, #e056fd); color: white; cursor: pointer; font-weight: bold;">
                            猜！
                        </button>
                        <div id="guessResult" style="margin-top: 1rem; text-align: center; color: #7ed6df;"></div>
                        <div id="guessCount" style="margin-top: 0.5rem; text-align: center; color: #888;"></div>
                    </div>
                </div>

                <!-- 記憶力測試 -->
                <div class="game-card special-rgb-border" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 1.5rem;">
                    <h3 style="color: #e056fd; margin-bottom: 1rem;">🧠 記憶力測試</h3>
                    <p style="color: #888; margin-bottom: 1rem;">記住出現的順序，然後按相同順序點擊</p>
                    <div class="memory-game">
                        <div class="memory-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                            <div class="memory-btn" data-index="0" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease;"></div>
                            <div class="memory-btn" data-index="1" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease;"></div>
                            <div class="memory-btn" data-index="2" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease;"></div>
                            <div class="memory-btn" data-index="3" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease;"></div>
                            <div class="memory-btn" data-index="4" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease;"></div>
                            <div class="memory-btn" data-index="5" style="aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s ease;"></div>
                        </div>
                        <button id="memoryStart" class="game-btn" style="width: 100%; padding: 0.8rem; border: none; border-radius: 8px; 
                                background: linear-gradient(45deg, #e056fd, #7ed6df); color: white; cursor: pointer; font-weight: bold;">
                            開始遊戲
                        </button>
                        <div id="memoryResult" style="margin-top: 1rem; text-align: center; color: #e056fd;"></div>
                    </div>
                </div>

                <!-- 幸運轉盤 -->
                <div class="game-card rainbow-border" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 1.5rem;">
                    <h3 style="color: #22a6b3; margin-bottom: 1rem;">🎰 幸運轉盤</h3>
                    <p style="color: #888; margin-bottom: 1rem;">轉動轉盤，看看今天的運勢如何！</p>
                    <div class="wheel-game" style="text-align: center;">
                        <div class="wheel" style="width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(
                            #ff6b6b 0deg 60deg,
                            #4ecdc4 60deg 120deg,
                            #45b7d1 120deg 180deg,
                            #f9ca24 180deg 240deg,
                            #f0932b 240deg 300deg,
                            #eb4d4b 300deg 360deg
                        ); margin: 0 auto 1rem; position: relative; transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);">
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                        background: white; width: 20px; height: 20px; border-radius: 50%; z-index: 2;"></div>
                            <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); 
                                        width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; 
                                        border-top: 15px solid white; z-index: 3;"></div>
                        </div>
                        <button id="spinWheel" class="game-btn" style="width: 100%; padding: 0.8rem; border: none; border-radius: 8px; 
                                background: linear-gradient(45deg, #22a6b3, #7ed6df); color: white; cursor: pointer; font-weight: bold;">
                            轉轉看！
                        </button>
                        <div id="wheelResult" style="margin-top: 1rem; text-align: center; color: #22a6b3; font-weight: bold;"></div>
                    </div>
                </div>

                <!-- 每日簽到 -->
                <div class="game-card floating-lights" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 1.5rem;">
                    <h3 style="color: #f39c12; margin-bottom: 1rem;">📅 每日簽到</h3>
                    <p style="color: #888; margin-bottom: 1rem;">每天來簽到，累積你的忠實粉絲積分！</p>
                    <div class="checkin-game" style="text-align: center;">
                        <div id="checkinStatus" style="margin-bottom: 1rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
                            <!-- 簽到狀態會顯示在這裡 -->
                        </div>
                        <button id="checkinBtn" class="game-btn" style="width: 100%; padding: 0.8rem; border: none; border-radius: 8px; 
                                background: linear-gradient(45deg, #f39c12, #e74c3c); color: white; cursor: pointer; font-weight: bold;">
                            今日簽到
                        </button>
                        <div id="checkinResult" style="margin-top: 1rem; text-align: center; color: #f39c12;"></div>
                    </div>
                </div>
            </div>
        </section>
        `;

        // 插入遊戲區塊
        const commentsSection = document.getElementById('comments');
        if (commentsSection) {
            commentsSection.insertAdjacentHTML('beforebegin', gameHTML);
        } else {
            const footer = document.querySelector('.site-footer');
            if (footer) {
                footer.insertAdjacentHTML('beforebegin', gameHTML);
            }
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

    // 猜數字遊戲
    initGuessGame() {
        let targetNumber = Math.floor(Math.random() * 100) + 1;
        let guessCount = 0;
        
        const guessInput = document.getElementById('guessInput');
        const guessBtn = document.getElementById('guessBtn');
        const guessResult = document.getElementById('guessResult');
        const guessCountDiv = document.getElementById('guessCount');
        
        function makeGuess() {
            const guess = parseInt(guessInput.value);
            guessCount++;
            
            if (isNaN(guess) || guess < 1 || guess > 100) {
                guessResult.innerHTML = '請輸入1-100之間的數字！';
                return;
            }
            
            if (guess === targetNumber) {
                guessResult.innerHTML = `🎉 恭喜答對了！數字就是 ${targetNumber}`;
                guessResult.style.color = '#00ff00';
                guessBtn.textContent = '再來一局';
                guessBtn.onclick = () => {
                    targetNumber = Math.floor(Math.random() * 100) + 1;
                    guessCount = 0;
                    guessResult.innerHTML = '';
                    guessCountDiv.innerHTML = '';
                    guessInput.value = '';
                    guessBtn.textContent = '猜！';
                    guessBtn.onclick = makeGuess;
                };
            } else if (guess < targetNumber) {
                guessResult.innerHTML = '太小了！再大一點～';
                guessResult.style.color = '#7ed6df';
            } else {
                guessResult.innerHTML = '太大了！再小一點～';
                guessResult.style.color = '#e056fd';
            }
            
            guessCountDiv.innerHTML = `已猜測 ${guessCount} 次`;
            guessInput.value = '';
        }
        
        guessBtn.addEventListener('click', makeGuess);
        guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') makeGuess();
        });
    }

    // 記憶力測試
    initMemoryGame() {
        let sequence = [];
        let playerSequence = [];
        let level = 1;
        let isPlaying = false;
        
        const memoryBtns = document.querySelectorAll('.memory-btn');
        const startBtn = document.getElementById('memoryStart');
        const result = document.getElementById('memoryResult');
        
        function showSequence() {
            isPlaying = true;
            playerSequence = [];
            
            // 添加新的隨機數到序列
            sequence.push(Math.floor(Math.random() * 6));
            
            result.innerHTML = `關卡 ${level} - 請記住順序`;
            
            let i = 0;
            const interval = setInterval(() => {
                if (i > 0) {
                    memoryBtns[sequence[i-1]].style.background = 'rgba(255,255,255,0.1)';
                }
                
                if (i < sequence.length) {
                    memoryBtns[sequence[i]].style.background = '#7ed6df';
                } else {
                    clearInterval(interval);
                    result.innerHTML = '現在請按照順序點擊';
                    isPlaying = false;
                }
                i++;
            }, 800);
        }
        
        memoryBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (isPlaying) return;
                
                playerSequence.push(index);
                btn.style.background = '#e056fd';
                setTimeout(() => {
                    btn.style.background = 'rgba(255,255,255,0.1)';
                }, 200);
                
                // 檢查玩家輸入
                if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
                    result.innerHTML = '❌ 順序錯誤！遊戲重新開始';
                    sequence = [];
                    level = 1;
                    startBtn.textContent = '開始遊戲';
                    return;
                }
                
                if (playerSequence.length === sequence.length) {
                    level++;
                    result.innerHTML = `✅ 正確！準備關卡 ${level}`;
                    setTimeout(showSequence, 1500);
                }
            });
        });
        
        startBtn.addEventListener('click', () => {
            if (sequence.length === 0) {
                showSequence();
                startBtn.textContent = '遊戲進行中...';
            }
        });
    }

    // 幸運轉盤
    initWheelGame() {
        const wheel = document.querySelector('.wheel');
        const spinBtn = document.getElementById('spinWheel');
        const result = document.getElementById('wheelResult');
        
        const prizes = [
            '大吉大利！', '小有所獲', '再接再厲', 
            '好運降臨！', '平平安安', '驚喜連連！'
        ];
        
        let isSpinning = false;
        
        spinBtn.addEventListener('click', () => {
            if (isSpinning) return;
            
            isSpinning = true;
            spinBtn.textContent = '轉動中...';
            
            const randomDegree = Math.floor(Math.random() * 360) + 3600; // 至少轉10圈
            wheel.style.transform = `rotate(${randomDegree}deg)`;
            
            setTimeout(() => {
                const finalDegree = randomDegree % 360;
                const prizeIndex = Math.floor(finalDegree / 60);
                result.innerHTML = `🎊 ${prizes[prizeIndex]}`;
                
                isSpinning = false;
                spinBtn.textContent = '再轉一次！';
            }, 3000);
        });
    }

    // 每日簽到
    initCheckinGame() {
        const checkinBtn = document.getElementById('checkinBtn');
        const checkinStatus = document.getElementById('checkinStatus');
        const checkinResult = document.getElementById('checkinResult');
        
        function updateCheckinStatus() {
            const today = new Date().toDateString();
            const lastCheckin = localStorage.getItem('ylblog_lastCheckin');
            const totalCheckins = parseInt(localStorage.getItem('ylblog_totalCheckins')) || 0;
            const consecutiveDays = parseInt(localStorage.getItem('ylblog_consecutiveDays')) || 0;
            
            if (lastCheckin === today) {
                checkinStatus.innerHTML = `
                    <div>✅ 今日已簽到</div>
                    <div style="font-size: 0.9rem; margin-top: 0.5rem;">
                        總簽到：${totalCheckins} 天 | 連續：${consecutiveDays} 天
                    </div>
                `;
                checkinBtn.textContent = '已完成簽到';
                checkinBtn.disabled = true;
                checkinBtn.style.opacity = '0.6';
            } else {
                checkinStatus.innerHTML = `
                    <div>📅 今日尚未簽到</div>
                    <div style="font-size: 0.9rem; margin-top: 0.5rem;">
                        總簽到：${totalCheckins} 天 | 連續：${consecutiveDays} 天
                    </div>
                `;
                checkinBtn.textContent = '今日簽到';
                checkinBtn.disabled = false;
                checkinBtn.style.opacity = '1';
            }
        }
        
        checkinBtn.addEventListener('click', () => {
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            const lastCheckin = localStorage.getItem('ylblog_lastCheckin');
            let totalCheckins = parseInt(localStorage.getItem('ylblog_totalCheckins')) || 0;
            let consecutiveDays = parseInt(localStorage.getItem('ylblog_consecutiveDays')) || 0;
            
            if (lastCheckin === yesterday) {
                consecutiveDays++;
            } else if (lastCheckin !== today) {
                consecutiveDays = 1;
            }
            
            totalCheckins++;
            
            localStorage.setItem('ylblog_lastCheckin', today);
            localStorage.setItem('ylblog_totalCheckins', totalCheckins);
            localStorage.setItem('ylblog_consecutiveDays', consecutiveDays);
            
            let rewardMessage = '簽到成功！';
            if (consecutiveDays >= 7) {
                rewardMessage += ' 🏆 連續一週簽到，獲得忠實粉絲稱號！';
            } else if (consecutiveDays >= 3) {
                rewardMessage += ' 🌟 連續簽到中，繼續保持！';
            }
            
            checkinResult.innerHTML = rewardMessage;
            updateCheckinStatus();
        });
        
        // 初始化簽到狀態
        updateCheckinStatus();
    }
}

// 防止重複初始化遊戲系統
if (!window.gamesLoaded) {
    window.gamesLoaded = true;
    
    // 延遲載入遊戲，避免阻塞其他功能
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => new BlogGames(), 200);
        });
    } else {
        setTimeout(() => new BlogGames(), 200);
    }
}
