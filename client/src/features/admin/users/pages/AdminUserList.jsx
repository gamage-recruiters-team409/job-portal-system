/**
 * @file AdminUserList.jsx
 * @description List view of all users for admin management.
 * @module Admin/Users
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Eye,
  Edit2,
  Ban,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { getAdminUsers, getAdminUserStats } from '../../../../services/adminUser.service';
import AddUserModal from '../components/AddUserModal';
import EditUserModal from '../components/EditUserModal';

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

/* ─── AdminUserList Component ──────────────────────────────────────────────── */

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalRegistered: 0, activeNow: 0, reportsPending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch Users
  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = { page, limit };
        if (statusFilter) params.status = statusFilter;
        if (searchQuery) params.search = searchQuery;

        const data = await getAdminUsers(params);
        if (isMounted) {
          if (data.data.users.length === 0 && page > 1) {
            setPage((p) => p - 1);
          } else {
            setUsers(data.data.users);
            setTotalPages(data.data.totalPages);
            setTotalUsers(data.data.total);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch users');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();
    
    return () => {
      isMounted = false;
    };
  }, [page, limit, statusFilter, searchQuery, refreshTrigger]);

  // Fetch Stats
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const data = await getAdminUserStats();
        if (isMounted) {
          setStats(data.data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch user stats', err);
      }
    };

    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  /* ─── Handlers ───────────────────────────────────────────────────────────── */

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserAdded = () => {
    setIsAddModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUserUpdated = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  /* ─── Render Helpers ─────────────────────────────────────────────────────── */

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
            Active
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold border border-red-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
            Suspended
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]"></span>
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200 rounded-b-xl">
        <p className="text-sm text-slate-500">
          Showing <span className="font-medium text-slate-900">{(page - 1) * limit + 1}</span> to{' '}
          <span className="font-medium text-slate-900">
            {Math.min(page * limit, totalUsers)}
          </span>{' '}
          of <span className="font-medium text-slate-900">{totalUsers}</span> users
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center">
             {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                // Show first, last, current, and adjacent pages
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                
                // Show ellipsis
                if (
                  pageNumber === page - 2 ||
                  pageNumber === page + 2
                ) {
                  return (
                    <span key={pageNumber} className="px-2 text-slate-400">
                      ...
                    </span>
                  );
                }
                
                return null;
             })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  /* ─── Main Render ────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Users</h1>
          <p className="text-sm text-slate-500 mt-1">Oversee and manage user accounts and permissions.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Users size={18} />
          Add New User
        </button>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total registered */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[135px]">
          <span className="text-sm font-medium text-slate-500">Total registered</span>
          <span className="text-3xl font-bold text-slate-900 mt-2">—</span>
        </div>

        {/* Active right now */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[135px]">
          <span className="text-sm font-medium text-slate-500">Active right now</span>
          <span className="text-3xl font-bold text-slate-900 mt-2">—</span>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-slate-200 h-full rounded-full w-0" />
            </div>
            <span className="text-xs font-semibold text-slate-400">—</span>
          </div>
        </div>

        {/* Reports pending */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between min-h-[135px]">
          <span className="text-sm font-medium text-slate-500">Reports pending</span>
          <span className="text-3xl font-bold text-slate-400 mt-2">—</span>
          <div className="mt-3">
            <Link
              to="/admin/reports"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Review tickets <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        {/* Filters & Actions */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 w-full justify-between items-center">
          {/* Search */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              className={
                'w-full h-11 pl-10 pr-4 bg-white border border-slate-200 ' +
                'rounded-xl text-sm text-slate-900 focus:outline-none ' +
                'focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-sm'
              }
              placeholder="Search by name or email..."
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Tabs */}
          <div className="w-full md:w-auto min-w-0 flex md:justify-end">
            <div
              className={
                'flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 ' +
                'rounded-xl overflow-x-auto max-w-full'
              }
            >
              {[
                { value: '', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'inactive', label: 'Inactive' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  className={`px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                    statusFilter === status.value
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                // Skeleton Loading
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4">
                      <AlertOctagon size={24} />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 mb-1">Error Loading Users</h3>
                    <p className="text-sm text-slate-500">{error}</p>
                    <button
                      onClick={() => setRefreshTrigger((prev) => prev + 1)}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition-all">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-500">{formatDate(user.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStatusBadge(user.accountStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="View Profile Details"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="Edit User"
                        >
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && !error && users.length > 0 && renderPagination()}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddUserModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleUserAdded}
        />
      )}
      
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUserUpdated}
        />
      )}
    </div>
  );
};

export default AdminUserList;
