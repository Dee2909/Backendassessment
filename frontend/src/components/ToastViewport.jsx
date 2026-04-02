import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { cn } from '../utils/cn';

const toneConfig = {
  success: {
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-900 ring-emerald-200/50',
    iconClass: 'text-emerald-600',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-rose-50 text-rose-900 ring-rose-200/50',
    iconClass: 'text-rose-600',
  },
  info: {
    icon: Info,
    className: 'bg-indigo-50 text-indigo-900 ring-indigo-200/50',
    iconClass: 'text-indigo-600',
  },
};

const ToastViewport = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-6 right-6 z-[100] flex w-full max-w-[400px] flex-col gap-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = toneConfig[toast.tone] || toneConfig.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto relative overflow-hidden rounded-[1.5rem] p-5 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-xl",
                config.className
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5", config.iconClass)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-sm font-bold tracking-tight">{toast.title}</h4>
                  {toast.message && (
                    <p className="mt-1 text-xs font-medium opacity-70 leading-relaxed">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-black/5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Progress bar or decorative accent */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-black/5" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastViewport;

