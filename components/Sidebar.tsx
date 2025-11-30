import React, { useMemo } from 'react';
import { Plus, Search, Trash2, FileText, Menu } from 'lucide-react';
import { Note } from '../types';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  setSearchQuery,
  isOpen,
  onCloseMobile
}) => {
  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('tr-TR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-primary-600 text-white p-1 rounded-lg">
                <FileText size={20} />
              </span>
              Akıllı Notlar
            </h1>
            <button onClick={onCreateNote} className="p-2 text-primary-600 hover:bg-primary-50 rounded-full transition-colors" title="Yeni Not">
              <Plus size={24} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Notlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">
              <p className="text-sm">Not bulunamadı</p>
              {notes.length === 0 && (
                <button onClick={onCreateNote} className="text-primary-600 text-sm mt-2 hover:underline">
                  İlk notunu oluştur
                </button>
              )}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => {
                  onSelectNote(note.id);
                  onCloseMobile();
                }}
                className={`
                  group relative p-3 rounded-xl cursor-pointer transition-all border border-transparent
                  ${activeNoteId === note.id 
                    ? 'bg-primary-50 border-primary-100 shadow-sm' 
                    : 'hover:bg-slate-50 hover:border-slate-200'
                  }
                `}
              >
                <h3 className={`font-semibold text-sm mb-1 truncate ${activeNoteId === note.id ? 'text-primary-900' : 'text-slate-700'}`}>
                  {note.title || 'Başlıksız Not'}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2 h-8">
                  {note.content || 'İçerik yok...'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatDate(note.updatedAt)}
                  </span>
                  <button
                    onClick={(e) => onDeleteNote(note.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    title="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};