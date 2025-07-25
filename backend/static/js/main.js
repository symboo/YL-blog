document.addEventListener('DOMContentLoaded', () => {
    // ====================== DOM 元素綁定 ======================
    const elements = {
        nicknameInput: document.getElementById('nicknameInput'),
        roomInput: document.getElementById('roomInput'),
        joinBtn: document.getElementById('joinBtn'),
        leaveBtn: document.getElementById('leaveBtn'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        messagesDiv: document.getElementById('messages'),
        localVideo: document.getElementById('localVideo'),
        userIdDisplay: document.getElementById('userIdDisplay'),
        nicknameDisplay: document.getElementById('nicknameDisplay'),
        localName: document.getElementById('localName'),
        videoContainer: document.getElementById('videoContainer'),
        userList: document.getElementById('userList'),
        loginPanel: document.getElementById('loginPanel'),
        mainPanel: document.getElementById('mainPanel'),
        muteBtn: document.getElementById('muteBtn'),
        cameraBtn: document.getElementById('cameraBtn'),
        imgForm: document.getElementById('imgForm'),
        imgInput: document.getElementById('imgInput')
    };

    // ====================== 狀態管理 ======================
    const state = {
        socket: null,
        localStream: null,
        room: null,
        userId: 'user_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString().slice(-4),
        nickname: '',
        peers: {},
        config: typeof SERVER_CONFIG !== "undefined" ? SERVER_CONFIG : { ip: "127.0.0.1", port: 5000 },
        audioEnabled: true,
        videoEnabled: true
    };

    // ====================== UI 初始化 ======================
    elements.userIdDisplay.textContent = state.userId;
    elements.nicknameDisplay.textContent = '';
    elements.localName.textContent = '';

    // ====================== 信令伺服器連線 ======================
    const initSocket = () => {
        const serverUrl = `https://${state.config.ip}:${state.config.port}`;
        state.socket = io(serverUrl, {
            transports: ['websocket'],
            secure: true,
            rejectUnauthorized: false,
            reconnectionAttempts: 5,
            timeout: 10000
        });

        state.socket.on('connect', () => {
            appendSystemMessage('✅ 已連線到伺服器');
        });

        state.socket.on('disconnect', () => {
            appendSystemMessage('❌ 與伺服器斷線');
            elements.mainPanel.style.display = 'none';
            elements.loginPanel.style.display = '';
            state.room = null;
            state.nickname = '';
            elements.nicknameDisplay.textContent = '';
            elements.localName.textContent = '';
            elements.userList.innerHTML = '';
            elements.messagesDiv.innerHTML = '';
            Object.keys(state.peers).forEach(removePeer);
            updateWhiteboardUsers([]);
        });

        state.socket.on('users_in_room', async ({ users }) => {
            await updatePeers(users);
            updateUserList(users);
            updateWhiteboardUsers(users);
        });

        state.socket.on('user_joined', ({ user_id, name }) => {
            appendSystemMessage(`${name} 加入房間`);
        });

        state.socket.on('user_left', ({ user_id, name }) => {
            appendSystemMessage(`${name} 離開房間`);
            removePeer(user_id);
        });

        state.socket.on('user_list', ({ users }) => {
            updateUserList(users);
            updateWhiteboardUsers(users);
        });

        state.socket.on('chat', ({ user, msg }) => {
            appendMessage(`${user}: ${msg}`, user === state.nickname ? 'self' : 'remote');
        });

        state.socket.on('image', ({ user, url }) => {
            appendImageMessage(user, url);
        });

        state.socket.on('signal', handleSignal);

        // 白板同步
        setupWhiteboardSocket();
    };

    async function getIceServersFromXirsys() {
        const response = await fetch("https://global.xirsys.net/_turn/StreamBridge", {
            method: "PUT",
            headers: {
                "Authorization": "Basic " + btoa("a34363471:8d858f88-6118-11f0-a005-0242ac130003")
            }
        });
        const data = await response.json();
        return data.v.iceServers;
    }

    // ====================== 多人WebRTC管理 ======================
    async function updatePeers(users) {
        for (const u of users) {
            const uid = u.id || u;
            if (uid !== state.userId && !state.peers[uid]) {
                await createPeerConnection(uid, u.name || uid);
            }
        }
        // 移除已離開的
        Object.keys(state.peers).forEach(uid => {
            if (!users.find(u => (u.id || u) === uid)) {
                removePeer(uid);
            }
        });
    }

    async function createPeerConnection(remoteId, remoteName) {
        const iceServers = await getIceServersFromXirsys();

        const pc = new RTCPeerConnection({ iceServers });

        // 本地流
        if (state.localStream) {
            state.localStream.getTracks().forEach(track => pc.addTrack(track, state.localStream));
        }

        // 遠端流
        let remoteVideo = document.getElementById('remote_' + remoteId);
        let wrapper = null;
        if (!remoteVideo) {
            wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper';
            wrapper.id = 'remote_wrapper_' + remoteId;
            const h3 = document.createElement('h3');
            h3.textContent = remoteName;
            remoteVideo = document.createElement('video');
            remoteVideo.id = 'remote_' + remoteId;
            remoteVideo.autoplay = true;
            remoteVideo.playsInline = true;
            wrapper.appendChild(h3);
            wrapper.appendChild(remoteVideo);
            elements.videoContainer.appendChild(wrapper);
        }
        pc.ontrack = e => {
            if (remoteVideo.srcObject !== e.streams[0]) {
                remoteVideo.srcObject = e.streams[0];
            }
        };

        pc.onicecandidate = e => {
            if (e.candidate) {
                state.socket.emit('signal', {
                    room: state.room,
                    from: state.userId,
                    target: remoteId,
                    candidate: e.candidate
                });
                console.log("New ICE candidate:", e.candidate);
            }
        };

        // SDP協商
        if (state.userId < remoteId) {
            pc.onnegotiationneeded = async () => {
                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    state.socket.emit('signal', {
                        room: state.room,
                        from: state.userId,
                        target: remoteId,
                        sdp: pc.localDescription
                    });
                } catch (err) {
                    console.error('SDP offer error:', err);
                }
            };
        }

        state.peers[remoteId] = { pc, videoEl: remoteVideo, name: remoteName };
    }

    function removePeer(remoteId) {
        if (state.peers[remoteId]) {
            if (state.peers[remoteId].pc) {
                state.peers[remoteId].pc.close();
            }
            const videoEl = state.peers[remoteId].videoEl;
            if (videoEl && videoEl.parentNode) {
                videoEl.parentNode.remove();
            }
            delete state.peers[remoteId];
        }
    }

    async function handleSignal(data) {
        const from = data.from;
        if (!state.peers[from]) {
            await createPeerConnection(from, data.name || from);
        }
        const pc = state.peers[from].pc;
        try {
            if (data.sdp) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                if (data.sdp.type === 'offer') {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    state.socket.emit('signal', {
                        room: state.room,
                        from: state.userId,
                        target: from,
                        sdp: pc.localDescription
                    });
                }
            } else if (data.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        } catch (err) {
            console.error('handleSignal error:', err);
        }
    }

    // ====================== UI功能 ======================
    function appendSystemMessage(message) {
        appendMessage(`[系統] ${message}`, 'system');
    }

    function appendMessage(message, type = 'normal') {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        elements.messagesDiv.appendChild(messageElement);
        elements.messagesDiv.scrollTop = elements.messagesDiv.scrollHeight;
    }

    function appendImageMessage(user, url) {
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `<b>${user}:</b><br><img src="${url}" class="chat-img" alt="圖片">`;
        elements.messagesDiv.appendChild(div);
        elements.messagesDiv.scrollTop = elements.messagesDiv.scrollHeight;
    }

    function updateUserList(users) {
        elements.userList.innerHTML = users.map(u =>
            `<span>${u.name || u.id || u}${(u.id || u) === state.userId ? '（你）' : ''}</span>`
        ).join('、');
    }

    // ====================== 事件監聽 ======================
    elements.joinBtn.addEventListener('click', async () => {
        const nickname = elements.nicknameInput.value.trim();
        const room = elements.roomInput.value.trim();
        if (!nickname || !room) {
            alert('請輸入暱稱與房間ID');
            return;
        }
        state.nickname = nickname;
        state.room = room;
        elements.nicknameDisplay.textContent = nickname;
        elements.localName.textContent = nickname;
        elements.loginPanel.style.display = 'none';
        elements.mainPanel.style.display = '';
        appendSystemMessage(`加入房間 ${room}...`);
        // 取得本地視訊
        try {
            state.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            elements.localVideo.srcObject = state.localStream;
        } catch (err) {
            alert('無法取得攝影機/麥克風權限');
            return;
        }
        if (!state.socket) initSocket();
        state.socket.emit('join', {
            room,
            user_id: state.userId,
            name: nickname
        });
    });

    elements.leaveBtn.addEventListener('click', () => {
        if (state.socket && state.room) {
            state.socket.emit('leave', {
                room: state.room,
                user_id: state.userId,
                name: state.nickname
            });
        }
        elements.mainPanel.style.display = 'none';
        elements.loginPanel.style.display = '';
        state.room = null;
        state.nickname = '';
        elements.nicknameDisplay.textContent = '';
        elements.localName.textContent = '';
        elements.userList.innerHTML = '';
        elements.messagesDiv.innerHTML = '';
        Object.keys(state.peers).forEach(removePeer);
        updateWhiteboardUsers([]);
        if (state.localStream) {
            state.localStream.getTracks().forEach(track => track.stop());
            elements.localVideo.srcObject = null;
            state.localStream = null;
        }
    });

    elements.sendBtn.addEventListener('click', sendChat);
    elements.messageInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendChat();
    });

    function sendChat() {
        const msg = elements.messageInput.value.trim();
        if (!msg) return;
        state.socket.emit('chat', {
            room: state.room,
            user: state.nickname,
            msg
        });
        elements.messageInput.value = '';
    }

    // 圖片上傳
    elements.imgForm.addEventListener('submit', e => {
        e.preventDefault();
        const file = elements.imgInput.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('room', state.room);
        formData.append('user', state.nickname);
        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(res => res.json()).then(data => {
            if (!data.success) alert('圖片上傳失敗');
            elements.imgInput.value = '';
        });
    });

    // 靜音/開啟麥克風
    elements.muteBtn.addEventListener('click', () => {
        state.audioEnabled = !state.audioEnabled;
        if (state.localStream) {
            state.localStream.getAudioTracks().forEach(track => track.enabled = state.audioEnabled);
        }
        elements.muteBtn.textContent = state.audioEnabled ? '靜音' : '開啟麥克風';
    });

    // 關閉/開啟鏡頭
    elements.cameraBtn.addEventListener('click', () => {
        state.videoEnabled = !state.videoEnabled;
        if (state.localStream) {
            state.localStream.getVideoTracks().forEach(track => track.enabled = state.videoEnabled);
        }
        elements.cameraBtn.textContent = state.videoEnabled ? '關閉鏡頭' : '開啟鏡頭';
    });

    // ====================== 多人同步白板（每人一塊） ======================
    const whiteboardList = document.getElementById('whiteboardList');
    const whiteboards = {}; // userId: {canvas, ctx, ...}
    let myWhiteboard = null;

    function createWhiteboard(userId, name, isSelf) {
        if (whiteboards[userId]) return whiteboards[userId];
        // 建立外框
        const box = document.createElement('div');
        box.className = 'whiteboard-box';
        box.id = 'whiteboard_box_' + userId;
        // 標題
        const owner = document.createElement('div');
        owner.className = 'whiteboard-owner';
        owner.textContent = name + (isSelf ? '（你）' : '');
        box.appendChild(owner);
        // canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'whiteboard-canvas';
        canvas.width = 340;
        canvas.height = 220;
        box.appendChild(canvas);
        // 工具列（只有自己能操作）
        let color = '#222222';
        let size = 3;
        if (isSelf) {
            const tools = document.createElement('div');
            tools.className = 'whiteboard-tools';
            // 顏色
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = color;
            colorInput.addEventListener('input', e => color = e.target.value);
            tools.appendChild(colorInput);
            // 粗細
            const sizeInput = document.createElement('input');
            sizeInput.type = 'range';
            sizeInput.min = 1;
            sizeInput.max = 16;
            sizeInput.value = size;
            sizeInput.addEventListener('input', e => size = parseInt(e.target.value));
            tools.appendChild(sizeInput);
            // 清除
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '清除';
            clearBtn.addEventListener('click', () => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                state.socket.emit('whiteboard_clear', {
                    room: state.room,
                    userId: state.userId
                });
            });
            tools.appendChild(clearBtn);
            box.appendChild(tools);
        }
        whiteboardList.appendChild(box);

        // 畫圖事件
        const ctx = canvas.getContext('2d');
        let drawing = false, last = null;
        function getPos(e) {
            if (e.touches) {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: (e.touches[0].clientX - rect.left) * canvas.width / rect.width,
                    y: (e.touches[0].clientY - rect.top) * canvas.height / rect.height
                };
            } else {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: (e.offsetX !== undefined ? e.offsetX : e.layerX) * canvas.width / rect.width,
                    y: (e.offsetY !== undefined ? e.offsetY : e.layerY) * canvas.height / rect.height
                };
            }
        }
        function drawLine(ctx, from, to, color, size, emit) {
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            ctx.closePath();
            if (emit) {
                state.socket.emit('whiteboard_draw', {
                    room: state.room,
                    userId: state.userId,
                    from, to, color, size
                });
            }
        }
        if (isSelf) {
            canvas.addEventListener('mousedown', e => {
                drawing = true;
                last = getPos(e);
            });
            canvas.addEventListener('mousemove', e => {
                if (!drawing) return;
                const now = getPos(e);
                drawLine(ctx, last, now, color, size, true);
                last = now;
            });
            canvas.addEventListener('mouseup', () => drawing = false);
            canvas.addEventListener('mouseleave', () => drawing = false);
            // 手機觸控
            canvas.addEventListener('touchstart', e => {
                drawing = true;
                last = getPos(e);
            });
            canvas.addEventListener('touchmove', e => {
                if (!drawing) return;
                const now = getPos(e);
                drawLine(ctx, last, now, color, size, true);
                last = now;
                e.preventDefault();
            }, { passive: false });
            canvas.addEventListener('touchend', () => drawing = false);
        }
        whiteboards[userId] = { canvas, ctx, box };
        if (isSelf) myWhiteboard = whiteboards[userId];
        return whiteboards[userId];
    }

    function drawLine(ctx, from, to, color, size, emit) {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        ctx.closePath();
    }

    // 處理同步事件
    function setupWhiteboardSocket() {
        state.socket.on('whiteboard_draw', data => {
            const { userId, from, to, color, size } = data;
            if (whiteboards[userId]) {
                drawLine(whiteboards[userId].ctx, from, to, color, size, false);
            }
        });
        state.socket.on('whiteboard_clear', data => {
            const { userId } = data;
            if (whiteboards[userId]) {
                whiteboards[userId].ctx.clearRect(0, 0, whiteboards[userId].canvas.width, whiteboards[userId].canvas.height);
            }
        });
        // 歷史同步
        state.socket.on('whiteboard_history', history => {
            Object.keys(history).forEach(userId => {
                if (!whiteboards[userId]) return;
                history[userId].forEach(data => {
                    drawLine(
                        whiteboards[userId].ctx,
                        data.from, data.to, data.color, data.size, false
                    );
                });
            });
        });
    }

    // 進房時建立所有人的白板
    function updateWhiteboardUsers(users) {
        whiteboardList.innerHTML = '';
        Object.keys(whiteboards).forEach(k => delete whiteboards[k]);
        users.forEach(u => {
            createWhiteboard(u.id || u, u.name || u.id || u, (u.id || u) === state.userId);
        });
    }

    // ====================== 初始化 ======================
    appendSystemMessage(`🌐 伺服器地址: ${state.config.ip}:${state.config.port}`);
    appendSystemMessage('🛠️ 準備連線...');
});