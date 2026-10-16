import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Grid,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
  Users,
  Settings2,
  Check
} from 'lucide-react';

export const FloorSettingsPage: React.FC = () => {
  const { tables, addAuditLog } = useApp();

  const [sections, setSections] = useState<string[]>([
    'Indoor',
    'Outdoor Terrace',
    'Bar Lounge',
    'Private Dining'
  ]);

  const [newSection, setNewSection] = useState('');
  const [turnaroundMinutes, setTurnaroundMinutes] = useState(75);
  const [allowMerges, setAllowMerges] = useState(true);
  const [allowSplits, setAllowSplits] = useState(true);
  const [requireManagerOverride, setRequireManagerOverride] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSection.trim() || sections.includes(newSection.trim())) return;

    setSections([...sections, newSection.trim()]);
    setNewSection('');
  };

  const handleRemoveSection = (sec: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter(s => s !== sec));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addAuditLog('Settings', 'Update Floor Settings', 'floor', 'Updated dining floor sections and capacity constraints');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-7 h-7 text-[#f5764b]" />
            Floor Plan & Table Layout Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dining room zones, table merge rules, turnaround duration benchmarks, and capacity overrides
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Floor settings updated!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Floor Sections Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#f5764b]" />
            Active Floor Sections & Zones
          </h3>
          <p className="text-xs text-gray-500">
            Define seating areas available on the visual floor plan and reservation intake form.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {sections.map(sec => {
              const tableCount = tables.filter(t => t.section === sec).length;
              const totalCap = tables
                .filter(t => t.section === sec)
                .reduce((s, t) => s + t.capacity, 0);

              return (
                <div
                  key={sec}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{sec}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tableCount} tables · {totalCap} total covers
                    </p>
                  </div>

                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sec)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add section form */}
          <div className="pt-2 flex gap-2">
            <input
              type="text"
              value={newSection}
              onChange={e => setNewSection(e.target.value)}
              placeholder="New section name (e.g. Rooftop Gazebo, Banquet Hall)..."
              className="flex-1 text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
            />
            <button
              type="button"
              onClick={handleAddSection}
              className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Zone
            </button>
          </div>
        </div>

        {/* Operational Constraints */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-[#f5764b]" />
            Floor Operations & Table Merging Rules
          </h3>

          <div className="space-y-4 divide-y divide-gray-100">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Standard Dining Turnaround Duration</h4>
                <p className="text-xs text-gray-500">Benchmark time allocated per seated table before turnaround warnings</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={30}
                  max={240}
                  value={turnaroundMinutes}
                  onChange={e => setTurnaroundMinutes(Number(e.target.value))}
                  className="w-20 text-sm font-semibold px-2 py-1.5 border border-gray-200 rounded-lg text-center"
                />
                <span className="text-xs text-gray-500">minutes</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Allow Table Merging on Floor Plan</h4>
                <p className="text-xs text-gray-500">Enables hosts to combine two adjacent tables for large parties</p>
              </div>
              <input
                type="checkbox"
                checked={allowMerges}
                onChange={e => setAllowMerges(e.target.checked)}
                className="w-4 h-4 text-[#f5764b] rounded border-gray-300 focus:ring-[#f5764b] cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Allow Table Splitting</h4>
                <p className="text-xs text-gray-500">Enables reverting previously combined tables back to standalone</p>
              </div>
              <input
                type="checkbox"
                checked={allowSplits}
                onChange={e => setAllowSplits(e.target.checked)}
                className="w-4 h-4 text-[#f5764b] rounded border-gray-300 focus:ring-[#f5764b] cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Require Manager Override for Overcapacity</h4>
                <p className="text-xs text-gray-500">Prompts authorization if seating a party exceeding designated table capacity</p>
              </div>
              <input
                type="checkbox"
                checked={requireManagerOverride}
                onChange={e => setRequireManagerOverride(e.target.checked)}
                className="w-4 h-4 text-[#f5764b] rounded border-gray-300 focus:ring-[#f5764b] cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-[#e05a2b]/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Floor Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
