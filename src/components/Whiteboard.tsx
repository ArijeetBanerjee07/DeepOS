import { Tldraw, track, useEditor, DefaultColorStyle, DefaultSizeStyle } from 'tldraw';
import 'tldraw/tldraw.css';
import { Sparkles, Loader2, X, Maximize, Plus, Pencil, Trash2, Star, BrainCircuit } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ─── tldraw color name → display hex ────────────────────────────────────────
const TLDRAW_COLORS: { name: string; hex: string }[] = [
  { name: 'violet', hex: '#9d5bd2' },
  { name: 'light-violet', hex: '#c0a3e5' },
  { name: 'blue', hex: '#4299e1' },
  { name: 'light-blue', hex: '#63b3ed' },
  { name: 'green', hex: '#48bb78' },
  { name: 'yellow', hex: '#ecc94b' },
  { name: 'orange', hex: '#ed8936' },
  { name: 'red', hex: '#f56565' },
  { name: 'black', hex: '#e2e8f0' }, // light so it's visible on dark bg
  { name: 'grey', hex: '#718096' },
];

// ─── AI Overview (renders inside <Tldraw> for editor access) ─────────────────
const AIOverviewPopup = track(({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) => {
  const editor = useEditor();
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedIds = editor.getSelectedShapeIds();
  const selectionKey = selectedIds.join(',');

  useEffect(() => {
    if (selectedIds.length > 0) {
      setIsOpen(true);
    }
  }, [selectionKey, setIsOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

  const handleAiOverview = async (customPrompt?: string) => {
    setIsGenerating(true);
    try {
      const selectedShapes = editor.getSelectedShapes();
      const shapesToAnalyze = selectedShapes.length > 0 ? selectedShapes : editor.getCurrentPageShapes();
      
      const textContent = shapesToAnalyze
        .map((s: any) => {
          if (s.type === 'text' || s.type === 'geo') {
            return s.props?.text || '';
          }
          return `[${s.type}]`;
        })
        .filter(Boolean)
        .join('\n');

      const systemMsg = "You are an AI Whiteboard Assistant. Analyze the provided content. If the user asks a specific question, answer it based on the whiteboard content. If no question is asked, provide a concise summary or explanation of the visual elements/text.";
      
      const userMsg = customPrompt 
        ? `Question: ${customPrompt}\n\nWhiteboard context:\n${textContent || 'No text content found, various shapes present.'}`
        : `Whiteboard content:\n${textContent || 'Various shapes and drawings'}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemMsg },
            { role: 'user', content: userMsg },
          ],
          temperature: 0.5,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setContent(data.choices[0].message.content);
      }
    } catch {
      setContent('Error connecting to AI services.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-5 z-[400] w-[320px] pointer-events-auto">
      <div
        style={{
          background: 'rgba(10,12,16,0.98)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(139,92,246,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa' }}>
            <Sparkles size={14} className="text-purple-400" />
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Cognitive AI
            </span>
          </div>
          <button
            onClick={() => { setIsOpen(false); setContent(''); }}
            style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {content ? (
            <div 
              ref={scrollRef}
              style={{ 
                fontSize: 12, 
                color: '#e5e7eb', 
                lineHeight: 1.6, 
                maxHeight: 300, 
                overflowY: 'auto',
                paddingRight: 8,
                whiteSpace: 'pre-wrap'
              }}
              className="custom-scrollbar"
            >
              {content}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280' }}>
              <BrainCircuit size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: 11, fontWeight: 500 }}>Select items or ask a question about the whiteboard.</p>
            </div>
          )}

          {/* Chat input area */}
          <div style={{ 
            marginTop: 4,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '4px',
            display: 'flex',
            gap: 4
          }}>
            <input 
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && userPrompt.trim()) {
                  handleAiOverview(userPrompt);
                  setUserPrompt('');
                }
              }}
              placeholder="Ask AI about selection..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 12,
                padding: '8px 12px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => {
                if (userPrompt.trim()) {
                  handleAiOverview(userPrompt);
                  setUserPrompt('');
                } else {
                  handleAiOverview();
                }
              }}
              disabled={isGenerating}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: isGenerating ? 0.5 : 1,
              }}
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </div>

          {content && (
             <button
             onClick={() => { setContent(''); handleAiOverview(); }}
             style={{
               width: '100%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: 6,
               background: 'rgba(139,92,246,0.1)',
               border: '1px solid rgba(139,92,246,0.2)',
               borderRadius: 10,
               color: '#a78bfa',
               fontSize: 10,
               fontWeight: 800,
               padding: '8px 0',
               cursor: 'pointer',
               letterSpacing: '0.05em',
               textTransform: 'uppercase'
             }}
           >
             <Star size={11} fill="rgba(167,139,250,0.3)" />
             Refresh Overview
           </button>
          )}
        </div>
      </div>
    </div>
  );
});

// ─── Inner canvas chrome (runs inside <Tldraw>, has editor access) ───────────
type EditorRef = ReturnType<typeof useEditor>;

const InnerControls = track(({
  activeWhiteboard,
  isFullScreen,
  toggleFullScreen,
  onEditorReady,
  activeColor,
  activeSize,
  handleColorChange,
  handleSizeChange,
}: {
  activeWhiteboard: { id: string; title: string };
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  onEditorReady: (ed: EditorRef) => void;
  activeColor: string;
  activeSize: string;
  handleColorChange: (c: string) => void;
  handleSizeChange: (s: 's'|'m'|'l'|'xl') => void;
}) => {
  const editor = useEditor();
  const [isAiPopupOpen, setIsAiPopupOpen] = useState(false);

  useEffect(() => {
    onEditorReady(editor);
  }, [editor, onEditorReady]);

  return (
    <>
      <AIOverviewPopup isOpen={isAiPopupOpen} setIsOpen={setIsAiPopupOpen} />

      {/* Top Center Pill */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(10,12,16,0.95)',
            border: '0.5px solid rgba(255,255,255,0.12)',
            borderRadius: 20,
            padding: '6px 16px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 900, color: '#a78bfa', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            WHITEBOARD
          </span>
          <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {activeWhiteboard.title}
          </span>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-3 right-3 z-[200] pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setIsAiPopupOpen(!isAiPopupOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 34, padding: '0 14px',
            background: isAiPopupOpen ? '#7c3aed' : 'rgba(139,92,246,0.12)',
            border: isAiPopupOpen ? 'none' : '1px solid rgba(139,92,246,0.3)',
            borderRadius: 10, color: isAiPopupOpen ? '#fff' : '#a78bfa',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
            cursor: 'pointer', textTransform: 'uppercase',
            transition: 'all 0.2s'
          }}
          title="Analyze selection or ask AI a question"
        >
          <Sparkles size={12} className={isAiPopupOpen ? 'text-white' : 'text-purple-400'} />
          AI Assistant
        </button>

        <button
          onClick={toggleFullScreen}
          style={{
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(13,17,23,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: '#e5e7eb',
            cursor: 'pointer',
          }}
          title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullScreen ? <X size={15} /> : <Maximize size={15} />}
        </button>
      </div>

      {/* Fullscreen floating color panel (bottom-left, only in fullscreen) */}
      {isFullScreen && (
        <div
          className="absolute bottom-20 left-6 z-[300] pointer-events-auto"
          style={{
            background: 'rgba(10,12,16,0.96)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '14px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
            minWidth: 180,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Color</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {TLDRAW_COLORS.map(({ name, hex }) => (
                <button
                  key={name}
                  onClick={() => handleColorChange(name)}
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: hex,
                    border: activeColor === name ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', padding: 0,
                    transform: activeColor === name ? 'scale(1.3)' : 'scale(1)',
                    transition: 'transform 0.15s',
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Size</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['s', 'm', 'l', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleSizeChange(sz)}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 9, fontWeight: 800,
                    cursor: 'pointer', textTransform: 'uppercase',
                    background: activeSize === sz ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
                    border: activeSize === sz ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.06)',
                    color: activeSize === sz ? '#a78bfa' : '#6b7280',
                  }}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom-left Live Canvas badge */}
      <div className="absolute bottom-7 left-5 z-[200] pointer-events-none">
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(10,12,16,0.85)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 100,
            padding: '5px 10px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px rgba(34,197,94,0.7)',
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ fontSize: 9, fontWeight: 900, color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Live Canvas
          </span>
        </div>
      </div>
    </>
  );
});

// ─── Main Whiteboard export ───────────────────────────────────────────────────
export const Whiteboard = ({
  activeWhiteboard,
  isFullScreen,
  toggleFullScreen,
  whiteboards,
  setActiveWhiteboardId,
  addWhiteboard,
  deleteWhiteboard,
}: {
  activeWhiteboard: { id: string; title: string } | undefined;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  whiteboards: { id: string; title: string }[];
  setActiveWhiteboardId: (id: string) => void;
  addWhiteboard: () => void;
  deleteWhiteboard: (id: string) => void;
}) => {
  const editorRef = useRef<EditorRef | null>(null);
  const [activeColor, setActiveColor] = useState('violet');
  const [activeSize, setActiveSize] = useState<'s' | 'm' | 'l' | 'xl'>('m');
  const [selectedShapes, setSelectedShapes] = useState<any[]>([]);

  // Removed buggy useEffect here, listener will be setup in onEditorReady

  const textShape = selectedShapes.find(s => s.type === 'text');
  const textWidth = textShape?.props?.w || 200;

  const handleTextWidthChange = (w: number) => {
    if (textShape && editorRef.current) {
      editorRef.current.updateShape({
        id: textShape.id,
        type: 'text',
        props: { w, autoSize: false }
      });
    }
  };

  const handleColorChange = (colorName: string) => {
    setActiveColor(colorName);
    if (editorRef.current) {
      try {
        editorRef.current.setStyleForNextShapes(DefaultColorStyle, colorName as any);
      } catch { /* silent — color may not apply without an active tool */ }
    }
  };

  const handleSizeChange = (size: 's' | 'm' | 'l' | 'xl') => {
    setActiveSize(size);
    if (editorRef.current) {
      try {
        editorRef.current.setStyleForNextShapes(DefaultSizeStyle, size as any);
      } catch { /* silent — size may not apply without an active tool */ }
    }
  };

  if (!activeWhiteboard) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0c10]">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex bg-[#0a0c10] ${isFullScreen ? 'fixed inset-0 z-[100]' : ''}`}>

      {/* ── Middle Panel ─────────────────────────────── */}
      {!isFullScreen && (
        <aside
          style={{
            width: 210,
            display: 'flex',
            flexDirection: 'column',
            background: '#0a0c10',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 14px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 900, color: '#4b5563', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Whiteboards
            </span>
            <button
              onClick={addWhiteboard}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6b7280', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center',
              }}
              title="New whiteboard"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Board List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0' }} className="custom-scrollbar">
            {whiteboards.map((wb) => {
              const isActive = activeWhiteboard.id === wb.id;
              return (
                <div
                  key={wb.id}
                  onClick={() => setActiveWhiteboardId(wb.id)}
                  className="group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    marginBottom: 2,
                    background: isActive ? 'rgba(167,139,250,0.1)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <Pencil size={11} style={{ color: isActive ? '#a78bfa' : '#4b5563', flexShrink: 0 }} />
                    <span style={{
                      fontSize: 12, fontWeight: 500,
                      color: isActive ? '#a78bfa' : '#6b7280',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {wb.title}
                    </span>
                  </div>
                  {whiteboards.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteWhiteboard(wb.id); }}
                      className="opacity-0 group-hover:opacity-100"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6b7280', padding: 3, borderRadius: 4, flexShrink: 0,
                        transition: 'opacity 0.15s, color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f87171'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6b7280'}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Properties Panel ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px', flexShrink: 0 }}>
            {/* Pen Color */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                Pen Color
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TLDRAW_COLORS.map(({ name, hex }) => (
                  <button
                    key={name}
                    onClick={() => handleColorChange(name)}
                    title={name}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: hex,
                      border: activeColor === name
                        ? '2px solid #ffffff'
                        : '2px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transform: activeColor === name ? 'scale(1.25)' : 'scale(1)',
                      transition: 'transform 0.15s, border-color 0.15s',
                      padding: 0,
                      boxShadow: activeColor === name ? `0 0 8px ${hex}99` : 'none',
                    }}
                    onMouseEnter={e => { if (activeColor !== name) (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)'; }}
                    onMouseLeave={e => { if (activeColor !== name) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                Stroke Width
              </label>
              <input
                type="range" min="1" max="4" step="1" defaultValue="2"
                onChange={(e) => {
                  const sizes: ('s' | 'm' | 'l' | 'xl')[] = ['s', 'm', 'l', 'xl'];
                  handleSizeChange(sizes[parseInt(e.target.value) - 1]);
                }}
                style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer', height: 3 }}
              />
            </div>

            {/* Font Size */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                Font Size
              </label>
              <div style={{ display: 'flex', gap: 5 }}>
                {(['s', 'm', 'l', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeChange(sz)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 7,
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s',
                      background: activeSize === sz ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                      border: activeSize === sz ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.06)',
                      color: activeSize === sz ? '#a78bfa' : '#6b7280',
                    }}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Box Width (Only for text shapes) */}
            {textShape && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                  Box Width
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="range" min="50" max="800" step="10" 
                    value={textWidth}
                    onChange={(e) => handleTextWidthChange(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: '#7c3aed', cursor: 'pointer', height: 3 }}
                  />
                  <span style={{ fontSize: 9, color: '#9ca3af', minWidth: 24 }}>{Math.round(textWidth)}</span>
                </div>
                <p style={{ fontSize: 9, color: '#4b5563', marginTop: 8, fontStyle: 'italic' }}>
                  Adjust width to wrap text like Canva.
                </p>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* ── Canvas ───────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0a0c10' }}>
        <Tldraw
          persistenceKey={`whiteboard-${activeWhiteboard.id}`}
          autoFocus
          // @ts-ignore — isDarkMode valid in this tldraw version
          isDarkMode={true}
          forceMobile={false}
        >
          <InnerControls
            activeWhiteboard={activeWhiteboard}
            isFullScreen={isFullScreen}
            toggleFullScreen={toggleFullScreen}
            onEditorReady={(ed) => { 
              if (!editorRef.current) {
                editorRef.current = ed;
                ed.store.listen(
                  function handleChange() {
                    setSelectedShapes(ed.getSelectedShapes());
                  },
                  { scope: 'document', source: 'user' }
                );
              }
            }}
            activeColor={activeColor}
            activeSize={activeSize}
            handleColorChange={handleColorChange}
            handleSizeChange={handleSizeChange}
          />
        </Tldraw>
      </div>

      {/* ── Global CSS overrides ──────────────────────── */}
      <style>{`
        /* ── Canvas background dot grid ── */
        .tl-container {
          background: #0a0c10 !important;
          font-family: 'Inter', sans-serif;
        }
        .tl-background {
          background-color: #0a0c10 !important;
          background-image: radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px) !important;
          background-size: 28px 28px !important;
        }

        /* ── REMOVE WHITE TEXT STROKE (the main bug) ── */
        .tl-shape text,
        .tl-shape tspan,
        .tl-text,
        .tl-text-shape__text,
        [class*="tl-text"] {
          -webkit-text-stroke: 0 !important;
          text-stroke: 0 !important;
          paint-order: fill !important;
          stroke: none !important;
          stroke-width: 0 !important;
          text-shadow: none !important;
        }

        /* ── Floating centered toolbar ── */
        .tlui-toolbar {
          background: rgba(10,12,16,0.97) !important;
          backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255,255,255,0.09) !important;
          border-radius: 18px !important;
          padding: 6px !important;
          bottom: 20px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          box-shadow: 0 12px 48px rgba(0,0,0,0.8) !important;
        }
        .tlui-toolbar .tlui-button {
          width: 34px !important;
          height: 34px !important;
          border-radius: 9px !important;
          color: #6b7280 !important;
        }
        .tlui-toolbar .tlui-button:hover {
          background: rgba(255,255,255,0.06) !important;
          color: #e5e7eb !important;
        }
        .tlui-toolbar .tlui-button[data-isactive="true"],
        .tlui-toolbar .tlui-button[aria-pressed="true"],
        .tlui-toolbar .tlui-button[data-state="active"] {
          background: rgba(124,58,237,0.18) !important;
          color: #a78bfa !important;
        }

        /* ── HIDE native style panel (user has sidebar for this) ── */
        .tlui-style-panel {
          display: none !important;
        }

        /* ── Watermark / license badge ── */
        .tlui-watermark,
        .tl-watermark,
        [class*="watermark"],
        .tl-ui-layout__bottom-left {
          display: none !important;
        }

        /* ── Top-left tldraw menu bar: ONE unified dark pill ── */

        /* Main container — compact horizontal pill */
        .tlui-layout__top__left {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 2px !important;
          width: fit-content !important;
          height: fit-content !important;
          background: rgba(10,12,16,0.92) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 14px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
          overflow: visible !important;
          padding: 4px 6px !important;
          margin: 8px !important;
          pointer-events: auto !important;
        }

        /* All child wrappers — transparent, horizontal, no offsets */
        .tlui-layout__top__left .tlui-menu-zone,
        .tlui-layout__top__left .tlui-actions-panel {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Inner rows — horizontal, no negative margins, no repositioning */
        .tlui-layout__top__left .tlui-row,
        .tlui-layout__top__left .tlui-toolbar,
        .tlui-layout__top__left .tlui-row.tlui-toolbar {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 2px !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          margin: 0 !important;
          padding: 0 !important;
          position: static !important;
          left: auto !important;
          transform: none !important;
        }

        /* Hide the Page menu — whiteboards are managed from sidebar */
        .tlui-page-menu,
        .tlui-page-menu__trigger {
          display: none !important;
        }

        /* All buttons — uniform size, no negative margins */
        .tlui-layout__top__left button,
        .tlui-layout__top__left .tlui-button {
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 8px !important;
          color: #e5e7eb !important;
          background: transparent !important;
          flex-shrink: 0 !important;
        }
        .tlui-layout__top__left button:hover,
        .tlui-layout__top__left .tlui-button:hover {
          background: rgba(255,255,255,0.07) !important;
        }

        /* SVG icons */
        .tlui-layout__top__left svg {
          color: #e5e7eb !important;
          stroke: #e5e7eb !important;
          opacity: 1 !important;
        }

        /* ── All bottom toolbar icons white ── */
        .tlui-toolbar svg {
          color: inherit !important;
          stroke: currentColor !important;
        }

        /* ── Zoom controls — one compact dark pill ── */

        /* The navigation-panel is the white box — kill it */
        .tlui-navigation-panel {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Inner rows inside the panel — transparent, horizontal */
        .tlui-navigation-panel .tlui-row,
        .tlui-navigation-panel .tlui-toolbar,
        .tlui-navigation-panel .tlui-row.tlui-toolbar {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 2px !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          margin: 0 !important;
          padding: 0 !important;
          position: static !important;
          left: auto !important;
          transform: none !important;
        }

        /* The outer zone — single dark pill container */
        .tlui-navigation-zone {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 0 !important;
          width: fit-content !important;
          height: fit-content !important;
          background: rgba(10,12,16,0.92) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 14px !important;
          bottom: 20px !important;
          right: 20px !important;
          left: auto !important;
          padding: 4px 6px !important;
          z-index: 500 !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
        }

        /* All buttons — uniform size, clean alignment */
        .tlui-navigation-zone button,
        .tlui-navigation-zone .tlui-button {
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 8px !important;
          color: #e5e7eb !important;
          background: transparent !important;
          flex-shrink: 0 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
        }
        .tlui-navigation-zone button:hover,
        .tlui-navigation-zone .tlui-button:hover {
          background: rgba(255,255,255,0.07) !important;
        }
        .tlui-navigation-zone svg {
          color: #e5e7eb !important;
          stroke: #e5e7eb !important;
        }

        /* Zoom percentage button — slightly wider for text */
        .tlui-zoom-menu__trigger,
        .tlui-zoom-menu__button {
          width: auto !important;
          min-width: 48px !important;
          padding: 0 8px !important;
          color: #e5e7eb !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          justify-content: center !important;
        }

        /* ── Menus & popovers (dark) ── */
        .tlui-popover__content,
        .tlui-menu,
        .tlui-dropdown-menu__content {
          background: #0d1117 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 14px !important;
          box-shadow: 0 16px 64px rgba(0,0,0,0.9) !important;
          color: #e5e7eb !important;
        }
        .tlui-menu .tlui-button,
        .tlui-dropdown-menu__content .tlui-button,
        .tlui-popover__content .tlui-button {
          color: #e5e7eb !important;
        }
        .tlui-menu .tlui-button:hover,
        .tlui-dropdown-menu__content .tlui-button:hover {
          background: rgba(255,255,255,0.07) !important;
        }

        /* ── Scrollbar ── */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(124,58,237,0.3);
          border-radius: 10px;
        }

        /* ── Text editing caret — white so visible on dark canvas ── */
        .tl-text-input,
        .tl-text-shape__text,
        [contenteditable="true"],
        .tl-container textarea,
        .tl-container input,
        .tl-container [contenteditable] {
          caret-color: #ffffff !important;
        }

        /* ── Live Canvas pulse animation ── */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
