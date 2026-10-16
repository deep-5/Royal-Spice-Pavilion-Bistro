import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  UtensilsCrossed,
  Shield,
  ArrowRight,
  User,
  Lock,
  Building2,
  ChefHat,
  CreditCard,
  Calculator,
  UserCheck
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginAs } = useApp();

  const [email, setEmail] = useState('vikram@royalspice.com');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Restaurant Owner');

  const demoPersonas: {
    role: UserRole;
    name: string;
    email: string;
    description: string;
    icon: any;
  }[] = [
    {
      role: 'Restaurant Owner',
      name: 'Vikram Singhania',
      email: 'vikram@royalspice.com',
      description: 'Full administrative access across all modules, financials, and configurations',
      icon: Shield
    },
    {
      role: 'Manager',
      name: 'Rajesh Malhotra',
      email: 'rajesh@royalspice.com',
      description: 'Daily operations, table bookings, inventory, supplier POs, and staff scheduling',
      icon: Building2
    },
    {
      role: 'Cashier',
      name: 'Sunita Rao',
      email: 'sunita@royalspice.com',
      description: 'Touch POS terminal, bill generation, UPI payments, and cash shift closing',
      icon: CreditCard
    },
    {
      role: 'Kitchen Staff',
      name: 'Chef Harpal Singh',
      email: 'harpal@royalspice.com',
      description: 'Kitchen Display System (KDS), ticket timing, recipes, and delay reporting',
      icon: ChefHat
    },
    {
      role: 'Host / Waiter',
      name: 'Rohan Mehta',
      email: 'rohan@royalspice.com',
      description: 'Table seating, waitlist queue, guest reservations, and floor plan monitoring',
      icon: UserCheck
    },
    {
      role: 'Accountant',
      name: 'Kavita Joshi',
      email: 'kavita@royalspice.com',
      description: 'Profit & Loss, GST compliance, expense vouchers, and financial reports',
      icon: Calculator
    }
  ];

  const handleSelectPersona = (persona: (typeof demoPersonas)[0]) => {
    setSelectedRole(persona.role);
    setEmail(persona.email);
    setPassword('••••••••');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(selectedRole);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo & Name */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#f5764b] text-white mb-3">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">
          Royal Spice Pavilion & Bistro
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Restaurant Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-xl border border-gray-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 text-center">
              Select Staff Persona or Sign In
            </h2>
            <p className="text-xs text-gray-500 text-center mt-1">
              Choose an authorized role to test the role-gated operational workflows.
            </p>
          </div>

          {/* Persona Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoPersonas.map(persona => {
              const Icon = persona.icon;
              const isSelected = selectedRole === persona.role;

              return (
                <button
                  type="button"
                  key={persona.role}
                  onClick={() => handleSelectPersona(persona)}
                  className={`p-3.5 rounded-lg border text-left transition-colors relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#f5764b] bg-orange-50/30'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-7 h-7 rounded flex items-center justify-center ${isSelected ? 'bg-[#f5764b] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">
                        {persona.role}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-xs">{persona.name}</h3>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                      {persona.description}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-gray-400 mt-2 pt-2 border-t border-gray-100 block">
                    {persona.email}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form Action */}
          <form onSubmit={handleFormSubmit} className="pt-4 border-t border-gray-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -trangray-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#f5764b] text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -trangray-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#f5764b] text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-gray-500">
                Signing in as: <strong className="text-gray-900">{selectedRole}</strong>
              </span>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-[#f5764b] hover:bg-[#e05a2b] text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Sign In to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
