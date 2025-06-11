from flask import Flask, request, jsonify
import os
import json
import jwt
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
DATA_FILE = 'users_data.json'
SECRET_KEY = 'supersecretkey123'  # Cambia esto por algo más seguro en producción
users = {}

# ----------------- Persistencia ----------------- #

def load_users():
    global users
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            users.update(json.load(f))

def save_users():
    with open(DATA_FILE, 'w') as f:
        json.dump(users, f, indent=4)

# ----------------- JWT ----------------- #

def generate_token(username):
    payload = {
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return True, payload['username']
    except jwt.ExpiredSignatureError:
        return False, 'Token expirado'
    except jwt.InvalidTokenError:
        return False, 'Token inválido'

# ----------------- Rutas ----------------- #

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username in users:
        return jsonify({'message': 'Usuario ya existe'}), 400

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    users[username] = {
        "password": password,
        "created_at": now,
        "updated_at": now
    }
    save_users()
    return jsonify({'message': 'Usuario registrado correctamente'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = users.get(username)
    if user and user['password'] == password:
        token = generate_token(username)
        return jsonify({'message': 'Login exitoso', 'token': token}), 200
    return jsonify({'message': 'Credenciales inválidas'}), 401

@app.route('/verify_token', methods=['POST'])
def verify():
    data = request.json
    token = data.get('token')
    is_valid, result = verify_token(token)
    if is_valid:
        return jsonify({'valid': True, 'username': result})
    else:
        return jsonify({'valid': False, 'error': result}), 401

@app.route('/update_password', methods=['PUT'])
def update_password():
    data = request.json
    username = data.get('username')
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    user = users.get(username)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404

    if user['password'] != old_password:
        return jsonify({'message': 'Contraseña anterior incorrecta'}), 401

    users[username]['password'] = new_password
    users[username]['updated_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_users()
    return jsonify({'message': 'Contraseña actualizada correctamente'})

# ----------------- Inicio ----------------- #

if __name__ == '__main__':
    load_users()
    app.run(port=5000)
