const SectionCard = ({ title, subtitle, action, children, className = '' }) => {
  return (
    <section className={`rounded-[2rem] border border-slate-100 bg-white shadow-sm ring-1 ring-slate-200/5 overflow-hidden ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex flex-col gap-4 border-b border-slate-50 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm font-medium text-slate-400">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-8">{children}</div>
    </section>
  );
};

export default SectionCard;

