import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download,
  ArrowUpDown
} from 'lucide-react';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { recordService } from '../services/recordService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate } from '../utils/formatters';
import { cn } from '../utils/cn';

const initialRecordForm = {
  amount: '',
  type: 'expense',
  category: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  userId: '',
};

const Records = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordForm, setRecordForm] = useState(initialRecordForm);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const [recordsRes, metaRes, usersRes] = await Promise.all([
        recordService.getAll({
          search: filters.search || undefined,
          type: filters.type || undefined,
          category: filters.category || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          page: filters.page,
          limit: 10,
        }),
        recordService.getMeta(),
        isAdmin
          ? userService.getAll({ status: 'active', limit: 50 })
          : Promise.resolve({ data: { users: [] } }),
      ]);

      setRecords(recordsRes.data.records);
      setPagination(recordsRes.data.pagination);
      setCategories(metaRes.data.categories);
      setAssignableUsers(usersRes.data.users);
    } catch (err) {
      addToast({
        title: 'Query Failed',
        message: err.response?.data?.error || 'Unable to fetch records from the ledger.',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, filters, isAdmin]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const ownerOptions = useMemo(
    () => assignableUsers.map((entry) => ({ value: entry.id, label: `${entry.name} (${entry.role})` })),
    [assignableUsers]
  );

  const openCreateModal = () => {
    setEditingRecord(null);
    setRecordForm({
      ...initialRecordForm,
      category: categories[0] || '',
      userId: ownerOptions[0]?.value || '',
    });
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setRecordForm({
      amount: String(record.amount),
      type: record.type,
      category: record.category,
      date: new Date(record.date).toISOString().split('T')[0],
      notes: record.notes || '',
      userId: record.userId || ownerOptions[0]?.value || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setRecordForm(initialRecordForm);
  };

  const handleRecordSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingRecord) {
        await recordService.update(editingRecord.id, recordForm);
        addToast({ title: 'Record Updated', message: 'The ledger entry was successfully modified.', tone: 'success' });
      } else {
        await recordService.create(recordForm);
        addToast({ title: 'Record Created', message: 'A new entry has been registered in the system.', tone: 'success' });
      }
      closeModal();
      fetchRecords();
    } catch (err) {
      addToast({
        title: 'Operation Failed',
        message: err.response?.data?.error || 'Please review the input data and try again.',
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;
    try {
      await recordService.delete(recordId);
      addToast({ title: 'Entry Removed', message: 'The record was purged from the system.', tone: 'success' });
      fetchRecords();
    } catch (err) {
      addToast({ title: 'Purge Failed', message: 'Unable to remove the record at this time.', tone: 'error' });
    }
  };

  if (loading && records.length === 0) {
    return <LoadingState title="Querying Ledger" message="Applying filters and retrieving granular record data." />;
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Transactions"
        title="Ledger Management"
        description="Filter, audit, and manage the complete historical record of financial activity within the organization."
        action={
          <div className="flex items-center gap-3">
             <button className="btn-secondary">
                <Download className="h-4 w-4" />
                Export CSV
             </button>
             {isAdmin && (
                <button type="button" onClick={openCreateModal} className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Register Entry
                </button>
             )}
          </div>
        }
      />

      {/* Filter Panel */}
      <SectionCard 
        title="Search & Filters" 
        subtitle="Narrow down records by text, classification, or date range."
      >
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="group relative">
               <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" />
               <input
                 type="text"
                 value={filters.search}
                 onChange={(e) => setFilters(c => ({ ...c, search: e.target.value, page: 1 }))}
                 className="form-input pl-10"
                 placeholder="Search by notes or user info..."
               />
            </div>
          </div>
          
          <div className="relative">
             <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <select
               value={filters.type}
               onChange={(e) => setFilters(c => ({ ...c, type: e.target.value, page: 1 }))}
               className="form-input pl-10 appearance-none"
             >
               <option value="">All Flow Types</option>
               <option value="income">Credits (+)</option>
               <option value="expense">Debits (-)</option>
             </select>
          </div>

          <div className="relative">
             <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <select
               value={filters.category}
               onChange={(e) => setFilters(c => ({ ...c, category: e.target.value, page: 1 }))}
               className="form-input pl-10 appearance-none"
             >
               <option value="">Specific Categories</option>
               {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
             </select>
          </div>

          <div className="relative">
             <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <input
               type="date"
               value={filters.startDate}
               onChange={(e) => setFilters(c => ({ ...c, startDate: e.target.value, page: 1 }))}
               className="form-input pl-10"
             />
          </div>

          <div className="relative">
             <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
             <input
               type="date"
               value={filters.endDate}
               onChange={(e) => setFilters(c => ({ ...c, endDate: e.target.value, page: 1 }))}
               className="form-input pl-10"
             />
          </div>

          <div className="lg:col-span-2 flex items-center justify-end">
            <button
               type="button"
               onClick={() => setFilters({ search: '', type: '', category: '', startDate: '', endDate: '', page: 1 })}
               className="btn-ghost text-xs font-bold uppercase tracking-widest"
            >
               Reset All Filters
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Records Table */}
      <SectionCard 
        title="Historical Ledger" 
        subtitle={`${pagination.total} entries synchronized with backend`}
      >
        {records.length === 0 ? (
          <EmptyState title="No matching records" message="Try adjusting your filters or search terms." />
        ) : (
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <th className="pb-6 pr-4">Timestamp</th>
                    <th className="pb-6 pr-4">Category</th>
                    <th className="pb-6 pr-4">Executive</th>
                    <th className="pb-6 pr-4">Classification</th>
                    <th className="pb-6 pr-4 text-right">Magnitude</th>
                    {isAdmin && <th className="pb-6 text-right">Operations</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((record, i) => (
                    <motion.tr 
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="py-5 pr-4 text-sm font-bold text-slate-900">{formatDate(record.date)}</td>
                      <td className="py-5 pr-4">
                         <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
                            {record.category}
                         </span>
                      </td>
                      <td className="py-5 pr-4">
                        <p className="text-sm font-bold text-slate-900">{record.userName}</p>
                        <p className="text-[10px] font-medium text-slate-400">{record.userEmail}</p>
                      </td>
                      <td className="py-5 pr-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter",
                          record.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {record.type}
                        </span>
                      </td>
                      <td className="py-5 pr-4 text-right">
                        <p className={cn(
                          "text-sm font-extrabold tracking-tight",
                          record.type === 'income' ? "text-emerald-600" : "text-slate-900"
                        )}>
                          {record.type === 'income' ? '+' : '-'}{formatCurrency(record.amount)}
                        </p>
                      </td>
                      {isAdmin && (
                        <td className="py-5 text-right">
                           <div className="flex justify-end gap-2 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <button 
                                onClick={() => openEditModal(record)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                              >
                                 <Pencil className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </button>
                           </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-50 pt-8">
               <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.pages}</span>
               </p>
               <div className="flex gap-3">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setFilters(c => ({ ...c, page: c.page - 1 }))}
                    className="btn-secondary h-10 w-10 !p-0 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setFilters(c => ({ ...c, page: c.page + 1 }))}
                    className="btn-secondary h-10 w-10 !p-0 disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
               </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingRecord ? 'Modify Record' : 'Register Entry'}
        subtitle="Manage the granular details of the financial ledger entry."
      >
        <form onSubmit={handleRecordSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Magnitude</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                 <input
                   type="number"
                   step="0.01"
                   value={recordForm.amount}
                   onChange={(e) => setRecordForm(c => ({ ...c, amount: e.target.value }))}
                   className="form-input pl-8 font-bold"
                   placeholder="0.00"
                   required
                 />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Timestamp</label>
              <input
                type="date"
                value={recordForm.date}
                onChange={(e) => setRecordForm(c => ({ ...c, date: e.target.value }))}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Classification</label>
              <select
                value={recordForm.type}
                onChange={(e) => setRecordForm(c => ({ ...c, type: e.target.value }))}
                className="form-input"
              >
                <option value="income">Credit (+)</option>
                <option value="expense">Debit (-)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</label>
              <select
                value={recordForm.category}
                onChange={(e) => setRecordForm(c => ({ ...c, category: e.target.value }))}
                className="form-input"
              >
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Record Executive</label>
              <select
                value={recordForm.userId}
                onChange={(e) => setRecordForm(c => ({ ...c, userId: e.target.value }))}
                className="form-input"
              >
                {ownerOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Internal Notes</label>
            <textarea
              value={recordForm.notes}
              onChange={(e) => setRecordForm(c => ({ ...c, notes: e.target.value }))}
              rows={3}
              className="form-input min-h-[100px]"
              placeholder="Provide context for this transaction..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-ghost">Discard</button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
              {saving ? 'Processing...' : editingRecord ? 'Save Changes' : 'Confirm Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Records;

