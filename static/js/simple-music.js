// ===========================================
// 于倫部落格 - 簡單背景音樂播放器
// ===========================================

(function() {
    'use strict';
    
    // 防止重複初始化
    if (window.backgroundMusicLoaded) return;
    window.backgroundMusicLoaded = true;

    // 你的背景音樂 - 可以替換成你喜歡的歌曲
    const BACKGROUND_MUSIC = {
        // 使用你自己的音樂檔案：Saja Boys - Soda Pop
        url: './music/Saja Boys - Soda Pop (Lyrics) ｜ K-Pop Demon Hunters Soundtrack.mp3',
        title: 'Saja Boys - Soda Pop',
        volume: 0.3 // 音量 (0.0 - 1.0)
    };

    let audio = null;
    let isPlaying = false;
    let musicButton = null;

    // 初始化背景音樂
    function initBackgroundMusic() {
        createMusicButton();
        setupAudio();
        
        // 嘗試自動播放（某些瀏覽器需要用戶互動）
        setTimeout(() => {
            tryAutoplay();
        }, 1000);
    }

    // 創建音樂控制按鈕
    function createMusicButton() {
        musicButton = document.createElement('button');
        musicButton.innerHTML = '🎵';
        musicButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(45deg, #7ed6df, #e056fd);
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(126, 214, 223, 0.4);
            transition: all 0.3s ease;
            animation: pulse 2s infinite;
        `;

        // 添加懸停效果
        musicButton.addEventListener('mouseenter', () => {
            musicButton.style.transform = 'scale(1.1)';
        });

        musicButton.addEventListener('mouseleave', () => {
            musicButton.style.transform = 'scale(1)';
        });

        // 點擊切換播放/暫停
        musicButton.addEventListener('click', toggleMusic);

        document.body.appendChild(musicButton);

        // 添加脈衝動畫樣式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
            
            .music-playing {
                animation: spin 3s linear infinite !important;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // 設定音頻
    function setupAudio() {
        audio = new Audio(BACKGROUND_MUSIC.url);
        audio.loop = true; // 循環播放
        audio.volume = BACKGROUND_MUSIC.volume;
        
        // 監聽載入完成
        audio.addEventListener('canplaythrough', () => {
            console.log('🎵 背景音樂已準備好');
        });

        // 監聽播放事件
        audio.addEventListener('play', () => {
            isPlaying = true;
            updateButtonState();
        });

        // 監聽暫停事件
        audio.addEventListener('pause', () => {
            isPlaying = false;
            updateButtonState();
        });

        // 錯誤處理
        audio.addEventListener('error', (e) => {
            console.log('⚠️ 音樂載入失敗:', e);
            musicButton.innerHTML = '❌';
            musicButton.title = '音樂載入失敗';
        });
    }

    // 嘗試自動播放
    function tryAutoplay() {
        if (audio) {
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('🎵 背景音樂自動播放成功');
                        showMusicToast('背景音樂已開始播放 🎶');
                    })
                    .catch((error) => {
                        console.log('ℹ️ 自動播放被阻止，需要用戶點擊');
                        showMusicToast('點擊右下角音樂按鈕開始播放 🎵');
                    });
            }
        }
    }

    // 切換音樂播放
    function toggleMusic() {
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            showMusicToast('音樂已暫停 ⏸️');
        } else {
            audio.play()
                .then(() => {
                    showMusicToast('音樂開始播放 ▶️');
                })
                .catch((error) => {
                    console.error('播放失敗:', error);
                    showMusicToast('播放失敗，請稍後再試 ❌');
                });
        }
    }

    // 更新按鈕狀態
    function updateButtonState() {
        if (!musicButton) return;

        if (isPlaying) {
            musicButton.innerHTML = '⏸️';
            musicButton.classList.add('music-playing');
            musicButton.title = '點擊暫停音樂';
        } else {
            musicButton.innerHTML = '▶️';
            musicButton.classList.remove('music-playing');
            musicButton.title = '點擊播放音樂';
        }
    }

    // 顯示音樂提示
    function showMusicToast(message) {
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

        // 自動移除
        setTimeout(() => {
            toast.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);

        // 添加動畫樣式
        if (!document.querySelector('#toast-animations')) {
            const animStyle = document.createElement('style');
            animStyle.id = 'toast-animations';
            animStyle.textContent = `
                @keyframes slideInDown {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes slideOutUp {
                    from { opacity: 1; transform: translate(-50%, 0); }
                    to { opacity: 0; transform: translate(-50%, -20px); }
                }
            `;
            document.head.appendChild(animStyle);
        }
    }

    // 當 DOM 載入完成時初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBackgroundMusic);
    } else {
        initBackgroundMusic();
    }

    // 提供全域音樂控制函數
    window.backgroundMusic = {
        play: () => audio && audio.play(),
        pause: () => audio && audio.pause(),
        toggle: toggleMusic,
        setVolume: (vol) => audio && (audio.volume = Math.max(0, Math.min(1, vol))),
        isPlaying: () => isPlaying
    };

})();
