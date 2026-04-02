import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../utils/cn';

const PAGE_META = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Financial overview & real-time metrics',
  },
  '/records': {
    title: 'Transactions',
    subtitle: 'Manage and audit financial records',
  },
  '/analytics': {
    title: 'Analytics',
    subtitle: 'Advanced data insights & trends',
  },
  '/users': {
    title: 'Team Management',
    subtitle: 'User roles & access control',
  },
};

const Topbar = ({ onOpenSidebar }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const page = useMemo(() => PAGE_META[location.pathname] ?? PAGE_META['/dashboard'], [location.pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{page.title}</h1>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{page.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 lg:max-w-md">
          <div className="group relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
            <input
              type="text"
              placeholder="Search anything..."
              className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/50 pl-10 pr-4 text-sm transition-all focus:border-indigo-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-50 hover:text-indigo-600">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border-2 border-white bg-indigo-500" />
          </button>
          
          <div className="h-6 w-px bg-slate-200 mx-2" />

          <div className="flex items-center gap-3 pl-2">
             <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-slate-400 leading-none">{user?.role}</p>
             </div>
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold shadow-sm">
                {user?.name?.charAt(0) || "U"}
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

