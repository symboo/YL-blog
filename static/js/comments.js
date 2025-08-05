// ===========================================
// 簡易評論系統 - 本地存儲版本
// ===========================================

class CommentSystem {
    constructor() {
        this.comments = JSON.parse(localStorage.getItem('ylblog_comments')) || [];
        this.init();
    }

    init() {
        this.createCommentSection();
        this.loadComments();
    }

    createCommentSection() {
        const commentHTML = `
        <section id="comments" class="comment-section modern-section" style="margin-top: 3rem;">
            <h2>💬 留言板</h2>
            <p style="text-align: center; color: #888; margin-bottom: 2rem;">
                歡迎在這裡留下你的想法，分享你的故事！
            </p>
            
            <div class="comment-form" style="margin-bottom: 2rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <input type="text" id="commentName" placeholder="你的暱稱" 
                           style="padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
                                  background: rgba(30,35,45,0.8); color: white;">
                    <input type="email" id="commentEmail" placeholder="信箱 (可選)" 
                           style="padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
                                  background: rgba(30,35,45,0.8); color: white;">
                </div>
                <textarea id="commentText" placeholder="寫下你的想法..." rows="4"
                          style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); 
                                 background: rgba(30,35,45,0.8); color: white; resize: vertical;"></textarea>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <div class="emoji-picker">
                        <span class="emoji-btn" data-emoji="😊">😊</span>
                        <span class="emoji-btn" data-emoji="❤️">❤️</span>
                        <span class="emoji-btn" data-emoji="👍">👍</span>
                        <span class="emoji-btn" data-emoji="🎮">🎮</span>
                        <span class="emoji-btn" data-emoji="✨">✨</span>
                        <span class="emoji-btn" data-emoji="🔥">🔥</span>
                    </div>
                    <button id="submitComment" class="submit-btn rainbow-border" 
                            style="padding: 0.8rem 2rem; border: none; border-radius: 8px; 
                                   background: linear-gradient(45deg, #7ed6df, #e056fd); 
                                   color: white; cursor: pointer; font-weight: bold;">
                        發表留言 🚀
                    </button>
                </div>
            </div>
            
            <div id="commentsList" class="comments-list">
                <!-- 留言會顯示在這裡 -->
            </div>
        </section>
        `;

        // 將評論系統插入到網站末尾（在 footer 之前）
        const footer = document.querySelector('.site-footer');
        if (footer) {
            footer.insertAdjacentHTML('beforebegin', commentHTML);
        } else {
            document.body.insertAdjacentHTML('beforeend', commentHTML);
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
    }

    submitComment() {
        const name = document.getElementById('commentName').value.trim();
        const email = document.getElementById('commentEmail').value.trim();
        const text = document.getElementById('commentText').value.trim();

        if (!name || !text) {
            alert('請填寫暱稱和留言內容！');
            return;
        }

        const comment = {
            id: Date.now(),
            name: name,
            email: email,
            text: text,
            timestamp: new Date().toLocaleString('zh-TW'),
            likes: 0
        };

        this.comments.unshift(comment);
        this.saveComments();
        this.loadComments();
        this.clearForm();
        
        // 成功提示
        this.showToast('留言發表成功！感謝你的分享 ✨');
    }

    clearForm() {
        document.getElementById('commentName').value = '';
        document.getElementById('commentEmail').value = '';
        document.getElementById('commentText').value = '';
    }

    loadComments() {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;

        if (this.comments.length === 0) {
            commentsList.innerHTML = `
                <div style="text-align: center; color: #888; padding: 2rem;">
                    <p>還沒有留言，成為第一個留言的人吧！ 🎯</p>
                </div>
            `;
            return;
        }

        commentsList.innerHTML = this.comments.map(comment => `
            <div class="comment-item" style="background: rgba(30,35,45,0.6); border-radius: 12px; 
                                            padding: 1.5rem; margin-bottom: 1rem; border-left: 4px solid #7ed6df;">
                <div class="comment-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                    <div class="comment-author" style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="avatar" style="width: 40px; height: 40px; border-radius: 50%; 
                                                   background: linear-gradient(45deg, #7ed6df, #e056fd); 
                                                   display: flex; align-items: center; justify-content: center; 
                                                   font-weight: bold; color: white;">
                            ${comment.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="name" style="font-weight: bold; color: #7ed6df;">${comment.name}</div>
                            <div class="time" style="font-size: 0.8rem; color: #888;">${comment.timestamp}</div>
                        </div>
                    </div>
                    <div class="comment-actions">
                        <button class="like-btn" onclick="commentSystem.likeComment(${comment.id})" 
                                style="background: none; border: none; color: #e056fd; cursor: pointer; 
                                       display: flex; align-items: center; gap: 0.3rem;">
                            ❤️ <span>${comment.likes}</span>
                        </button>
                    </div>
                </div>
                <div class="comment-text" style="color: #f8f8f8; line-height: 1.6;">
                    ${comment.text.replace(/\n/g, '<br>')}
                </div>
            </div>
        `).join('');
    }

    likeComment(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes++;
            this.saveComments();
            this.loadComments();
            this.showToast('感謝你的支持！ 💖');
        }
    }

    saveComments() {
        localStorage.setItem('ylblog_comments', JSON.stringify(this.comments));
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #7ed6df, #e056fd);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// 防止重複初始化評論系統
if (!window.commentsLoaded) {
    window.commentsLoaded = true;
    
    // 延遲載入評論，避免阻塞其他功能
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.commentSystem = new CommentSystem();
            }, 300);
        });
    } else {
        setTimeout(() => {
            window.commentSystem = new CommentSystem();
        }, 300);
    }
}

// 添加動畫樣式
const toastStyles = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.emoji-btn {
    display: inline-block;
    padding: 0.3rem 0.5rem;
    margin: 0 0.2rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: rgba(255,255,255,0.1);
}

.emoji-btn:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.2);
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(126, 214, 223, 0.4);
}

.comment-item {
    transition: all 0.3s ease;
}

.comment-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
`;

const toastStyleSheet = document.createElement('style');
toastStyleSheet.textContent = toastStyles;
document.head.appendChild(toastStyleSheet);
