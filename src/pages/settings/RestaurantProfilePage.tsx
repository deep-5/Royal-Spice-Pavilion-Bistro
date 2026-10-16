import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Save,
  CheckCircle2,
  Building,
  Phone,
  Mail,
  Receipt,
  Globe,
  Clock,
  Sparkles
} from 'lucide-react';

export const RestaurantProfilePage: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [formData, setFormData] = useState({
    name: settings.name,
    slogan: settings.slogan,
    logo: settings.logo,
    gstin: settings.gstin,
    address: settings.address,
    city: settings.city,
    phone: settings.phone,
    email: settings.email,
    currency: settings.currency,
    currencySymbol: settings.currencySymbol,
    timezone: settings.timezone
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Store className="w-7 h-7 text-[#f5764b]" />
            Restaurant Brand & Profile Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            General establishment details, legal tax GSTIN, currency localization, and receipt branding
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Profile updated successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {/* Basic Brand Identity */}
        <div className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#f5764b]" />
            Establishment Identity & Branding
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Legal Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tagline / Brand Slogan
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                GSTIN / Tax Identification Number *
              </label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full text-sm font-mono px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Printed on all customer tax invoices</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Brand Logo URL
              </label>
              <input
                type="text"
                value={formData.logo}
                onChange={e => setFormData({ ...formData, logo: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
            </div>
          </div>
        </div>

        {/* Contact & Physical Location */}
        <div className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#f5764b]" />
            Contact & Headquarters Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Official Reservation Phone *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Official Business Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                City / State *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              />
            </div>
          </div>
        </div>

        {/* Currency & Localization */}
        <div className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#f5764b]" />
            Regional Currency & Timezone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Operating Currency
              </label>
              <select
                value={formData.currency}
                onChange={e => {
                  const curr = e.target.value;
                  const sym = curr === 'INR' ? '₹' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : 'AED ';
                  setFormData({ ...formData, currency: curr, currencySymbol: sym });
                }}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b] font-semibold"
              >
                <option value="INR">Indian Rupee (INR ₹)</option>
                <option value="USD">US Dollar (USD $)</option>
                <option value="EUR">Euro (EUR €)</option>
                <option value="GBP">British Pound (GBP £)</option>
                <option value="AED">UAE Dirham (AED)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                readOnly
                value={formData.currencySymbol}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg bg-gray-50 font-bold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                System Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#f5764b]"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="America/New_York">America/New York (EST/EDT)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer save */}
        <div className="p-6 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Changes will take effect immediately across all POS stations and bills.
          </p>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-xl text-sm font-semibold shadow-sm transition-all shadow-[#e05a2b]/20"
          >
            <Save className="w-4 h-4" />
            Save Profile Settings
          </button>
        </div>
      </form>
    </div>
  );
};
