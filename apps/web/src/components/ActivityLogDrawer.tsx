'use client';

import React, { useState, useEffect } from 'react';
import { TaskActivityLog } from '@shared/schemas/index';
import { fetchActivityLogs } from '../lib/api';
import { History, X, Activity, Clock, ShieldCheck, User } from 'lucide-react';

interface ActivityLogDrawerProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({
  workspaceId,
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<TaskActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && workspaceId) {
      setLoading(true);
      fetchActivityLogs(workspaceId)
        .then((data) => setLogs(data))
        .catch((err) => console.error('Failed to load activity logs:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, workspaceId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d121f] border-l border-[#1f293d] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#1f293d] flex items-center justify-between bg-[#121826]/80">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-950/80 p-2 rounded-xl border border-blue-800/60 text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-100 leading-tight">Activity Log</h2>
                <p className="text-xs text-slate-400">Audit Trail for {workspaceId}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Log Event Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-xs text-slate-400 space-x-2">
                <Activity className="w-5 h-5 animate-spin text-blue-500" />
                <span>Loading activity audit stream...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No activity log records found for this workspace.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-[#121826] border border-[#1f293d] p-4 rounded-xl space-y-2 shadow-md relative"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-400 font-mono tracking-wide uppercase px-2 py-0.5 rounded bg-blue-950/60 border border-blue-900/50">
                      {log.action}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 font-medium">Task ID: </span>
                    <span className="font-mono text-slate-300">{log.taskId.slice(0, 8)}</span>
                  </div>

                  {log.details && (
                    <div className="bg-[#090d16] p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 font-mono overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Actor: {log.actorId}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
