'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, UpdateTaskInput } from '@shared/schemas/index';
import { Calendar, Tag, Trash2, Edit3, X, Check, Clock, Lock } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, input: UpdateTaskInput) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  isReadOnly?: boolean;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isReadOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setTagInput(task.tags ? task.tags.join(', ') : '');
      setIsEditing(false);
      setShowConfirmDelete(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isReadOnly) return;

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        tags,
      });

      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isReadOnly) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#121826] border border-[#1f293d] w-full max-w-xl rounded-2xl shadow-2xl p-6 relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 pr-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 font-mono">
              {task.id.slice(0, 8)}
            </span>
            <span className="capitalize px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-900/50">
              {task.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isReadOnly ? (
              <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Lock className="w-3 h-3 text-slate-400" />
                Read-Only (Viewer)
              </span>
            ) : (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/50 px-3 py-1.5 rounded-lg border border-blue-800/50 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Task
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5"
                  >
                    Cancel Edit
                  </button>
                )}

                {!showConfirmDelete ? (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 px-3 py-1.5 rounded-lg border border-rose-800/50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-rose-950 border border-rose-800 px-2 py-1 rounded-lg">
                    <span className="text-xs text-rose-200 font-medium">Confirm?</span>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-2 py-0.5 rounded font-bold"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="text-slate-400 text-xs px-1 hover:text-slate-200"
                    >
                      No
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* View / Edit Mode */}
        {!isEditing || isReadOnly ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 leading-snug">{task.title}</h2>
              <p className="text-slate-400 text-sm mt-2 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-1 uppercase font-semibold">Priority</span>
                <span className="font-bold text-slate-200">{task.priority}</span>
              </div>

              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-1 uppercase font-semibold">Due Date</span>
                <div className="flex items-center gap-1 text-slate-200 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</span>
                </div>
              </div>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-2 uppercase">Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 bg-blue-950/40 text-blue-300 px-2.5 py-1 rounded-lg text-xs border border-blue-900/50"
                    >
                      <Tag className="w-3 h-3 text-blue-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 text-xs text-slate-500 border-t border-slate-800">
              <Clock className="w-3.5 h-3.5" />
              <span>Created {new Date(task.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

