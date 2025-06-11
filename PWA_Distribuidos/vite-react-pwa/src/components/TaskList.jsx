// src/components/TaskList.jsx
import { useEffect, useState } from 'react';
import TaskForm from './TaskForm';

export default function TaskList({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const API_URL = 'http://localhost:5001/tasks';
  const token = localStorage.getItem('token');

  const checkBackendAvailability = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsOffline(false);
        return true;
      }
    } catch (err) {
      setIsOffline(true);
    }
    return false;
  };

  const fetchTasks = () => {
    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTasks(data);
      })
      .catch(() => setError('Error al obtener tareas'));
  };

  useEffect(() => {
    checkBackendAvailability().then((online) => {
      if (online) fetchTasks();
    });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleOffline = () => {
    setIsOffline(true);
    const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks') || '[]');
    if (offlineTasks.length > 0) {
      setTasks([...tasks, ...offlineTasks.map((t) => ({ ...t, id: Date.now().toString() }))]);
      setHasPending(true);
    }
  };
  

  const handleOnline = () => {
    checkBackendAvailability().then((online) => {
      if (online) {
        setIsOffline(false);
        syncOfflineTasks();
      }
    });
  };

  const syncOfflineTasks = async () => {
    const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks') || '[]');
    if (offlineTasks.length === 0) return;

    const results = await Promise.allSettled(
      offlineTasks.map((taskData) =>
        fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(taskData),
        })
      )
    );

    const failedTasks = offlineTasks.filter((_, i) => results[i].status !== 'fulfilled');

    if (failedTasks.length > 0) {
      localStorage.setItem('offlineTasks', JSON.stringify(failedTasks));
      setHasPending(true);
    } else {
      localStorage.removeItem('offlineTasks');
      setHasPending(false);
    }

    fetchTasks();
  };

  const handleAddTask = async (taskData) => {
    if (editTask) {
      try {
        const res = await fetch(`${API_URL}/${editTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(taskData),
        });
  
        if (res.ok) {
          setEditTask(null);
          setShowEditModal(false);
          fetchTasks();
        } else {
          const data = await res.json();
          setError(data.message || 'Error al editar tarea');
        }
      } catch (err) {
        setError('No se pudo conectar al servidor para editar la tarea.');
      }
      return;
    }
  
    let backendOk = false;
    try {
      backendOk = await checkBackendAvailability();
    } catch (e) {
      backendOk = false;
    }
  
    if (!backendOk) {
      const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks') || '[]');
      const taskWithId = { ...taskData, id: Date.now().toString(), status: 'en progreso' };
      offlineTasks.push(taskWithId);
      localStorage.setItem('offlineTasks', JSON.stringify(offlineTasks));
      setTasks((prev) => [...prev, taskWithId]);
      setHasPending(true);
      return;
    }
  
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });
  
      if (res.ok) {
        fetchTasks();
      } else {
        const data = await res.json();
        setError(data.message || 'Error al agregar tarea');
      }
    } catch (err) {
      setError('Error de red al agregar la tarea. Se intentará sincronizar luego.');
      // Backup en local por si la conexión falló en medio
      const offlineTasks = JSON.parse(localStorage.getItem('offlineTasks') || '[]');
      const taskWithId = { ...taskData, id: Date.now().toString(), status: 'en progreso' };
      offlineTasks.push(taskWithId);
      localStorage.setItem('offlineTasks', JSON.stringify(offlineTasks));
      setTasks((prev) => [...prev, taskWithId]);
      setHasPending(true);
    }
  };
  
  

  const markAsComplete = async (id) => {
    const res = await fetch(`${API_URL}/${id}/complete`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'terminada':
        return 'text-green-600';
      case 'fuera de tiempo':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    acc[task.category] = acc[task.category] || [];
    acc[task.category].push(task);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-indigo-600">Mis Tareas</h1>
        {isOffline && (
          <div className="bg-yellow-100 text-yellow-700 border border-yellow-300 p-2 rounded text-center mb-4">
            Estás sin conexión con el servidor. Las tareas se guardarán localmente.
          </div>
        )}
        {hasPending && (
          <div className="bg-blue-100 text-blue-700 border border-blue-300 p-2 rounded text-center mb-4">
            Tienes tareas pendientes por sincronizar.
          </div>
        )}
        <TaskForm onAdd={handleAddTask} editingTask={editTask} />

        {showEditModal && editTask && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 shadow-lg w-11/12 max-w-md">
              <h2 className="text-xl font-semibold mb-2">Editar tarea</h2>
              <TaskForm onAdd={handleAddTask} editingTask={editTask} />
              <button
                className="mt-4 text-sm text-gray-600 underline hover:text-gray-800"
                onClick={() => {
                  setEditTask(null);
                  setShowEditModal(false);
                }}
              >
                Cancelar edición
              </button>
            </div>
          </div>
        )}

        {Object.entries(groupedTasks).map(([category, tasks]) => (
          <div key={category} className="mt-6">
            <h2 className="text-lg font-bold text-gray-700 border-b pb-1 mb-2">{category}</h2>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded border p-3"
                >
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold ${
                        task.status === 'terminada' ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {task.title || '[sin título]'}
                    </h3>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <p className={`text-xs ${statusColor(task.status)}`}>
                      vence: {task.due_date} • estado: {task.status}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 mt-2 sm:mt-0">
                    {(task.status === 'en progreso' || task.status === 'fuera de tiempo') && (
                      <button
                        onClick={() => markAsComplete(task.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        ✓ Completar
                      </button>
                    )}
                    <button
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      onClick={() => {
                        setEditTask(task);
                        setShowEditModal(true);
                      }}
                    >
                      ✎ Editar
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteTask(task.id)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            onLogout();
          }}
          className="mt-6 w-full text-sm text-gray-600 underline hover:text-gray-800"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
