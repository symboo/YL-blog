from flask import Flask, render_template, request, send_from_directory
from flask_socketio import SocketIO, join_room, leave_room, emit
from werkzeug.utils import secure_filename
import os
from pathlib import Path
import datetime
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID

UPLOAD_FOLDER = Path(__file__).parent / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)

SERVER_IP = "26.5.245.49"
PORT = 5000

socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
rooms = {}  # room_id: {user_id: {'sid': sid, 'name': name}}
whiteboard_history = {}  # room_id: {user_id: [draw_data, ...]}

@app.route('/')
def welcome():
    return render_template('welcome.html')

@app.route('/call')
def call():
    return render_template('call.html')

@app.route('/index')
def yl():
    return render_template('main.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/submit')
def submit():
    return render_template('submit.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    room = request.form['room']
    user = request.form['user']
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        socketio.emit('image', {
            'user': user,
            'room': room,
            'url': f'/uploads/{filename}'
        }, room=room)
        return {'success': True}
    return {'success': False}, 400

@socketio.on('join')
def handle_join(data):
    room = data['room']
    user_id = data['user_id']
    name = data['name']
    sid = request.sid
    join_room(room)
    if room not in rooms:
        rooms[room] = {}
    rooms[room][user_id] = {'sid': sid, 'name': name}
    emit('users_in_room', {'users': [{'id': uid, 'name': rooms[room][uid]['name']} for uid in rooms[room]]}, room=room)
    emit('user_joined', {'user_id': user_id, 'name': name}, room=room)
    emit('user_list', {'users': [{'id': uid, 'name': rooms[room][uid]['name']} for uid in rooms[room]]}, room=room)
    # 傳送白板歷史
    emit('whiteboard_history', whiteboard_history.get(room, {}), room=sid)

@socketio.on('leave')
def handle_leave(data):
    room = data['room']
    user_id = data['user_id']
    name = data.get('name', '')
    leave_room(room)
    if room in rooms and user_id in rooms[room]:
        del rooms[room][user_id]
        emit('user_left', {'user_id': user_id, 'name': name}, room=room)
        emit('users_in_room', {'users': [{'id': uid, 'name': rooms[room][uid]['name']} for uid in rooms[room]]}, room=room)
        if not rooms[room]:
            del rooms[room]

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    for room in list(rooms.keys()):
        for user_id, info in list(rooms[room].items()):
            if info['sid'] == sid:
                leave_room(room)
                name = info['name']
                del rooms[room][user_id]
                emit('user_left', {'user_id': user_id, 'name': name}, room=room)
                emit('users_in_room', {'users': [{'id': uid, 'name': rooms[room][uid]['name']} for uid in rooms[room]]}, room=room)
                if not rooms[room]:
                    del rooms[room]

@socketio.on('chat')
def handle_chat(data):
    room = data['room']
    user = data['user']
    msg = data['msg']
    emit('chat', {'user': user, 'msg': msg}, room=room)

@socketio.on('signal')
def handle_signal(data):
    room = data['room']
    target = data.get('target')
    if target:
        target_sid = rooms[room].get(target, {}).get('sid')
        if target_sid:
            emit('signal', data, room=target_sid)
    else:
        emit('signal', data, room=room, include_self=False)

@socketio.on('whiteboard_draw')
def handle_whiteboard_draw(data):
    room = data['room']
    user_id = data['userId']
    # 儲存歷史
    if room not in whiteboard_history:
        whiteboard_history[room] = {}
    if user_id not in whiteboard_history[room]:
        whiteboard_history[room][user_id] = []
    whiteboard_history[room][user_id].append(data)
    emit('whiteboard_draw', data, room=room, include_self=False)

@socketio.on('whiteboard_clear')
def handle_whiteboard_clear(data):
    room = data['room']
    user_id = data.get('userId')
    # 清空歷史
    if room in whiteboard_history and user_id in whiteboard_history[room]:
        whiteboard_history[room][user_id] = []
    emit('whiteboard_clear', {'userId': user_id}, room=room, include_self=False)

if __name__ == '__main__':
    cert_dir = Path(__file__).parent / 'certs'
    cert_dir.mkdir(exist_ok=True)
    cert_file = cert_dir / 'cert.pem'
    key_file = cert_dir / 'key.pem'
    if not cert_file.exists() or not key_file.exists():
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048, backend=default_backend())
        cert = x509.CertificateBuilder().subject_name(
            x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, u"WebRTC-Server")])
        ).issuer_name(
            x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, u"WebRTC-Server")])
        ).public_key(
            key.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.datetime.utcnow()
        ).not_valid_after(
            datetime.datetime.utcnow() + datetime.timedelta(days=365)
        ).sign(key, hashes.SHA256(), default_backend())
        cert_file.write_bytes(cert.public_bytes(serialization.Encoding.PEM))
        key_file.write_bytes(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        ))
    print(f"伺服器啟動於：https://{SERVER_IP}:{PORT}")
    socketio.run(app, host='0.0.0.0', port=PORT, ssl_context=(str(cert_file), str(key_file)), debug=True)