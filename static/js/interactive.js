// ===========================================
// 于倫部落格 - 互動功能增強包 (優化版)
// ===========================================

(function() {
    'use strict';

    // 防止重複初始化
    if (window.interactiveLoaded) return;
    window.interactiveLoaded = true;

    // 等待 DOM 載入完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInteractiveFeatures);
    } else {
        initInteractiveFeatures();
    }

    function initInteractiveFeatures() {
        // 1. 平滑滾動導航
        initSmoothScrolling();
        
        // 2. 照片查看器
        initPhotoViewer();
        
        // 3. 愛心特效
        initHeartEffect();
        
        // 4. Konami 密技
        initKonamiCode();
        
        // 5. 訪客統計
        initVisitorStats();
        
        // 6. 動畫效果
        initAnimations();
    }

    // 平滑滾動功能
    function initSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // 照片查看器功能
    function initPhotoViewer() {
        const gfImages = document.querySelectorAll('.gf-img, .album-img, .game-img');
        gfImages.forEach((img, index) => {
            img.addEventListener('click', function() {
                const item = this.closest('.gf-item, .album-item, .screenshot-item');
                if (item) {
                    item.classList.toggle('active');
                    
                    // 增加查看計數
                    let viewCount = parseInt(localStorage.getItem('ylblog_photoViews') || '0');
                    viewCount++;
                    localStorage.setItem('ylblog_photoViews', viewCount);
                }
            });
        });
    }

    // 愛心特效
    function initHeartEffect() {
        const gfImages = document.querySelectorAll('.gf-img');
        gfImages.forEach(img => {
            img.addEventListener('click', function(e) {
                createHeartEffect(e.pageX, e.pageY);
            });
        });
    }

    function createHeartEffect(x, y) {
        const heart = document.createElement('div');
        heart.innerHTML = '💖';
        heart.style.cssText = `
            position: fixed;
            left: ${x - 10}px;
            top: ${y - 10}px;
            pointer-events: none;
            z-index: 9999;
            font-size: 20px;
            animation: heartFloat 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(heart);
        
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 1500);
    }

    // Konami 密技
    function initKonamiCode() {
        let sequence = [];
        const konamiCode = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];

        document.addEventListener('keydown', function(e) {
            sequence.push(e.code);
            if (sequence.length > konamiCode.length) {
                sequence.shift();
            }
            
            if (sequence.join(',') === konamiCode.join(',')) {
                triggerKonamiEffect();
                sequence = [];
            }
        });
    }

    function triggerKonamiEffect() {
        // 特殊效果
        document.body.style.animation = 'rainbow 2s infinite';
        
        setTimeout(() => {
            document.body.style.animation = '';
            alert('🎉 恭喜發現隱藏彩蛋！');
        }, 3000);
    }

    // 訪客統計
    function initVisitorStats() {
        let visits = parseInt(localStorage.getItem('ylblog_visits') || '0');
        visits++;
        localStorage.setItem('ylblog_visits', visits);
        
        // 在控制台顯示統計
        console.log(`歡迎！你是第 ${visits} 次造訪此網站 🎉`);
    }

    // 動畫效果
    function initAnimations() {
        // 添加動畫樣式
        const animationStyles = `
            @keyframes heartFloat {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-50px) scale(1.5);
                    opacity: 0;
                }
            }

            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }

            .animate-in {
                animation: fadeInUp 0.6s ease-out forwards;
            }

            @keyframes fadeInUp {
                0% {
                    opacity: 0;
                    transform: translateY(30px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = animationStyles;
        document.head.appendChild(styleSheet);

        // 滾動動畫觀察器
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // 觀察所有區段
        document.querySelectorAll('.modern-section').forEach(section => {
            observer.observe(section);
        });
    }

})();
