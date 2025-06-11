import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Detectar si la app ya está instalada
  useEffect(() => {
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
    });

    // Algunos navegadores detectan esto
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  // Capturar evento beforeinstallprompt si ocurre
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      alert('Para instalar esta app, abre el menú del navegador y selecciona "Agregar a pantalla de inicio".');
    }
  };

  if (isInstalled) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow-lg animate-bounce z-50"
    >
      📲 Instalar App
    </button>
  );
}
