import { useState } from 'react';
import Auth from './auth/Auth';
import TaskList from './components/TaskList';
import InstallPrompt from './components/InstallPrompt';

function App() {
  const [authenticated, setAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  return authenticated ? (
    <>
      <TaskList onLogout={() => setAuthenticated(false)} />
      <InstallPrompt /> {/* 👈 Aquí se muestra el botón */}
    </>
  ) : (
    <Auth onLogin={() => setAuthenticated(true)} />
  );
}

export default App;
