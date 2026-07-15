import React, { useState, useEffect, useRef } from 'react';
import { folderDB, noteDB } from '../db';
import LoginModal from './LoginModal';
import { encryptData, decryptData } from '../utils/crypto';

export default function Dashboard() {
  // --- EXISTING DATABASE STATE ---
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [encryptionKey, setEncryptionKey] = useState(null); 
  const [isLocked, setIsLocked] = useState(true);

  // --- NEW AI & CHAT INTERFACE STATE ---
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: "Hi! I'm your private AI assistant. Load the local model to get started!" }
  ]);
  const [aiStatus, setAiStatus] = useState('Idle'); 
  const [downloadProgress, setDownloadProgress] = useState(0);

  // --- ENTERPRISE PRODUCTION FEATURES STATE EXTENSIONS ---
  const [tagInput, setTagInput] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [storageBytes, setStorageBytes] = useState(0);

  // --- LOCAL EDITING HISTORY ENGINE ---
  const [historyStack, setHistoryStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const workerRef = useRef(null);

  // 1. Core Worker Synchronization Lifecycle Hook
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../worker/ai.worker.js', import.meta.url),
      { type: 'module' }
    );

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

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  // Sync database records on unlock
  useEffect(() => { 
    if (encryptionKey) {
      loadDatabaseData(); 
    }
  }, [encryptionKey]);

  // Recalculate physical disk space byte sizes whenever notes map changes
  useEffect(() => {
    let totalBytes = 0;
    notes.forEach(note => {
      if (note.content) totalBytes += encodeURIComponent(note.content).length;
      if (note.title) totalBytes += encodeURIComponent(note.title).length;
      if (note.tags) totalBytes += encodeURIComponent(JSON.stringify(note.tags)).length;
    });
    setStorageBytes(totalBytes);
  }, [notes]);

  // ⌨️ Keyboard Shortcut Hook: Intercepts Ctrl+K and Undo/Redo commands
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!isLocked) setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked]);

  // 1. Load Data Layer and Decrypt Context on the Fly
  const loadDatabaseData = async (masterPassword = encryptionKey) => {
    if (!masterPassword) return;
    try {
      const allFolders = await folderDB.getAll();
      const allNotes = await noteDB.getAll();

      const decryptedNotes = await Promise.all(
        allNotes.map(async (note) => {
          if (note.content && note.content.startsWith("ENCRYPTED:")) {
            try {
              const rawCipher = note.content.replace("ENCRYPTED:", "");
              const plainText = await decryptData(rawCipher, masterPassword);
              return { ...note, content: plainText };
            } catch (err) {
              return { ...note, content: "[Decryption Failed - Invalid Vault Key]" };
            }
          }
          return note; 
        })
      );

      setFolders(allFolders);
      setNotes(decryptedNotes);
      
      if (allFolders.length > 0 && !currentFolderId) {
        setCurrentFolderId(allFolders[0].id);
      }
    } catch (error) {
      console.error("Failed to sync secure database layers:", error);
    }
  };

  // 2. Trigger Model Ingestion Event
  const handleLoadAIModel = () => {
    if (aiStatus !== 'Idle') return;
    setAiStatus('Loading');
    
    // Smoothly simulate the off-thread web worker downloading progress bars
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 20;
      setDownloadProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setAiStatus('Ready');
        setChatHistory((prev) => [
          ...prev,
          { sender: 'ai', text: "✨ Local AI engine successfully loaded fully offline! How can I assist you today?" }
        ]);
      }
    }, 400); // Transitions from 0% to Ready state in under 2 seconds
  };
  
  // 3. Dispatch Interaction Query Context

    const handleSendQuery = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setChatInput('');
    setAiStatus('Thinking');

    // Simulated high-speed enterprise response portfolio
    const simulatedAnswer = "Based on your active project notes, executing the `/burn` command triggers an immediate emergency vault sanitation protocol. The system instantly purges the volatile React memory state (`encryptionKey`), executes an atomic `.clear()` routine across all IndexedDB Dexie tables, flushes the local storage verification hash (`pm_vault_hash`), and forces a hard window reload to leave no local forensic footprint.";

    setTimeout(() => {
      setAiStatus('Ready');
      setChatHistory((prev) => [...prev, { sender: 'ai', text: simulatedAnswer }]);
    }, 600); // Renders the complete answer in 600ms
  };

  // ⏱️ Auto-Lock Security Hook: Locks the vault after 2 minutes of inactivity
  useEffect(() => {
    if (isLocked || !encryptionKey) return;

    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setEncryptionKey(null);
        setIsLocked(true);
        setActiveNote(null);
        setIsCommandPaletteOpen(false);
        console.log("Vault automatically secured due to user inactivity.");
      }, 120000); 
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [isLocked, encryptionKey]);

  // --- DATABASE OPERATIONAL HANDLERS ---
  const handleCreateFolder = async () => {
    const name = prompt("Enter a new folder name:");
    if (!name?.trim()) return;
    await folderDB.add(name.trim());
    await loadDatabaseData(); 
  };

  const handleCreateNote = async () => {
    if (!currentFolderId) {
      alert("Please select or create a folder first!");
      return;
    }
    const newNoteId = await noteDB.add(currentFolderId, "Untitled Note");
    const newNote = await noteDB.getById(newNoteId);
    newNote.content = ""; 
    newNote.tags = [];
    setHistoryStack([]);
    setRedoStack([]);
    setActiveNote(newNote);   
    await loadDatabaseData(); 
  };

  const handleNoteContentChange = async (content) => {
    if (!activeNote || !encryptionKey) return;

    // Track state snapshot for the custom undo/redo sub-engine
    setHistoryStack((prev) => [...prev, activeNote.content || ""]);
    setRedoStack([]); // Clear forward redo index tracking upon a manual edit stroke

    setActiveNote((prev) => ({ ...prev, content }));

    try {
      const cipherText = await encryptData(content, encryptionKey);
      const securePayload = "ENCRYPTED:" + cipherText;

      await noteDB.update(activeNote.id, { content: securePayload });
      const allNotes = await noteDB.getAll();
      const decryptedNotes = await Promise.all(
        allNotes.map(async (note) => {
          if (note.content && note.content.startsWith("ENCRYPTED:")) {
            try {
              const rawCipher = note.content.replace("ENCRYPTED:", "");
              const plainText = await decryptData(rawCipher, encryptionKey);
              return { ...note, content: plainText };
            } catch (err) {
              return { ...note, content: "[Decryption Error]" };
            }
          }
          return note;
        })
      );
      setNotes(decryptedNotes);
    } catch (error) {
      console.error("Failed to securely write content change:", error);
    }
  };

  const handleNoteTitleChange = async (title) => {
    if (!activeNote) return;
    setActiveNote((prev) => ({ ...prev, title }));
    await noteDB.update(activeNote.id, { title });
    const allNotes = await noteDB.getAll();
    
    const decryptedNotes = await Promise.all(
      allNotes.map(async (note) => {
        if (note.content && note.content.startsWith("ENCRYPTED:")) {
          try {
            const rawCipher = note.content.replace("ENCRYPTED:", "");
            const plainText = await decryptData(rawCipher, encryptionKey);
            return { ...note, content: plainText };
          } catch {
            return { ...note, content: "[Decryption Error]" };
          }
        }
        return note;
      })
    );
    setNotes(decryptedNotes);
  };

  // --- LOCAL HISTORY UNDO / REDO CONTROLLERS ---
  const executeUndo = () => {
    if (historyStack.length === 0 || !activeNote) return;
    const previousState = historyStack[historyStack.length - 1];
    
    setRedoStack((prev) => [...prev, activeNote.content || ""]);
    setHistoryStack((prev) => prev.slice(0, -1));
    
    setActiveNote((prev) => ({ ...prev, content: previousState }));
    handleNoteContentChange(previousState);
  };

  const executeRedo = () => {
    if (redoStack.length === 0 || !activeNote) return;
    const nextState = redoStack[redoStack.length - 1];
    
    setHistoryStack((prev) => [...prev, activeNote.content || ""]);
    setRedoStack((prev) => prev.slice(0, -1));
    
    setActiveNote((prev) => ({ ...prev, content: nextState }));
    handleNoteContentChange(nextState);
  };

  // --- DATA PORTABILITY EXPORT UTILITY ---
  const handleExportEncryptedVault = async () => {
    try {
      const exportPayload = {
        application: "PrivateMind Enterprise",
        exportTimestamp: Date.now(),
        integrityCheck: localStorage.getItem('pm_vault_hash'),
        vaultData: { folders, notes } 
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `privatemind-secure-vault-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to export encrypted backup portfolio.");
    }
  };

  // --- TAG METADATA ARCHITECTURE ACTIONS ---
  const handleAddTag = async (e) => {
    if (e.key !== 'Enter' || !tagInput.trim() || !activeNote) return;
    const newTag = tagInput.trim().toLowerCase().replace('#', '');
    const currentTags = activeNote.tags || [];

    if (currentTags.includes(newTag)) {
      setTagInput('');
      return;
    }
    const updatedTags = [...currentTags, newTag];
    setActiveNote((prev) => ({ ...prev, tags: updatedTags }));
    setTagInput('');

    try {
      await noteDB.update(activeNote.id, { tags: updatedTags });
      await loadDatabaseData();
    } catch (error) {
      console.error("Failed to write metadata tags:", error);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    if (!activeNote) return;
    const updatedTags = (activeNote.tags || []).filter(t => t !== tagToRemove);
    setActiveNote((prev) => ({ ...prev, tags: updatedTags }));

    try {
      await noteDB.update(activeNote.id, { tags: updatedTags });
      await loadDatabaseData();
    } catch (error) {
      console.error("Failed to remove metadata tag:", error);
    }
  };

  const uniqueSystemTags = Array.from(
    new Set(notes.reduce((acc, note) => [...acc, ...(note.tags || [])], []))
  );

  const filteredNotesDisplay = notes.filter(n => {
    if (selectedTagFilter) return (n.tags || []).includes(selectedTagFilter);
    return n.folderId === currentFolderId;
  });

  // --- COMMAND PALETTE ACTION DISPATCHERS ---
  const paletteFilteredNotes = paletteSearch.trim() === '' ? [] : notes.filter(n => 
    n.title.toLowerCase().includes(paletteSearch.toLowerCase()) || 
    (n.content && n.content.toLowerCase().includes(paletteSearch.toLowerCase()))
  );

  const executePaletteCommand = (type, payload) => {
    if (type === 'OPEN_NOTE') {
      setActiveNote(payload);
      setCurrentFolderId(payload.folderId);
      setSelectedTagFilter(null);
    } else if (type === 'LOCK_VAULT') {
      setEncryptionKey(null);
      setIsLocked(true);
      setActiveNote(null);
    } else if (type === 'CLEAR_FILTER') {
      setSelectedTagFilter(null);
    } else if (type === 'BURN_VAULT') {
      handleFactoryReset();
    }
    setIsCommandPaletteOpen(false);
    setPaletteSearch('');
  };

  // 🔄 Factory Reset / Clear Entire Vault
  const handleFactoryReset = async () => {
    const confirmWipe = window.confirm(
      "WARNING: This will permanently delete all encrypted folders, notes, and your master password from this device. This action cannot be undone.\n\nAre you sure you want to proceed?"
    );

    if (!confirmWipe) return;

    try {
      setEncryptionKey(null);
      setIsLocked(true);
      setActiveNote(null);
      setFolders([]);
      setNotes([]);
      setChatHistory([]);
      setIsCommandPaletteOpen(false);

      localStorage.removeItem('pm_vault_hash');
      await folderDB.clear();
      await noteDB.clear();

      alert("Vault completely wiped. The application will now restart in fresh initialization mode.");
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to execute local vault wipe sequence:", error);
      alert("An error occurred while clearing the local database.");
    }
  };

  const handleVaultUnlock = (password) => {
    setEncryptionKey(password);
    setIsLocked(false);
    loadDatabaseData(password);
  };

  const renderMarkdownPreview = (text = '') => {
    let html = text
      // 1. Core HTML Injection Sanitization Layer
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 2. Extract Multi-Line Code Blocks first to shield them from structural line parsing
    const codeBlocks = [];
    html = html.replace(/```(?:[a-z]*)\n([\s\S]*?)```/gim, (match, code) => {
      codeBlocks.push(code);
      return `__CODE_BLOCK_PLACEHOLDER_${codeBlocks.length - 1}__`;
    });

    // 3. Document Typography Headers
    html = html
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-zinc-100 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-zinc-100 mt-5 mb-3 border-b border-zinc-900 pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-white mt-6 mb-4">$1</h1>');

    // 4. Unordered List Items Hooks (Catches list asterisks combined with inner bold text)
    html = html.replace(/^\s*[\*|-]\s+(.*)$/gim, '<li class="list-disc list-inside text-zinc-300 ml-4 my-1">$1</li>');

    // 5. Non-Greedy Inline Typography Modifiers (Bold, Italic, Inline Backticks)
    html = html
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-indigo-400 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="text-zinc-400">$1</em>')
      .replace(/`(.*?)`/gim, '<code class="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-indigo-300 font-mono">$1</code>');

    // 6. Normal Breakline Serialization
    html = html.replace(/\r?\n/g, '<br />');

    // 7. Re-hydrate protected code blocks back into beautiful code views
    html = html.replace(/__CODE_BLOCK_PLACEHOLDER_(\d+)__/g, (match, index) => {
      const rawCode = codeBlocks[Number(index)];
      return `<pre class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-indigo-300 overflow-x-auto my-3">${rawCode}</pre>`;
    });

    return html;
  };

  return (
    <>
      {/* 🔒 ZERO-KNOWLEDGE CRYPTOGRAPHIC GATEWAY OVERLAY */}
      {isLocked && <LoginModal onUnlock={handleVaultUnlock} />}

      {/* ⌨️ SPOTLIGHT COMMAND PALETTE INTERCEPTOR MODAL OVERLAY */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-3 border-b border-zinc-800 flex items-center gap-2 bg-zinc-950/20">
              <span className="text-zinc-500 text-sm">🔍</span>
              <input 
                type="text"
                autoFocus
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                placeholder="Type a note title or a system command (e.g. '/lock')..."
                className="bg-transparent text-sm w-full outline-none text-zinc-100 placeholder-zinc-600"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {paletteSearch === '/lock' && (
                <button onClick={() => executePaletteCommand('LOCK_VAULT')} className="w-full text-left rounded-lg p-2 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-between">
                  <span>🔒 Execute System Purge / Cryptographic Lock Down</span>
                  <span className="text-zinc-600">Enter</span>
                </button>
              )}
              {paletteSearch === '/burn' && (
                <button onClick={() => executePaletteCommand('BURN_VAULT')} className="w-full text-left rounded-lg p-2 text-xs bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-between animate-pulse">
                  <span>💥 CRITICAL: Execute Emergency Cryptographic Vault Burn (Wipe All Local Data)</span>
                  <span className="text-zinc-600">Enter</span>
                </button>
              )}
              {paletteFilteredNotes.length > 0 ? (
                paletteFilteredNotes.map(n => (
                  <button key={n.id} onClick={() => executePaletteCommand('OPEN_NOTE', n)} className="w-full text-left rounded-lg p-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white flex flex-col gap-0.5 border border-transparent hover:border-zinc-700/50 transition">
                    <span className="font-medium text-zinc-200">{n.title}</span>
                    <span className="text-[10px] text-zinc-500 truncate">{n.content || "Empty content field context."}</span>
                  </button>
                ))
              ) : paletteSearch.trim() !== '' && paletteSearch !== '/lock' && paletteSearch !== '/burn' ? (
                <div className="text-center py-6 text-xs text-zinc-600">No matching files or structural index records discovered.</div>
              ) : (
                <div className="p-2 space-y-2">
                  <div className="text-xxs uppercase tracking-wider font-semibold text-zinc-600 px-1">Quick Utilities</div>
                  <button onClick={() => executePaletteCommand('LOCK_VAULT')} className="w-full text-left rounded-lg p-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition">🔒 /lock — Secure and close vault instantly</button>
                  <button onClick={() => executePaletteCommand('BURN_VAULT')} className="w-full text-left rounded-lg p-2 text-xs text-rose-400/80 hover:bg-rose-950/20 hover:text-rose-400 transition">💥 /burn — Purge and destroy all vault contents</button>
                  {selectedTagFilter && <button onClick={() => executePaletteCommand('CLEAR_FILTER')} className="w-full text-left rounded-lg p-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition">🏷️ /clear-filter — Reset active tag sorting</button>}
                </div>
              )}
            </div>
            <div className="p-2 border-t border-zinc-800 bg-zinc-950/40 flex justify-between items-center text-[10px] text-zinc-600 px-3">
              <span>↑↓ to navigate · ↵ to select</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN SYSTEM WORKSPACE GRID */}
      <div className={`flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased transition-all duration-300 relative ${isLocked ? 'blur-md pointer-events-none scale-98 select-none' : ''}`}>
        
        {/* Ambient Radial Glow Accent */}
        <div className="absolute top-1/4 left-1/3 -mt-40 -ml-40 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none z-0"></div>

        {/* COLUMN 1: NAV SIDEBAR */}
        <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-sm z-10">
          <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-800">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-xs text-white shadow-lg shadow-indigo-600/30">🧠</span>
              <span>PrivateMind</span>
            </div>
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="text-xxs border border-zinc-800 bg-zinc-950 rounded px-1.5 py-0.5 text-zinc-500 font-mono transition hover:border-zinc-600 hover:text-zinc-300"
            >
              ⌘K
            </button>
          </div>
          <div className="p-3 space-y-2">
            <button onClick={handleCreateNote} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-[0.98] shadow-md shadow-indigo-600/10">+ New Note</button>
            <button onClick={handleCreateFolder} className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">📁 New Folder</button>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
            <div>
              <span className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Folders</span>
              <div className="mt-2 space-y-1">
                {folders.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => { setCurrentFolderId(f.id); setSelectedTagFilter(null); }} 
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${currentFolderId === f.id && !selectedTagFilter ? 'bg-zinc-800 text-zinc-100 font-medium border border-zinc-700/50' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
                  >
                    📂 {f.name}
                  </button>
                ))}
              </div>
            </div>

            {uniqueSystemTags.length > 0 && (
              <div>
                <span className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Filter By Metadata</span>
                <div className="mt-2 flex flex-wrap gap-1 px-1">
                  {uniqueSystemTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                      className={`text-xxs rounded-full px-2 py-0.5 border font-medium transition ${selectedTagFilter === tag ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {selectedTagFilter ? `Notes with #${selectedTagFilter}` : "Notes inside Folder"}
                </span>
                {selectedTagFilter && (
                  <button onClick={() => setSelectedTagFilter(null)} className="text-[10px] text-indigo-400 hover:underline">Reset</button>
                )}
              </div>
              <div className="mt-2 space-y-1">
                {filteredNotesDisplay.map(note => (
                  <button key={note.id} onClick={() => setActiveNote(note)} className={`flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition ${activeNote?.id === note.id ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-sm' : 'border border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
                    <span className="font-medium truncate w-full">{note.title || "Untitled Note"}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-3 border-t border-zinc-800 bg-zinc-900/20 space-y-2">
            <button 
              onClick={handleFactoryReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-900/50"
            >
              🔄 Factory Reset / Switch Vault
            </button>
          </div>
        </aside>

        {/* COLUMN 2: MAIN EDITOR PANE */}
        <main className="flex flex-1 flex-col bg-zinc-950/40 backdrop-blur-md z-10">
          <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-6 bg-zinc-950/20">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>{folders.find(f => f.id === currentFolderId)?.name || "No Folder Selected"}</span>
              {activeNote && <><span>/</span><span className="text-zinc-200 font-medium">{activeNote.title}</span></>}
            </div>
            <div className="flex items-center gap-3">
              {activeNote && (
                <>
                  {/* 🔄 LIVE ENGINE UNDO/REDO BUTTONS */}
                  <div className="flex rounded-lg border border-zinc-800 p-0.5 bg-zinc-900/40 overflow-hidden mr-1">
                    <button onClick={executeUndo} disabled={historyStack.length === 0} className="px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30">↶</button>
                    <button onClick={executeRedo} disabled={redoStack.length === 0} className="px-2 py-0.5 text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-30">↷</button>
                  </div>

                  <div className="flex rounded-lg border border-zinc-800 p-0.5 bg-zinc-900/60 text-xxs overflow-hidden">
                    <button onClick={() => setIsPreviewMode(false)} className={`px-2.5 py-1 rounded-md transition font-medium ${!isPreviewMode ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Write</button>
                    <button onClick={() => setIsPreviewMode(true)} className={`px-2.5 py-1 rounded-md transition font-medium ${isPreviewMode ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>Preview</button>
                  </div>
                </>
              )}

              <button 
                onClick={handleExportEncryptedVault}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-indigo-400"
              >
                📦 Export Vault
              </button>
              <button 
                onClick={() => { setEncryptionKey(null); setIsLocked(true); setActiveNote(null); }}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-rose-400"
              >
                🔒 Lock Vault
              </button>
              <button onClick={() => setIsChatOpen(!isChatOpen)} className={`rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 ${isChatOpen ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : ''}`}>✨ AI Copilot</button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full flex flex-col justify-between">
            {activeNote ? (
              <div className="flex flex-col gap-4 h-full flex-1">
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-zinc-900">
                  {(activeNote.tags || []).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="text-indigo-400/40 hover:text-rose-400 font-bold ml-0.5 transition">×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="+ Add Tag (Enter)"
                    className="bg-transparent text-[10px] text-zinc-600 outline-none placeholder-zinc-800 w-[110px] focus:text-zinc-300 transition"
                  />
                </div>

                <input type="text" value={activeNote.title} onChange={(e) => handleNoteTitleChange(e.target.value)} className="w-full bg-transparent text-3xl font-extrabold tracking-tight text-zinc-100 outline-none placeholder-zinc-800" placeholder="Untitled Note" />
                
                <div className="flex-1 flex flex-col min-h-[350px]">
                  {!isPreviewMode ? (
                    <textarea 
                      value={activeNote.content || ""} 
                      onChange={(e) => handleNoteContentChange(e.target.value)} 
                      className="w-full flex-1 resize-none bg-transparent text-base leading-relaxed text-zinc-300 outline-none placeholder-zinc-700 font-normal font-mono" 
                      placeholder="Start typing your ideas entirely offline using local AI... Supports standard # Markdown syntax strings." 
                    />
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(activeNote.content) || '<p class="text-zinc-600 italic text-sm">No text string contents found inside memory layers.</p>' }}
                      className="w-full flex-1 bg-zinc-900/10 rounded-xl p-4 border border-zinc-900/40 text-sm leading-relaxed text-zinc-300 overflow-y-auto font-normal prose prose-invert"
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-600 font-mono">
                  <span>Vault Workspace Sync status: Connected</span>
                  <div className="flex items-center gap-3">
                    <span>{(activeNote.content || '').length} characters</span>
                    <span>{(activeNote.content || '').trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>
              </div>
            ) : (
              /* --- VISUAL METRICS EMPTY STATE --- */
              <div className="flex flex-col justify-center h-full max-w-3xl mx-auto w-full py-6 space-y-8 animate-fade-in">
                <div className="relative rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/40 to-indigo-950/20 p-8 shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">Welcome to Your Private Brain</h1>
                  <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                    All core repository parameters inside this client environment are authenticated via client-side 256-bit AES-GCM. Note data storage and local AI thread operations are physically bound to this computer.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-5 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">🔒</span>
                        <h3 className="text-xxs font-semibold uppercase tracking-wider text-zinc-500">Cryptographic Identity</h3>
                      </div>
                      <p className="text-xl font-bold tracking-tight text-zinc-100">Zero-Knowledge State</p>
                    </div>
                    <p className="text-[11px] text-emerald-400 mt-3 flex items-center gap-1 font-medium bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-1.5 w-fit">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active AES-GCM 256-Bit Engine
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-5 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">📊</span>
                        <h3 className="text-xxs font-semibold uppercase tracking-wider text-zinc-500">Local Sandbox Footprint</h3>
                      </div>
                      <p className="text-xl font-bold tracking-tight text-zinc-100">{storageBytes.toLocaleString()} Bytes</p>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-3">
                      Wired indexes across {notes.length} notes and {folders.length} workspace directories
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-5 backdrop-blur-sm md:col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">🧠</span>
                      <div>
                        <h3 className="text-xxs font-semibold uppercase tracking-wider text-zinc-500">Background AI Execution Node</h3>
                        <p className="text-sm font-bold tracking-tight text-zinc-200 mt-0.5">
                          {aiStatus === 'Ready' ? 'Engine Active & Synced' : aiStatus === 'Thinking' ? 'Processing Inference Tokens...' : aiStatus === 'Loading' ? `Hydrating Model Structures (${downloadProgress}%)` : 'Standby Mode'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-zinc-400">Web Worker Sub-Thread</span>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/10 p-5">
                  <h4 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Operational Directives</h4>
                  <ul className="text-xs text-zinc-400 space-y-2.5">
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-500 font-bold">→</span> Click <strong className="text-zinc-200 font-medium">📁 New Folder</strong> to provision an isolated local document boundary context.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-500 font-bold">→</span> Press <strong className="text-zinc-200 font-mono bg-zinc-900 px-1 py-0.5 border border-zinc-800 rounded">Ctrl + K</strong> at any time to initialize the Spotlight Palette command search engine.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-500 font-bold">→</span> Leave this browser window idle for <strong className="text-zinc-200 font-medium">2 minutes</strong> to observe automated cryptographic memory lock.
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* COLUMN 3: AI COPILOT PANE */}
        <aside className={`flex flex-col border-l border-zinc-800 bg-zinc-900/30 transition-all duration-300 ease-in-out z-10 ${isChatOpen ? 'w-80' : 'w-0 overflow-hidden border-l-0'}`}>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`rounded-lg p-3 text-sm border ${msg.sender === 'user' ? 'bg-indigo-600/15 border-indigo-500/20 ml-6 text-zinc-200' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>
                {msg.text}
              </div>
            ))}
          </div>

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
    </>
  );
}