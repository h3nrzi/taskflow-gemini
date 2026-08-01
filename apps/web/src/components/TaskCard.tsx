'use client';

import React from 'react';
import { Task, TaskStatus } from '@shared/schemas/index';
import { Calendar, Tag, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask?: (task: Task) => void;
  isReadOnly?: boolean;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-800 text-slate-300 border-slate-700',
  MEDIUM: 'bg-blue-950/60 text-blue-400 border-blue-800',
  HIGH: 'bg-amber-950/60 text-amber-400 border-amber-800',
  URGENT: 'bg-rose-950/60 text-rose-400 border-rose-800',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onUpdateStatus,
  onSelectTask,
  isReadOnly = false,
}) => {
  return (
    <div
      onClick={() => onSelectTask && onSelectTask(task)}
      className="bg-[#121826] border border-[#1f293d] hover:border-slate-700 rounded-xl p-4 shadow-lg transition-all space-y-3 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-slate-100 text-base leading-snug group-hover:text-blue-400 transition-colors">
          {task.title}
        </h4>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full border shrink-0 ${
            priorityColors[task.priority] || priorityColors.MEDIUM
          }`}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Meta tags & due date */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
        {task.dueDate && (
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {task.tags.map((tag: string) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-blue-950/40 text-blue-300 px-2 py-0.5 rounded border border-blue-900/50"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Status Action Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs"
      >
        {isReadOnly ? (
          <div className="flex items-center gap-1 text-slate-500 text-[11px] font-medium py-1">
            <Lock className="w-3 h-3" />
            <span>Read-Only Mode (Viewer)</span>
          </div>
        ) : (
          <>
            {task.status !== 'TODO' && (
              <button
                onClick={() => onUpdateStatus(task.id, task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-800"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>{task.status === 'DONE' ? 'In Progress' : 'Todo'}</span>
              </button>
            )}

            {task.status !== 'DONE' && (
              <button
                onClick={() => onUpdateStatus(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors px-2.5 py-1 rounded bg-blue-950/30 hover:bg-blue-900/40 border border-blue-800/50"
              >
                <span>{task.status === 'TODO' ? 'In Progress' : 'Complete'}</span>
                {task.status === 'IN_PROGRESS' ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <ArrowRight className="w-3 h-3" />
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

