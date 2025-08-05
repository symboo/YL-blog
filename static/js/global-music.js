// ===========================================
// 于倫部落格 - 全域持續播放音樂系統
// ===========================================

(function() {
    'use strict';
    
    // 使用 sessionStorage 來在頁面間保持音樂狀態
    const STORAGE_KEY = 'ylblog_music_state';
    const MUSIC_CONFIG = {
        url: './music/Saja Boys - Soda Pop (Lyrics) ｜ K-Pop Demon Hunters Soundtrack.mp3',
        title: 'Saja Boys - Soda Pop',
        volume: 0.3
    };

    let globalAudio = null;
    let musicButton = null;
    let isInitialized = false;

    // 獲取音樂狀態
    function getMusicState() {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {
            isPlaying: false,
            currentTime: 0,
            volume: MUSIC_CONFIG.volume
        };
    }

    // 保存音樂狀態
    function saveMusicState() {
        if (globalAudio) {
            const state = {
                isPlaying: !globalAudio.paused,
                currentTime: globalAudio.currentTime,
                volume: globalAudio.volume
            };
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }

    // 初始化全域音樂
    function initGlobalMusic() {
        if (isInitialized) return;
        isInitialized = true;

        // 檢查是否已經有音樂實例在其他頁面運行
        if (window.parent && window.parent.globalMusicInstance) {
            globalAudio = window.parent.globalMusicInstance;
        } else {
            createMusicInstance();
        }

        createMusicButton();
        restoreMusicState();
        
        // 監聽頁面關閉前保存狀態
        window.addEventListener('beforeunload', saveMusicState);
        
        // 定期保存狀態（以防意外關閉）
        setInterval(saveMusicState, 5000);
    }

    // 創建音樂實例
    function createMusicInstance() {
        globalAudio = new Audio(MUSIC_CONFIG.url);
        globalAudio.loop = true;
        globalAudio.volume = MUSIC_CONFIG.volume;
        
        // 讓音樂實例可以在頁面間共享
        if (window.parent) {
            window.parent.globalMusicInstance = globalAudio;
        }
        window.globalMusicInstance = globalAudio;

        // 音樂事件監聽
        globalAudio.addEventListener('play', updateButtonState);
        globalAudio.addEventListener('pause', updateButtonState);
        globalAudio.addEventListener('loadeddata', () => {
            console.log('🎵 音樂載入完成');
        });
        globalAudio.addEventListener('error', (e) => {
            console.log('⚠️ 音樂載入失敗:', e);
            if (musicButton) {
                musicButton.innerHTML = '❌';
                musicButton.title = '音樂載入失敗';
            }
        });
    }

    // 恢復音樂狀態
    function restoreMusicState() {
        const state = getMusicState();
        
        if (globalAudio) {
            globalAudio.volume = state.volume;
            globalAudio.currentTime = state.currentTime;
            
            if (state.isPlaying) {
                // 嘗試恢復播放
                const playPromise = globalAudio.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('🎵 音樂狀態已恢復');
                            showMusicToast('音樂繼續播放 🎶');
                        })
                        .catch(() => {
                            console.log('ℹ️ 需要用戶互動才能播放');
                            showMusicToast('點擊音樂按鈕繼續播放 🎵');
                        });
                }
            }
        }
        
        updateButtonState();
    }

    // 創建音樂控制按鈕
    function createMusicButton() {
        // 如果已經有按鈕就不重複創建
        if (document.querySelector('.global-music-button')) return;

        musicButton = document.createElement('button');
        musicButton.className = 'global-music-button';
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
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(126, 214, 223, 0.4);
            transition: all 0.3s ease;
            animation: pulse 2s infinite;
        `;

        // 懸停效果
        musicButton.addEventListener('mouseenter', () => {
            musicButton.style.transform = 'scale(1.1)';
        });

        musicButton.addEventListener('mouseleave', () => {
            musicButton.style.transform = 'scale(1)';
        });

        // 點擊切換播放
        musicButton.addEventListener('click', toggleMusic);
        
        document.body.appendChild(musicButton);

        // 添加樣式
        addButtonStyles();
    }

    // 添加按鈕動畫樣式
    function addButtonStyles() {
        if (document.querySelector('#global-music-styles')) return;

        const style = document.createElement('style');
        style.id = 'global-music-styles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
            
            .global-music-button.playing {
                animation: spin 3s linear infinite !important;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes slideInDown {
                from { opacity: 0; transform: translate(-50%, -20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
            }
            
            @keyframes slideOutUp {
                from { opacity: 1; transform: translate(-50%, 0); }
                to { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);
    }

    // 切換音樂播放
    function toggleMusic() {
        if (!globalAudio) return;

        if (globalAudio.paused) {
            globalAudio.play()
                .then(() => {
                    showMusicToast('音樂開始播放 ▶️');
                    saveMusicState();
                })
                .catch((error) => {
                    console.error('播放失敗:', error);
                    showMusicToast('播放失敗，請稍後再試 ❌');
                });
        } else {
            globalAudio.pause();
            showMusicToast('音樂已暫停 ⏸️');
            saveMusicState();
        }
    }

    // 更新按鈕狀態
    function updateButtonState() {
        if (!musicButton || !globalAudio) return;

        if (!globalAudio.paused) {
            musicButton.innerHTML = '⏸️';
            musicButton.classList.add('playing');
            musicButton.title = '點擊暫停音樂 - ' + MUSIC_CONFIG.title;
        } else {
            musicButton.innerHTML = '▶️';
            musicButton.classList.remove('playing');
            musicButton.title = '點擊播放音樂 - ' + MUSIC_CONFIG.title;
        }
    }

    // 顯示音樂提示
    function showMusicToast(message) {
        // 移除舊的提示
        const oldToast = document.querySelector('.music-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'music-toast';
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
            z-index: 10001;
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
    }

    // 提供全域音樂控制 API
    window.globalMusic = {
        play: () => globalAudio && globalAudio.play(),
        pause: () => globalAudio && globalAudio.pause(),
        toggle: toggleMusic,
        setVolume: (vol) => {
            if (globalAudio) {
                globalAudio.volume = Math.max(0, Math.min(1, vol));
                saveMusicState();
            }
        },
        isPlaying: () => globalAudio && !globalAudio.paused,
        getCurrentTime: () => globalAudio ? globalAudio.currentTime : 0,
        setCurrentTime: (time) => {
            if (globalAudio) {
                globalAudio.currentTime = time;
                saveMusicState();
            }
        }
    };

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalMusic);
    } else {
        initGlobalMusic();
    }

})();
