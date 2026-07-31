'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, CreateTaskInput } from '@shared/schemas/task.schema';
import { fetchTasks, createTask, updateTaskStatus } from '../lib/api';
import { KanbanColumn } from '../components/KanbanColumn';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { ToastAlert } from '../components/ToastAlert';
import { Plus, Kanban, RefreshCw, Layers } from 'lucide-react';

export default function KanbanPage() {
  const [workspaceId, setWorkspaceId] = useState('ws-demo-01');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast / Alert Feedback State
  const [toast, setToast] = useState<{ type: 'error' | 'success' | null; message: string | null }>({
    type: null,
    message: null,
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks(workspaceId);
      setTasks(data);
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to load tasks from API',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [workspaceId]);

  const handleCreateTask = async (input: CreateTaskInput) => {
    try {
      const newTask = await createTask(input);
      setTasks((prev) => [newTask, ...prev]);
      setToast({
        type: 'success',
        message: `Task "${newTask.title}" created successfully!`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to create task payload (422 / 500 error)',
      });
      throw err;
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI Update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(taskId, newStatus);
      setToast({
        type: 'success',
        message: `Task status updated to ${newStatus}`,
      });
    } catch (err: any) {
      // Revert Optimistic State
      setTasks(previousTasks);
      setToast({
        type: 'error',
        message: err.message || 'Failed to update task status',
      });
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Navbar Header */}
      <header className="border-b border-[#1f293d] bg-[#0d121f]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/30">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100 leading-tight">TaskFlow</h1>
              <p className="text-xs text-slate-400">Multi-Tenant Kanban Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Workspace Selector */}
            <div className="flex items-center gap-2 bg-[#121826] border border-[#1f293d] px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-400">Tenant:</span>
              <select
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                className="bg-transparent text-slate-100 font-medium outline-none cursor-pointer"
              >
                <option value="ws-demo-01">ws-demo-01 (Engineering)</option>
                <option value="ws-demo-02">ws-demo-02 (Product & Design)</option>
              </select>
            </div>

            <button
              onClick={loadTasks}
              className="p-2 text-slate-400 hover:text-slate-200 bg-[#121826] border border-[#1f293d] hover:bg-slate-800 rounded-xl transition-all"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Board Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Loading tasks for workspace "{workspaceId}"...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KanbanColumn
              status="TODO"
              title="To Do"
              tasks={todoTasks}
              onUpdateStatus={handleUpdateStatus}
            />
            <KanbanColumn
              status="IN_PROGRESS"
              title="In Progress"
              tasks={inProgressTasks}
              onUpdateStatus={handleUpdateStatus}
            />
            <KanbanColumn
              status="DONE"
              title="Done"
              tasks={doneTasks}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        workspaceId={workspaceId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Toast Alert Feedback */}
      <ToastAlert
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ type: null, message: null })}
      />
    </div>
  );
}
