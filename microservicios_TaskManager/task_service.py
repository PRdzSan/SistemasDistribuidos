from flask import Flask, request, jsonify
import requests
import datetime
import uuid
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
DATA_FILE = 'tasks_data.json'
AUTH_SERVICE_URL = 'http://localhost:5000'
tasks = {}

# ----------------- Persistencia ----------------- #

def load_tasks():
    global tasks
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            tasks.update(json.load(f))

def save_tasks():
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=4)

# ----------------- Token ----------------- #

def get_token_from_header():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    return auth_header.split(' ')[1]

def verify_token(token):
    try:
        response = requests.post(f'{AUTH_SERVICE_URL}/verify_token', json={'token': token})
        if response.status_code == 200 and response.json().get('valid'):
            return response.json().get('username')
    except:
        pass
    return None

# ----------------- Utilidades ----------------- #

def find_task(user_tasks, task_id):
    return next((task for task in user_tasks if task['id'] == task_id), None)

# ----------------- Rutas ----------------- #

@app.route('/tasks', methods=['GET'])
def get_tasks():
    token = get_token_from_header()
    username = verify_token(token)
    if not username:
        return jsonify({'message': 'Token inválido o faltante'}), 401

    user_tasks = tasks.get(username, [])
    now = datetime.datetime.now()
    for task in user_tasks:
        if task['status'] != 'terminada':
            due = datetime.datetime.strptime(task['due_date'], "%Y-%m-%d %H:%M")
            if now > due:
                task['status'] = 'fuera de tiempo'
    save_tasks()
    return jsonify(user_tasks)

@app.route('/tasks', methods=['POST'])
def add_task():
    token = get_token_from_header()
    username = verify_token(token)
    if not username:
        return jsonify({'message': 'Token inválido o faltante'}), 401

    data = request.json
    title = data.get('title')
    description = data.get('description')
    category = data.get('category')
    due_date = data.get('due_date')

    if not all([title, description, category, due_date]):
        return jsonify({'message': 'Faltan campos obligatorios'}), 400

    try:
        datetime.datetime.strptime(due_date, "%Y-%m-%d %H:%M")
    except ValueError:
        return jsonify({'message': 'Formato de fecha inválido. Usa YYYY-MM-DD HH:MM'}), 400

    # Validar título único
    for existing_task in tasks.get(username, []):
        if existing_task['title'].lower() == title.lower():
            return jsonify({'message': 'Ya existe una tarea con ese título'}), 400

    task = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "category": category,
        "due_date": due_date,
        "status": "en progreso",
        "author": username
    }

    tasks.setdefault(username, []).append(task)
    save_tasks()
    return jsonify({'message': 'Tarea añadida correctamente', 'task': task})

@app.route('/tasks/<task_id>/complete', methods=['PUT'])
def complete_task(task_id):
    token = get_token_from_header()
    username = verify_token(token)
    if not username:
        return jsonify({'message': 'Token inválido o faltante'}), 401

    user_tasks = tasks.get(username, [])
    task = find_task(user_tasks, task_id)
    if task:
        task['status'] = 'terminada'
        save_tasks()
        return jsonify({'message': 'Tarea marcada como completada', 'task': task})
    return jsonify({'message': 'Tarea no encontrada'}), 404

@app.route('/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    token = get_token_from_header()
    username = verify_token(token)
    if not username:
        return jsonify({'message': 'Token inválido o faltante'}), 401

    user_tasks = tasks.get(username, [])
    task = find_task(user_tasks, task_id)
    if not task:
        return jsonify({'message': 'Tarea no encontrada'}), 404

    data = request.json
    new_title = data.get('title', task['title'])

    # Verificar títulos duplicados (excepto el mismo task)
    for other_task in user_tasks:
        if other_task['id'] != task_id and other_task['title'].lower() == new_title.lower():
            return jsonify({'message': 'Ya existe otra tarea con ese título'}), 400

    task['title'] = new_title
    task['description'] = data.get('description', task['description'])
    task['category'] = data.get('category', task['category'])

    if 'due_date' in data:
        try:
            datetime.datetime.strptime(data['due_date'], "%Y-%m-%d %H:%M")
            task['due_date'] = data['due_date']
        except ValueError:
            return jsonify({'message': 'Formato de fecha inválido. Usa YYYY-MM-DD HH:MM'}), 400

    save_tasks()
    return jsonify({'message': 'Tarea actualizada', 'task': task})

@app.route('/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    token = get_token_from_header()
    username = verify_token(token)
    if not username:
        return jsonify({'message': 'Token inválido o faltante'}), 401

    user_tasks = tasks.get(username, [])
    for i, task in enumerate(user_tasks):
        if task['id'] == task_id:
            user_tasks.pop(i)
            save_tasks()
            return jsonify({'message': 'Tarea eliminada correctamente'})
    return jsonify({'message': 'Tarea no encontrada'}), 404

# ----------------- Inicio ----------------- #

if __name__ == '__main__':
    load_tasks()
    app.run(port=5001)
