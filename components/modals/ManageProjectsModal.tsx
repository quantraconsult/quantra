
import React, { useState } from 'react';
import { Project, Task, CompletedTask } from '../../types';
import Tooltip from '../Tooltip';

interface ManageProjectsModalProps {
  items: Project[];
  onClose: () => void;
  tasks: Task[];
  completedTasks: CompletedTask[];
  onAddItem: (name: string) => void;
  onRemoveItem: (id: string) => void;
  onReorderItem: (id: string, direction: 'up' | 'down') => void;
  onUpdateItemName: (id: string, name: string) => void;
}

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);

const ArrowUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
);

const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
);

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5"/></svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);


const ManageProjectsModal: React.FC<ManageProjectsModalProps> = ({ items, onClose, tasks, completedTasks, onAddItem, onRemoveItem, onReorderItem, onUpdateItemName }) => {
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

  const handleStartEdit = (item: Project) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName('');
  };

  const handleUpdateName = (id: string) => {
    if (editingItemName.trim()) {
      onUpdateItemName(id, editingItemName.trim());
      handleCancelEdit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-secondary rounded-lg shadow-xl p-6 w-full max-w-2xl m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Manage Projects</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="New project name"
            className="flex-grow bg-primary border border-border-color text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent p-2.5"
          />
          <button type="submit" className="bg-accent hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Add</button>
        </form>

        <div className="max-h-96 overflow-y-auto pr-2">
          <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-text-secondary uppercase bg-primary sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3">Project Name</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const hasTasks = tasks.some(t => t.project_id === item.id) || completedTasks.some(t => t.project_id === item.id);
                const isEditing = editingItemId === item.id;

                return (
                  <tr key={item.id} className="border-b border-border-color">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingItemName}
                          onChange={(e) => setEditingItemName(e.target.value)}
                          className="bg-primary border border-border-color text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent p-1.5 w-full"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(item.id); if (e.key === 'Escape') handleCancelEdit(); }}
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <Tooltip text="Save changes">
                                <button onClick={() => handleUpdateName(item.id)} className="text-green-400 hover:text-green-300 p-1">
                                    <CheckIcon className="w-5 h-5" />
                                </button>
                            </Tooltip>
                            <Tooltip text="Cancel editing">
                                <button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300 p-1">
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip text="Move up">
                                <div>
                                    <button onClick={() => onReorderItem(item.id, 'up')} disabled={index === 0} className="text-text-secondary p-1 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:text-text-primary">
                                        <ArrowUpIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </Tooltip>
                            <Tooltip text="Move down">
                                <div>
                                    <button onClick={() => onReorderItem(item.id, 'down')} disabled={index === items.length - 1} className="text-text-secondary p-1 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:text-text-primary">
                                        <ArrowDownIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </Tooltip>
                            <Tooltip text="Edit name">
                                <button onClick={() => handleStartEdit(item)} className="text-text-secondary hover:text-accent p-1">
                                    <EditIcon className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            <Tooltip text={hasTasks ? "Cannot delete project with tasks" : "Delete project"}>
                              <div>
                                <button onClick={() => onRemoveItem(item.id)} disabled={hasTasks} className="text-text-secondary p-1 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:text-red-500">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </Tooltip>
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