
# Aplicación Web Progresiva: Gestor de Tareas

Este proyecto es una aplicación web progresiva (PWA) que permite a los usuarios gestionar sus tareas personales de forma intuitiva y eficiente. La solución incluye un frontend construido con React (usando Vite y Tailwind CSS) y un backend compuesto por microservicios desarrollados en Flask. La aplicación funciona correctamente incluso sin conexión a internet, gracias al uso de Service Workers y almacenamiento local, y permite su instalación como una app independiente desde el navegador.

## Requisitos

- Node.js y npm
- Python 3.10 o superior
- pip

## 1. Instalación del backend (microservicios)

1. Abre una terminal y navega hasta la carpeta del proyecto donde se encuentran los archivos auth_service.py y task_service.py.
2. Instala las dependencias de Python con el siguiente comando:

   pip install -r requirements.txt

3. Ejecuta ambos microservicios en terminales separadas:

   python auth_service.py
   python task_service.py

   El servicio de autenticación se ejecutará por defecto en el puerto 5000, y el servicio de tareas en el puerto 5001.

## 2. Instalación del frontend (PWA)

1. Abre una nueva terminal y navega hasta la carpeta del frontend que contiene el proyecto React.
2. Ejecuta:

   npm install
   npm run dev

3. Abre tu navegador en la siguiente dirección:

   http://localhost:5173

   Desde ahí podrás utilizar la aplicación, registrarte, iniciar sesión, y gestionar tus tareas.

## 3. Funcionalidades destacadas

- Registro e inicio de sesión con autenticación mediante tokens JWT.
- Creación, edición, eliminación y marcado de tareas como completadas.
- Agrupación automática de tareas por categoría.
- Uso de colores para indicar el estado de cada tarea: en progreso, fuera de tiempo o completada.
- Interfaz responsiva construida con Tailwind CSS.
- Soporte completo para funcionamiento offline:
  - Almacenamiento temporal de tareas sin conexión.
  - Sincronización automática con el servidor cuando se recupera la conexión.
- Alerta visual cuando el usuario está offline y cuando hay tareas pendientes por sincronizar.
- Instalación como aplicación web progresiva desde el navegador (PWA compatible).

## Notas adicionales

- En algunos navegadores, el botón de instalación puede no aparecer inmediatamente. Se recomienda probar en Google Chrome o Microsoft Edge.
- Si ya instalaste la PWA previamente y luego la desinstalaste, puede que debas borrar el caché o usar otro perfil/navegador para que vuelva a aparecer el botón de instalación.
- En caso de errores relacionados con peticiones POST sin conexión, asegúrate de estar desconectado antes de intentar crear una tarea offline y de haber registrado correctamente el Service Worker.

---

Este proyecto es parte de una práctica de integración de tecnologías web modernas, enfocada en la creación de soluciones ligeras, accesibles y multiplataforma.
