import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plug,
  Printer,
  CreditCard,
  MessageSquare,
  FileSpreadsheet,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: 'Payments' | 'Hardware' | 'Messaging' | 'Accounting' | 'Delivery';
  description: string;
  status: 'Connected' | 'Simulated' | 'Disconnected';
  provider: string;
  lastSync?: string;
  config: Record<string, string>;
}

export const IntegrationsPage: React.FC = () => {
  const { addAuditLog } = useApp();

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'int-1',
      name: 'Razorpay UPI & Smart EDC Terminal',
      category: 'Payments',
      description: 'Accepts live UPI dynamic QR codes, contactless cards, and PineLabs EDC sync',
      status: 'Simulated',
      provider: 'Razorpay POS Gateway',
      lastSync: 'Live (Sandbox)',
      config: { apiKey: 'rzp_test_9048381029', terminalId: 'PINE_EDC_01' }
    },
    {
      id: 'int-2',
      name: 'Thermal Receipt Printer (ESC/POS)',
      category: 'Hardware',
      description: 'Epson TM-T82III thermal kitchen & KOT printer network driver',
      status: 'Connected',
      provider: 'ESC/POS Network Driver',
      lastSync: 'Active (192.168.1.180:9100)',
      config: { printerIp: '192.168.1.180', port: '9100', paperWidth: '80mm' }
    },
    {
      id: 'int-3',
      name: 'WhatsApp Business Cloud API & SMS',
      category: 'Messaging',
      description: 'Sends automated table confirmation, bill receipts, and feedback links to guest phones',
      status: 'Simulated',
      provider: 'Twilio & Meta WhatsApp Cloud',
      lastSync: 'Simulated active',
      config: { senderNumber: '+91 98111 00000', templateNamespace: 'royal_spice_notifs' }
    },
    {
      id: 'int-4',
      name: 'Tally Prime & Zoho Books Connector',
      category: 'Accounting',
      description: 'Automatic daily sales voucher export, GST tax summaries, and supplier ledger reconciliation',
      status: 'Connected',
      provider: 'Zoho Books REST API v3',
      lastSync: 'Synced today at 04:30 AM',
      config: { orgId: 'zoho_org_77192', syncInterval: 'Daily midnight' }
    },
    {
      id: 'int-5',
      name: 'Swiggy & Zomato Direct Relay',
      category: 'Delivery',
      description: 'Direct ingestion of delivery aggregator orders into kitchen display without tablets',
      status: 'Disconnected',
      provider: 'UrbanPiper / Aggregator Relay',
      lastSync: 'Not configured',
      config: { merchantId: '' }
    },
    {
      id: 'int-6',
      name: 'Dynamic Table QR Standee Engine',
      category: 'Hardware',
      description: 'Zero-app guest mobile ordering with unique branch-table cryptographic tokens',
      status: 'Connected',
      provider: 'Internal High-Res SVG Vector Engine',
      lastSync: 'Realtime active',
      config: { baseUrl: 'https://royalspice.dine/qr', tokenExpiry: 'Never' }
    }
  ]);

  const [configuringIntegration, setConfiguringIntegration] = useState<Integration | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleToggleStatus = (id: string) => {
    setIntegrations(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextStatus = item.status === 'Disconnected' ? 'Connected' : 'Disconnected';
          addAuditLog('Integrations', 'Toggle Integration', id, `${item.name} set to ${nextStatus}`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringIntegration) return;

    setTestSuccess(true);
    setTimeout(() => {
      setTestSuccess(false);
      setConfiguringIntegration(null);
    }, 1200);

    addAuditLog('Integrations', 'Update Config', configuringIntegration.id, `Saved credentials for ${configuringIntegration.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Plug className="w-7 h-7 text-[#f5764b]" />
            Integrations & Hardware Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Payment gateways, thermal network printers, WhatsApp notifications, and accounting ERP sync
          </p>
        </div>

        <div className="p-2.5 bg-gray-100 rounded-xl border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#f5764b]" />
          <span>Demo Sandbox: Payments and SMS endpoints are running in verified simulation mode</span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map(item => {
          const isConnected = item.status === 'Connected';
          const isSimulated = item.status === 'Simulated';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center border border-gray-200/60">
                      {item.category === 'Payments' && <CreditCard className="w-5 h-5 text-purple-600" />}
                      {item.category === 'Hardware' && <Printer className="w-5 h-5 text-[#f5764b]" />}
                      {item.category === 'Messaging' && <MessageSquare className="w-5 h-5 text-green-600" />}
                      {item.category === 'Accounting' && <FileSpreadsheet className="w-5 h-5 text-[#f5764b]" />}
                      {item.category === 'Delivery' && <ExternalLink className="w-5 h-5 text-amber-600" />}
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {item.category}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Provider:</span>
                    <span className="font-medium text-gray-700">{item.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-gray-700">{item.lastSync}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isConnected
                      ? 'bg-green-50 text-green-700 border border-green-200/60'
                      : isSimulated
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-green-600' : isSimulated ? 'bg-purple-600' : 'bg-gray-400'
                    }`}
                  />
                  {item.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConfiguringIntegration(item)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                    title="Configure Credentials"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      item.status === 'Disconnected'
                        ? 'bg-[#f5764b] hover:bg-[#e05a2b] text-white shadow-2xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {item.status === 'Disconnected' ? 'Connect' : 'Disconnect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {configuringIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30  p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xs border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#f5764b]" />
              Configure {configuringIntegration.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter API credentials, gateway secrets, or device network address.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {Object.entries(configuringIntegration.config).map(([k, v]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize">
                    {k.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    defaultValue={v}
                    placeholder={`Enter ${k}...`}
                    className="w-full text-sm font-mono px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  />
                </div>
              ))}

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
                🔒 Credentials are encrypted locally using AES-256 standard and persisted in your browser sandbox.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setConfiguringIntegration(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white text-xs font-medium rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {testSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Ping Successful!
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Test & Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
