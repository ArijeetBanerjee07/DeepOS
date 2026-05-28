

export const Navbar = ({ onEnterWorkspace, user, onLogout }: { onEnterWorkspace: () => void, user: any, onLogout: () => void }) => {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex flex-row items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full transition-all duration-300">
      <div 
        className="text-3xl tracking-tight text-foreground cursor-pointer flex items-center gap-2" 
        style={{ fontFamily: "'Instrument Serif', serif" }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        Deep OS
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <a href="#hero" className="text-sm text-foreground transition-colors hover:text-blue-400">Home</a>
        <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-blue-400">Features</a>
        <a href="#about" className="text-sm text-muted-foreground transition-colors hover:text-blue-400">Philosophy</a>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <button 
              onClick={onLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
            <button 
              onClick={onEnterWorkspace}
              className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform cursor-pointer border border-white/10"
            >
              Workspace
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button 
              onClick={onEnterWorkspace}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onEnterWorkspace}
              className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform cursor-pointer border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
