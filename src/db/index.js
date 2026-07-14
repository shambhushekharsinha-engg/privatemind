import Dexie from 'dexie';

export const db = new Dexie('PrivateMindDB');
db.version(1).stores({
  folders: '++id, name, createdAt',
  notes: '++id, folderId, title, content, updatedAt, tags'
});

export const folderDB = {
  getAll: () => db.folders.orderBy('name').toArray(),
  add: (name) => db.folders.add({ name, createdAt: Date.now() }),
  delete: async (folderId) => {
    return db.transaction('rw', [db.folders, db.notes], async () => {
      await db.notes.where({ folderId: Number(folderId) }).delete();
      await db.folders.delete(Number(folderId));
    });
  }
};

export const noteDB = {
  getAll: () => db.notes.orderBy('updatedAt').reverse().toArray(),
  getByFolder: (folderId) => db.notes.where({ folderId: Number(folderId) }).toArray(),
  getById: (id) => db.notes.get(Number(id)),
  add: (folderId, title = 'Untitled Note') => {
    return db.notes.add({
      folderId: folderId ? Number(folderId) : null,
      title,
      content: '',
      updatedAt: Date.now(),
      tags: []
    });
  },
  update: (id, updates) => {
    return db.notes.update(Number(id), { ...updates, updatedAt: Date.now() });
  },
  delete: (id) => db.notes.delete(Number(id))
};