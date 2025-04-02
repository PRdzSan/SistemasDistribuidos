# 📚 Servicio Web: Biblioteca Digital

Este proyecto es un ejemplo de un servicio web clásico basado en arquitectura cliente-servidor. Permite realizar operaciones básicas sobre una biblioteca digital, utilizando Flask (Python) y persistiendo los datos en un archivo JSON (`books.json`), el cual contiene **50 libros reales con sus autores y fechas auténticas**.

---

## 🚀 Cómo ejecutar el proyecto

### 📋 Requisitos

- Python 3 instalado.
- Flask instalado:
```bash
pip install flask
```

---

### 📁 Archivos necesarios

Asegúrate de tener los siguientes archivos en el mismo directorio:

```
biblioteca/
│
├── app.py             # Código del servidor Flask
├── books.json    # Archivo con 50 libros auténticos (simula base de datos)
```

## 🧪 Cómo probar el servicio

### 1. Ejecutar el servidor

Desde una terminal:

```bash
python app.py
```

El servidor quedará disponible en:  
📍 `http://localhost:5000`

---

### 2. Endpoints disponibles

#### 📚 Obtener todos los libros
- `GET /books`

#### 🔍 Obtener libro por ID
- `GET /books/<id>`  
- Ejemplo: `/books/105`

#### ➕ Agregar un nuevo libro
- `POST /books`
- JSON de ejemplo:
```json
{
  "title": "Nuevo Libro",
  "author": "Nombre del Autor",
  "year": 2024
}
```
#### 🗑️ Eliminar un libro por ID
- `DELETE /books/<id>`
---
## 📝 Notas adicionales
- Todos los datos se almacenan en `books.json`, el cual ya contiene libros reales precargados.
- Puedes usar Postman, Insomnia o `curl` para hacer pruebas HTTP.
- Este servicio no requiere autenticación y está diseñado para fines educativos.
- Puedes extenderlo fácilmente con más funcionalidades.
---
