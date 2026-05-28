
import { 
  Focus, 
  ShieldAlert, 
  BrainCircuit, 
  Workflow, 
  FileText, 
  LineChart,
  Bot,
  Layers,
  Moon
} from 'lucide-react';

const features = [
  {
    icon: <Focus className="w-6 h-6 mb-4 text-gray-300" />,
    title: "Focus Session System",
    description: "A distraction-free workspace. Set an intent, start a timed session, and work with adaptive timers and ambient environments."
  },
  {
    icon: <ShieldAlert className="w-6 h-6 mb-4 text-gray-300" />,
    title: "Hardcore Deep Mode",
    description: "For serious users. Locks app switching, suppresses notifications, and blocks exiting until the session ends."
  },
  {
    icon: <BrainCircuit className="w-6 h-6 mb-4 text-gray-300" />,
    title: "Thought Capture",
    description: "Quick-access input to dump thoughts or distractions without breaking focus. Process them later."
  },
  {
    icon: <Bot className="w-6 h-6 mb-4 text-gray-300" />,
    title: "AI Thought Assistant",
    description: "An intelligent partner (Strategist, Critic, Creative) that restructures ideas, summarizes sessions, and suggests next steps."
  },
  {
    icon: <FileText className="w-6 h-6 mb-4 text-gray-300" />,
    title: "Structured Mental Workspace",
    description: "Minimal block-based note-taking where every focus session automatically generates a clean, organized page."
  },
  {
    icon: <Workflow className="w-6 h-6 mb-4 text-gray-300" />,
    title: "Cognitive Canvas",
    description: "A freeform visual brainstorming space. Connect ideas, map relationships, and turn messy sketches into roadmaps."
  },
  {
    icon: <Layers className="w-6 h-6 mb-4 text-gray-300" />,
    title: "Canvas Intelligence",
    description: "AI that detects missing steps, converts abstract ideas to timelines, and auto-cleans messy diagrams."
  },
  {
    icon: <LineChart className="w-6 h-6 mb-4 text-gray-300" />,
    title: "Deep Work Analytics",
    description: "Tracks duration, drop-offs, and time-of-day performance. Generates insights like 'You focus best at night'."
  },
  {
    icon: <Moon className="w-6 h-6 mb-4 text-gray-300" />,
    title: "Environment Engine",
    description: "Adaptive visual and audio themes (Night Sky, Rain Desk, Library) that change based on past performance data."
  }
];

export const Features = () => {
  return (
    <section id="features" className="relative z-10 w-full py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center mb-24 relative">
        <h2 
          className="text-5xl md:text-7xl text-foreground font-normal tracking-tight mb-6 bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          The architecture of <em className="not-italic text-blue-400">focus.</em>
        </h2>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto font-light">
          We stripped away the noise to build a minimal, AI-powered productivity and thinking system designed entirely for deep cognitive performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="group relative bg-[#0a0d11]/80 backdrop-blur-md border border-white/5 hover:border-blue-500/30 rounded-3xl p-10 flex flex-col items-start text-left hover:-translate-y-2 transition-all duration-500 cursor-default overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500 text-blue-400 scale-150 -translate-y-8 translate-x-8">
              {feature.icon}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-medium text-foreground mb-4 tracking-tight group-hover:text-blue-200 transition-colors">
              {feature.title}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed group-hover:text-gray-300 transition-colors">
              {feature.description}
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>
    </section>
  );
};
