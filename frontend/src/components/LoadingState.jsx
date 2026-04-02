import { motion } from 'framer-motion';

const LoadingState = ({ title, message }) => {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-indigo-50" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-indigo-600" 
        />
      </div>
      <div className="mt-8 text-center">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title || "Syncing data..."}</h3>
        <p className="mt-2 text-sm font-medium text-slate-500 max-w-xs">{message || "Please wait while we prepare your dashboard."}</p>
      </div>
    </div>
  );
};

export default LoadingState;
