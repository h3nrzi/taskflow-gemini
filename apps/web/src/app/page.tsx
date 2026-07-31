'use client';

import React, { useState, useEffect } from 'react';
import {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskInput,
  UpdateTaskInput,
} from '@shared/schemas/task.schema';
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from '../lib/api';
import { KanbanColumn } from '../components/KanbanColumn';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { ActivityLogDrawer } from '../components/ActivityLogDrawer';
import { ToastAlert } from '../components/ToastAlert';
import { Plus, Kanban, RefreshCw, Layers, Search, Filter, History, X } from 'lucide-react';

export default function KanbanPage() {
  const [workspaceId, setWorkspaceId] = useState('ws-demo-01');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State (STORY-004)
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [tagFilter, setTagFilter] = useState('');

  // Modals & Drawers State (STORY-005 & STORY-006)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);

  // Toast / Alert Feedback State
  const [toast, setToast] = useState<{ type: 'error' | 'success' | null; message: string | null }>({
    type: null,
    message: null,
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks(workspaceId, {
        search: searchQuery || undefined,
        priority: priorityFilter || undefined,
        tag: tagFilter || undefined,
      });
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
  }, [workspaceId, searchQuery, priorityFilter, tagFilter]);

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
      setTasks(previousTasks);
      setToast({
        type: 'error',
        message: err.message || 'Failed to update task status',
      });
    }
  };

  const handleEditTask = async (taskId: string, input: UpdateTaskInput) => {
    try {
      const updated = await updateTask(taskId, input);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setSelectedTask(updated);
      setToast({
        type: 'success',
        message: `Task "${updated.title}" updated successfully!`,
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to update task details',
      });
      throw err;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setIsDetailModalOpen(false);
      setSelectedTask(null);
      setToast({
        type: 'success',
        message: 'Task deleted successfully',
      });
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to delete task',
      });
      throw err;
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Navbar Header */}
      <header className="border-b border-[#1f293d] bg-[#0d121f]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 space-y-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/30">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100 leading-tight">TaskFlow</h1>
              <p className="text-xs text-slate-400">Multi-Tenant Kanban Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Workspace Switcher */}
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

            {/* Audit Log Drawer Button (STORY-006) */}
            <button
              onClick={() => setIsActivityDrawerOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-[#121826] border border-[#1f293d] hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-all"
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Activity Log</span>
            </button>

            <button
              onClick={loadTasks}
              className="p-2 text-slate-400 hover:text-slate-200 bg-[#121826] border border-[#1f293d] hover:bg-slate-800 rounded-xl transition-all"
              title="Refresh Tasks"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Filter & Search Bar (STORY-004) */}
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121826] border border-[#1f293d] focus:border-blue-500 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-[#121826] border border-[#1f293d] px-3 py-1 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
              className="bg-transparent text-slate-200 outline-none font-medium cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-1.5 bg-[#121826] border border-[#1f293d] px-3 py-1 rounded-xl text-xs min-w-[140px]">
            <span className="text-slate-400 font-medium">Tag:</span>
            <input
              type="text"
              placeholder="Filter by tag..."
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-transparent text-slate-200 outline-none font-medium text-xs placeholder-slate-500 w-full"
            />
            {tagFilter && (
              <button onClick={() => setTagFilter('')} className="text-slate-400 hover:text-slate-200">
                <X className="w-3 h-3" />
              </button>
            )}
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
              onSelectTask={handleSelectTask}
            />
            <KanbanColumn
              status="IN_PROGRESS"
              title="In Progress"
              tasks={inProgressTasks}
              onUpdateStatus={handleUpdateStatus}
              onSelectTask={handleSelectTask}
            />
            <KanbanColumn
              status="DONE"
              title="Done"
              tasks={doneTasks}
              onUpdateStatus={handleUpdateStatus}
              onSelectTask={handleSelectTask}
            />
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        workspaceId={workspaceId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Task Detail & Edit Modal (STORY-005) */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={handleEditTask}
        onDelete={handleDeleteTask}
      />

      {/* Activity Log Audit Trail Drawer (STORY-006) */}
      <ActivityLogDrawer
        workspaceId={workspaceId}
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
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
