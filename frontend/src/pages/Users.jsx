import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  Shield, 
  UserCheck, 
  UserX, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Users as UsersIcon,
  Activity
} from 'lucide-react';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { userService } from '../services/userService';
import { useToast } from '../hooks/useToast';
import { formatDateTime } from '../utils/formatters';
import { ROLE_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { cn } from '../utils/cn';

const initialUserForm = {
  name: '',
  email: '',
  password: '',
  role: 'Viewer',
  status: 'active',
};

const UserStatCard = ({ label, value, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-200/5"
  >
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
  </motion.div>
);

const Users = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, usersRes] = await Promise.all([
        userService.getSummary(),
        userService.getAll({
          search: filters.search || undefined,
          role: filters.role || undefined,
          status: filters.status || undefined,
          page: filters.page,
          limit: 10,
        }),
      ]);

      setSummary(summaryRes.data);
      setUsers(usersRes.data.users);
      setPagination(usersRes.data.pagination);
    } catch (err) {
      addToast({
        title: 'Registry Offline',
        message: err.response?.data?.error || 'Unable to retrieve personnel data from the server.',
        tone: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setEditingUser(null);
    setUserForm(initialUserForm);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setUserForm(initialUserForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        const payload = {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          status: userForm.status,
        };
        if (userForm.password.trim()) payload.password = userForm.password;
        await userService.update(editingUser.id, payload);
        addToast({ title: 'Profile Synchronized', message: 'User authorization and metadata updated successfully.', tone: 'success' });
      } else {
        await userService.create(userForm);
        addToast({ title: 'Identity Created', message: 'New user has been granted access to the platform.', tone: 'success' });
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      addToast({
        title: 'Operation Blocked',
        message: err.response?.data?.error || 'Please ensure all identification data is valid.',
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && users.length === 0) {
    return <LoadingState title="Auditing Access Control" message="Validating personnel credentials and role distributions..." />;
  }

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        eyebrow="Personnel"
        title="Access Control"
        description="Monitor organization members, manage role-based authorization, and control infrastructure access."
        action={
          <button type="button" onClick={openCreateModal} className="btn-primary">
            <UserPlus className="h-4 w-4" />
            Provision User
          </button>
        }
      />

      <div className="grid gap-6 md:grid-cols-4">
        <UserStatCard label="Organization Total" value={summary?.totalUsers ?? 0} icon={UsersIcon} colorClass="bg-indigo-50 text-indigo-600" delay={0} />
        <UserStatCard label="Active Personnel" value={summary?.activeUsers ?? 0} icon={UserCheck} colorClass="bg-emerald-50 text-emerald-600" delay={0.1} />
        <UserStatCard label="Intelligence Analysts" value={summary?.byRole?.Analyst ?? 0} icon={Shield} colorClass="bg-purple-50 text-purple-600" delay={0.2} />
        <UserStatCard label="Command Admins" value={summary?.byRole?.Admin ?? 0} icon={Activity} colorClass="bg-amber-50 text-amber-600" delay={0.3} />
      </div>

      <SectionCard title="Search Personnel" subtitle="Locate users by identifier or narrow by clearance level.">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="relative group lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(c => ({ ...c, search: e.target.value, page: 1 }))}
              className="form-input pl-10"
              placeholder="Search by name, email, or identifier..."
            />
          </div>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filters.role}
              onChange={(e) => setFilters(c => ({ ...c, role: e.target.value, page: 1 }))}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All Responsibility Tiers</option>
              {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters(c => ({ ...c, status: e.target.value, page: 1 }))}
              className="form-input pl-10 appearance-none"
            >
              <option value="">All Status Levels</option>
              {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <button
               type="button"
               onClick={() => setFilters({ search: '', role: '', status: '', page: 1 })}
               className="btn-ghost text-xs font-bold uppercase tracking-widest"
            >
               Reset Audit Parameters
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Personnel Registry"
        subtitle={`${pagination.total ?? 0} identities successfully queried`}
      >
        {users.length === 0 ? (
          <EmptyState title="No personnel detected" message="Adjust audit filters to locate users." />
        ) : (
          <div className="relative">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <th className="pb-6 pr-4">Identity</th>
                    <th className="pb-6 pr-4">Authorization</th>
                    <th className="pb-6 pr-4">System Status</th>
                    <th className="pb-6 pr-4">Ledger Volume</th>
                    <th className="pb-6 pr-4">Provisioned</th>
                    <th className="pb-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user, i) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="group"
                    >
                      <td className="py-5 pr-4">
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-[10px] font-medium text-slate-400">{user.email}</p>
                      </td>
                      <td className="py-5 pr-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight text-indigo-600 ring-1 ring-indigo-100">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-5 pr-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter",
                          user.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-5 pr-4 text-sm font-bold text-slate-700">{user.recordCount} tx</td>
                      <td className="py-5 pr-4 text-[10px] font-bold uppercase text-slate-400">{formatDateTime(user.createdAt)}</td>
                      <td className="py-5 text-right">
                        <button 
                          onClick={() => openEditModal(user)} 
                          className="flex h-9 w-9 ml-auto items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600 shadow-sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingUser ? 'Synchronize Identity' : 'Provision Personnel'}
        subtitle="Configure access levels and identity metadata for the organization."
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Legal Name</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm(c => ({ ...c, name: e.target.value }))}
                className="form-input"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Organization Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(c => ({ ...c, email: e.target.value }))}
                className="form-input"
                placeholder="john@company.com"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Clearance Tier</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm(c => ({ ...c, role: e.target.value }))}
                className="form-input"
              >
                {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Operational Status</label>
              <select
                value={userForm.status}
                onChange={(e) => setUserForm(c => ({ ...c, status: e.target.value }))}
                className="form-input"
              >
                {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {editingUser ? 'Access Key (Rotate)' : 'Access Key'}
              </label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm(c => ({ ...c, password: e.target.value }))}
                className="form-input"
                placeholder="••••••••"
                required={!editingUser}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-ghost">Discard</button>
            <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
              {saving ? 'Synchronizing...' : editingUser ? 'Update Profile' : 'Authorize User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;

