from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)
DATA_FILE = 'books.json'

# Cargar libros desde el archivo JSON
def load_books():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

# Guardar libros en el archivo JSON
def save_books(books):
    with open(DATA_FILE, 'w') as f:
        json.dump(books, f, indent=4)

# Obtener todos los libros
@app.route('/books', methods=['GET'])
def get_books():
    books = load_books()
    return jsonify(books), 200

# Obtener un libro por ID
@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    books = load_books()
    for book in books:
        if book['id'] == book_id:
            return jsonify(book), 200
    return jsonify({'error': 'Libro no encontrado'}), 404

# Agregar un nuevo libro
@app.route('/books', methods=['POST'])
def add_book():
    books = load_books()
    data = request.get_json()

    # Validaciones básicas
    if not all(k in data for k in ('title', 'author', 'year')):
        return jsonify({'error': 'Faltan campos requeridos'}), 400

    new_id = max([book['id'] for book in books], default=100) + 1
    new_book = {
        'id': new_id,
        'title': data['title'],
        'author': data['author'],
        'year': data['year']
    }
    books.append(new_book)
    save_books(books)
    return jsonify({'message': 'Libro agregado correctamente', 'book_id': new_id}), 201

# Eliminar un libro por ID
@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    books = load_books()
    updated_books = [book for book in books if book['id'] != book_id]

    if len(books) == len(updated_books):
        return jsonify({'error': 'Libro no encontrado'}), 404

    save_books(updated_books)
    return jsonify({'message': f'Libro con ID {book_id} eliminado'}), 200
