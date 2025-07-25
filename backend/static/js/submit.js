// 更好的表单验证和提交处理
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('valorant-submission-form');
    const charCounter = document.getElementById('desc-count');
    const textarea = document.getElementById('video-desc');
    
    // 实时字符计数
    textarea.addEventListener('input', function() {
        charCounter.textContent = this.value.length;
    });
    
    // 视频预览功能
    const previewBtn = document.getElementById('preview-video');
    const previewArea = document.getElementById('video-preview');
    
    previewBtn.addEventListener('click', function() {
        const url = document.getElementById('video-url').value;
        if(url) {
            const videoId = extractVideoId(url);
            if(videoId) {
                previewArea.innerHTML = `
                    <iframe width="100%" height="100%" 
                            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" 
                            frameborder="0" allowfullscreen></iframe>
                `;
            }
        }
    });
    
    // 表单提交
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 验证表单
        if(!validateForm()) return;
        
        // 显示加载状态
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
        submitBtn.disabled = true;
        
        try {
            // 模拟API调用
            const response = await mockApiCall(new FormData(form));
            
            // 显示成功消息
            showToast('投稿成功！我们会在24小时内审核您的视频', 'success');
            
            // 重置表单
            form.reset();
            charCounter.textContent = '0';
            previewArea.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <p>影片預覽將顯示在這裡</p>
                </div>
            `;
        } catch (error) {
            showToast('提交失败，请稍后再试', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // 标签切换功能
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
});

// 辅助函数
function extractVideoId(url) {
    // 提取YouTube视频ID的逻辑
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function validateForm() {
    // 实现全面的表单验证
    let isValid = true;
    // 验证逻辑...
    return isValid;
}

function switchTab(tabId) {
    // 切换标签页的逻辑
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.submission-form').forEach(form => {
        form.classList.toggle('active-tab', form.getAttribute('data-tab') === tabId);
    });
}

function showToast(message, type) {
    // 创建并显示Toast通知
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

async function mockApiCall(formData) {
    // 模拟API调用
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Form data:', Object.fromEntries(formData));
            resolve({ status: 'success' });
        }, 1500);
    });
}

// 在submit.js中添加圖片上傳處理
document.addEventListener('DOMContentLoaded', function() {
    // ... 其他現有代碼 ...
    
    // 圖片上傳處理
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('screenshot-upload');
    const imagePreview = document.getElementById('image-preview');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast('檔案大小超過 5MB 限制', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                uploadArea.querySelector('.upload-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 拖放功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });
    
    // 截圖表單字符計數
    const screenshotDesc = document.getElementById('screenshot-desc');
    const screenshotDescCount = document.getElementById('screenshot-desc-count');
    
    screenshotDesc.addEventListener('input', function() {
        screenshotDescCount.textContent = this.value.length;
    });
});

// 在submit.js中增強validateForm函數
function validateForm() {
    const form = document.getElementById('valorant-submission-form');
    let isValid = true;
    
    // 驗證遊戲ID格式 (名稱#標籤)
    const playerId = form.querySelector('#player-id');
    const idRegex = /^[A-Za-z0-9_]{3,16}#[A-Za-z0-9]{4}$/;
    if (!idRegex.test(playerId.value)) {
        showError(playerId, '請輸入有效的遊戲ID (例如: YLstudio#TW1)');
        isValid = false;
    }
    
    // 驗證YouTube連結
    const videoUrl = form.querySelector('#video-url');
    const urlRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
    if (!urlRegex.test(videoUrl.value)) {
        showError(videoUrl, '請輸入有效的YouTube連結');
        isValid = false;
    }
    
    // 驗證必填字段
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showError(field, '此為必填欄位');
            isValid = false;
        }
    });
    
    return isValid;
}

function showError(field, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '0.3rem';
    
    // 移除現有的錯誤訊息
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    field.parentNode.appendChild(errorElement);
    field.classList.add('error');
    
    // 3秒後自動移除錯誤樣式
    setTimeout(() => {
        field.classList.remove('error');
    }, 3000);
}