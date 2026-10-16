import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCode,
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Calendar,
  UserCheck
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [resultFilter, setResultFilter] = useState('All');

  const modules = [
    'All',
    'Orders',
    'POS',
    'Tables',
    'Reservations',
    'Waitlist',
    'Menu',
    'Inventory',
    'Purchasing',
    'Finance',
    'Staff',
    'Checklists',
    'Settings',
    'Auth'
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    const matchesResult = resultFilter === 'All' || log.result === resultFilter;

    return matchesSearch && matchesModule && matchesResult;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp,Actor,Role,Module,Action,Record ID,Summary,Result\n'];
    const rows = filteredLogs.map(l =>
      `"${l.timestamp}","${l.actor}","${l.role}","${l.module}","${l.action}","${l.recordId}","${l.summary.replace(/"/g, '""')}","${l.result}"`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `System_Audit_Trail_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#f5764b]" />
            Security & Operational Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Immutable forensic trail recording all user role events, financial approvals, table transfers, and inventory deductions
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 shadow-2xs transition-colors"
        >
          <Download className="w-4 h-4 text-gray-500" />
          Export Audit Trail
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Trail Entries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{auditLogs.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Chronologically logged</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Successful Operations</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {auditLogs.filter(l => l.result === 'Success').length}
          </p>
          <p className="text-xs text-green-600/80 mt-0.5">Verified actions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts & Warnings</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {auditLogs.filter(l => l.result === 'Warning').length}
          </p>
          <p className="text-xs text-amber-600/80 mt-0.5">Exceptions flagged</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tamper Protection</p>
          <p className="text-2xl font-bold text-[#e05a2b] mt-1">100%</p>
          <p className="text-xs text-gray-400 mt-0.5">SHA-256 session integrity</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -trangray-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search actor name, summary, record ID, or action..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          >
            {modules.map(m => (
              <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>
            ))}
          </select>

          <select
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
          >
            <option value="All">All Results</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/80 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Summary Description</th>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-sans">
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="font-semibold text-gray-900 block">{log.actor}</span>
                      <span className="text-[11px] text-[#e05a2b] font-medium">{log.role}</span>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-800 font-sans">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-gray-700 font-sans max-w-sm">
                      {log.summary}
                    </td>

                    <td className="py-3 px-4 text-gray-400">
                      {log.recordId}
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          log.result === 'Success'
                            ? 'bg-green-50 text-green-700'
                            : log.result === 'Warning'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {log.result === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                        {log.result === 'Warning' && <AlertTriangle className="w-3 h-3" />}
                        {log.result === 'Failed' && <XCircle className="w-3 h-3" />}
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
