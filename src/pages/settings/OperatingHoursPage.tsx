import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Save,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Trash2,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const OperatingHoursPage: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [hours, setHours] = useState(settings.operatingHours);
  const [minAdvanceMinutes, setMinAdvanceMinutes] = useState(60);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [defaultDurationMinutes, setDefaultDurationMinutes] = useState(90);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Holiday closures list
  const [holidays, setHolidays] = useState<{ id: string; name: string; date: string }[]>([
    { id: 'h1', name: 'Diwali Festival (Evening)', date: '2026-11-08' },
    { id: 'h2', name: 'Holi Festival (Full Day)', date: '2026-03-04' }
  ]);

  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  const handleTimeChange = (index: number, field: 'open' | 'close', value: string) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
  };

  const handleToggleClosed = (index: number) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], isClosed: !updated[index].isClosed };
    setHours(updated);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName.trim() || !holidayDate) return;

    setHolidays([...holidays, { id: `h-${Date.now()}`, name: holidayName.trim(), date: holidayDate }]);
    setHolidayName('');
    setHolidayDate('');
  };

  const handleRemoveHoliday = (id: string) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  const handleSave = () => {
    updateSettings({ operatingHours: hours });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-[#f5764b]" />
            Operating Hours & Booking Schedule
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Weekly dining service hours, online reservation cutoff rules, and scheduled festival closures
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Operating schedule updated!
          </div>
        )}
      </div>

      {/* Weekly Hours Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Weekly Service Schedule</h3>
            <p className="text-xs text-gray-500">Defines operating hours for kitchen dispatch and online reservation booking</p>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Schedule
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {hours.map((item, idx) => (
            <div key={item.day} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50">
              <div className="w-32">
                <span className="text-sm font-bold text-gray-900">{item.day}</span>
              </div>

              <div className="flex items-center gap-3 flex-1">
                {item.isClosed ? (
                  <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    Closed All Day
                  </span>
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Opens:</span>
                    <input
                      type="text"
                      value={item.open}
                      onChange={e => handleTimeChange(idx, 'open', e.target.value)}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-[#f5764b] w-24 text-center"
                    />
                    <span className="text-gray-400">to</span>
                    <span className="text-gray-500">Closes:</span>
                    <input
                      type="text"
                      value={item.close}
                      onChange={e => handleTimeChange(idx, 'close', e.target.value)}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-[#f5764b] w-24 text-center"
                    />
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleToggleClosed(idx)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    item.isClosed
                      ? 'bg-orange-50 text-[#e05a2b] hover:bg-orange-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.isClosed ? 'Mark Open' : 'Mark Closed'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Cutoff Rules */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#f5764b]" />
          Online Reservation Constraints & Cutoffs
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Min Advance Notice
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={minAdvanceMinutes}
                onChange={e => setMinAdvanceMinutes(Number(e.target.value))}
                className="w-full text-sm font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
              <span className="text-xs text-gray-500">min</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Prevents last-second walk-in clashes</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Max Booking Horizon
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={maxAdvanceDays}
                onChange={e => setMaxAdvanceDays(Number(e.target.value))}
                className="w-full text-sm font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
              <span className="text-xs text-gray-500">days</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">How far ahead guests can reserve</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Default Seating Slot
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={30}
                value={defaultDurationMinutes}
                onChange={e => setDefaultDurationMinutes(Number(e.target.value))}
                className="w-full text-sm font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
              <span className="text-xs text-gray-500">min</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Assumed dining duration per table</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              No-show Grace Window
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                value={gracePeriodMinutes}
                onChange={e => setGracePeriodMinutes(Number(e.target.value))}
                className="w-full text-sm font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
              <span className="text-xs text-gray-500">min</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Before table is released to waitlist</p>
          </div>
        </div>
      </div>

      {/* Holiday Closures */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          Scheduled Holiday Closures & Maintenance
        </h3>

        <form onSubmit={handleAddHoliday} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={holidayName}
            onChange={e => setHolidayName(e.target.value)}
            placeholder="Holiday / Event Name (e.g. Annual Staff Party)"
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          />

          <input
            type="date"
            required
            value={holidayDate}
            onChange={e => setHolidayDate(e.target.value)}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-[#f5764b] text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors shrink-0 flex items-center gap-1.5 justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Holiday
          </button>
        </form>

        <div className="divide-y divide-gray-100">
          {holidays.map(h => (
            <div key={h.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-gray-800">{h.name}</span>
                <span className="text-gray-400 ml-2">({h.date})</span>
              </div>
              <button
                onClick={() => handleRemoveHoliday(h.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
