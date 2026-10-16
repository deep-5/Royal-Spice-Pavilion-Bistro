import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Percent,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const TaxSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [taxRate, setTaxRate] = useState(settings.defaultTaxRate);
  const [serviceChargeRate, setServiceChargeRate] = useState(settings.serviceChargeRate);
  const [isServiceChargeEnabled, setIsServiceChargeEnabled] = useState(settings.isServiceChargeEnabled);
  const [alcoholTaxRate, setAlcoholTaxRate] = useState(18);
  const [enableAlcoholTax, setEnableAlcoholTax] = useState(false);
  const [roundOffBills, setRoundOffBills] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live bill simulation for ₹1000 subtotal
  const simSubtotal = 1000;
  const simTax = (simSubtotal * taxRate) / 100;
  const simCgst = simTax / 2;
  const simSgst = simTax / 2;
  const simServiceCharge = isServiceChargeEnabled ? (simSubtotal * serviceChargeRate) / 100 : 0;
  const simGross = simSubtotal + simTax + simServiceCharge;
  const simFinal = roundOffBills ? Math.round(simGross) : simGross;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultTaxRate: taxRate,
      serviceChargeRate,
      isServiceChargeEnabled
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-[#f5764b]" />
            Tax & Service Charge Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Goods & Services Tax (GST) slabs, CGST/SGST apportionment, and restaurant service charge rules
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Tax settings updated!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Form Controls */}
          <div className="md:col-span-7 space-y-6">
            {/* Standard GST Rates */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#f5764b]" />
                Standard Restaurant GST Rate
              </h3>
              <p className="text-xs text-gray-500">
                Governed by Indian Ministry of Finance restaurant GST notification.
              </p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Applicable Food & Beverage GST Rate (%)
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="flex-1 text-sm font-semibold px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                  >
                    <option value={5}>5% (Standard Restaurant Service - 2.5% CGST + 2.5% SGST)</option>
                    <option value={12}>12% (Hotel Room Dining Service)</option>
                    <option value={18}>18% (Outdoor Catering / Banqueting)</option>
                    <option value={0}>0% (Tax Exempt / Non-GST Establishment)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono font-semibold">{(taxRate / 2).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>State / UT GST (SGST):</span>
                  <span className="font-mono font-semibold">{(taxRate / 2).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Service Charge Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Hospitality Service Charge</h3>
                  <p className="text-xs text-gray-500">Discretionary staff welfare charge added to dine-in orders</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isServiceChargeEnabled}
                    onChange={e => setIsServiceChargeEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:trangray-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f5764b]"></div>
                </label>
              </div>

              {isServiceChargeEnabled && (
                <div className="space-y-3 pt-2 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Service Charge Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      step={0.5}
                      value={serviceChargeRate}
                      onChange={e => setServiceChargeRate(Number(e.target.value))}
                      className="w-full text-sm font-semibold px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    ℹ️ <strong>CCPA Advisory:</strong> As per Central Consumer Protection Authority guidelines, service charge is voluntary. Diners may request waiver prior to bill settlement.
                  </div>
                </div>
              )}
            </div>

            {/* Billing Rounding */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Round Off Total to Nearest Integer</h4>
                <p className="text-xs text-gray-500">Eliminates paise friction in cash transactions (e.g. ₹1052.40 → ₹1052)</p>
              </div>
              <input
                type="checkbox"
                checked={roundOffBills}
                onChange={e => setRoundOffBills(e.target.checked)}
                className="w-4 h-4 text-[#f5764b] rounded border-gray-300 focus:ring-[#f5764b] cursor-pointer"
              />
            </div>
          </div>

          {/* Right Column: Live Bill Calculation Simulator */}
          <div className="md:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 sticky top-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#f5764b]" />
                Live Guest Bill Simulator
              </h3>
              <p className="text-xs text-gray-500">
                Visual preview of how a guest bill of ₹{simSubtotal.toLocaleString('en-IN')} is computed and itemized.
              </p>

              <div className="bg-gray-50 p-4 rounded-xl font-mono text-xs space-y-2.5 border border-gray-200/60">
                <div className="flex justify-between text-gray-600">
                  <span>Food & Beverage Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{simSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>CGST @ {(taxRate / 2).toFixed(1)}%:</span>
                  <span>+₹{simCgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>SGST @ {(taxRate / 2).toFixed(1)}%:</span>
                  <span>+₹{simSgst.toFixed(2)}</span>
                </div>

                {isServiceChargeEnabled && (
                  <div className="flex justify-between text-gray-600">
                    <span>Service Charge @ {serviceChargeRate}%:</span>
                    <span>+₹{simServiceCharge.toFixed(2)}</span>
                  </div>
                )}

                {roundOffBills && simGross !== simFinal && (
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>Round-off adjustment:</span>
                    <span>{simFinal > simGross ? '+' : ''}{(simFinal - simGross).toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-orange-950">
                  <span>Final Amount Payable:</span>
                  <span className="text-base">₹{simFinal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-[#e05a2b]/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Tax & Surcharge Rules
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
