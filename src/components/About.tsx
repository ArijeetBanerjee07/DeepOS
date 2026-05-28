

export const About = () => {
  return (
    <section id="about" className="relative z-10 w-full py-32 px-6 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 
            className="text-5xl md:text-7xl text-foreground font-normal tracking-tight mb-8 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Our <em className="not-italic text-blue-400">Philosophy</em>
          </h2>
          
          <div className="space-y-8 text-xl md:text-2xl text-muted-foreground/90 leading-relaxed font-light max-w-4xl bg-[#06080a]/50 p-10 rounded-3xl backdrop-blur-sm border border-white/5 shadow-2xl">
            <p>
              The modern internet is a machine built for distraction. Every notification, every endless feed, and every complex "all-in-one" productivity tool actively works against your ability to think deeply.
            </p>
            <p>
              We realized that solving this wasn't about adding more databases, tags, or tracking metrics. It was about <span className="text-blue-300 font-medium bg-blue-500/10 px-2 py-1 rounded">cognitive performance.</span>
            </p>
            <p>
              Deep Work OS is not an all-in-one productivity app. It is a <span className="text-purple-300 font-medium bg-purple-500/10 px-2 py-1 rounded">mental workspace.</span> Our AI is not a chatbot to write emails for you; it is a <span className="text-green-300 font-medium bg-green-500/10 px-2 py-1 rounded">silent thinking partner</span> that helps you clarify messy thoughts, break down goals, and find flaws in your logic.
            </p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            { title: "Not Productivity", desc: "We optimize for cognitive performance and focus depth.", color: "blue" },
            { title: "Not AI Tools", desc: "We provide an invisible thinking partner to augment your mind.", color: "purple" },
            { title: "Not Note Apps", desc: "We build structured mental workspaces, not database jungles.", color: "green" }
          ].map((item, i) => (
            <div key={i} className="relative group bg-[#0a0d11]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${item.color}-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity`} />
              <h4 className="text-white font-medium mb-3 text-lg">{item.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
