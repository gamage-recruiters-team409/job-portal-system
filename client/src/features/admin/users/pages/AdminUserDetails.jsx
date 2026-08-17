/**
 * @file AdminUserDetails.jsx
 * @description Dedicated, professional User Details and Profile View for Admin management.
 * @module Admin/Users
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Mail,
  Calendar,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  RotateCcw,
  User,
  ShieldCheck,
  Briefcase,
  Trash2,
  Sparkles,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminUserById, updateAdminUserStatus } from '../../../../services/adminUser.service';
import { USER_ROLES, ACCOUNT_STATUSES } from '../../../../constants/statuses';
import EditUserModal from '../components/EditUserModal';
import ResetPasswordModal from '../../common/ResetPasswordModal';
import SuspendAccountModal from '../../common/SuspendAccountModal';

/* ─── Helper Functions ─────────────────────────────────────────────────────── */

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/* ─── AdminUserDetails Component ───────────────────────────────────────────── */

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Action States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [confirmStatusAction, setConfirmStatusAction] = useState(null); // 'suspended' | 'active' | 'inactive' | null
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAdminUserById(userId);
        if (isMounted) {
          setUser(response?.data?.user || response?.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch user details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchUserDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [userId, refreshTrigger]);

  /* ─── Handlers ───────────────────────────────────────────────────────────── */

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await updateAdminUserStatus(userId, newStatus);
      toast.success(
        newStatus === 'active'
          ? 'Account reactivated successfully!'
          : newStatus === 'suspended'
          ? 'Account suspended.'
          : 'Account set to inactive.'
      );
      setConfirmStatusAction(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUserUpdated = () => {
    setIsEditModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  /* ─── Render Helpers ─────────────────────────────────────────────────────── */

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold border border-emerald-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold border border-red-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
            Suspended
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold border border-slate-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]"></span>
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  const renderRoleBadge = (role) => {
    const isJobSeeker = role === USER_ROLES.JOB_SEEKER;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs ${
          isJobSeeker
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-purple-50 text-purple-700 border border-purple-200'
        }`}
      >
        {isJobSeeker ? <User size={12} /> : <Briefcase size={12} />}
        {isJobSeeker ? 'Job seeker' : 'Employer'}
      </span>
    );
  };

  /* ─── Main Render ────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full pb-16">
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">User Not Found</h3>
        <p className="text-sm text-slate-500 max-w-md mb-6">{error || 'The requested user account does not exist or was removed.'}</p>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Back to user list
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-16 animate-in fade-in duration-200">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>Admin</span>
            <span className="text-slate-300">/</span>
            <Link to="/admin/users" className="hover:text-blue-600 transition-colors">
              Manage users
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">{user.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-all shadow-2xs"
          >
            <ArrowLeft size={16} />
            Back to list
          </Link>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <Edit2 size={16} />
            Edit user
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: User Summary & Actions */}
        <div className="flex flex-col gap-6">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col items-center text-center relative overflow-hidden">
            <div className="relative mb-4 mt-2">
              <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-2xl flex items-center justify-center shadow-2xs">
                {getInitials(user.name)}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full border-2 border-white ${
                  user.accountStatus === 'active'
                    ? 'bg-emerald-500'
                    : user.accountStatus === 'suspended'
                    ? 'bg-red-500'
                    : 'bg-slate-400'
                }`}
                title={`Status: ${user.accountStatus}`}
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5 break-all">{user.email}</p>

            <div className="flex items-center gap-2 mt-4">
              {renderRoleBadge(user.role)}
              {renderStatusBadge(user.accountStatus)}
            </div>

            <div className="w-full border-t border-slate-100 mt-6 pt-4 flex flex-col gap-3 text-left text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" /> Member since
                </span>
                <span className="text-slate-900 font-semibold">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-slate-400" /> Email status
                </span>
                <span className="font-semibold">
                  {user.emailVerified ? (
                    <span className="text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 size={14} /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-600 inline-flex items-center gap-1">
                      <Clock size={14} /> Unverified
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col gap-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Actions</h3>

            <div className="flex flex-col gap-2.5">
              {/* Reset Password button */}
              <button
                onClick={() => setIsResetPasswordOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                <RotateCcw size={15} />
                Send Password Reset
              </button>

              {/* Status Action Buttons */}
              {user.accountStatus === ACCOUNT_STATUSES.ACTIVE ? (
                <>
                  <button
                    onClick={() => setConfirmStatusAction(ACCOUNT_STATUSES.SUSPENDED)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-sm font-semibold transition-colors shadow-2xs"
                  >
                    <Ban size={16} />
                    Suspend Account
                  </button>
                  <button
                    onClick={() => setConfirmStatusAction(ACCOUNT_STATUSES.INACTIVE)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-medium transition-colors shadow-2xs"
                  >
                    <Trash2 size={15} />
                    Deactivate Account
                  </button>
                </>
              ) : user.accountStatus === ACCOUNT_STATUSES.SUSPENDED ? (
                <>
                  <button
                    onClick={() => setConfirmStatusAction(ACCOUNT_STATUSES.ACTIVE)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-sm font-semibold transition-colors shadow-2xs"
                  >
                    <CheckCircle2 size={16} />
                    Reactivate Account
                  </button>
                  <button
                    onClick={() => setConfirmStatusAction(ACCOUNT_STATUSES.INACTIVE)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-medium transition-colors shadow-2xs"
                  >
                    <Trash2 size={15} />
                    Set to Inactive
                  </button>
                </>
              ) : (
                /* INACTIVE state */
                <>
                  <button
                    onClick={() => setConfirmStatusAction(ACCOUNT_STATUSES.ACTIVE)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-sm font-semibold transition-colors shadow-2xs"
                  >
                    <CheckCircle2 size={16} />
                    Activate Account
                  </button>
                  <button
                    onClick={() => setConfirmStatusAction(ACCOUNT_STATUSES.SUSPENDED)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-sm font-semibold transition-colors shadow-2xs"
                  >
                    <Ban size={16} />
                    Suspend Account
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Structured Profile Details & Recent Activity */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Profile Details Card */}
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 shadow-2xs relative">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Profile Details</h3>
                <p className="text-xs text-slate-500 mt-0.5">Overview of user credentials and status</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <User size={16} />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tile 1: Full Name */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <User size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{user.name}</p>
                </div>
              </div>

              {/* Tile 2: Email */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <a
                    href={`mailto:${user.email}`}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-0.5 block truncate"
                  >
                    {user.email}
                  </a>
                </div>
              </div>

              {/* Tile 3: Role */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Role</p>
                  <p className="text-sm font-bold text-slate-900 capitalize mt-0.5">
                    {user.role === USER_ROLES.JOB_SEEKER ? 'Job Seeker' : 'Employer Partner'}
                  </p>
                </div>
              </div>

              {/* Tile 4: Status */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Status</p>
                  <p className="text-sm font-bold text-slate-900 capitalize mt-0.5">{user.accountStatus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">System audit and account timeline</p>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shadow-2xs">
                <Activity size={18} />
              </span>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-200/80 space-y-6">
              {/* Event 1 */}
              <div className="relative">
                <span
                  className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full ring-4 ${
                    user.accountStatus === 'active'
                      ? 'bg-[#16A34A] ring-emerald-100'
                      : user.accountStatus === 'suspended'
                      ? 'bg-[#DC2626] ring-red-100'
                      : 'bg-[#64748B] ring-slate-100'
                  }`}
                ></span>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Account Status:{' '}
                    <span
                      className={`capitalize ${
                        user.accountStatus === 'active'
                          ? 'text-[#16A34A]'
                          : user.accountStatus === 'suspended'
                          ? 'text-[#DC2626]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {user.accountStatus}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Current account state on system record</p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-slate-400 ring-4 ring-slate-100"></span>
                <div>
                  <p className="text-sm font-bold text-slate-900">Account Created & Registered</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Suspend / Deactivate Confirmation Modal */}
      {(confirmStatusAction === 'suspended' || confirmStatusAction === 'inactive') && (
        <SuspendAccountModal
          isOpen={Boolean(confirmStatusAction)}
          onClose={() => setConfirmStatusAction(null)}
          onConfirm={() => handleStatusUpdate(confirmStatusAction)}
          userName={user.name}
          actionType={confirmStatusAction}
          isSubmitting={isUpdatingStatus}
        />
      )}

      {/* Reactivate / Activate Confirmation Modal */}
      {confirmStatusAction === 'active' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 size={24} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Activate Account?
                </h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Are you sure you want to reactivate <span className="font-semibold text-slate-800">{user.name}</span>&apos;s account? Access rights will be restored immediately.
                </p>
              </div>

              <div className="flex w-full gap-2.5 mt-3">
                <button
                  onClick={() => setConfirmStatusAction(null)}
                  disabled={isUpdatingStatus}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate('active')}
                  disabled={isUpdatingStatus}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center shadow-sm disabled:opacity-70 transition-all bg-[#16A34A] hover:bg-[#15803D]"
                >
                  {isUpdatingStatus ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Activate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <EditUserModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUserUpdated}
        />
      )}

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        userName={user.name}
        email={user.email}
        isVerified={user.emailVerified}
        userType={user.role === USER_ROLES.JOB_SEEKER ? 'User' : 'Employer'}
      />
    </div>
  );
};

export default AdminUserDetails;
