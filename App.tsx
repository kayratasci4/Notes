import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Note } from './types';
import { FileText } from 'lucide-react';

const STORAGE_KEY = 'akilli-notlar-data-v1';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedNotes = JSON.parse(saved);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
            // Optionally select first note, or leave null to show empty state
        }
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    }
    setIsInitializing(false);
  }, []);

  // Save to LocalStorage whenever notes change
  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isInitializing]);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    // On mobile, close sidebar after creating to go to editor
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prevNotes => 
      prevNotes.map(n => n.id === updatedNote.id ? updatedNote : n)
    );
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bu notu silmek istediğinize emin misiniz?")) {
      setNotes(notes.filter(n => n.id !== id));
      if (activeNoteId === id) {
        setActiveNoteId(null);
      }
    }
  };

  const getActiveNote = () => notes.find(n => n.id === activeNoteId);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
        {activeNoteId ? (
          <Editor 
            key={activeNoteId} // Force re-mount when switching notes to reset editor internal state
            note={getActiveNote()!}
            onUpdate={updateNote}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 text-center bg-white">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <FileText size={32} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Akıllı Notlar'a Hoş Geldiniz</h2>
            <p className="max-w-md text-slate-500 mb-8">
              Düşüncelerinizi yazın, Gemini AI ile düzenleyin, özetleyin veya genişletin.
            </p>
            <button 
              onClick={() => {
                createNote();
                setIsSidebarOpen(false);
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span className="text-xl">+</span> Yeni Not Oluştur
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="mt-6 md:hidden text-sm text-slate-500 hover:text-primary-600 font-medium"
            >
              Not Listesini Göster
            </button>
          </div>
        )}
      </main>
    </div>
  );
}