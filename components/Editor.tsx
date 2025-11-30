import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Sparkles, Check, AlignLeft, SpellCheck, MoreHorizontal, PenLine, ArrowRight } from 'lucide-react';
import { Note, AIActionType } from '../types';
import { generateNoteContent } from '../services/geminiService';
import { Button } from './Button';

interface EditorProps {
  note: Note;
  onUpdate: (updatedNote: Note) => void;
  onMenuClick: () => void;
}

export const Editor: React.FC<EditorProps> = ({ note, onUpdate, onMenuClick }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when note prop changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setAiError(null);
  }, [note.id]);

  // Debounce updates to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onUpdate({
          ...note,
          title,
          content,
          updatedAt: Date.now()
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content, note, onUpdate]);

  const handleAIAction = async (action: AIActionType) => {
    setIsAILoading(true);
    setAiError(null);
    setShowAIMenu(false);
    
    try {
      if (action === AIActionType.GENERATE_TITLE) {
        // For title generation, we use the content as source
        if (!content.trim()) {
          setAiError("Başlık oluşturmak için önce biraz içerik yazmalısın.");
          return;
        }
        const newTitle = await generateNoteContent(content, action);
        setTitle(newTitle);
      } else {
        // For content modifications
        if (!content.trim()) {
          setAiError("AI işlemi için içerik boş olamaz.");
          return;
        }
        
        const newContent = await generateNoteContent(content, action);
        
        if (action === AIActionType.CONTINUE_WRITING) {
          setContent(prev => prev + "\n\n" + newContent);
        } else {
          setContent(newContent);
        }
      }
    } catch (error: any) {
      setAiError(error.message || "Bir hata oluştu.");
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <AlignLeft size={20} />
          </button>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:block">
            {note.createdAt ? new Date(note.createdAt).toLocaleDateString('tr-TR') : 'Yeni Not'}
          </span>
        </div>

        <div className="flex items-center gap-2">
            {/* AI Tools Dropdown */}
            <div className="relative">
              <Button 
                variant="secondary" 
                size="sm"
                className="!py-1.5 !px-3 text-sm gap-2 text-purple-600 border-purple-100 bg-purple-50 hover:bg-purple-100"
                onClick={() => setShowAIMenu(!showAIMenu)}
                isLoading={isAILoading}
                icon={<Sparkles size={16} />}
              >
                Gemini AI
              </Button>

              {showAIMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAIMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1.5 flex flex-col gap-1">
                      <p className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Metin İşlemleri</p>
                      <button 
                        onClick={() => handleAIAction(AIActionType.FIX_GRAMMAR)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <SpellCheck size={16} className="text-green-500" />
                        <span>Dilbilgisini Düzelt</span>
                      </button>
                      <button 
                        onClick={() => handleAIAction(AIActionType.SUMMARIZE)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Wand2 size={16} className="text-blue-500" />
                        <span>Özetle</span>
                      </button>
                       <button 
                        onClick={() => handleAIAction(AIActionType.MAKE_LONGER)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <MoreHorizontal size={16} className="text-orange-500" />
                        <span>Genişlet & Detaylandır</span>
                      </button>
                      <button 
                        onClick={() => handleAIAction(AIActionType.CONTINUE_WRITING)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <PenLine size={16} className="text-purple-500" />
                        <span>Yazmaya Devam Et</span>
                      </button>
                      <div className="h-px bg-slate-100 my-1" />
                      <button 
                        onClick={() => handleAIAction(AIActionType.GENERATE_TITLE)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <ArrowRight size={16} className="text-slate-500" />
                        <span>Başlık Öner</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
          {aiError && (
             <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
               <span>⚠️ {aiError}</span>
               <button onClick={() => setAiError(null)} className="ml-auto text-red-400 hover:text-red-600">
                 <Check size={16} />
               </button>
             </div>
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Not Başlığı"
            className="w-full text-3xl md:text-4xl font-bold text-slate-800 placeholder:text-slate-300 border-none focus:ring-0 bg-transparent mb-6 p-0"
          />
          
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Yazmaya başlayın... AI özelliklerini kullanmak için sağ üstteki butona tıklayın."
            className="w-full h-[calc(100vh-250px)] resize-none text-base md:text-lg text-slate-600 placeholder:text-slate-300 border-none focus:ring-0 bg-transparent leading-relaxed p-0 selection:bg-purple-100 selection:text-purple-900"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};