import { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './CustomNode';
import { Plus, Sparkles, X, Edit3, Image as ImageIcon, Video, FileText, Link as LinkIcon, Loader2, Code } from 'lucide-react';
import { generateRoadmap } from '../utils/groq';
import { calculateFlowchartLayout } from '../utils/layout';

const nodeTypes = {
  custom: CustomNode,
};

export const CognitiveCanvas = ({ activeRoadmap, setRoadmaps }: { activeRoadmap: any, setRoadmaps: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRoadmaps((prev: any) => prev.map((rm: any) => {
        if (rm.id === activeRoadmap.id) {
          return { ...rm, nodes: applyNodeChanges(changes, rm.nodes) };
        }
        return rm;
      }));
    },
    [activeRoadmap.id, setRoadmaps]
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setRoadmaps((prev: any) => prev.map((rm: any) => {
        if (rm.id === activeRoadmap.id) {
          return { ...rm, edges: applyEdgeChanges(changes, rm.edges) };
        }
        return rm;
      }));
    },
    [activeRoadmap.id, setRoadmaps]
  );
  
  const onConnect = useCallback(
    (params: Connection) => {
      setRoadmaps((prev: any) => prev.map((rm: any) => {
        if (rm.id === activeRoadmap.id) {
          return { ...rm, edges: addEdge({ ...params, animated: true, style: { stroke: '#3b82f6' } }, rm.edges) };
        }
        return rm;
      }));
    },
    [activeRoadmap.id, setRoadmaps]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: Math.random().toString(),
      type: 'custom',
      position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 },
      data: { title: `New ${type} Node`, description: '', type },
    };
    setRoadmaps((prev: any) => prev.map((rm: any) => {
      if (rm.id === activeRoadmap.id) {
        return { ...rm, nodes: [...rm.nodes, newNode] };
      }
      return rm;
    }));
    setIsModalOpen(false);
  };

  const handleGenerateRoadmap = async () => {
    if (!aiQuery.trim()) return;
    setIsGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
      const result = await generateRoadmap(aiQuery, apiKey);
      
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

        setRoadmaps((prev: any) => prev.map((rm: any) => {
          if (rm.id === activeRoadmap.id) {
            return { 
              ...rm, 
              title: result.title || rm.title,
              nodes: newNodes, 
              edges: newEdges 
            };
          }
          return rm;
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
      setIsAiModalOpen(false);
      setAiQuery('');
    }
  };

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#06080A] to-[#010101]">
      <div className="absolute top-8 left-8 z-10 flex items-center gap-4">
        <h2 className="text-2xl" style={{ fontFamily: "'Instrument Serif', serif" }}>Cognitive Canvas</h2>
        <button 
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center gap-2 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-md hover:bg-blue-500/30 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <Sparkles size={14} />
          Generate Roadmap from Ideas
        </button>
      </div>

      <ReactFlow
        nodes={activeRoadmap.nodes}
        edges={activeRoadmap.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="react-flow-dark"
      >
        <Background color="#ffffff" gap={40} size={1} />
        <Controls 
          className="!bg-[#11161d] !border-white/10 !fill-white shadow-xl" 
        />
      </ReactFlow>

      {/* Plus Button - Node Creator Engine */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="absolute top-8 right-8 p-4 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform z-10"
      >
        <Plus size={24} />
      </button>

      {/* Node Creator Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11161d] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl mb-6 font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>Create Node</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => addNode('text')} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:border-white/20">
                <Edit3 size={24} className="text-gray-400" />
                <span className="text-sm">Text Node</span>
              </button>
              <button onClick={() => { setIsAiModalOpen(true); setIsModalOpen(false); }} className="flex flex-col items-center gap-3 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Sparkles size={24} className="text-blue-400" />
                <span className="text-sm">AI Node</span>
              </button>
              <button onClick={() => addNode('image')} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:border-white/20">
                <ImageIcon size={24} className="text-emerald-400" />
                <span className="text-sm">Image</span>
              </button>
              <button onClick={() => addNode('video')} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:border-white/20">
                <Video size={24} className="text-rose-400" />
                <span className="text-sm">Video</span>
              </button>
              <button onClick={() => addNode('notes')} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:border-white/20">
                <FileText size={24} className="text-amber-400" />
                <span className="text-sm">Notes</span>
              </button>
              <button onClick={() => addNode('link')} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:border-white/20">
                <LinkIcon size={24} className="text-purple-400" />
                <span className="text-sm">Resource Link</span>
              </button>
              <button onClick={() => addNode('code')} className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:border-white/20 col-span-2">
                <Code size={24} className="text-orange-400" />
                <span className="text-sm">Code Snippet & Validator</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Roadmap Modal */}
      {isAiModalOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11161d] border border-blue-500/20 p-6 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(59,130,246,0.15)] relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-medium" style={{ fontFamily: "'Instrument Serif', serif" }}>AI Cognitive Architect</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Describe your idea, goal, or problem. The AI will generate a structured, actionable visual roadmap.
            </p>

            <textarea 
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g., 'A roadmap to migrate our monolithic backend to microservices over 3 months'"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none h-32 mb-6"
            />

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerateRoadmap}
                disabled={isGenerating || !aiQuery.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGenerating ? 'Architecting...' : 'Generate Node Structure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
