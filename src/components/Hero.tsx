

export const Hero = ({ onEnterWorkspace }: { onEnterWorkspace: () => void }) => {
  return (
    <section id="hero" className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-40">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient to fade into the next section smoothly at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-40 z-0 bg-gradient-to-t from-background to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        <h1 
          className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2.46px] max-w-7xl font-normal text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em> rise <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>
        
        <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
          We're designing tools for deep thinkers, bold creators, and quiet rebels. Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>
        
        <button 
          onClick={onEnterWorkspace}
          className="animate-fade-rise-delay-2 liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 hover:scale-[1.03] transition-transform cursor-pointer"
        >
          Enter Workspace
        </button>
      </div>
    </section>
  );
};
