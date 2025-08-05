// ===========================================
// 于倫部落格 - 背景音樂播放器
// ===========================================

class MusicPlayer {
    constructor() {
        this.currentTrack = 0;
        this.isPlaying = false;
        this.audio = null;
        this.volume = 0.3;
        
        // 音樂清單 - 支援 YouTube 連結和本地檔案
        this.playlist = [
            // 這裡可以添加你的 YouTube 音樂連結
            // 格式：將 YouTube 連結轉換為直接音頻連結
        ];
        
        this.init();
    }

    init() {
        this.createPlayer();
        this.bindEvents();
        this.loadSettings();
    }

    createPlayer() {
        const playerHTML = `
        <div id="musicPlayer" class="music-player floating-lights" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            background: rgba(20, 25, 35, 0.95);
            border-radius: 15px;
            padding: 1rem;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
        ">
            <!-- 播放器頭部 -->
            <div class="player-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="color: #7ed6df; margin: 0; font-size: 1rem;">🎵 背景音樂</h4>
                <div>
                    <button id="musicToggle" class="player-btn" style="background: none; border: none; color: #7ed6df; cursor: pointer; margin-right: 0.5rem;">
                        🎶
                    </button>
                    <button id="playerClose" class="player-btn" style="background: none; border: none; color: #888; cursor: pointer;">
                        ✕
                    </button>
                </div>
            </div>

            <!-- 當前播放信息 -->
            <div class="current-track" style="text-align: center; margin-bottom: 1rem;">
                <div id="trackTitle" style="color: white; font-weight: bold; margin-bottom: 0.3rem;">選擇一首歌曲</div>
                <div id="trackArtist" style="color: #888; font-size: 0.9rem;">于倫的音樂時光</div>
            </div>

            <!-- 進度條 -->
            <div class="progress-container" style="margin-bottom: 1rem;">
                <div class="progress-bar" style="
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    overflow: hidden;
                    cursor: pointer;
                ">
                    <div id="progressFill" style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, #7ed6df, #e056fd);
                        transition: width 0.1s ease;
                    "></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.8rem; color: #888;">
                    <span id="currentTime">0:00</span>
                    <span id="totalTime">0:00</span>
                </div>
            </div>

            <!-- 控制按鈕 -->
            <div class="controls" style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <button id="prevBtn" class="control-btn" style="
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">⏮</button>
                
                <button id="playPauseBtn" class="control-btn play-btn" style="
                    background: linear-gradient(45deg, #7ed6df, #e056fd);
                    border: none;
                    color: white;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                ">▶</button>
                
                <button id="nextBtn" class="control-btn" style="
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">⏭</button>
            </div>

            <!-- 音量控制 -->
            <div class="volume-control" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <span style="color: #888;">🔊</span>
                <input type="range" id="volumeSlider" min="0" max="100" value="30" style="
                    flex: 1;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    outline: none;
                    border-radius: 2px;
                ">
                <span id="volumeValue" style="color: #888; font-size: 0.8rem; min-width: 30px;">30%</span>
            </div>

            <!-- 播放清單 -->
            <div class="playlist-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="color: #888; font-size: 0.9rem;">播放清單</span>
                    <div>
                        <button id="addYouTubeBtn" style="background: none; border: none; color: #ff0000; cursor: pointer; font-size: 0.8rem; margin-right: 0.5rem;" title="添加YouTube音樂">🎬</button>
                        <input type="file" id="musicUpload" accept="audio/*" style="display: none;" multiple>
                        <button id="uploadBtn" style="background: none; border: none; color: #7ed6df; cursor: pointer; font-size: 0.8rem; margin-right: 0.5rem;" title="上傳音樂">📁</button>
                        <button id="shuffleBtn" style="background: none; border: none; color: #888; cursor: pointer; font-size: 0.8rem;">🔀</button>
                    </div>
                </div>
                <div id="playlist" style="max-height: 150px; overflow-y: auto;">
                    <!-- 播放清單項目會在這裡動態生成 -->
                </div>
                
                <!-- YouTube 連結輸入區 -->
                <div id="youtubeInput" style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <div style="color: #7ed6df; font-size: 0.9rem; margin-bottom: 0.5rem;">添加 YouTube 音樂</div>
                    <input type="text" id="youtubeUrl" placeholder="貼上 YouTube 連結..." style="
                        width: 100%; 
                        padding: 0.5rem; 
                        border: 1px solid rgba(255,255,255,0.2); 
                        border-radius: 4px; 
                        background: rgba(30,35,45,0.8); 
                        color: white; 
                        margin-bottom: 0.5rem;
                    ">
                    <input type="text" id="songTitle" placeholder="歌曲名稱（選填）" style="
                        width: 100%; 
                        padding: 0.5rem; 
                        border: 1px solid rgba(255,255,255,0.2); 
                        border-radius: 4px; 
                        background: rgba(30,35,45,0.8); 
                        color: white; 
                        margin-bottom: 0.5rem;
                    ">
                    <div style="display: flex; gap: 0.5rem;">
                        <button id="addYouTubeConfirm" style="
                            flex: 1; 
                            padding: 0.5rem; 
                            background: linear-gradient(45deg, #7ed6df, #e056fd); 
                            border: none; 
                            border-radius: 4px; 
                            color: white; 
                            cursor: pointer;
                        ">添加</button>
                        <button id="addYouTubeCancel" style="
                            flex: 1; 
                            padding: 0.5rem; 
                            background: rgba(255,255,255,0.1); 
                            border: none; 
                            border-radius: 4px; 
                            color: white; 
                            cursor: pointer;
                        ">取消</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 迷你播放器切換按鈕 -->
        <button id="miniPlayerToggle" class="mini-toggle breathing-rgb" style="
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
            z-index: 999;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(126, 214, 223, 0.4);
        ">🎵</button>
        `;

        document.body.insertAdjacentHTML('beforeend', playerHTML);
        this.generatePlaylist();
    }

