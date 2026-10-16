import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChecklistTask, UserRole } from '../../types';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Filter,
  UserCheck,
  Calendar,
  AlertCircle,
  Sparkles,
  ClipboardList
} from 'lucide-react';

export const ChecklistsPage: React.FC = () => {
  const { checklists, toggleChecklistTask, addChecklistTask, reportChecklistIssue, currentUser } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed' | 'Issues'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [issueModalTask, setIssueModalTask] = useState<ChecklistTask | null>(null);
  const [issueText, setIssueText] = useState('');

  // Form state
  const [taskName, setTaskName] = useState('');
  const [taskCategory, setTaskCategory] = useState<ChecklistTask['category']>('Opening Checklist');
  const [taskRole, setTaskRole] = useState<UserRole>('Kitchen Staff');
  const [taskDueTime, setTaskDueTime] = useState('11:00 AM');

  const categories = [
    'All',
    'Opening Checklist',
    'Closing Checklist',
    'Kitchen Sanitation',
    'Food Safety & Temp',
    'Cash Shift Closing'
  ];

  const filteredTasks = checklists.filter(task => {
    if (selectedCategory !== 'All' && task.category !== selectedCategory) return false;
    if (statusFilter === 'Pending' && task.isCompleted) return false;
    if (statusFilter === 'Completed' && !task.isCompleted) return false;
    if (statusFilter === 'Issues' && !task.reportedIssue) return false;
    return true;
  });

  const totalCount = checklists.length;
  const completedCount = checklists.filter(t => t.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  const issuesCount = checklists.filter(t => !!t.reportedIssue).length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    addChecklistTask({
      name: taskName.trim(),
      category: taskCategory,
      assignedRole: taskRole,
      dueTime: taskDueTime
    });

    setTaskName('');
    setShowAddModal(false);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalTask || !issueText.trim()) return;

    reportChecklistIssue(issueModalTask.id, issueText.trim());
    setIssueModalTask(null);
    setIssueText('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-[#f5764b]" />
            Operational Checklists & Tasks
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Standard operating procedures, food safety compliance, and shift opening/closing verification
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-sm font-medium shadow-sm transition-all shadow-[#e05a2b]/20"
        >
          <Plus className="w-4 h-4" />
          Add Checklist Task
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{completionPercentage}%</p>
            <p className="text-xs text-gray-400 mt-0.5">{completedCount} of {totalCount} completed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#f5764b] flex items-center justify-center font-bold text-sm">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-0.5">{completedCount}</p>
            <p className="text-xs text-green-600/80 mt-0.5">Verified on schedule</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Tasks</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">{pendingCount}</p>
            <p className="text-xs text-amber-600/80 mt-0.5">Awaiting staff action</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Issues Flagged</p>
            <p className="text-2xl font-bold text-red-600 mt-0.5">{issuesCount}</p>
            <p className="text-xs text-red-600/80 mt-0.5">Needs manager review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#f5764b]" />
            Overall Shift Protocol Progress
          </span>
          <span className="font-semibold text-[#e05a2b]">{completedCount} / {totalCount} Done ({completionPercentage}%)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#f5764b] h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs & Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#f5764b] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
          {(['All', 'Pending', 'Completed', 'Issues'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Checklist Tasks Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              There are no tasks matching your selected category and status filters.
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                task.isCompleted ? 'bg-gray-50/50' : 'hover:bg-gray-50/80'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Interactive Checkbox */}
                <button
                  onClick={() => toggleChecklistTask(task.id)}
                  className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                    task.isCompleted
                      ? 'bg-[#f5764b] border-[#f5764b] text-white shadow-xs'
                      : 'border-gray-300 hover:border-[#f5764b] bg-white'
                  }`}
                  title={task.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                >
                  {task.isCompleted && <CheckSquare className="w-4 h-4 stroke-[2.5]" />}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 font-semibold'
                      }`}
                    >
                      {task.name}
                    </span>

                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 border border-gray-200/60">
                      {task.category}
                    </span>

                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-orange-50 text-[#e05a2b]">
                      {task.assignedRole}
                    </span>
                  </div>

                  {/* Completion or Warning note */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-0.5">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      Due by {task.dueTime}
                    </span>

                    {task.isCompleted && task.completedBy && (
                      <span className="flex items-center gap-1 text-green-700 font-medium">
                        <UserCheck className="w-3.5 h-3.5" />
                        Completed by {task.completedBy} {task.completedAt ? `at ${task.completedAt}` : ''}
                      </span>
                    )}

                    {task.reportedIssue && (
                      <span className="flex items-center gap-1 text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Issue: {task.reportedIssue}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pl-9 md:pl-0 shrink-0">
                {!task.reportedIssue ? (
                  <button
                    onClick={() => {
                      setIssueModalTask(task);
                      setIssueText('');
                    }}
                    className="text-xs px-2.5 py-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-gray-200/60 hover:border-red-200 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500" />
                    Report Issue
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIssueModalTask(task);
                      setIssueText(task.reportedIssue || '');
                    }}
                    className="text-xs px-2.5 py-1.5 text-red-700 bg-red-50 rounded-lg transition-colors border border-red-200 font-medium flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    Update Issue
                  </button>
                )}

                <button
                  onClick={() => toggleChecklistTask(task.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    task.isCompleted
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-orange-50 text-[#e05a2b] hover:bg-orange-100 border border-orange-200/60'
                  }`}
                >
                  {task.isCompleted ? 'Re-open' : 'Mark Done'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30  p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xs border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#f5764b]" />
              Add Checklist Task
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Add a recurring shift SOP or hygiene task to the operational board.
            </p>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Task Name / Description *
                </label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={e => setTaskName(e.target.value)}
                  placeholder="e.g. Inspect blast chiller temperature (Target < 3°C)"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Protocol Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={e => setTaskCategory(e.target.value as ChecklistTask['category'])}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    <option value="Opening Checklist">Opening Checklist</option>
                    <option value="Closing Checklist">Closing Checklist</option>
                    <option value="Kitchen Sanitation">Kitchen Sanitation</option>
                    <option value="Food Safety & Temp">Food Safety & Temp</option>
                    <option value="Cash Shift Closing">Cash Shift Closing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={taskRole}
                    onChange={e => setTaskRole(e.target.value as UserRole)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    <option value="Kitchen Staff">Kitchen Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Host / Waiter">Host / Waiter</option>
                    <option value="Restaurant Owner">Restaurant Owner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Target Due Time
                </label>
                <input
                  type="text"
                  value={taskDueTime}
                  onChange={e => setTaskDueTime(e.target.value)}
                  placeholder="e.g. 11:30 AM or Before Shift End"
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {issueModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30  p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xs border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Report Task Exception or Issue
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Task: <strong className="text-gray-800">{issueModalTask.name}</strong>
            </p>

            <form onSubmit={handleReportIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Issue / Deviation Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={issueText}
                  onChange={e => setIssueText(e.target.value)}
                  placeholder="e.g. Deep freezer reading 4°C above target. Contacted HVAC technician."
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIssueModalTask(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-sm"
                >
                  Log Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
