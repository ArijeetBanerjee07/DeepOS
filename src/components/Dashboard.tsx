import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  BrainCircuit,
  FileText,
  Workflow,
  LineChart,
  Settings,
  Sparkles,
  CloudRain,
  ShieldAlert,
  Send,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightOpen,
  Pencil,
  Maximize,
  Users
} from 'lucide-react';
import { CognitiveCanvas } from './CognitiveCanvas';
import { Whiteboard } from './Whiteboard';
import { generateRoadmap } from '../utils/groq';
import { calculateFlowchartLayout } from '../utils/layout';
import ReactMarkdown from 'react-markdown';
import type { Node, Edge } from 'reactflow';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 100 },
    data: { title: 'Define Core API', description: 'Set up GraphQL resolvers for user focus states.', type: 'task' },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 250, y: 250 },
    data: { title: 'Implement Auth', description: 'JWT based stateless auth.', type: 'concept' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6' } },
];

export const PERSONAS = [
  {
    id: 'strategist',
    name: 'The Strategist',
    icon: 'BrainCircuit',
    description: 'Focuses on high-level architecture, roadmap planning, and breaking down complex problems into actionable steps.',
    tags: ['System Design', 'Planning'],
    styles: {
      activeBg: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
      activeIconBg: 'bg-blue-500/20 text-blue-400',
      inactiveIconBg: 'bg-blue-500/10 text-blue-400/70 group-hover:bg-blue-500/20 group-hover:text-blue-400',
      activeText: 'text-blue-100',
      activeDesc: 'text-blue-200/70',
      activeTag: 'bg-blue-500/20 text-blue-300'
    },
    prompt: 'You are The Strategist, a system architect and planner. Focus on high-level architecture, roadmap planning, and breaking down complex problems into actionable steps. Keep answers concise and structured.'
  },
  {
    id: 'reviewer',
    name: 'The Code Reviewer',
    icon: 'Pencil',
    description: 'Strictly focuses on code quality, performance optimizations, and security vulnerabilities. Direct and concise.',
    tags: ['Optimization', 'Security'],
    styles: {
      activeBg: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
      activeIconBg: 'bg-purple-500/20 text-purple-400',
      inactiveIconBg: 'bg-purple-500/10 text-purple-400/70 group-hover:bg-purple-500/20 group-hover:text-purple-400',
      activeText: 'text-purple-100',
      activeDesc: 'text-purple-200/70',
      activeTag: 'bg-purple-500/20 text-purple-300'
    },
    prompt: 'You are The Code Reviewer. Strictly focus on code quality, performance optimizations, and security vulnerabilities. Be direct, concise, and provide code examples for improvements.'
  },
  {
    id: 'muse',
    name: 'The Creative Muse',
    icon: 'Sparkles',
    description: 'Specializes in lateral thinking, UI/UX design ideas, and brainstorming alternative approaches.',
    tags: ['Brainstorming', 'UX Design'],
    styles: {
      activeBg: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
      activeIconBg: 'bg-green-500/20 text-green-400',
      inactiveIconBg: 'bg-green-500/10 text-green-400/70 group-hover:bg-green-500/20 group-hover:text-green-400',
      activeText: 'text-green-100',
      activeDesc: 'text-green-200/70',
      activeTag: 'bg-green-500/20 text-green-300'
    },
    prompt: 'You are The Creative Muse. Specialize in lateral thinking, UI/UX design ideas, and brainstorming alternative approaches. Be encouraging, creative, and think outside the box.'
  }
];

