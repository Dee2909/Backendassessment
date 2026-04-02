import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck, BarChart3, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const demoAccounts = [
  { role: 'Admin', email: 'admin@finance.com', password: 'admin123', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { role: 'Analyst', email: 'analyst@finance.com', password: 'analyst123', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
  { role: 'Viewer', email: 'viewer@finance.com', password: 'viewer123', icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      addToast({
        title: 'Welcome back!',
        message: 'Your finance dashboard is ready.',
        tone: 'success',
      });
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.error || 'Authentication failed. Please check your credentials.';
      setError(message);
      addToast({
        title: 'Login failed',
        message,
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-indigo-200/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-purple-200/30 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[35%] w-[35%] rounded-full bg-blue-100/40 blur-[110px]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center p-6 lg:flex-row lg:gap-16">
        {/* Left Side: Brand & Value Prop */}
        <motion.section 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 flex-1 text-center lg:mb-0 lg:text-left"
        >
          <div className="mb-8 flex justify-center lg:justify-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="ml-4 flex items-center text-xl font-bold tracking-tight text-slate-900">
              Finance<span className="text-indigo-600">Flow</span>
            </span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Intelligent Finance <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Operations Center
            </span>
          </h1>
          
          <p className="mt-8 text-lg leading-relaxed text-slate-600 lg:max-w-xl">
            A state-of-the-art platform for real-time cash flow monitoring, 
            granular record management, and AI-driven analytics.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:max-w-2xl">
            {['Real-time tracking', 'Role-based access', 'Smart analytics'].map((feature, i) => (
              <motion.div 
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/40 p-4 backdrop-blur-sm"
              >
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-sm font-semibold text-slate-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Right Side: Login Form */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="glass-card overflow-hidden rounded-[2.5rem] p-8 sm:p-10">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900">Secure Access</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in with your enterprise credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="relative">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <div className="group relative">
                    <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(c => ({ ...c, email: e.target.value }))}
                      className="form-input pl-12"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <div className="group relative">
                    <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm(c => ({ ...c, password: e.target.value }))}
                      className="form-input pl-12"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary group relative w-full overflow-hidden py-4 shadow-xl shadow-indigo-200 transition-all hover:translate-y-[-1px] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Access Dashboard
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-12">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest text-slate-400">
                  <span className="bg-white/80 px-4 backdrop-blur-sm">Demo Accounts</span>
                </div>
              </div>

              <div className="grid gap-3">
                {demoAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => setForm({ email: account.email, password: account.password })}
                      className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-indigo-100 hover:bg-indigo-50/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${account.bg} ${account.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800">{account.role}</p>
                          <p className="text-xs text-slate-500">{account.email}</p>
                        </div>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-sm transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                        Use
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Login;

