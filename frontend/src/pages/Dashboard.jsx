import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Activity, 
  ArrowRight,
  ExternalLink,
  Shield,
  BarChart3,
  Users,
  FileText
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { formatCompactNumber, formatCurrency, formatDate } from '../utils/formatters';
import { cn } from '../utils/cn';

const MetricCard = ({ label, value, helper, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm ring-1 ring-slate-200/5"
  >
    <div className="flex items-center justify-between">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", colorClass)}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors hover:bg-slate-100">
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </div>
    </div>
    <div className="mt-6">
      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{value}</h3>
      <p className="mt-2 text-sm font-medium text-slate-500">{helper}</p>
    </div>
    {/* Decorative background shape */}
    <div className={cn("absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03]", colorClass)} />
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [userSummary, setUserSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const isAdmin = user?.role === 'Admin';
        const requests = [
          dashboardService.getSummary(),
          dashboardService.getRecent({ limit: 6 }),
          isAdmin ? userService.getSummary() : Promise.resolve({ data: null }),
        ];

        const [summaryRes, recentRes, usersRes] = await Promise.all(requests);

        if (!cancelled) {
          setSummary(summaryRes.data);
          setRecentRecords(recentRes.data);
          setUserSummary(usersRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          addToast({
            title: 'Unable to load dashboard',
            message: err.response?.data?.error || 'Please try again later.',
            tone: 'error',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();
    return () => { cancelled = true; };
  }, [addToast, user?.role]);

  if (loading) {
    return <LoadingState title="Generating insights" message="Syncing with the ledger and calculating balances..." />;
  }

  const metrics = [
    {
      label: 'Portfolio Income',
      value: formatCurrency(summary?.totalIncome ?? 0),
      icon: TrendingUp,
      colorClass: 'bg-emerald-50 text-emerald-600',
      helper: 'Lifetime total earnings',
    },
    {
      label: 'Operational Costs',
      value: formatCurrency(summary?.totalExpense ?? 0),
      icon: TrendingDown,
      colorClass: 'bg-rose-50 text-rose-600',
      helper: 'Aggregated expenditures',
    },
    {
      label: 'Net Treasury',
      value: formatCurrency(summary?.netBalance ?? 0),
      icon: Wallet,
      colorClass: 'bg-indigo-50 text-indigo-600',
      helper: 'Available liquidity',
    },
    {
      label: 'Recent Volume',
      value: formatCompactNumber(summary?.recentActivityCount ?? 0),
      icon: Activity,
      colorClass: 'bg-amber-50 text-amber-600',
      helper: 'Last 30 days activity',
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        eyebrow="Financial Intelligence"
        title="Command Center Overview"
        description="Monitor real-time cash flow, audit recent transactions, and manage organizational access from a single consolidated interface."
        action={
          <div className="flex items-center gap-4">
            {(user?.role === 'Analyst' || user?.role === 'Admin') && (
              <Link to="/analytics" className="btn-primary">
                <BarChart3 className="h-4 w-4" />
                Advanced Analytics
              </Link>
            )}
            <Link to="/records" className="btn-secondary">
              <FileText className="h-4 w-4" />
              All Transactions
            </Link>
          </div>
        }
      />

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <MetricCard key={metric.label} {...metric} delay={0.1 * i} />
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Records Table */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Stream of Activity"
            subtitle="The very latest financial flows registered in the system."
            action={
              <Link to="/records" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
                View Ledger
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          >
            {recentRecords.length === 0 ? (
              <EmptyState title="No transactions detected" message="Start by adding records via the transaction portal." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      <th className="pb-6 pr-4">Timestamp</th>
                      <th className="pb-6 pr-4">Categorization</th>
                      <th className="pb-6 pr-4">Type</th>
                      <th className="pb-6 text-right">Magnitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentRecords.map((record, i) => (
                      <motion.tr 
                        key={record.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        className="group"
                      >
                        <td className="py-4 pr-4">
                          <p className="text-sm font-bold text-slate-900">{formatDate(record.date)}</p>
                          <p className="text-[10px] font-medium text-slate-400">{record.userName}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                            {record.category}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter",
                            record.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {record.type}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <p className={cn(
                            "text-sm font-extrabold tracking-tight",
                            record.type === 'income' ? "text-emerald-600" : "text-slate-900"
                          )}>
                            {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                          </p>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Sidebar Info Cards */}
        <div className="space-y-8">
          <SectionCard 
            title="Access Profile" 
            subtitle="Identity & authorization status"
            className="bg-indigo-600 !text-white border-none shadow-indigo-200"
          >
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Current Authorization</p>
                <h4 className="text-xl font-bold text-white">{user?.role} Access</h4>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <p className="text-sm leading-relaxed text-indigo-50">
                {user?.role === 'Viewer'
                  ? 'Authorized for read-only access to ledger records and summary analytics.'
                  : user?.role === 'Analyst'
                    ? 'Granted read/write access to analytics models and advanced reporting tools.'
                    : 'Unrestricted administrative control over users, transactions, and system configuration.'}
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 p-3 ring-1 ring-white/20">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">System Online</span>
              </div>
            </div>
          </SectionCard>

          {userSummary && (
            <SectionCard title="Organization snapshot" subtitle="Active personnel & distribution">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Users</p>
                    <p className="mt-2 text-2xl font-extrabold text-slate-900">{userSummary.totalUsers}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Online</p>
                    <p className="mt-2 text-2xl font-extrabold text-emerald-600">{userSummary.activeUsers}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Distribution</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Administrators', count: userSummary.byRole.Admin, color: 'bg-indigo-500' },
                      { label: 'Analysts', count: userSummary.byRole.Analyst, color: 'bg-purple-500' },
                      { label: 'Viewers', count: userSummary.byRole.Viewer, color: 'bg-slate-400' },
                    ].map((item) => (
                      <div key={item.label} className="group flex items-center justify-between rounded-xl bg-slate-50/50 p-3 transition-colors hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-1.5 w-1.5 rounded-full", item.color)} />
                          <span className="text-sm font-bold text-slate-700">{item.label}</span>
                        </div>
                        <span className="text-sm font-extrabold text-slate-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