export const Dashboard = ({ onExit }: { onExit: () => void }) => {
  const [activeTab, setActiveTab] = useState<'focus' | 'notes' | 'canvas' | 'personas' | 'whiteboard'>('whiteboard');
  const [activePersonaId, setActivePersonaId] = useState('strategist');
  const [isFocusing, setIsFocusing] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [thoughtDump, setThoughtDump] = useState('');
  const [isChatGenerating, setIsChatGenerating] = useState(false);

  // Todos State
  const [todos, setTodos] = useState([
    { id: '1', text: 'Update database schema', completed: false },
    { id: '2', text: 'Refactor authentication module', completed: false }
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      setTodos([...todos, { id: Math.random().toString(), text: newTodoText, completed: false }]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAutoExtractTasks = () => {
    setIsChatGenerating(true);
    setTimeout(() => {
      setTodos(prev => [
        ...prev,
        { id: Math.random().toString(), text: 'Review roadmap milestones', completed: false },
        { id: Math.random().toString(), text: 'Consolidate whiteboard notes', completed: false }
      ]);
      setIsChatGenerating(false);
    }, 1000);
  };

  const handleBreakdownTask = (todoId: string, taskText: string) => {
    const subtasks = [
      { id: Math.random().toString(), text: `Phase 1: Planning for "${taskText}"`, completed: false },
      { id: Math.random().toString(), text: `Phase 2: Execution for "${taskText}"`, completed: false },
      { id: Math.random().toString(), text: `Phase 3: Review "${taskText}"`, completed: false },
    ];
    setTodos(prev => prev.flatMap(t => t.id === todoId ? subtasks : [t]));
  };

  // Focus Timer State
  const [focusTimeLeft, setFocusTimeLeft] = useState(25 * 60);
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [isHardcoreMode, setIsHardcoreMode] = useState(false);
  const [isAmbientSoundOn, setIsAmbientSoundOn] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isFocusing && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusTimeLeft === 0 && isFocusing) {
      setIsFocusing(false);
      setIsHardcoreMode(false);
    }
    return () => clearInterval(interval);
  }, [isFocusing, focusTimeLeft]);
  
  // Roadmap State
  const [roadmaps, setRoadmaps] = useState<{id: string, title: string, nodes: Node[], edges: Edge[]}[]>([
    { id: '1', title: 'Backend Migration', nodes: initialNodes, edges: initialEdges }
  ]);
  const [activeRoadmapId, setActiveRoadmapId] = useState('1');
  const [isRoadmapSidebarOpen, setIsRoadmapSidebarOpen] = useState(true);

  // Whiteboard State
  const [whiteboards, setWhiteboards] = useState<{id: string, title: string}[]>([
    { id: '1', title: 'Brainstorming Session' }
  ]);
  const [activeWhiteboardId, setActiveWhiteboardId] = useState('1');
  const [isWhiteboardSidebarOpen, setIsWhiteboardSidebarOpen] = useState(true);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
  const [isWhiteboardFullScreen, setIsWhiteboardFullScreen] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(320); // Default width for chatbot sidebar

  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "I am your Cognitive Assistant. I can help you brainstorm ideas, structure roadmaps, or validate code. How can I help you today?" }
  ]);

  const submitRef = React.useRef<any>(null);

  useEffect(() => {
    const handlePrompt = (e: any) => {
      if (submitRef.current) {
        submitRef.current(e.detail);
      }
    };
    window.addEventListener('chatbotPrompt', handlePrompt);
    return () => window.removeEventListener('chatbotPrompt', handlePrompt);
  }, []);

  const handleChatSubmit = async (overrideQuery?: string) => {
    const query = typeof overrideQuery === 'string' ? overrideQuery : aiChatInput;
    if (!query.trim() || isChatGenerating) return;
    if (typeof overrideQuery !== 'string') {
      setAiChatInput('');
    }
    setChatMessages(prev => [...prev, { role: 'user', content: query }]);
    setIsChatGenerating(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
      if ((activeTab === 'canvas' || query.toLowerCase().includes('roadmap')) && !query.toLowerCase().includes('explain the topic:')) {
        setActiveTab('canvas');
        const result = await generateRoadmap(query, apiKey);
        
        if (result && result.nodes) {
          const rawNodes = result.nodes.map((n: any) => ({ ...n, id: `ai-${n.id || Math.random().toString()}` }));
          const rawEdges = (result.edges || []).map((e: any) => ({
            id: `e-${e.source}-${e.target}`,
            source: `ai-${e.source}`,
            target: `ai-${e.target}`
          }));

          const layout = calculateFlowchartLayout(rawNodes, rawEdges);

          const newNodes: Node[] = rawNodes.map((n: any) => ({
            id: n.id,
            type: 'custom',
            position: layout[n.id] || { x: 100, y: 100 },
            data: { title: n.title, description: n.description, type: n.type || 'ai' },
          }));

          const newEdges: Edge[] = rawEdges.map((e: any) => ({
            ...e,
            animated: true,
            style: { stroke: '#3b82f6' }
          }));

          const newRoadmapId = Math.random().toString();
          setRoadmaps(prev => [...prev, {
            id: newRoadmapId,
            title: result.title || 'AI Generated Roadmap',
            nodes: newNodes,
            edges: newEdges
          }]);
          setActiveRoadmapId(newRoadmapId);
          setChatMessages(prev => [...prev, { role: 'ai', content: `I have generated a new roadmap: "${result.title || 'AI Generated Roadmap'}". You can view it on the canvas now.` }]);
        } else {
          setChatMessages(prev => [...prev, { role: 'ai', content: "I tried to generate a roadmap but couldn't structure it properly. Could you rephrase?" }]);
        }
      } else {
        // Generic response or explanation
        const activePersona = PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0];
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: activePersona.prompt },
              ...chatMessages.map(m => ({ role: m.role, content: m.content })),
              { role: "user", content: query }
            ],
            temperature: 0.5
          })
        });
        if (res.ok) {
          const result = await res.json();
          setChatMessages(prev => [...prev, { role: 'ai', content: result.choices[0].message.content }]);
        }
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to my neural core." }]);
    } finally {
      setIsChatGenerating(false);
    }
  };

  useEffect(() => {
    submitRef.current = handleChatSubmit;
  });

  const handleSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const doDrag = (dragEvent: MouseEvent) => {
      const newWidth = startWidth - (dragEvent.clientX - startX);
      if (newWidth > 250 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    };

    const stopDrag = () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  return (
    <div className="flex h-screen w-screen bg-[#06080A] text-foreground font-body overflow-hidden">
      {/* Left Sidebar - Navigation (52px as requested) */}
      <aside className={`w-[52px] flex flex-col items-center py-6 bg-[#0a0c10] border-r border-white/5 z-20 transition-all ${(isWhiteboardFullScreen || (isFocusing && isHardcoreMode)) ? 'w-0 opacity-0 overflow-hidden border-none' : ''}`}>
        <div 
          className="text-xl tracking-tight text-foreground cursor-pointer mb-8" 
          style={{ fontFamily: "'Instrument Serif', serif" }}
          onClick={() => { if (!(isFocusing && isHardcoreMode)) onExit(); }}
          title="Exit Workspace"
        >
          D<sup className="text-[10px]">OS</sup>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1 w-full items-center">
          <button 
            onClick={() => { if (!(isFocusing && isHardcoreMode)) { setActiveTab('focus'); setIsWhiteboardFullScreen(false); } }}
            className={`p-3 rounded-xl transition-all ${activeTab === 'focus' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
            title="Focus Session"
          >
            <Play size={20} className={isFocusing ? 'text-green-400' : ''} />
          </button>
          <button 
            onClick={() => { if (!(isFocusing && isHardcoreMode)) { setActiveTab('notes'); setIsWhiteboardFullScreen(false); } }}
            className={`p-3 rounded-xl transition-all ${activeTab === 'notes' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
            title="Knowledge System"
          >
            <FileText size={20} />
          </button>
          <button 
            onClick={() => { if (!(isFocusing && isHardcoreMode)) { setActiveTab('canvas'); setIsWhiteboardFullScreen(false); } }}
            className={`p-3 rounded-xl transition-all ${activeTab === 'canvas' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
            title="Cognitive Canvas"
          >
            <Workflow size={20} />
          </button>
          <button 
            onClick={() => { if (!(isFocusing && isHardcoreMode)) { setActiveTab('personas'); setIsWhiteboardFullScreen(false); } }}
            className={`p-3 rounded-xl transition-all ${activeTab === 'personas' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
            title="AI Personas"
          >
            <Users size={20} />
          </button>
          <button 
            onClick={() => { if (!(isFocusing && isHardcoreMode)) setActiveTab('whiteboard'); }}
            className={`p-2.5 rounded-xl transition-all ${activeTab === 'whiteboard' ? 'bg-[#a78bfa]/12 text-[#a78bfa]' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
            title="Creative Whiteboard"
          >
            <Pencil size={20} />
          </button>
        </nav>
        
        <div className="flex flex-col gap-4 mb-4">
          {activeTab === 'whiteboard' && (
            <button 
              onClick={() => setIsWhiteboardFullScreen(!isWhiteboardFullScreen)}
              className={`p-3 rounded-xl transition-all ${isWhiteboardFullScreen ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
              title={isWhiteboardFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
            >
              <Maximize size={20} />
            </button>
          )}
          <button className="p-3 text-muted-foreground hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        {activeTab === 'focus' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-3xl mx-auto w-full">
            <h1 className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Focus Environment</h1>
            
            {isFocusing ? (
              <div className="text-[120px] font-light tracking-tighter leading-none mb-12" style={{ fontFamily: "'Instrument Serif', serif" }}>
                {String(Math.floor(focusTimeLeft / 60)).padStart(2, '0')}:{String(focusTimeLeft % 60).padStart(2, '0')}
              </div>
            ) : (
              <div className="flex flex-col items-center mb-12">
                <div className="text-[120px] font-light tracking-tighter leading-none" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {String(Math.floor(focusDuration / 60)).padStart(2, '0')}:{String(focusDuration % 60).padStart(2, '0')}
                </div>
                <div className="flex gap-2 mt-4">
                  {[15, 25, 45, 60].map(mins => (
                    <button 
                      key={mins}
                      onClick={() => {
                        setFocusDuration(mins * 60);
                        setFocusTimeLeft(mins * 60);
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${focusDuration === mins * 60 ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <input 
              type="text" 
              placeholder="Set your deep work intent..."
              className="w-full bg-transparent border-b border-white/20 pb-4 text-2xl text-center focus:outline-none focus:border-white/60 transition-colors mb-12"
            />
            
            <div className="flex items-center gap-4 mb-16">
              <button 
                onClick={() => setIsFocusing(!isFocusing)}
                className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm transition-all ${
                  isFocusing 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                    : 'bg-white text-black hover:scale-[1.03]'
                }`}
              >
                {isFocusing ? <Square size={16} /> : <Play size={16} fill="currentColor" />}
                {isFocusing ? 'End Session' : 'Enter Deep Flow'}
              </button>
              
              <button 
                onClick={() => setIsAmbientSoundOn(!isAmbientSoundOn)}
                className={`p-3 rounded-full transition-colors ${isAmbientSoundOn ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white'}`} 
                title="Ambient Sound: Rain"
              >
                <CloudRain size={18} />
              </button>
              {isAmbientSoundOn && (
                <audio autoPlay loop src="/Rain_Ambient.mp3" />
              )}
              
              <button 
                onClick={() => setIsHardcoreMode(!isHardcoreMode)}
                className={`p-3 rounded-full transition-colors ${isHardcoreMode ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white'}`} 
                title="Hardcore Mode (Blocks exiting while active)"
              >
                <ShieldAlert size={18} />
              </button>
            </div>

            {/* Thought Capture System */}
            <div className="w-full mt-auto mb-8 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center bg-[#0d1116] border border-white/10 rounded-xl p-2">
                <BrainCircuit className="text-muted-foreground ml-3" size={18} />
                <input 
                  type="text" 
                  value={thoughtDump}
                  onChange={(e) => setThoughtDump(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && thoughtDump.trim()) {
                      handleChatSubmit(`I had this distraction/idea during focus: "${thoughtDump}". Save it and tell me briefly to get back to work.`);
                      setThoughtDump('');
                    }
                  }}
                  placeholder="Thought Capture: Dump distractions here..." 
                  className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:outline-none"
                />
                <button 
                  onClick={() => {
                    if (thoughtDump.trim()) {
                      handleChatSubmit(`I had this distraction/idea during focus: "${thoughtDump}". Save it and tell me briefly to get back to work.`);
                      setThoughtDump('');
                    }
                  }}
                  className="p-2 text-muted-foreground hover:text-white transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex-1 p-12 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl" style={{ fontFamily: "'Instrument Serif', serif" }}>Structured Knowledge</h2>
              <button className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-md hover:bg-white/20 transition-colors">
                <Sparkles size={14} className="text-blue-400" />
                Auto-Summarize Session
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                <h3 className="text-lg font-medium mb-2">Morning Deep Work</h3>
                <p className="text-sm text-muted-foreground mb-4">Focused on system architecture design for 90 minutes.</p>
                <div className="flex gap-2">
                  <span className="text-xs bg-white/10 px-2 py-1 rounded">Architecture</span>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded">Flow state</span>
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl border-l-2 border-l-blue-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Action Items & Tasks</h3>
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{todos.filter(t => !t.completed).length} pending</span>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={handleAutoExtractTasks}
                    disabled={isChatGenerating}
                    className="px-3 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 hover:text-purple-300 rounded-md transition-colors flex items-center justify-center border border-purple-500/30"
                    title="Auto-extract tasks from context"
                  >
                    <Sparkles size={16} />
                  </button>
                  <input 
                    type="text" 
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                    placeholder="Add a new task manually..." 
                    className="flex-1 bg-[#06080A] border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50"
                  />
                  <button 
                    onClick={handleAddTodo}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <ul className="space-y-1">
                  {todos.map(todo => (
                    <li key={todo.id} className="group flex items-center gap-3 text-sm p-2 rounded hover:bg-white/5 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="accent-blue-500 w-4 h-4 cursor-pointer" 
                      />
                      <span className={`flex-1 transition-all ${todo.completed ? 'line-through text-muted-foreground' : 'text-white'}`}>
                        {todo.text}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleBreakdownTask(todo.id, todo.text)}
                          className="p-1 text-muted-foreground hover:text-purple-400 transition-colors"
                          title="AI Breakdown into Subtasks"
                        >
                          <Sparkles size={14} />
                        </button>
                        <button 
                          onClick={() => setTodos(todos.filter(t => t.id !== todo.id))}
                          className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                  {todos.length === 0 && (
                    <div className="text-sm text-muted-foreground italic py-4 text-center">No tasks currently pending. Enjoy the calm.</div>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'canvas' && (
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Roadmaps Sidebar */}
            <div className={`bg-[#0a0d11] border-r border-white/5 flex flex-col z-20 transition-all duration-300 ${isRoadmapSidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-none'}`}>
              <div className="p-4 border-b border-white/5 flex items-center justify-between min-w-[256px]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Your Roadmaps</h3>
                  <button 
                    onClick={() => setIsRoadmapSidebarOpen(false)}
                    className="p-1 text-muted-foreground hover:text-white transition-colors"
                  >
                    <PanelLeftClose size={14} />
                  </button>
                </div>
                <button 
                  onClick={() => {
                    const id = Math.random().toString();
                    setRoadmaps(prev => [...prev, { id, title: 'New Roadmap', nodes: [], edges: [] }]);
                    setActiveRoadmapId(id);
                  }}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {roadmaps.map(rm => (
                  <div 
                    key={rm.id} 
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${activeRoadmapId === rm.id ? 'bg-blue-500/20 border border-blue-500/30 text-blue-100' : 'hover:bg-white/5 text-gray-400'}`}
                    onClick={() => setActiveRoadmapId(rm.id)}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Workflow size={14} className={activeRoadmapId === rm.id ? 'text-blue-400' : 'text-gray-500'} />
                      <span className="text-sm truncate">{rm.title}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newRoadmaps = roadmaps.filter(r => r.id !== rm.id);
                        if (newRoadmaps.length === 0) {
                          const newId = Math.random().toString();
                          setRoadmaps([{ id: newId, title: 'New Roadmap', nodes: [], edges: [] }]);
                          setActiveRoadmapId(newId);
                        } else {
                          setRoadmaps(newRoadmaps);
                          if (activeRoadmapId === rm.id) {
                            setActiveRoadmapId(newRoadmaps[0].id);
                          }
                        }
                      }}
                      className="text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
              {!isRoadmapSidebarOpen && (
                <button 
                  onClick={() => setIsRoadmapSidebarOpen(true)}
                  className="absolute top-4 left-4 z-50 p-2 bg-[#11161d] border border-white/10 rounded-md hover:bg-white/10 transition-colors shadow-lg"
                >
                  <PanelLeftOpen size={16} />
                </button>
              )}
              <CognitiveCanvas 
                activeRoadmap={roadmaps.find(r => r.id === activeRoadmapId)!} 
                setRoadmaps={setRoadmaps}
              />
            </div>
          </div>
        )}

        {activeTab === 'whiteboard' && (
          <div className="flex-1 flex overflow-hidden relative">
            <Whiteboard 
              activeWhiteboard={whiteboards.find(w => w.id === activeWhiteboardId)!} 
              isFullScreen={isWhiteboardFullScreen}
              toggleFullScreen={() => setIsWhiteboardFullScreen(!isWhiteboardFullScreen)}
              whiteboards={whiteboards}
              setActiveWhiteboardId={setActiveWhiteboardId}
              addWhiteboard={() => {
                const id = Math.random().toString();
                setWhiteboards(prev => [...prev, { id, title: 'New Whiteboard' }]);
                setActiveWhiteboardId(id);
              }}
              deleteWhiteboard={(id) => {
                const newWhiteboards = whiteboards.filter(w => w.id !== id);
                if (newWhiteboards.length === 0) {
                  const newId = Math.random().toString();
                  setWhiteboards([{ id: newId, title: 'New Whiteboard' }]);
                  setActiveWhiteboardId(newId);
                } else {
                  setWhiteboards(newWhiteboards);
                  if (activeWhiteboardId === id) {
                    setActiveWhiteboardId(newWhiteboards[0].id);
                  }
                }
              }}
            />

            {!isChatSidebarOpen && !isWhiteboardFullScreen && (
              <button 
                onClick={() => setIsChatSidebarOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center justify-center gap-1 py-4 px-1.5 bg-[#0d1117] border border-white/10 border-r-0 rounded-l-xl hover:bg-white/10 transition-colors shadow-lg"
                title="Show Thought Assistant"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                <PanelRightOpen size={14} style={{ writingMode: 'horizontal-tb' }} />
                <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase" style={{ writingMode: 'vertical-rl' }}>Chat</span>
              </button>
            )}
          </div>
        )}

        {activeTab === 'personas' && (
          <div className="flex-1 p-12 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl" style={{ fontFamily: "'Instrument Serif', serif" }}>AI Thought Partners</h2>
              <button className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors">
                <Plus size={14} />
                Create Custom Persona
              </button>
            </div>
            
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Configure different AI personalities to assist you in various stages of deep work. Select a persona to activate it in the Thought Assistant sidebar.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {PERSONAS.map(persona => {
                const isActive = activePersonaId === persona.id;
                const IconComponent = persona.icon === 'BrainCircuit' ? BrainCircuit : persona.icon === 'Pencil' ? Pencil : Sparkles;
                
                return (
                  <div 
                    key={persona.id}
                    onClick={() => setActivePersonaId(persona.id)}
                    className={`p-6 rounded-xl relative overflow-hidden group cursor-pointer transition-all border ${
                      isActive 
                        ? persona.styles.activeBg
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                    )}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${
                      isActive ? persona.styles.activeIconBg : persona.styles.inactiveIconBg
                    }`}>
                      <IconComponent size={24} />
                    </div>
                    <h3 className={`text-xl font-medium mb-2 transition-colors ${isActive ? persona.styles.activeText : ''}`}>
                      {persona.name} {isActive && '(Active)'}
                    </h3>
                    <p className={`text-sm mb-4 transition-colors ${isActive ? persona.styles.activeDesc : 'text-muted-foreground'}`}>
                      {persona.description}
                    </p>
                    <div className="flex gap-2">
                      {persona.tags.map(tag => (
                        <span key={tag} className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                          isActive ? persona.styles.activeTag : 'bg-white/10 text-gray-400'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Custom Bot */}
              <div className="p-6 bg-white/[0.02] border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.04] transition-all min-h-[220px]">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground mb-4 group-hover:bg-white/10 group-hover:text-white transition-all">
                  <Plus size={24} />
                </div>
                <h3 className="text-lg font-medium mb-1">New Custom Bot</h3>
                <p className="text-sm text-muted-foreground">Define instructions and specialized tools.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Chatbot & Assistant */}
      <aside 
        className={`bg-[#0a0d11] border-l border-white/5 flex flex-col z-30 relative shrink-0 transition-all ${(!isChatSidebarOpen || isWhiteboardFullScreen || (isFocusing && isHardcoreMode)) ? 'w-0 opacity-0 overflow-hidden border-none' : ''}`}
        style={{ width: (!isChatSidebarOpen || isWhiteboardFullScreen || (isFocusing && isHardcoreMode)) ? '0' : `${sidebarWidth}px` }}
      >
        {/* Resize Handle */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-blue-500/50 z-50 transition-colors"
          onMouseDown={handleSidebarResize}
        />

        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm font-medium">Thought Assistant</h3>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Active: {PERSONAS.find(p => p.id === activePersonaId)?.name || 'The Strategist'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsChatSidebarOpen(false)}
            className="text-muted-foreground hover:text-white transition-colors"
            title="Hide Sidebar"
          >
            <PanelLeftClose className="rotate-180" size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <span className={`text-[10px] text-muted-foreground ${msg.role === 'user' ? 'mr-2' : 'ml-2'}`}>
                {msg.role === 'user' ? 'You' : 'AI'}
              </span>
              <div className={`p-3 text-sm border prose prose-invert max-w-none prose-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600/20 border-blue-500/30 rounded-2xl rounded-tr-sm text-blue-100' 
                  : 'bg-white/5 border-white/5 rounded-2xl rounded-tl-sm text-gray-300'
              }`}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isChatGenerating && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground ml-2">AI • Typing...</span>
              <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm text-sm border border-white/5 w-16 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#0a0d11]">
          <div className="relative flex items-center bg-[#11161d] border border-white/10 rounded-2xl p-1.5 focus-within:border-blue-500/50 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all">
            <input 
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSubmit();
                }
              }}
              placeholder="Ask me anything..." 
              className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:outline-none text-white placeholder:text-gray-500"
            />
            <button 
              onClick={() => handleChatSubmit()}
              disabled={isChatGenerating || !aiChatInput.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:bg-white/5 disabled:text-gray-500 flex items-center justify-center shrink-0"
            >
              <Send size={14} className={!isChatGenerating && aiChatInput.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

// Add missing Bot icon component simply
const Bot = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);
