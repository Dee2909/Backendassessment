import { motion } from 'framer-motion';

const PageHeader = ({ eyebrow, title, description, action }) => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center"
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex flex-shrink-0 flex-wrap gap-3">{action}</div>}
    </motion.header>
  );
};

export default PageHeader;
