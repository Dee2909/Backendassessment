import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart2, 
  Users, 
  X, 
  CreditCard,
  ChevronRight,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  
  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      description: 'Overview & metrics',
      icon: LayoutDashboard,
    },
    {
      path: '/records',
      label: 'Transactions',
      description: 'Records management',
      icon: FileText,
    },
  ];

  if (user?.role === 'Analyst' || user?.role === 'Admin') {
    navItems.push({
      path: '/analytics',
      label: 'Analytics',
      description: 'Data & trends',
      icon: BarChart2,
    });
  }

  if (user?.role === 'Admin') {
    navItems.push({
      path: '/users',
      label: 'Team',
      description: 'Access control',
      icon: Users,
    });
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:translate-x-0",
        open ? "translate-x-0 shadow-2xl shadow-slate-200/50" : "-translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex h-20 items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Finance<span className="text-indigo-600">Flow</span></h1>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        <div className="mb-4 px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Main Menu</p>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "group flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
              isActive 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.label}</p>
                </div>
                {isActive && (
                  <motion.div layoutId="active-pill" className="h-1.5 w-1.5 rounded-full bg-white/40" />
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="mt-8 mb-4 px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Settings</p>
        </div>
        <button className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all">
          <Bell className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-semibold">Notifications</span>
        </button>
        <button className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all">
          <Settings className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-semibold">Settings</span>
        </button>
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 uppercase font-bold text-indigo-600">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs font-medium text-slate-500 uppercase tracking-tighter">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

