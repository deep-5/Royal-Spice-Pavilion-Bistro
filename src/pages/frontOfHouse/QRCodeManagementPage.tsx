import React, { useState } from 'react';
import {
  QrCode,
  Download,
  Printer,
  RotateCcw,
  Eye,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Table } from '../../types';

interface QRCodeManagementPageProps {
  onNavigate: (pageId: string) => void;
  onOpenCustomerQR: (tableId: string) => void;
}

export const QRCodeManagementPage: React.FC<QRCodeManagementPageProps> = ({ onNavigate, onOpenCustomerQR }) => {
  const { tables, settings, currentBranch } = useApp();

  const [selectedTable, setSelectedTable] = useState<Table | null>(tables[0] || null);
  const [standeePrintModalOpen, setStandeePrintModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Simulated SVG QR Code generator
  const renderSVGQRCode = (tableNumber: string) => {
    return (
      <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="white" />
        {/* Finder pattern Top-Left */}
        <rect x="10" y="10" width="24" height="24" fill="#0d9488" rx="2" />
        <rect x="14" y="14" width="16" height="16" fill="white" />
        <rect x="18" y="18" width="8" height="8" fill="#0d9488" />

        {/* Finder pattern Top-Right */}
        <rect x="66" y="10" width="24" height="24" fill="#0d9488" rx="2" />
        <rect x="70" y="14" width="16" height="16" fill="white" />
        <rect x="74" y="18" width="8" height="8" fill="#0d9488" />

        {/* Finder pattern Bottom-Left */}
        <rect x="10" y="66" width="24" height="24" fill="#0d9488" rx="2" />
        <rect x="14" y="70" width="16" height="16" fill="white" />
        <rect x="18" y="74" width="8" height="8" fill="#0d9488" />

        {/* Data modules */}
        <rect x="38" y="12" width="6" height="6" fill="#0f172a" />
        <rect x="48" y="16" width="6" height="6" fill="#0f172a" />
        <rect x="38" y="24" width="6" height="6" fill="#0f172a" />
        <rect x="52" y="24" width="6" height="6" fill="#0f172a" />
        <rect x="12" y="42" width="6" height="6" fill="#0f172a" />
        <rect x="22" y="46" width="6" height="6" fill="#0f172a" />
        <rect x="38" y="40" width="24" height="20" fill="#0f172a" rx="1" />
        <rect x="44" y="46" width="12" height="8" fill="white" />
        <text x="50" y="52" fontSize="5" fontWeight="bold" fill="#0d9488" textAnchor="middle" dominantBaseline="middle">
          {tableNumber}
        </text>

        <rect x="70" y="42" width="6" height="6" fill="#0f172a" />
        <rect x="82" y="48" width="6" height="6" fill="#0f172a" />
        <rect x="38" y="66" width="6" height="6" fill="#0f172a" />
        <rect x="48" y="72" width="6" height="6" fill="#0f172a" />
        <rect x="66" y="68" width="6" height="6" fill="#0f172a" />
        <rect x="78" y="74" width="6" height="6" fill="#0f172a" />
        <rect x="84" y="84" width="6" height="6" fill="#0f172a" />
      </svg>
    );
  };

  const handleDownloadSVG = (table: Table) => {
    alert(`Downloading QR code asset for Table ${table.number} (${settings.name} - ${currentBranch.name})`);
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Table QR Code Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Generate, print table standees, and manage secure session QR codes for contactless ordering
          </p>
        </div>

        <button
          onClick={() => {
            if (selectedTable) {
              onOpenCustomerQR(selectedTable.id);
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#f5764b] hover:bg-[#e05a2b] rounded-lg shadow-2xs transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          <span>Launch Customer QR Experience</span>
        </button>
      </div>

      {/* Grid of Tables with QR Code previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 no-print">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{table.number}</h3>
                  <p className="text-[11px] text-gray-500">{table.section} • {table.capacity}p</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  Active QR
                </span>
              </div>

              {/* QR Code graphic */}
              <div className="my-4 p-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                {renderSVGQRCode(table.number)}
              </div>

              <p className="text-[10px] text-gray-400 font-mono text-center">
                Session ID: QR-SEC-{table.id.toUpperCase()}-2026
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedTable(table);
                  setStandeePrintModalOpen(true);
                }}
                className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Standee</span>
              </button>
              <button
                onClick={() => onOpenCustomerQR(table.id)}
                className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-950 rounded font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Menu</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Standee Preview / Modal */}
      {standeePrintModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 ">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Action Bar (no-print) */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 no-print">
              <span className="text-xs font-bold text-gray-800">Print Table Standee</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintStandee}
                  className="px-3 py-1 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Card
                </button>
                <button
                  onClick={() => setStandeePrintModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Table Tent Card */}
            <div className="p-8 text-center bg-white text-gray-900 border-4 border-[#f5764b] m-4 rounded-2xl print-area">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold uppercase tracking-wider text-orange-950">
                  {settings.name}
                </h2>
                <p className="text-xs text-gray-500 font-medium">{currentBranch.name}</p>
              </div>

              <div className="my-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 inline-block shadow-inner">
                {renderSVGQRCode(selectedTable.number)}
              </div>

              <div className="space-y-1.5">
                <div className="inline-block px-4 py-1 rounded-full bg-orange-50 border border-orange-300 text-orange-950 font-black text-sm">
                  TABLE {selectedTable.number}
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-2">
                  Scan to Order & Pay
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Open your camera to browse our live digital menu, order gourmet food directly to your table, and request your bill.
                </p>
                <div className="pt-3 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  No App Download Required • Free High Speed WiFi
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
