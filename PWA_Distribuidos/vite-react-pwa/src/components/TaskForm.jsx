import { useState, useEffect } from 'react';

export default function TaskForm({ onAdd, editingTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Convierte "YYYY-MM-DD HH:MM" ⇄ "YYYY-MM-DDTHH:MM"
  const convertToInputFormat = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.replace(' ', 'T');
  };

  const convertToBackendFormat = (dateStr) => {
    return dateStr.replace('T', ' ');
  };

  // Precargar datos si estamos editando una tarea
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setCategory(editingTask.category || '');
      setDueDate(convertToInputFormat(editingTask.due_date));
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !category || !dueDate) return;

    onAdd({
      title,
      description,
      category,
      due_date: convertToBackendFormat(dueDate),
    });

    // Limpiar formulario si es una nueva tarea
    if (!editingTask) {
      setTitle('');
      setDescription('');
      setCategory('');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        className="w-full p-2 border rounded"
        placeholder="Categoría"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        className="w-full p-2 border rounded"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        {editingTask ? 'Actualizar tarea' : 'Agregar tarea'}
      </button>
    </form>
  );
}
