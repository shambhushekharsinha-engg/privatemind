import Dexie from 'dexie';

// 🧠 Initialize the local browser database instance
export const db = new Dexie('PrivateMindDB');

// Define table schemas and dynamic query index paths
db.version(1).stores({
  folders: '++id, name, createdAt',
  notes: '++id, folderId, title, content, updatedAt, tags'
});

// 📁 Folder Database Operations Controller
export const folderDB = {
  // Pull all folder structures sorted alphabetically by name
  getAll: () => db.folders.orderBy('name').toArray(),
  
  // Instantly insert a fresh folder entry partition with a local timestamp
  add: (name) => db.folders.add({ name, createdAt: Date.now() }),
  
  // Transaction wrapper to safely wipe out notes inside a folder before deleting the folder itself
  delete: async (folderId) => {
    return db.transaction('rw', [db.folders, db.notes], async () => {
      await db.notes.where({ folderId: Number(folderId) }).delete();
      await db.folders.delete(Number(folderId));
    });
  }
};

// 📝 Notes Database Operations Controller
export const noteDB = {
  // Fetch all note assets sorted chronologically by the most recent update
  getAll: () => db.notes.orderBy('updatedAt').reverse().toArray(),
  
  // Filter and load notes mapped exclusively to a matching folder domain tracking ID
  getByFolder: (folderId) => db.notes.where({ folderId: Number(folderId) }).toArray(),
  
  // Grab a single note profile directly by its specific primary key value
  getById: (id) => db.notes.get(Number(id)),
  
  // Generate a clean note data schema entry tied to an active parent folder path
  add: (folderId, title = 'Untitled Note') => {
    return db.notes.add({
      folderId: folderId ? Number(folderId) : null,
      title,
      content: '',
      updatedAt: Date.now(),
      tags: []
    });
  },
  
  // Perform safe updates (like modifying title or encrypted content blocks) without breaking other keys
  update: (id, updates) => {
    return db.notes.update(Number(id), { ...updates, updatedAt: Date.now() });
  },
  
  // Delete a specific note index target entry completely from disk storage
  delete: (id) => db.notes.delete(Number(id))
};