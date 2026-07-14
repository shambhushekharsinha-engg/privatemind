import React, { useState, useEffect, useRef } from 'react';
import { folderDB, noteDB } from '../db';

export default function Dashboard() {
  // --- EXISTING DATABASE STATE ---
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);

  // --- NEW AI & CHAT INTERFACE STATE ---
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: "Hi! I'm your private AI assistant. Load the local model to get started!" }
  ]);
  const [aiStatus, setAiStatus] = useState('Idle'); // 'Idle', 'Loading', 'Ready', 'Thinking'
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Persistent reference holder for the background worker thread instance
  const workerRef = useRef(null);

  // 1. Core Worker Synchronization Lifecycle Hook
  useEffect(() => {
    // Instantiate our background processing engine using Vite's explicit URL layout syntax
    workerRef.current = new Worker(
      new URL('../worker/ai.worker.js', import.meta.url),
      { type: 'module' }
    );

    // Coordinate responses incoming from the worker thread back to the React UI view
    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'DOWNLOAD_PROGRESS':
          setAiStatus('Loading');
          setDownloadProgress(Math.round(payload));
          break;

        case 'MODEL_READY':
          setAiStatus('Ready');
          setChatHistory((prev) => [
            ...prev,
            { sender: 'ai', text: "✨ Local AI engine successfully loaded fully offline! How can I assist you today?" }
          ]);
          break;

        case 'STREAM_TOKEN':
          // Update the last message in history in real-time as tokens stream in
          setChatHistory((prev) => {
            const updated = [...prev];
            if (updated[updated.length - 1].sender === 'ai') {
              updated[updated.length - 1].text = payload;
            } else {
              updated.push({ sender: 'ai', text: payload });
            }
            return updated;
          });
          break;

        case 'GENERATION_COMPLETE':
          setAiStatus('Ready');
          break;

        case 'ERROR':
          setAiStatus('Ready');
          alert(`Worker Pipeline Error Encountered: ${payload}`);
          break;

        default:
          break;
      }
    };

    // Clean up worker processes when component structure drops or hot-reloads
    return () => {
      workerRef.current.terminate();
    };
  }, []);

  // Sync database records on mount
  useEffect(() => { loadDatabaseData(); }, []);

  const loadDatabaseData = async () => {
    const allFolders = await folderDB.getAll();
    const allNotes = await noteDB.getAll();
    setFolders(allFolders);
    setNotes(allNotes);
    if (allFolders.length > 0 && !currentFolderId) setCurrentFolderId(allFolders[0].id);
  };

  // 2. Trigger Model Ingestion Event
  const handleLoadAIModel = () => {
    if (aiStatus !== 'Idle') return;
    setAiStatus('Loading');
    workerRef.current.postMessage({ type: 'LOAD_MODEL' });
  };

  // 3. Dispatch Interaction Query Context to Thread Layer
  const handleSendQuery = () => {
    if (!chatInput.trim() || aiStatus !== 'Ready') return;

    const userMessage = chatInput.trim();
    
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setAiStatus('Thinking');

    // Build an ultra-clean, text-only pipeline format for the small model
    let fullPrompt = "";
    if (activeNote) {
      fullPrompt = `Context:\n${activeNote.content}\n\nQuestion: ${userMessage}`;
    } else {
      fullPrompt = `Question: ${userMessage}`;
    }

    workerRef.current.postMessage({ type: 'GENERATE_TEXT', payload: fullPrompt });
  };

  // --- COMPLETED DATABASE HANDLERS ---
  const handleCreateFolder = async () => {
    const name = prompt("Enter a new folder name:");
    if (!name?.trim()) return;
    await folderDB.add(name.trim());
    await loadDatabaseData(); // This updates your UI sidebar folder list instantly
  };

  const handleCreateNote = async () => {
    if (!currentFolderId) {
      alert("Please select or create a folder first!");
      return;
    }
    const newNoteId = await noteDB.add(currentFolderId, "Untitled Note");
    const newNote = await noteDB.getById(newNoteId);
    setActiveNote(newNote);   // Automatically opens the note in the editor workspace canvas
    await loadDatabaseData(); // Updates your note list layout state
  };

  const handleNoteContentChange = async (content) => {
    if (!activeNote) return;
    setActiveNote((prev) => ({ ...prev, content }));
    await noteDB.update(activeNote.id, { content });
    const allNotes = await noteDB.getAll();
    setNotes(allNotes);
  };

  const handleNoteTitleChange = async (title) => {
    if (!activeNote) return;
    setActiveNote((prev) => ({ ...prev, title }));
    await noteDB.update(activeNote.id, { title });
    const allNotes = await noteDB.getAll();
    setNotes(allNotes);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased">
      {/* COLUMN 1: NAV SIDEBAR */}
      <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-xs text-white shadow-lg shadow-indigo-600/30">🧠</span>
            <span>PrivateMind</span>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <button onClick={handleCreateNote} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-[0.98]">+ New Note</button>
          <button onClick={handleCreateFolder} className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">📁 New Folder</button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div>
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Folders</span>
            <div className="mt-2 space-y-1">
              {folders.map(f => (
                <button key={f.id} onClick={() => setCurrentFolderId(f.id)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${currentFolderId === f.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>📂 {f.name}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Notes inside Folder</span>
            <div className="mt-2 space-y-1">
              {notes.filter(n => n.folderId === currentFolderId).map(note => (
                <button key={note.id} onClick={() => setActiveNote(note)} className={`flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition ${activeNote?.id === note.id ? 'bg-zinc-800 border border-zinc-700 text-zinc-100' : 'border border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                  <span className="font-medium truncate w-full">{note.title || "Untitled Note"}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* COLUMN 2: MAIN EDITOR PANE */}
      <main className="flex flex-1 flex-col bg-zinc-950">
        <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>{folders.find(f => f.id === currentFolderId)?.name || "No Folder Selected"}</span>
            {activeNote && <><span>/</span><span className="text-zinc-200 font-medium">{activeNote.title}</span></>}
          </div>
          <button onClick={() => setIsChatOpen(!isChatOpen)} className={`rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 ${isChatOpen ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : ''}`}>✨ AI Copilot</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full flex flex-col gap-4">
          {activeNote ? (
            <>
              <input type="text" value={activeNote.title} onChange={(e) => handleNoteTitleChange(e.target.value)} className="w-full bg-transparent text-3xl font-bold tracking-tight text-zinc-100 outline-none placeholder-zinc-700" placeholder="Untitled Note" />
              <textarea value={activeNote.content} onChange={(e) => handleNoteContentChange(e.target.value)} className="w-full flex-1 resize-none bg-transparent text-base leading-relaxed text-zinc-300 outline-none placeholder-zinc-700" placeholder="Start typing your ideas entirely offline using local AI..." />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-600">
              <span className="text-4xl mb-2">📝</span>
              <p>Select a note from the sidebar or make a new one to begin editing.</p>
            </div>
          )}
        </div>
      </main>

      {/* COLUMN 3: AI COPILOT PANE */}
      <aside className={`flex flex-col border-l border-zinc-800 bg-zinc-900/30 transition-all duration-300 ease-in-out ${isChatOpen ? 'w-80' : 'w-0 overflow-hidden border-l-0'}`}>
        <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50">
          <span className="text-sm font-semibold text-zinc-200">Local AI Copilot</span>
          {aiStatus === 'Ready' ? (
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">Offline Ready</span>
          ) : aiStatus === 'Loading' ? (
            <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">Downloading {downloadProgress}%</span>
          ) : aiStatus === 'Thinking' ? (
            <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20 animate-pulse">Thinking...</span>
          ) : (
            <button onClick={handleLoadAIModel} className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500">Init AI</button>
          )}
        </div>

        {/* Dynamic History Timeline Console */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`rounded-lg p-3 text-sm border ${msg.sender === 'user' ? 'bg-indigo-600/15 border-indigo-500/20 ml-6 text-zinc-200' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {/* Interactive Query Console Input Toolbar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              disabled={aiStatus !== 'Ready'}
              placeholder={aiStatus === 'Ready' ? "Ask your second brain..." : "Initialize AI Engine first"} 
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-3 pr-10 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button onClick={handleSendQuery} disabled={aiStatus !== 'Ready'} className="absolute right-1.5 rounded-md p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50">➔</button>
          </div>
        </div>
      </aside>
    </div>
  );
}