import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  Area,
  AreaChart,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PieChart as PieIcon, 
  BarChart3, 
  LineChart as LineIcon,
  Table as TableIcon
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useToast } from '../hooks/useToast';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/formatters';
import { cn } from '../utils/cn';

const chartColors = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
];

const MetricMiniCard = ({ label, value, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-200/5 group hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-4">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110", colorClass)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

const Analytics = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [summaryRes, categoryRes, monthlyRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getCategory(),
          dashboardService.getMonthly({ months: 6 }),
        ]);

        if (!cancelled) {
          setSummary(summaryRes.data);
          setCategoryData(categoryRes.data);
          setMonthlyData(monthlyRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          addToast({
            title: 'Analytics Offline',
            message: err.response?.data?.error || 'Unable to correlate data points at this time.',
            tone: 'error',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [addToast]);

  const pieData = useMemo(
    () =>
      categoryData
        .filter((entry) => entry.total > 0)
        .map((entry) => ({ name: entry.category, value: entry.total })),
    [categoryData]
  );

  if (loading) {
    return <LoadingState title="Processing Data Models" message="Correlating historical trends and category distributions..." />;
  }

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        eyebrow="Intelligence"
        title="Advanced Insights"
        description="Deep-dive into organizational spending patterns, revenue trends, and category distribution models."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <MetricMiniCard 
          label="Cumulative Credits" 
          value={formatCurrency(summary?.totalIncome ?? 0)} 
          icon={TrendingUp} 
          colorClass="bg-emerald-50 text-emerald-600"
          delay={0}
        />
        <MetricMiniCard 
          label="Cumulative Debits" 
          value={formatCurrency(summary?.totalExpense ?? 0)} 
          icon={TrendingDown} 
          colorClass="bg-rose-50 text-rose-600"
          delay={0.1}
        />
        <MetricMiniCard 
          label="Net Treasury" 
          value={formatCurrency(summary?.netBalance ?? 0)} 
          icon={Target} 
          colorClass="bg-indigo-50 text-indigo-600"
          delay={0.2}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <SectionCard 
          title="Category Distribution" 
          subtitle="Proportional magnitude of transactions by classification."
          action={<PieIcon className="h-4 w-4 text-slate-400" />}
        >
          {pieData.length === 0 ? (
            <EmptyState title="No classification data" message="Distributions will appear once records are registered." />
          ) : (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    outerRadius={130} 
                    innerRadius={85}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => formatCurrency(value)} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard 
          title="Velocity Trends" 
          subtitle="Monthly credit vs debit volume across the last 6 months."
          action={<BarChart3 className="h-4 w-4 text-slate-400" />}
        >
          {monthlyData.length === 0 ? (
            <EmptyState title="No velocity trends" message="Monthly aggregation requires more historical data." />
          ) : (
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={8}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => formatCurrency(value)} 
                  />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Credits" />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Debits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <SectionCard 
          title="Treasury Trajectory" 
          subtitle="Net value progression over selected timeframes."
          action={<LineIcon className="h-4 w-4 text-slate-400" />}
          className="lg:col-span-3"
        >
          {monthlyData.length === 0 ? (
            <EmptyState title="No trajectory data" message="Net progression will materialize with more data points." />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => formatCurrency(value)} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#6366f1" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorNet)" 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard 
          title="Metric Matrix" 
          subtitle="Granular classification results"
          action={<TableIcon className="h-4 w-4 text-slate-400" />}
          className="lg:col-span-2"
        >
          {categoryData.length === 0 ? (
            <EmptyState title="Matrix empty" message="Processing... data models still initializing." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <th className="pb-6 pr-4">Matrix</th>
                    <th className="pb-6 pr-4">Count</th>
                    <th className="pb-6 text-right">Magnitude</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categoryData.map((entry, i) => (
                    <motion.tr 
                      key={entry.category} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="group"
                    >
                      <td className="py-4 pr-4">
                        <span className="text-sm font-bold text-slate-900">{entry.category}</span>
                      </td>
                      <td className="py-4 pr-4 text-sm font-medium text-slate-400">{entry.transactions} tx</td>
                      <td className="py-4 text-right">
                        <p className={cn(
                          "text-sm font-extrabold tracking-tight",
                          entry.total >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {formatCurrency(entry.total)}
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
    </div>
  );
};

export default Analytics;

