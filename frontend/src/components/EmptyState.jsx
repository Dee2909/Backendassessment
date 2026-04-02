import { Inbox } from 'lucide-react';

const EmptyState = ({ title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-300 ring-1 ring-slate-100">
        <Inbox className="h-10 w-10" />
      </div>
      <h3 className="mt-6 text-lg font-bold text-slate-900 tracking-tight">{title || "No data available"}</h3>
      <p className="mt-2 text-sm font-medium text-slate-500 max-w-xs">{message || "There are no records to display at this time."}</p>
    </div>
  );
};

export default EmptyState;