    generatePlaylist() {
        const playlist = document.getElementById('playlist');
        playlist.innerHTML = this.playlist.map((track, index) => `
            <div class="playlist-item" data-index="${index}" style="
                padding: 0.5rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 0.3rem;
                background: ${index === this.currentTrack ? 'rgba(126, 214, 223, 0.2)' : 'rgba(255,255,255,0.05)'};
            ">
                <div style="color: white; font-size: 0.9rem; margin-bottom: 0.2rem;">${track.title}</div>
                <div style="color: #888; font-size: 0.8rem;">${track.artist} • ${track.duration}</div>
            </div>
        `).join('');
    }

    bindEvents() {
        const player = document.getElementById('musicPlayer');
        const miniToggle = document.getElementById('miniPlayerToggle');
        const playerClose = document.getElementById('playerClose');
        const musicToggle = document.getElementById('musicToggle');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        const progressBar = document.querySelector('.progress-bar');
        const uploadBtn = document.getElementById('uploadBtn');
        const musicUpload = document.getElementById('musicUpload');
        const addYouTubeBtn = document.getElementById('addYouTubeBtn');
        const youtubeInput = document.getElementById('youtubeInput');
        const addYouTubeConfirm = document.getElementById('addYouTubeConfirm');
        const addYouTubeCancel = document.getElementById('addYouTubeCancel');

        // YouTube 連結添加功能
        addYouTubeBtn.addEventListener('click', () => {
            youtubeInput.style.display = youtubeInput.style.display === 'none' ? 'block' : 'none';
        });

        addYouTubeCancel.addEventListener('click', () => {
            youtubeInput.style.display = 'none';
            document.getElementById('youtubeUrl').value = '';
            document.getElementById('songTitle').value = '';
        });

        addYouTubeConfirm.addEventListener('click', () => {
            const url = document.getElementById('youtubeUrl').value.trim();
            const title = document.getElementById('songTitle').value.trim();
            
            if (url) {
                // 提取 YouTube 視頻 ID
                const videoId = this.extractYouTubeVideoId(url);
                if (videoId) {
                    // 使用 YouTube 嵌入式播放器（需要用戶互動）
                    const trackTitle = title || '未命名歌曲';
                    
                    this.playlist.push({
                        title: trackTitle,
                        artist: "YouTube",
                        url: url, // 保存原始 YouTube 連結
                        videoId: videoId,
                        duration: "未知",
                        isYouTube: true
                    });
                    
                    this.generatePlaylist();
                    youtubeInput.style.display = 'none';
                    document.getElementById('youtubeUrl').value = '';
                    document.getElementById('songTitle').value = '';
                    
                    alert('YouTube 連結已添加！\n注意：由於版權限制，某些 YouTube 視頻可能無法播放。');
                } else {
                    alert('請輸入有效的 YouTube 連結');
                }
            }
        });

        // 上傳音樂功能
        uploadBtn.addEventListener('click', () => {
            musicUpload.click();
        });

        musicUpload.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.type.startsWith('audio/')) {
                    const url = URL.createObjectURL(file);
                    const duration = "未知";
                    
                    // 創建音頻對象來獲取時長
                    const audio = new Audio(url);
                    audio.addEventListener('loadedmetadata', () => {
                        const minutes = Math.floor(audio.duration / 60);
                        const seconds = Math.floor(audio.duration % 60);
                        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        
                        // 更新播放清單中的時長
                        const trackIndex = this.playlist.length - 1;
                        this.playlist[trackIndex].duration = formattedDuration;
                        this.generatePlaylist();
                    });
                    
                    // 添加到播放清單
                    this.playlist.push({
                        title: file.name.replace(/\.[^/.]+$/, ""), // 移除副檔名
                        artist: "本地音樂",
                        url: url,
                        duration: duration
                    });
                    
                    this.generatePlaylist();
                }
            });
            
            // 清空 input
            e.target.value = '';
        });

        // 顯示/隱藏播放器
        miniToggle.addEventListener('click', () => {
            player.style.transform = 'translateX(0)';
            miniToggle.style.display = 'none';
        });

        playerClose.addEventListener('click', () => {
            player.style.transform = 'translateX(400px)';
            miniToggle.style.display = 'block';
        });

        // 播放/暫停
        playPauseBtn.addEventListener('click', () => {
            this.togglePlay();
        });

        // 上一首/下一首
        prevBtn.addEventListener('click', () => {
            this.previousTrack();
        });

        nextBtn.addEventListener('click', () => {
            this.nextTrack();
        });

        // 音量控制
        volumeSlider.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            volumeValue.textContent = e.target.value + '%';
            if (this.audio) {
                this.audio.volume = this.volume;
            }
            this.saveSettings();
        });

        // 進度條控制
        progressBar.addEventListener('click', (e) => {
            if (this.audio) {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.audio.currentTime = percent * this.audio.duration;
            }
        });

        // 播放清單點擊
        document.addEventListener('click', (e) => {
            if (e.target.closest('.playlist-item')) {
                const index = parseInt(e.target.closest('.playlist-item').dataset.index);
                this.playTrack(index);
            }
        });

        // 隨機播放
        document.getElementById('shuffleBtn').addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * this.playlist.length);
            this.playTrack(randomIndex);
        });

        // 音樂總開關
        musicToggle.addEventListener('click', () => {
            if (this.isPlaying) {
                this.pause();
            } else {
                if (!this.audio) {
                    this.playTrack(0);
                } else {
                    this.play();
                }
            }
        });
    }

    // 提取 YouTube 視頻 ID
    extractYouTubeVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }

    playTrack(index) {
        this.currentTrack = index;
        const track = this.playlist[index];
        
        // 停止當前播放
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }

        if (track.isYouTube) {
            // YouTube 連結處理
            alert(`即將在新視窗開啟 YouTube:\n${track.title}\n\n由於瀏覽器安全限制，YouTube 音樂需要在新視窗播放。`);
            window.open(track.url, '_blank');
            
            // 模擬播放狀態
            this.simulateYouTubePlayback(track);
        } else {
            // 本地檔案或直接音頻連結
            this.audio = new Audio(track.url);
            this.audio.volume = this.volume;
            
            this.audio.addEventListener('loadedmetadata', () => {
                this.updateProgress();
            });
            
            this.audio.addEventListener('timeupdate', () => {
                this.updateProgress();
            });
            
            this.audio.addEventListener('ended', () => {
                this.nextTrack();
            });
        }
        
        this.updateTrackInfo(track);
        this.updatePlaylist();
        this.play();
    }

    simulateYouTubePlayback(track) {
        // 為 YouTube 視頻創建模擬播放
        const duration = 180; // 預設 3 分鐘
        let currentTime = 0;
        
        this.audio = {
            duration: duration,
            currentTime: currentTime,
            volume: this.volume,
            pause: () => {},
            play: () => {}
        };
        
        // 模擬播放進度
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
        }
        
        this.playbackInterval = setInterval(() => {
            if (this.isPlaying && currentTime < duration) {
                currentTime += 0.5;
                this.audio.currentTime = currentTime;
                this.updateProgress();
                
                if (currentTime >= duration) {
                    this.nextTrack();
                }
            }
        }, 500);
    }

    simulateAudioPlayback(track) {
        // 模擬音頻播放（因為沒有實際音頻文件）
        let currentTime = 0;
        const duration = this.parseDuration(track.duration);
        
        this.audio.duration = duration;
        this.audio.currentTime = currentTime;
        
        // 模擬播放進度
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
        }
        
        this.playbackInterval = setInterval(() => {
            if (this.isPlaying && currentTime < duration) {
                currentTime += 0.5;
                this.audio.currentTime = currentTime;
                this.updateProgress();
                
                if (currentTime >= duration) {
                    this.nextTrack();
                }
            }
        }, 500);
    }

    parseDuration(durationStr) {
        const [minutes, seconds] = durationStr.split(':').map(Number);
        return minutes * 60 + seconds;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        document.getElementById('playPauseBtn').textContent = '⏸';
        document.getElementById('musicToggle').textContent = '⏸';
        
        // 添加播放動畫效果
        document.getElementById('miniPlayerToggle').style.animation = 'pulse 2s infinite';
    }

    pause() {
        this.isPlaying = false;
        document.getElementById('playPauseBtn').textContent = '▶';
        document.getElementById('musicToggle').textContent = '🎶';
        
        document.getElementById('miniPlayerToggle').style.animation = 'none';
    }

    nextTrack() {
        const nextIndex = (this.currentTrack + 1) % this.playlist.length;
        this.playTrack(nextIndex);
    }

    previousTrack() {
        const prevIndex = this.currentTrack === 0 ? this.playlist.length - 1 : this.currentTrack - 1;
        this.playTrack(prevIndex);
    }

    updateTrackInfo(track) {
        document.getElementById('trackTitle').textContent = track.title;
        document.getElementById('trackArtist').textContent = track.artist;
        document.getElementById('totalTime').textContent = track.duration;
    }

    updatePlaylist() {
        const items = document.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            if (index === this.currentTrack) {
                item.style.background = 'rgba(126, 214, 223, 0.2)';
            } else {
                item.style.background = 'rgba(255,255,255,0.05)';
            }
        });
    }

    updateProgress() {
        if (!this.audio) return;
        
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        
        const currentMinutes = Math.floor(this.audio.currentTime / 60);
        const currentSeconds = Math.floor(this.audio.currentTime % 60);
        document.getElementById('currentTime').textContent = 
            `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
    }

    saveSettings() {
        localStorage.setItem('ylblog_musicVolume', this.volume);
        localStorage.setItem('ylblog_musicTrack', this.currentTrack);
    }

    loadSettings() {
        const savedVolume = localStorage.getItem('ylblog_musicVolume');
        const savedTrack = localStorage.getItem('ylblog_musicTrack');
        
        if (savedVolume) {
            this.volume = parseFloat(savedVolume);
            document.getElementById('volumeSlider').value = this.volume * 100;
            document.getElementById('volumeValue').textContent = Math.round(this.volume * 100) + '%';
        }
        
        if (savedTrack) {
            this.currentTrack = parseInt(savedTrack);
            this.updatePlaylist();
        }
    }
}

// 添加必要的 CSS 動畫
const musicStyles = `
<style>
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.control-btn:hover {
    background: rgba(255,255,255,0.2) !important;
    transform: scale(1.1);
}

.play-btn:hover {
    background: linear-gradient(45deg, #6cb5c2, #c144d1) !important;
}

.playlist-item:hover {
    background: rgba(126, 214, 223, 0.1) !important;
}

.music-player::-webkit-scrollbar {
    width: 4px;
}

.music-player::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
}

.music-player::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #7ed6df, #e056fd);
    border-radius: 2px;
}

#volumeSlider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(45deg, #7ed6df, #e056fd);
    cursor: pointer;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', musicStyles);

// 防止重複初始化
let musicPlayerInstance = null;

// 初始化音樂播放器 - 只執行一次
if (!musicPlayerInstance) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!musicPlayerInstance) {
                musicPlayerInstance = new MusicPlayer();
            }
        });
    } else {
        musicPlayerInstance = new MusicPlayer();
    }
}
