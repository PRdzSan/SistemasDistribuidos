import { useState } from 'react';

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const toggleForm = () => {
    setIsRegister(!isRegister);
    setMessage('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:5000/${isRegister ? 'register' : 'login'}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      onLogin();
    } else {
      setMessage(data.message || 'Error de autenticación');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          {isRegister ? 'Crea tu cuenta' : 'Inicia sesión'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-medium"
            type="submit"
          >
            {isRegister ? 'Registrar' : 'Iniciar sesión'}
          </button>
        </form>
        {message && (
          <p className="mt-3 text-center text-red-500 text-sm font-medium">
            {message}
          </p>
        )}
        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <button
            className="text-indigo-600 font-semibold underline hover:text-indigo-800"
            onClick={toggleForm}
            type="button"
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
}
