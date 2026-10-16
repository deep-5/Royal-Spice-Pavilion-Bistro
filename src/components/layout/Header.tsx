import React, { useState } from 'react';
import {
  Menu,
  Search,
  Calendar,
  Bell,
  Plus,
  Shield,
  Clock,
  ChevronDown,
  Building2,
  RotateCcw,
  LogOut,
  Utensils,
  Receipt,
  TableProperties,
  CircleDollarSign,
  BarChart3,
  CheckCircle2,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onNavigate: (pageId: string) => void;
  onOpenQuickAction: (actionType: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSearch,
  onOpenNotifications,
  onNavigate,
  onOpenQuickAction,
  isSidebarCollapsed,
  onToggleCollapse
}) => {
  const {
    settings,
    branches,
    currentBranchId,
    setCurrentBranchId,
    currentBranch,
    currentUser,
    currentRole,
    loginAs,
    dateFilter,
    setDateFilter,
    notifications,
    staff,
    clockIn,
    clockOut,
    resetToDemoData
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roles: UserRole[] = [
    'Restaurant Owner',
    'Manager',
    'Cashier',
    'Kitchen Staff',
    'Host / Waiter',
    'Accountant'
  ];

  const currentStaffMember = staff.find(s => s.role === currentRole);
  const isClockedIn = currentStaffMember?.currentAttendanceStatus === 'Clocked In';

  const handleClockToggle = () => {
    if (!currentStaffMember) return;
    if (isClockedIn) {
      clockOut(currentStaffMember.id);
      alert(`${currentStaffMember.name} has clocked out.`);
    } else {
      clockIn(currentStaffMember.id);
      alert(`${currentStaffMember.name} has clocked in.`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Toggle & Branch Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              onToggleSidebar();
            } else if (onToggleCollapse) {
              onToggleCollapse();
            }
          }}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title={isSidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-gray-700 hover:text-[#F5764B] transition-colors" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700 hover:text-[#F5764B] transition-colors" />
          )}
        </button>

        {/* Branch Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-[#f5764b]/50 bg-gray-50/80 hover:bg-white text-xs font-bold text-gray-800 transition-all shadow-2xs"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[#f5764b]">
              <Building2 className="w-3 h-3" />
            </span>
            <span className="hidden sm:inline text-gray-400 font-semibold">{settings.name}:</span>
            <span className="truncate max-w-[130px] text-gray-900 font-extrabold">{currentBranch.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showBranchMenu && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white shadow-lg border border-gray-100 py-2 z-40 animate-fade-in">
              <div className="px-3.5 py-1.5 border-b border-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Select Restaurant Branch
              </div>
              {branches.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setCurrentBranchId(b.id);
                    setShowBranchMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    b.id === currentBranchId ? 'font-bold text-[#f5764b] bg-orange-50/60' : 'text-gray-700'
                  }`}
                >
                  <div>
                    <p className="font-bold text-gray-900">{b.name}</p>
                    <p className="text-[10px] text-gray-400">{b.city} • {b.operatingHours}</p>
                  </div>
                  {b.id === currentBranchId && <CheckCircle2 className="w-4 h-4 text-[#f5764b]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Bar (Moniex Pill Style) */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50/90 hover:bg-white text-gray-400 hover:text-gray-700 hover:border-[#f5764b]/40 text-xs w-52 lg:w-72 transition-all shadow-2xs group"
        >
          <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#f5764b] transition-colors" />
          <span className="truncate font-medium">Type to search...</span>
          <kbd className="ml-auto px-2 py-0.5 rounded-full border border-gray-200 bg-white text-[10px] font-mono text-gray-400 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Date Filter, Role Switcher, Quick Actions, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Filter */}
        <div className="relative hidden lg:block">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#f5764b]"
          >
            <option value="Today">Date: Today</option>
            <option value="Yesterday">Date: Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors"
            title="Click to switch role and test permissions"
          >
            <Shield className="w-3.5 h-3.5 text-[#f5764b]" />
            <span className="hidden sm:inline font-semibold">{currentRole}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xs border border-gray-200 py-1.5 z-40">
              <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] font-bold uppercase text-gray-400">
                Switch Active Role
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    loginAs(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    r === currentRole ? 'font-bold text-[#f5764b] bg-orange-50' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${r === currentRole ? 'bg-[#f5764b]' : 'bg-gray-300'}`} />
                    <span>{r}</span>
                  </div>
                  {r === currentRole && <span className="text-[10px] text-[#f5764b] font-bold">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Staff Attendance Quick Clock In/Out */}
        {currentStaffMember && (
          <button
            onClick={handleClockToggle}
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              isClockedIn
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
            title={isClockedIn ? 'Click to Clock Out' : 'Click to Clock In'}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isClockedIn ? 'Clocked In' : 'Clock Out'}</span>
          </button>
        )}

        {/* Quick Action Button Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f5764b] hover:bg-[#e05a2b] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xs border border-gray-200 py-1.5 z-40">
              <button
                onClick={() => {
                  onOpenQuickAction('reservation');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>New Reservation</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('pos');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Receipt className="w-4 h-4 text-gray-500" />
                <span>Open POS Terminal</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAction('order');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Utensils className="w-4 h-4 text-gray-500" />
                <span>Add Order</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('floor-plan');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <TableProperties className="w-4 h-4 text-gray-500" />
                <span>Manage Tables</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAction('menu-item');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-gray-500" />
                <span>Add Menu Item</span>
              </button>
              <button
                onClick={() => {
                  onOpenQuickAction('expense');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <CircleDollarSign className="w-4 h-4 text-gray-500" />
                <span>Add Expense</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('sales-analytics');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span>View Analytics</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#f5764b]/20 transition-all"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xs border border-gray-200 py-2 z-40">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{currentUser.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-[#e05a2b] border border-orange-200">
                  {currentRole}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('settings-profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>Restaurant Settings</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all demo data back to clean factory state? Any changes made will be restored.')) {
                      resetToDemoData();
                      alert('Demo database reset successfully.');
                    }
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reset Demo Database</span>
                </button>
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch User</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
