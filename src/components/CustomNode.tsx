import { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Sparkles, Image, Video, FileText, Link as LinkIcon, Edit3, Trash2, Check, Loader2, Pin, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const iconMap: Record<string, React.ReactNode> = {
  ai: <Sparkles size={16} className="text-blue-400" />,
  image: <Image size={16} className="text-emerald-400" />,
  video: <Video size={16} className="text-rose-400" />,
  notes: <FileText size={16} className="text-amber-400" />,
  link: <LinkIcon size={16} className="text-purple-400" />,
  text: <Edit3 size={16} className="text-gray-400" />,
  task: <Edit3 size={16} className="text-gray-400" />,
  concept: <Sparkles size={16} className="text-blue-400" />,
  resource: <LinkIcon size={16} className="text-purple-400" />,
  code: <Code size={16} className="text-orange-400" />
};

export const CustomNode = ({ id, data }: { id: string, data: any }) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const type = data.type || 'text';
  const icon = iconMap[type] || iconMap.text;
  const isSticky = type === 'notes';

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  const handleChange = (field: string, value: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          n.data = { ...n.data, [field]: value };
        }
        return n;
      })
    );
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      handleChange('mediaUrl', url);
    }
  };

  const handleAiDescription = async () => {
    setIsGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
      const prompt = `Write a short, actionable description for a node titled "${data.title}" in a visual roadmap. Keep it under 2 sentences.`;
      
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        const content = result.choices[0].message.content.replace(/^["']|["']$/g, '');
        handleChange('description', content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const isMedia = type === 'image' || type === 'video';
  const hasMedia = !!data.mediaUrl;

  const containerClasses = isSticky
    ? "bg-yellow-100 border border-yellow-300 text-yellow-900 rounded shadow-md min-w-[256px] w-64 overflow-hidden relative group transition-all hover:shadow-xl hover:-translate-y-1 transform -rotate-1"
    : `bg-[#11161d] border border-white/10 rounded-xl shadow-xl min-w-[256px] ${isMedia && hasMedia ? 'w-fit max-w-4xl' : 'w-64'} overflow-hidden relative group transition-all hover:border-white/20`;

  return (
    <div className={containerClasses}>
      {isSticky && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20">
          <Pin size={16} className="text-red-500/80 drop-shadow-sm" fill="currentColor" />
        </div>
      )}
      
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#11161d] shadow-sm cursor-crosshair z-10" />
      
      <div className={`p-4 ${isSticky ? 'pt-6' : ''}`}>
        {isEditing ? (
          <div className="space-y-2 mb-2">
            <input 
              autoFocus
              className={`w-full border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 ${isSticky ? 'bg-yellow-50 border-yellow-200 text-yellow-900' : 'bg-black/50 border-white/10 text-white'}`}
              value={data.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Node Title"
            />
            <textarea
              className={`w-full border rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 resize-none h-16 ${isSticky ? 'bg-yellow-50 border-yellow-200 text-yellow-900' : 'bg-black/50 border-white/10 text-white'}`}
              value={data.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description"
            />
            <button 
              onClick={() => setIsEditing(false)}
              className="w-full flex items-center justify-center gap-1 bg-blue-500/20 text-blue-400 py-1 rounded text-xs hover:bg-blue-500/30 transition-colors"
            >
              <Check size={12} /> Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {!isSticky && (
                  <div className="p-1.5 rounded-md bg-white/5 border border-white/5">
                    {icon}
                  </div>
                )}
                <h4 
                  className={`text-sm font-medium truncate cursor-text ${isSticky ? 'text-yellow-900 font-bold' : 'text-white'}`}
                  onDoubleClick={() => {
                    window.dispatchEvent(new CustomEvent('chatbotPrompt', { detail: `Explain the topic: ${data.title}. Provide a detailed overview.` }));
                  }}
                  title="Double click to AI explain"
                >
                  {data.title || 'Untitled Node'}
                </h4>
              </div>
              <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSticky ? 'bg-yellow-200/50 rounded-md backdrop-blur-sm' : ''}`}>
                {!isSticky && (
                  <button 
                    onClick={handleAiDescription}
                    title="AI Generate Description"
                    disabled={isGenerating}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  </button>
                )}
                <button 
                  onClick={() => setIsEditing(true)}
                  className={`p-1 transition-colors ${isSticky ? 'text-yellow-700 hover:text-yellow-900' : 'text-muted-foreground hover:text-white'}`}
                >
                  <Edit3 size={12} />
                </button>
                <button 
                  onClick={handleDelete}
                  className={`p-1 transition-colors ${isSticky ? 'text-red-500/70 hover:text-red-600' : 'text-red-400/70 hover:text-red-400'}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Media Uploads for Image/Video */}
            {type === 'image' && (
              <div className="mb-3">
                {data.mediaUrl ? (
                  <img src={data.mediaUrl} alt={data.title} className="w-auto h-auto rounded-md object-contain max-h-[80vh]" />
                ) : (
                  <div className="w-full h-24 bg-white/5 border border-dashed border-white/20 rounded-md flex flex-col items-center justify-center relative hover:bg-white/10 transition-colors">
                    <Image size={20} className="text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Upload Image</span>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleMediaUpload} />
                  </div>
                )}
              </div>
            )}

            {type === 'video' && (
              <div className="mb-3">
                {data.mediaUrl ? (
                  <video src={data.mediaUrl} controls className="w-auto h-auto rounded-md max-h-[80vh]" />
                ) : (
                  <div className="w-full h-24 bg-white/5 border border-dashed border-white/20 rounded-md flex flex-col items-center justify-center relative hover:bg-white/10 transition-colors">
                    <Video size={20} className="text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Upload Video</span>
                    <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleMediaUpload} />
                  </div>
                )}
              </div>
            )}

            {type === 'code' && (
              <div className="mb-3 space-y-2" onDoubleClick={(e) => e.stopPropagation()}>
                <textarea 
                  className="w-full bg-black/80 border border-white/20 rounded p-2 text-xs font-mono text-green-400 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"
                  value={data.codeSnippet || ''}
                  onChange={(e) => handleChange('codeSnippet', e.target.value)}
                  placeholder="// Write your code here..."
                />
                <button 
                  onClick={async () => {
                    setIsGenerating(true);
                    try {
                      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: { "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`, "Content-Type": "application/json" },
                        body: JSON.stringify({
                          model: "llama-3.1-8b-instant",
                          messages: [{ role: "user", content: `You are an expert code reviewer. Validate this code and return ONLY a success or error message explaining the issues or confirming it's correct. Keep it short:\n\n${data.codeSnippet}` }],
                          temperature: 0.1
                        })
                      });
                      if (res.ok) {
                        const result = await res.json();
                        handleChange('validationResult', result.choices[0].message.content);
                      }
                    } finally { setIsGenerating(false); }
                  }}
                  disabled={isGenerating || !data.codeSnippet}
                  className="w-full bg-blue-500/20 text-blue-400 py-1.5 rounded text-xs hover:bg-blue-500/30 transition-colors flex justify-center items-center gap-1"
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Code size={12} />} Validate Code
                </button>
                {data.validationResult && (
                  <div className={`p-2 rounded text-xs border overflow-y-auto max-h-32 ${
                    (data.validationResult.toLowerCase().includes('success') || data.validationResult.toLowerCase().includes('correct')) 
                    ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                    : (data.validationResult.toLowerCase().includes('error') || data.validationResult.toLowerCase().includes('invalid') || data.validationResult.toLowerCase().includes('issue'))
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}>
                    <div className="whitespace-pre-wrap">{data.validationResult}</div>
                  </div>
                )}
              </div>
            )}

            {(type === 'link' || type === 'resource') && data.description && (
              <div className="mb-3">
                <a 
                  href={data.description.trim().startsWith('http') ? data.description.trim() : `https://${data.description.trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline break-all flex items-center gap-1 group/link"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkIcon size={10} className="shrink-0" />
                  <span className="truncate">{data.description}</span>
                </a>
              </div>
            )}

            {data.description && type !== 'link' && type !== 'resource' && (
              <div 
                className={`text-xs leading-relaxed cursor-text prose prose-invert max-w-none prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 ${isSticky ? 'text-yellow-800 prose-p:text-yellow-800 prose-headings:text-yellow-900 prose-strong:text-yellow-900' : 'text-muted-foreground'}`}
                onDoubleClick={() => setIsEditing(true)}
              >
                <ReactMarkdown>{data.description}</ReactMarkdown>
              </div>
            )}
          </>
        )}
      </div>

      {!isSticky && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-blue-500/50 transition-colors"></div>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-[#11161d] shadow-sm cursor-crosshair z-10" />
    </div>
  );
};
