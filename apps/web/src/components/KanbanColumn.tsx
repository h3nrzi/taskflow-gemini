'use client';

import React from 'react';
import { Task, TaskStatus } from '@shared/schemas/task.schema';
import { TaskCard } from './TaskCard';
import { Circle, Clock, CheckCircle } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSelectTask?: (task: Task) => void;
}

const columnHeaderConfig: Record<
  TaskStatus,
  { icon: React.ReactNode; badgeColor: string; borderColor: string }
> = {
  TODO: {
    icon: <Circle className="w-4 h-4 text-slate-400" />,
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    borderColor: 'border-slate-800',
  },
  IN_PROGRESS: {
    icon: <Clock className="w-4 h-4 text-blue-400" />,
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800',
    borderColor: 'border-blue-900/60',
  },
  DONE: {
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    borderColor: 'border-emerald-900/60',
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onUpdateStatus,
  onSelectTask,
}) => {
  const config = columnHeaderConfig[status];

  return (
    <div
      className={`flex flex-col bg-[#0d121f] border ${config.borderColor} rounded-2xl p-4 min-h-[500px] shadow-xl`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="font-bold text-slate-200 text-base">{title}</h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${config.badgeColor}`}>
          {tasks.length}
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
            No tasks in {title}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateStatus={onUpdateStatus}
              onSelectTask={onSelectTask}
            />
          ))
        )}
      </div>
    </div>
  );
};
