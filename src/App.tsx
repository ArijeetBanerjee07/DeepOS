import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{ token: string, email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('deep_os_token');
    const email = localStorage.getItem('deep_os_email');
    if (token && email) {
      setUser({ token, email });
    }
  }, []);

  const handleEnterWorkspace = () => {
    if (user) {
      setView('dashboard');
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('deep_os_token', token);
    localStorage.setItem('deep_os_email', userData.email);
    setUser({ token, email: userData.email });
    setView('dashboard');
  };

  if (view === 'dashboard') {
    return <Dashboard onExit={() => setView('landing')} />;
  }

  return (
    <div className="relative min-h-screen w-full bg-background selection:bg-white/20 selection:text-white">
      <Navbar onEnterWorkspace={handleEnterWorkspace} user={user} onLogout={() => {
        localStorage.removeItem('deep_os_token');
        localStorage.removeItem('deep_os_email');
        setUser(null);
      }} />
      <main className="w-full">
        <Hero onEnterWorkspace={handleEnterWorkspace} />
        <Features />
        <About />
        <Contact />
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin} 
      />
    </div>
  );
}
