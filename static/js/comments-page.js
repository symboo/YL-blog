// ===========================================
// 于倫部落格 - 留言頁面專用版本
// ===========================================

class CommentsPage {
    constructor() {
        // 防止重複初始化
        if (window.commentsPageLoaded) return;
        window.commentsPageLoaded = true;
        
        this.comments = JSON.parse(localStorage.getItem('ylblog_comments')) || [];
        this.init();
    }

    init() {
        this.createCommentSection();
        this.loadComments();
        this.showWelcomeMessage();
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showToast('💬 歡迎來到留言區！分享你的想法吧～');
        }, 500);
    }

    createCommentSection() {
        const commentHTML = `
        <div class="container" style="max-width: 800px; margin: 0 auto; padding: 0 1rem;">
            <!-- 留言統計 -->
            <div class="comment-stats rainbow-border" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 2rem; margin-bottom: 3rem; text-align: center;">
                <h2 style="color: #7ed6df; margin-bottom: 1rem; font-size: 1.8rem;">📊 留言統計</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div class="stat-item breathing-rgb" style="padding: 1rem; border-radius: 8px; background: rgba(24,28,36,0.6);">
                        <div style="font-size: 2rem; color: #e056fd;">${this.comments.length}</div>
                        <div style="color: #888; font-size: 0.9rem;">總留言數</div>
                    </div>
                    <div class="stat-item breathing-rgb" style="padding: 1rem; border-radius: 8px; background: rgba(24,28,36,0.6);">
                        <div style="font-size: 2rem; color: #7ed6df;">${this.getActiveUsers()}</div>
                        <div style="color: #888; font-size: 0.9rem;">活躍用戶</div>
                    </div>
                    <div class="stat-item breathing-rgb" style="padding: 1rem; border-radius: 8px; background: rgba(24,28,36,0.6);">
                        <div style="font-size: 2rem; color: #f39c12;">${this.getRecentComments()}</div>
                        <div style="color: #888; font-size: 0.9rem;">近期留言</div>
                    </div>
                </div>
            </div>

            <!-- 留言表單 -->
            <div class="comment-form floating-lights" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 2rem; margin-bottom: 3rem;">
                <h3 style="color: #e056fd; margin-bottom: 1.5rem; font-size: 1.5rem;">✍️ 發表留言</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <input type="text" id="commentName" placeholder="你的暱稱 *" 
                           style="padding: 1rem; border-radius: 8px; border: 2px solid rgba(126,214,223,0.3); 
                                  background: rgba(24,28,36,0.8); color: white; font-size: 1rem;">
                    <input type="email" id="commentEmail" placeholder="信箱 (可選)" 
                           style="padding: 1rem; border-radius: 8px; border: 2px solid rgba(126,214,223,0.3); 
                                  background: rgba(24,28,36,0.8); color: white; font-size: 1rem;">
                </div>
                
                <textarea id="commentText" placeholder="寫下你的想法..." rows="4"
                          style="width: 100%; padding: 1rem; border-radius: 8px; border: 2px solid rgba(126,214,223,0.3); 
                                 background: rgba(24,28,36,0.8); color: white; resize: vertical; font-size: 1rem; font-family: inherit;"></textarea>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; flex-wrap: wrap; gap: 1rem;">
                    <div class="emoji-picker" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <span class="emoji-btn sparkle-effect" data-emoji="😊" style="font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; background: rgba(255,255,255,0.1); transition: all 0.3s ease;">😊</span>
                        <span class="emoji-btn sparkle-effect" data-emoji="❤️" style="font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; background: rgba(255,255,255,0.1); transition: all 0.3s ease;">❤️</span>
                        <span class="emoji-btn sparkle-effect" data-emoji="👍" style="font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; background: rgba(255,255,255,0.1); transition: all 0.3s ease;">👍</span>
                        <span class="emoji-btn sparkle-effect" data-emoji="🎮" style="font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; background: rgba(255,255,255,0.1); transition: all 0.3s ease;">🎮</span>
                        <span class="emoji-btn sparkle-effect" data-emoji="✨" style="font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; background: rgba(255,255,255,0.1); transition: all 0.3s ease;">✨</span>
                        <span class="emoji-btn sparkle-effect" data-emoji="🔥" style="font-size: 1.5rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; background: rgba(255,255,255,0.1); transition: all 0.3s ease;">🔥</span>
                    </div>
                    <button id="submitComment" class="submit-btn rainbow-border" 
                            style="padding: 1rem 2rem; border: none; border-radius: 8px; 
                                   background: linear-gradient(45deg, #7ed6df, #e056fd); 
                                   color: white; cursor: pointer; font-weight: bold; font-size: 1rem;">
                        🚀 發表留言
                    </button>
                </div>
                
                <div style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    💡 小提示：使用 Ctrl+Enter 快速發表留言
                </div>
            </div>
            
            <!-- 留言列表 -->
            <div class="comments-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h3 style="color: #7ed6df; font-size: 1.5rem;">📝 所有留言</h3>
                <div class="comment-controls" style="display: flex; gap: 1rem;">
                    <button id="sortComments" class="control-btn breathing-rgb" 
                            style="padding: 0.5rem 1rem; border: none; border-radius: 6px; 
                                   background: rgba(126,214,223,0.2); color: #7ed6df; cursor: pointer; font-size: 0.9rem;">
                        📅 排序：最新
                    </button>
                    <button id="clearComments" class="control-btn" 
                            style="padding: 0.5rem 1rem; border: none; border-radius: 6px; 
                                   background: rgba(231,76,60,0.2); color: #e74c3c; cursor: pointer; font-size: 0.9rem;">
                        🗑️ 清空
                    </button>
                </div>
            </div>
            
            <div id="commentsList" class="comments-list">
                <!-- 留言會顯示在這裡 -->
            </div>
            
            <div id="noComments" class="no-comments diamond-shine" style="text-align: center; padding: 3rem; background: rgba(30,35,45,0.8); border-radius: 12px; display: none;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💭</div>
                <h3 style="color: #888; margin-bottom: 1rem;">還沒有留言</h3>
                <p style="color: #666;">成為第一個留言的人吧！</p>
            </div>
        </div>
        `;

        // 將留言系統插入到容器
        const container = document.getElementById('comments-container');
        if (container) {
            container.innerHTML = commentHTML;
        }

        // 綁定事件
        this.bindEvents();
    }

    bindEvents() {
        // 表情符號選擇
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const textarea = document.getElementById('commentText');
                const emoji = btn.dataset.emoji;
                textarea.value += emoji;
                textarea.focus();
                
                // 添加點擊效果
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 200);
            });
        });

        // 提交留言
        document.getElementById('submitComment').addEventListener('click', () => {
            this.submitComment();
        });

        // 回車提交
        document.getElementById('commentText').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.submitComment();
            }
        });

        // 排序按鈕
        const sortBtn = document.getElementById('sortComments');
        let isOldestFirst = false;
        sortBtn.addEventListener('click', () => {
            isOldestFirst = !isOldestFirst;
            sortBtn.textContent = isOldestFirst ? '📅 排序：最舊' : '📅 排序：最新';
            this.loadComments(isOldestFirst);
        });

        // 清空留言
        document.getElementById('clearComments').addEventListener('click', () => {
            if (confirm('確定要清空所有留言嗎？此操作無法復原！')) {
                this.comments = [];
                localStorage.removeItem('ylblog_comments');
                this.loadComments();
                this.updateStats();
                this.showToast('🗑️ 已清空所有留言');
            }
        });
    }

    submitComment() {
        const name = document.getElementById('commentName').value.trim();
        const email = document.getElementById('commentEmail').value.trim();
        const text = document.getElementById('commentText').value.trim();

        if (!name) {
            this.showToast('❌ 請輸入你的暱稱');
            document.getElementById('commentName').focus();
            return;
        }

        if (!text) {
            this.showToast('❌ 請輸入留言內容');
            document.getElementById('commentText').focus();
            return;
        }

        const comment = {
            id: Date.now(),
            name: name,
            email: email,
            text: text,
            time: new Date().toLocaleString('zh-TW'),
            avatar: this.generateAvatar(name)
        };

        this.comments.unshift(comment);
        localStorage.setItem('ylblog_comments', JSON.stringify(this.comments));

        // 清空表單
        document.getElementById('commentName').value = '';
        document.getElementById('commentEmail').value = '';
        document.getElementById('commentText').value = '';

        this.loadComments();
        this.updateStats();
        this.showToast(`✅ 留言發表成功！感謝 ${name} 的留言～`);
    }

    generateAvatar(name) {
        const avatars = ['🧑', '👩', '🧔', '👦', '👧', '🧑‍💼', '👩‍💼', '🧑‍🎓', '👩‍🎓', '🧑‍💻'];
        const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        return avatars[hash % avatars.length];
    }

    loadComments(oldestFirst = false) {
        const commentsList = document.getElementById('commentsList');
        const noComments = document.getElementById('noComments');

        if (!commentsList) return;

        if (this.comments.length === 0) {
            commentsList.style.display = 'none';
            if (noComments) noComments.style.display = 'block';
            return;
        }

        if (noComments) noComments.style.display = 'none';
        commentsList.style.display = 'block';

        const sortedComments = oldestFirst ? [...this.comments].reverse() : this.comments;

        commentsList.innerHTML = sortedComments.map(comment => `
            <div class="comment-item white-pulse-border" style="background: rgba(30,35,45,0.8); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; transition: all 0.3s ease;">
                <div class="comment-header" style="display: flex; align-items: center; margin-bottom: 1rem;">
                    <div class="comment-avatar sparkle-effect" style="font-size: 2rem; margin-right: 1rem;">${comment.avatar}</div>
                    <div class="comment-info">
                        <div class="comment-name" style="color: #7ed6df; font-weight: bold; font-size: 1.1rem;">${this.escapeHtml(comment.name)}</div>
                        <div class="comment-time" style="color: #888; font-size: 0.9rem;">${comment.time}</div>
                    </div>
                    <div class="comment-actions" style="margin-left: auto;">
                        <button onclick="commentsPageInstance.deleteComment(${comment.id})" class="delete-btn" 
                                style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 0.9rem; padding: 0.5rem;">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="comment-text" style="color: white; line-height: 1.6; font-size: 1rem;">
                    ${this.formatText(comment.text)}
                </div>
            </div>
        `).join('');
    }

    deleteComment(id) {
        if (confirm('確定要刪除這條留言嗎？')) {
            this.comments = this.comments.filter(comment => comment.id !== id);
            localStorage.setItem('ylblog_comments', JSON.stringify(this.comments));
            this.loadComments();
            this.updateStats();
            this.showToast('🗑️ 留言已刪除');
        }
    }

    updateStats() {
        // 更新統計數據
        const statsItems = document.querySelectorAll('.stat-item div:first-child');
        if (statsItems.length >= 3) {
            statsItems[0].textContent = this.comments.length;
            statsItems[1].textContent = this.getActiveUsers();
            statsItems[2].textContent = this.getRecentComments();
        }
    }

    getActiveUsers() {
        const uniqueUsers = new Set(this.comments.map(comment => comment.name.toLowerCase()));
        return uniqueUsers.size;
    }

    getRecentComments() {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        return this.comments.filter(comment => {
            const commentDate = new Date(comment.time);
            return commentDate > oneDayAgo;
        }).length;
    }

    formatText(text) {
        return this.escapeHtml(text)
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #7ed6df;">$1</a>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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

// 全域實例
let commentsPageInstance;

// 初始化留言頁面
document.addEventListener('DOMContentLoaded', () => {
    commentsPageInstance = new CommentsPage();
});

// 如果 DOM 已經載入完成
if (document.readyState !== 'loading') {
    commentsPageInstance = new CommentsPage();
}
