

export const Contact = () => {
  return (
    <section id="contact" className="relative z-10 w-full py-32 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 
          className="text-4xl md:text-5xl text-foreground font-normal tracking-tight mb-6"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Ready for <em className="not-italic text-muted-foreground">deep work?</em>
        </h2>
        <p className="text-muted-foreground text-lg mb-10">
          We are currently in private beta, accepting a limited number of early adopters who are serious about protecting their focus.
        </p>
        
        <form className="flex flex-col sm:flex-row items-center gap-4 justify-center max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="w-full sm:w-auto flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3.5 text-sm text-foreground focus:outline-none focus:border-white/30 transition-colors"
            required
          />
          <button 
            type="submit" 
            className="liquid-glass w-full sm:w-auto rounded-full px-8 py-3.5 text-sm text-foreground hover:scale-[1.03] transition-transform cursor-pointer"
          >
            Request Access
          </button>
        </form>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mb-4 md:mb-0">
            <span style={{ fontFamily: "'Instrument Serif', serif" }} className="text-sm">Deep Work OS</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Manifesto</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </section>
  );
};
