import React, { useState } from 'react';
import Tooltip from '../Tooltip';

interface Project { id: string; name: string; sorting: number; }
interface ManageProjectsModalProps {
  items: Project[];
  onClose: () => void;
  tasks: any[]; completedTasks: any[];
  onAddItem: (name: string) => void;
  onRemoveItem: (id: string) => void;
  onReorderItem: (id: string, direction: 'up' | 'down') => void;
  onUpdateItemName: (id: string, name: string) => void;
}

// FIXED ICONS: No hardcoded dimensions, overflow-visible
const XIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="overflow-visible" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const TrashIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="overflow-visible" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const ArrowUpIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="overflow-visible" {...props}><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>;
const ArrowDownIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="overflow-visible" {...props}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>;
const EditIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="overflow-visible" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
const CheckIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="overflow-visible" {...props}><path d="M20 6 9 17l-5-5"/></svg>;
const XCircleIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="overflow-visible" {...props}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;

const ManageProjectsModal: React.FC<ManageProjectsModalProps> = ({ items, onClose, onAddItem, onRemoveItem, onReorderItem, onUpdateItemName }) => {
  const [newItemName, setNewItemName] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName('');
    }
  };

  const handleUpdateName = (id: string) => {
    if (editingItemName.trim()) {
      onUpdateItemName(id, editingItemName.trim());
      setEditingItemId(null);
      setEditingItemName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Manage Projects</h2>
            <p className="text-sm text-zinc-400">Add, rename, and reorder workspace projects.</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 border-b border-zinc-800 bg-zinc-800/30">
            <form onSubmit={handleAddItem} className="flex gap-3">
            <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Type a new project name..."
                className="flex-grow bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm rounded-xl focus:ring-cyan-500 focus:border-cyan-500 p-3 placeholder-zinc-500"
            />
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-lg shadow-cyan-900/20">
                Add Project
            </button>
            </form>
        </div>

        <div className="overflow-auto flex-grow p-0">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-800/50 sticky top-0 backdrop-blur-md">
              <tr>
                <th scope="col" className="px-6 py-3">Project Name</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map((item, index) => {
                const isEditing = editingItemId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4 font-medium text-zinc-200">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingItemName}
                          onChange={(e) => setEditingItemName(e.target.value)}
                          className="bg-zinc-900 border border-cyan-500 text-white text-sm rounded-lg p-2 w-full"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(item.id); if (e.key === 'Escape') setEditingItemId(null); }}
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <>
                            <Tooltip text="Save">
                                <button onClick={() => handleUpdateName(item.id)} className="text-green-400 hover:bg-green-900/30 p-2 rounded-lg"><CheckIcon className="w-5 h-5" /></button>
                            </Tooltip>
                            <Tooltip text="Cancel">
                                <button onClick={() => setEditingItemId(null)} className="text-red-400 hover:bg-red-900/30 p-2 rounded-lg"><XCircleIcon className="w-5 h-5" /></button>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <button onClick={() => onReorderItem(item.id, 'up')} disabled={index === 0} className="text-zinc-400 hover:text-white hover:bg-zinc-700 p-2 rounded-lg disabled:opacity-20"><ArrowUpIcon className="w-5 h-5" /></button>
                            <button onClick={() => onReorderItem(item.id, 'down')} disabled={index === items.length - 1} className="text-zinc-400 hover:text-white hover:bg-zinc-700 p-2 rounded-lg disabled:opacity-20"><ArrowDownIcon className="w-5 h-5" /></button>
                            <div className="w-px h-4 bg-zinc-700 mx-2"></div>
                            <button onClick={() => { setEditingItemId(item.id); setEditingItemName(item.name); }} className="text-zinc-400 hover:text-cyan-400 hover:bg-zinc-700 p-2 rounded-lg"><EditIcon className="w-5 h-5" /></button>
                            <button onClick={() => onRemoveItem(item.id)} className="text-zinc-400 hover:text-red-400 hover:bg-red-900/20 p-2 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProjectsModal;